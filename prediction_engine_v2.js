function normalizePredictionWord(word) {
  if (typeof normWord === "function") return normWord(word);
  return String(word || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function isSingleWordToken(word) {
  return !!word && !/[_\s]/.test(String(word));
}

function uniqueWords(words) {
  const seen = new Set();
  const result = [];

  (words || []).forEach((word) => {
    if (!isSingleWordToken(word)) return;
    const normalized = normalizePredictionWord(word);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(word);
  });

  return result;
}

function getRhymeBankWords() {
  if (typeof CORDEL_RHYME_BANK !== "undefined" && CORDEL_RHYME_BANK) {
    return uniqueWords(Object.values(CORDEL_RHYME_BANK).flat());
  }
  if (typeof FALLBACK_TOKENS !== "undefined" && Array.isArray(FALLBACK_TOKENS)) {
    return uniqueWords(FALLBACK_TOKENS);
  }
  return ["sol", "lua", "mar", "amor"];
}

function getLastWord(verse) {
  if (!verse) return "";
  const cleaned = String(verse).replace(/___/g, " ").trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/).filter(Boolean);
  return normalizePredictionWord(words[words.length - 1] || "");
}

function findRhymes(word) {
  if (!word) return [];
  const normalized = normalizePredictionWord(word);
  if (!normalized) return [];

  const allWords = getRhymeBankWords();
  const rhymes3 = [];
  const rhymes2 = [];
  const rhymes1 = [];

  allWords.forEach((candidate) => {
    const normalizedCandidate = normalizePredictionWord(candidate);
    if (!normalizedCandidate || normalizedCandidate === normalized) return;

    if (
      normalizedCandidate.length >= 3 &&
      normalized.length >= 3 &&
      normalizedCandidate.slice(-3) === normalized.slice(-3)
    ) {
      rhymes3.push(candidate);
    } else if (
      normalizedCandidate.length >= 2 &&
      normalized.length >= 2 &&
      normalizedCandidate.slice(-2) === normalized.slice(-2)
    ) {
      rhymes2.push(candidate);
    } else if (
      normalizedCandidate.length >= 1 &&
      normalized.length >= 1 &&
      normalizedCandidate.slice(-1) === normalized.slice(-1)
    ) {
      rhymes1.push(candidate);
    }
  });

  return uniqueWords([...rhymes3, ...rhymes2, ...rhymes1]);
}

function suggestNextWord(scheme, lines) {
  let targetWord = null;
  const nextIndex = lines.length;

  if (scheme === "AABB") {
    if (nextIndex === 1 && lines[0]) targetWord = getLastWord(lines[0].verse);
    if (nextIndex === 3 && lines[2]) targetWord = getLastWord(lines[2].verse);
  } else if (scheme === "ABAB") {
    if (nextIndex === 2 && lines[0]) targetWord = getLastWord(lines[0].verse);
    if (nextIndex === 3 && lines[1]) targetWord = getLastWord(lines[1].verse);
  } else if (scheme === "ABBA") {
    if (nextIndex === 2 && lines[1]) targetWord = getLastWord(lines[1].verse);
    if (nextIndex === 3 && lines[0]) targetWord = getLastWord(lines[0].verse);
  }

  return targetWord;
}

function getThemeEntries(theme) {
  const entries = [];
  if (!theme || !theme.tokens) return entries;

  if (Array.isArray(theme.tokens)) {
    theme.tokens.forEach((token, index) => {
      if (!isSingleWordToken(token)) return;
      entries.push({ word: token, category: "tema", index });
    });
    return entries;
  }

  Object.entries(theme.tokens).forEach(([category, words]) => {
    (words || []).forEach((word, index) => {
      if (!isSingleWordToken(word)) return;
      entries.push({ word, category, index });
    });
  });

  return entries;
}

function buildThemeLookup(theme) {
  const lookup = new Map();

  getThemeEntries(theme).forEach((entry) => {
    const normalized = normalizePredictionWord(entry.word);
    if (!normalized) return;

    if (!lookup.has(normalized)) {
      lookup.set(normalized, {
        word: entry.word,
        categories: new Set(),
        indexes: [],
      });
    }

    const record = lookup.get(normalized);
    record.categories.add(entry.category);
    record.indexes.push(entry.index);
  });

  return lookup;
}

function detectContextExpectations(beforeBlank) {
  const normalizedWords = String(beforeBlank || "")
    .trim()
    .split(/\s+/)
    .map(normalizePredictionWord)
    .filter(Boolean);

  const last = normalizedWords[normalizedWords.length - 1] || "";
  const previous = normalizedWords[normalizedWords.length - 2] || "";
  const weights = {
    substantivos: 0.68,
    objetosCulturais: 0.64,
    lugares: 0.56,
    acoes: 0.52,
    adjetivos: 0.34,
    verbos: 0.28,
  };

  let label = "fechamento nominal";
  let reason = "O verso termina com uma estrutura que normalmente pede um substantivo no fim.";

  const determiners = new Set(["o", "a", "os", "as", "um", "uma", "meu", "minha", "seu", "sua", "esse", "essa", "este", "esta"]);
  const locatives = new Set(["no", "na", "em", "pro", "pra", "ao", "a"]);
  const verbTriggers = new Set(["vou", "vamos", "quero", "quer", "posso", "pode", "devo", "preciso"]);
  const adjectiveTriggers = new Set(["muito", "bem", "ta", "esta", "estava", "ficou", "anda", "segue"]);

  if (determiners.has(last)) {
    weights.substantivos = 1;
    weights.objetosCulturais = 0.88;
    weights.lugares = 0.76;
    weights.acoes = 0.58;
    weights.adjetivos = 0.22;
    weights.verbos = 0.14;
    label = "artigo antes da lacuna";
    reason = 'A palavra anterior funciona como artigo, então a lacuna tende a terminar em um nome.';
  } else if (locatives.has(last)) {
    weights.lugares = 1;
    weights.substantivos = 0.82;
    weights.objetosCulturais = 0.7;
    weights.acoes = 0.44;
    weights.adjetivos = 0.18;
    weights.verbos = 0.12;
    label = "pista de lugar";
    reason = 'A preposição antes da lacuna favorece palavras que soam como lugar ou destino.';
  } else if (verbTriggers.has(last) || (last === "de" && verbTriggers.has(previous))) {
    weights.verbos = 1;
    weights.acoes = 0.74;
    weights.substantivos = 0.38;
    weights.objetosCulturais = 0.26;
    weights.lugares = 0.22;
    weights.adjetivos = 0.18;
    label = "pista verbal";
    reason = "O contexto sugere uma ação, então verbos e palavras de movimento ganham força.";
  } else if (adjectiveTriggers.has(last)) {
    weights.adjetivos = 1;
    weights.substantivos = 0.42;
    weights.objetosCulturais = 0.22;
    weights.lugares = 0.22;
    weights.acoes = 0.24;
    weights.verbos = 0.18;
    label = "pista descritiva";
    reason = "A estrutura anterior pede uma qualidade ou descrição para fechar melhor o verso.";
  }

  return { weights, label, reason };
}

function rhymeMatchScore(candidate, targetWord) {
  if (!targetWord) {
    return {
      score: 0.52,
      reason: "Neste verso a rima ainda nao foi travada, entao a dimensao de rima fica neutra.",
    };
  }

  const candidateWord = normalizePredictionWord(candidate);
  const target = normalizePredictionWord(targetWord);

  if (!candidateWord || !target) {
    return {
      score: 0.08,
      reason: "Sem base suficiente para comparar a terminação da palavra com a rima alvo.",
    };
  }

  if (candidateWord === target) {
    return {
      score: 0.82,
      reason: `A palavra repete exatamente a terminação de "${targetWord}", mas perde um pouco por ficar literal demais.`,
    };
  }

  if (candidateWord.length >= 3 && target.length >= 3 && candidateWord.slice(-3) === target.slice(-3)) {
    return {
      score: 1,
      reason: `A terminação final de 3 letras aproxima bem a palavra da rima esperada com "${targetWord}".`,
    };
  }

  if (candidateWord.length >= 2 && target.length >= 2 && candidateWord.slice(-2) === target.slice(-2)) {
    return {
      score: 0.74,
      reason: `A palavra compartilha 2 letras finais com "${targetWord}", criando uma rima intermediaria.`,
    };
  }

  if (candidateWord.slice(-1) === target.slice(-1)) {
    return {
      score: 0.32,
      reason: `A palavra encosta na rima de "${targetWord}" so pela ultima letra, entao a forca fica leve.`,
    };
  }

  return {
    score: 0.04,
    reason: `A terminação de "${candidate}" se afasta da rima que o esquema pede com "${targetWord}".`,
  };
}

function themeAffinityScore(candidateRecord, theme) {
  if (candidateRecord && candidateRecord.categories.size) {
    const categoryCount = candidateRecord.categories.size;
    const categoryList = Array.from(candidateRecord.categories);
    const centralIndex = Math.min(...candidateRecord.indexes);
    const themeSize = Math.max(1, getThemeEntries(theme).length);
    const positionBonus = 0.12 * (1 - centralIndex / themeSize);
    return {
      score: Math.max(0.52, Math.min(1, 0.7 + categoryCount * 0.08 + positionBonus)),
      reason: `A palavra aparece na trilha "${theme.name}" nas categorias ${categoryList.join(", ")}.`,
    };
  }

  return {
    score: 0.28,
    reason: `A palavra nao aparece diretamente no repertorio principal da trilha "${theme.name}".`,
  };
}

function syntaxCueScore(candidateRecord, expectations) {
  if (!candidateRecord || !candidateRecord.categories.size) {
    return {
      score: 0.34,
      reason: expectations.reason,
    };
  }

  const categoryScores = Array.from(candidateRecord.categories).map((category) => expectations.weights[category] || 0.22);
  const bestScore = Math.max(...categoryScores, 0.22);
  const bestCategory = Array.from(candidateRecord.categories).sort((a, b) => (expectations.weights[b] || 0) - (expectations.weights[a] || 0))[0];

  return {
    score: bestScore,
    reason: `A pista sintatica atual favorece a categoria "${bestCategory}" neste fechamento do verso.`,
  };
}

function historyCoherenceScore(candidateWord, candidateRecord, themeLookup, lines) {
  if (!lines || lines.length === 0) {
    return {
      score: 0.55,
      reason: "Como ainda nao ha versos anteriores, a coerencia com a quadra fica neutra.",
    };
  }

  const normalizedCandidate = normalizePredictionWord(candidateWord);
  const previousWords = lines.map((line) => normalizePredictionWord(line.token || getLastWord(line.verse)));

  if (previousWords.includes(normalizedCandidate)) {
    return {
      score: 0.12,
      reason: "A palavra ja apareceu na quadra, entao perde coerencia por repeticao.",
    };
  }

  let overlap = 0;
  previousWords.forEach((previousWord) => {
    const previousRecord = themeLookup.get(previousWord);
    if (!previousRecord || !candidateRecord) return;

    const hasSharedCategory = Array.from(candidateRecord.categories).some((category) => previousRecord.categories.has(category));
    if (hasSharedCategory) overlap += 1;
  });

  const baseScore = 0.42 + (overlap / lines.length) * 0.36;
  const finalScore = Math.max(0.24, Math.min(0.88, baseScore));

  if (overlap > 0) {
    return {
      score: finalScore,
      reason: "A palavra conversa com categorias ja usadas nos versos anteriores, mantendo unidade na quadra.",
    };
  }

  return {
    score: finalScore,
    reason: "A palavra permanece coerente com o tema, mas abre um desvio leve em relacao aos versos anteriores.",
  };
}

function corpusFrequencyScore(candidateWord, candidateRecord, themeWords, rhymeWords, fallbackWords) {
  const normalizedCandidate = normalizePredictionWord(candidateWord);
  const inTheme = themeLookupHas(themeWords, normalizedCandidate);
  const inRhymeBank = themeLookupHas(rhymeWords, normalizedCandidate);
  const inFallback = themeLookupHas(fallbackWords, normalizedCandidate);

  let score = 0.24;
  if (inTheme) score += 0.36;
  if (inRhymeBank) score += 0.22;
  if (inFallback) score += 0.1;
  if (candidateRecord && candidateRecord.categories.size > 1) score += 0.08;

  return {
    score: Math.max(0.2, Math.min(0.92, score)),
    reason: "Esta dimensao representa o quanto a palavra aparece nos pequenos repertorios usados como corpus pedagogico.",
  };
}

function themeLookupHas(words, normalizedCandidate) {
  return (words || []).some((word) => normalizePredictionWord(word) === normalizedCandidate);
}

function roundVectorValue(value) {
  return Math.round(value * 1000) / 1000;
}

function buildPredictionsV2(verse, theme, lines, scheme) {
  const themeLookup = buildThemeLookup(theme);
  const themeWords = uniqueWords(getThemeEntries(theme).map((entry) => entry.word));
  const fallbackWords = uniqueWords(typeof FALLBACK_TOKENS !== "undefined" ? FALLBACK_TOKENS : ["sol", "lua", "mar", "amor"]);
  const targetRhymeWord = suggestNextWord(scheme, lines);
  const rhymeWords = targetRhymeWord ? findRhymes(targetRhymeWord) : [];
  const beforeBlank = String(verse || "").split("___")[0].trim();
  const expectations = detectContextExpectations(beforeBlank);

  const candidatePool = uniqueWords([
    ...rhymeWords,
    ...themeWords,
    ...fallbackWords,
    ...getRhymeBankWords(),
  ]);

  const weights = [
    { key: "themeAffinity", label: "Tema da trilha", weight: 0.2 },
    { key: "rhymeAffinity", label: "Rima esperada", weight: 0.34 },
    { key: "syntaxCue", label: "Pista sintatica", weight: 0.18 },
    { key: "historyCoherence", label: "Coerencia da quadra", weight: 0.14 },
    { key: "corpusFrequency", label: "Frequencia no mini-corpus", weight: 0.14 },
  ];

  const scoredCandidates = candidatePool.map((candidate) => {
    const normalized = normalizePredictionWord(candidate);
    const candidateRecord = themeLookup.get(normalized);

    const themeDimension = themeAffinityScore(candidateRecord, theme);
    const rhymeDimension = rhymeMatchScore(candidate, targetRhymeWord);
    const syntaxDimension = syntaxCueScore(candidateRecord, expectations);
    const historyDimension = historyCoherenceScore(candidate, candidateRecord, themeLookup, lines);
    const corpusDimension = corpusFrequencyScore(candidate, candidateRecord, themeWords, rhymeWords, fallbackWords);

    const dimensions = [
      { ...weights[0], score: themeDimension.score, reason: themeDimension.reason },
      { ...weights[1], score: rhymeDimension.score, reason: rhymeDimension.reason },
      { ...weights[2], score: syntaxDimension.score, reason: syntaxDimension.reason },
      { ...weights[3], score: historyDimension.score, reason: historyDimension.reason },
      { ...weights[4], score: corpusDimension.score, reason: corpusDimension.reason },
    ].map((dimension) => ({
      ...dimension,
      contribution: roundVectorValue(dimension.score * dimension.weight),
      score: roundVectorValue(dimension.score),
    }));

    const totalScore = roundVectorValue(dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0));

    return {
      word: candidate,
      normalized,
      totalScore,
      dimensions,
    };
  });

  scoredCandidates.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

    const bRhyme = b.dimensions.find((dimension) => dimension.key === "rhymeAffinity")?.score || 0;
    const aRhyme = a.dimensions.find((dimension) => dimension.key === "rhymeAffinity")?.score || 0;
    if (bRhyme !== aRhyme) return bRhyme - aRhyme;

    return a.word.localeCompare(b.word, "pt-BR");
  });

  let topCandidates = scoredCandidates.slice(0, 4);
  if (targetRhymeWord) {
    const rhymeWordSet = new Set(rhymeWords.map((word) => normalizePredictionWord(word)));
    const rhymeOnly = scoredCandidates.filter((candidate) => rhymeWordSet.has(candidate.normalized));

    if (rhymeOnly.length >= 4) {
      topCandidates = rhymeOnly.slice(0, 4);
    }

    const rhymePriority = scoredCandidates.filter((candidate) => {
      const rhymeDimension = candidate.dimensions.find((dimension) => dimension.key === "rhymeAffinity");
      return rhymeDimension && rhymeDimension.score >= 0.74;
    }).slice(0, 2);

    if (rhymeOnly.length < 4 && rhymePriority.length > 0) {
      const forcedSelection = [...rhymePriority];
      scoredCandidates.forEach((candidate) => {
        if (forcedSelection.length >= 4) return;
        if (forcedSelection.some((selected) => selected.normalized === candidate.normalized)) return;
        forcedSelection.push(candidate);
      });
      topCandidates = forcedSelection.slice(0, 4);
    }
  }

  const totalTopScore = Math.max(0.001, topCandidates.reduce((sum, candidate) => sum + candidate.totalScore, 0));
  const probabilities = topCandidates.map((candidate) => roundVectorValue(candidate.totalScore / totalTopScore));
  const confidence = Math.max(
    0.12,
    Math.min(
      0.96,
      0.24 + ((probabilities[0] || 0) - (probabilities[3] || probabilities[probabilities.length - 1] || 0)) * 1.9
    )
  );

  const details = topCandidates.map((candidate, index) => ({
    word: candidate.word,
    normalized: candidate.normalized,
    totalScore: candidate.totalScore,
    probability: probabilities[index],
    dimensions: candidate.dimensions,
  }));

  return {
    candidates: topCandidates.map((candidate) => candidate.word),
    probs: probabilities,
    confidence: roundVectorValue(confidence),
    details,
    targetRhymeWord,
    contextSummary: {
      beforeBlank,
      expectationLabel: expectations.label,
      expectationReason: expectations.reason,
    },
  };
}
