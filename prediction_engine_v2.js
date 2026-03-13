// prediction_engine_v2.js

function getRhymeBankWords() {
  if (typeof CORDEL_RHYME_BANK !== "undefined" && CORDEL_RHYME_BANK) {
    return Object.values(CORDEL_RHYME_BANK).flat();
  }
  if (typeof FALLBACK_TOKENS !== "undefined" && Array.isArray(FALLBACK_TOKENS)) {
    return [...FALLBACK_TOKENS];
  }
  return ["sol", "lua", "mar", "amor"];
}

// 1. Extrair última palavra
function getLastWord(verse) {
  if (!verse) return "";
  const words = verse.trim().split(/\s+/);
  if (words.length === 0) return "";
  let last = words[words.length - 1];
  last = last.replace(/___/g, ""); // Remove placemarker if any
  return typeof normWord === "function" ? normWord(last) : last.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/gi, "");
}

// 2. Busca de rimas fonéticas
function findRhymes(word) {
  if (!word) return [];
  const normalized = typeof normWord === "function" ? normWord(word) : word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/gi, "");
  if (!normalized) return [];

  const allWords = getRhymeBankWords();
  let rhymes3 = [];
  let rhymes2 = [];
  let rhymes1 = [];

  for (let w of allWords) {
    let nw = typeof normWord === "function" ? normWord(w) : w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/gi, "");
    if (nw === normalized) continue;

    if (nw.length >= 3 && normalized.length >= 3 && nw.slice(-3) === normalized.slice(-3)) {
      rhymes3.push(w);
    } else if (nw.length >= 2 && normalized.length >= 2 && nw.slice(-2) === normalized.slice(-2)) {
      rhymes2.push(w);
    } else if (nw.length >= 1 && normalized.length >= 1 && nw.slice(-1) === normalized.slice(-1)) {
      rhymes1.push(w);
    }
  }

  if (rhymes3.length > 0) return rhymes3;
  if (rhymes2.length > 0) return rhymes2;
  return rhymes1;
}

// 3. Sugestão automática de esquema
function suggestNextWord(scheme, lines) {
  let targetWord = null;
  let nextIndex = lines.length;

  if (scheme === "AABB") {
    if (nextIndex === 1 && lines[0]) targetWord = getLastWord(lines[0].verse); 
    if (nextIndex === 3 && lines[2]) targetWord = getLastWord(lines[2].verse);
  } else if (scheme === "ABAB") {
    if (nextIndex === 2 && lines[0]) targetWord = getLastWord(lines[0].verse);
    if (nextIndex === 3 && lines[1]) targetWord = getLastWord(lines[1].verse);
  }

  return targetWord;
}

// 4. Motor de Previsão V2
function buildPredictionsV2(verse, theme, lines, scheme) {
  let poolTheme = [];
  if (theme && theme.tokens) {
    if (Array.isArray(theme.tokens)) {
      poolTheme = [...theme.tokens];
    } else {
      poolTheme = Object.values(theme.tokens).flat();
    }
  }

  let targetRhymeWord = suggestNextWord(scheme, lines);
  
  if (!targetRhymeWord && lines.length > 0) {
    targetRhymeWord = getLastWord(lines[lines.length - 1].verse);
  }

  let rhymes = [];
  if (targetRhymeWord) {
    rhymes = findRhymes(targetRhymeWord);
  }

  const allLexical = getRhymeBankWords();
  let candidates = [];
  
  function popRandom(arr) {
    if (arr.length === 0) return null;
    const idx = Math.floor(Math.random() * arr.length);
    return arr.splice(idx, 1)[0];
  }

  let pool1 = [...poolTheme];
  let pool2 = [...rhymes];
  let pool3 = [...allLexical];
  let pool4 = (typeof FALLBACK_TOKENS !== "undefined") ? [...FALLBACK_TOKENS] : ["sol", "lua", "mar", "amor"];

  // Se tem rima sugerida forte (vinda da rima alvo), tente inserir
  while(candidates.length < 2 && pool2.length > 0) {
      let r = popRandom(pool2);
      if(!candidates.includes(r)) candidates.push(r);
  }
  
  while(candidates.length < 3 && pool1.length > 0) {
      let t = popRandom(pool1);
      if(!candidates.includes(t)) candidates.push(t);
  }
  
  while(candidates.length < 4 && pool3.length > 0) {
      let l = popRandom(pool3);
      if(!candidates.includes(l)) candidates.push(l);
  }
  
  while(candidates.length < 4 && pool4.length > 0) {
      let f = popRandom(pool4);
      if(!candidates.includes(f)) candidates.push(f);
  }

  candidates.sort(() => Math.random() - 0.5);

  const base = 0.70;
  let weights = candidates.map((_, i) => {
    const jitter = (Math.random() * 0.22) - 0.11;
    const bias = (3 - i) * 0.09;
    return Math.max(0.05, base + bias + jitter);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map(w => w / sum);
  const sorted = [...probs].sort((a, b) => b - a);
  const confidence = Math.max(0.12, Math.min(0.96, 0.25 + (sorted[0] - sorted[3]) * 1.8));

  return { candidates, probs, confidence };
}
