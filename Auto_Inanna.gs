function doPost(e) {
  return registrarVerso(e);
}

function normWordScore(word) {
  return String(word || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function extractWordTokensScore(verse) {
  return String(verse || "")
    .trim()
    .split(/\s+/)
    .map(function (token) {
      return token.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ-]+$/g, "");
    })
    .filter(function (token) { return !!token; });
}

function getLastWordScore(verse) {
  var tokens = extractWordTokensScore(verse);
  return normWordScore(tokens.length ? tokens[tokens.length - 1] : "");
}

function isSuspiciousJoinedTokenScore(token) {
  var normalized = normWordScore(token);
  if (!normalized) return false;
  if (/^(de|da|do|das|dos|na|no|nas|nos|em|com|pra|pro|e|foi|vai|sou|era|sao|estou|esta|ta|comeu)[a-z]{5,}$/.test(normalized)) {
    return true;
  }
  return normalized.length >= 13;
}

function rhymePairScoreScore(a, b) {
  if (!a || !b) return -1;
  if (a === b && a.length > 1) return 3;
  if (a.length >= 3 && b.length >= 3 && a.slice(-3) === b.slice(-3)) return 3;
  if (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2)) return 2;
  if (a.slice(-1) === b.slice(-1)) return 1;
  return -1;
}

function getQuadraLines(verseText) {
  return String(verseText || "")
    .split(/\r?\n/)
    .map(function (line) { return String(line || "").trim(); })
    .filter(function (line) { return !!line; })
    .slice(0, 4);
}

function analyzeStructureScore(lines) {
  var stopwords = {
    de: true, do: true, da: true, dos: true, das: true,
    e: true, em: true, com: true, pra: true, pro: true,
    para: true, que: true, se: true, na: true, no: true,
    nas: true, nos: true
  };
  var goodLines = 0;
  var suspiciousLines = 0;

  lines.forEach(function (line) {
    var tokens = extractWordTokensScore(line);
    var finalToken = tokens.length ? tokens[tokens.length - 1] : "";
    var finalWord = normWordScore(finalToken);
    var balanced = tokens.length >= 3 && tokens.length <= 8;
    var suspicious = tokens.some(function (token) {
      return isSuspiciousJoinedTokenScore(token);
    });
    var clearEnding = finalWord.length >= 2 && !stopwords[finalWord] && !isSuspiciousJoinedTokenScore(finalToken);

    if (suspicious) suspiciousLines += 1;
    if (balanced && clearEnding && !suspicious) goodLines += 1;
  });

  return {
    goodLines: goodLines,
    suspiciousLines: suspiciousLines,
    points: goodLines === 4 ? 2 : goodLines >= 3 ? 1 : 0
  };
}

function analyzeRhymeScore(lines) {
  var words = lines.map(function (line) { return getLastWordScore(line); });
  var schemes = [
    { id: "AABB", pairs: [[0, 1], [2, 3]], label: "AABB" },
    { id: "ABAB", pairs: [[0, 2], [1, 3]], label: "ABAB" },
    { id: "ABBA", pairs: [[0, 3], [1, 2]], label: "ABBA" }
  ];

  var best = schemes[0];
  var bestPairScores = [-1, -1];
  var bestScore = -99;

  schemes.forEach(function (scheme) {
    var pairScores = scheme.pairs.map(function (pair) {
      return rhymePairScoreScore(words[pair[0]], words[pair[1]]);
    });
    var total = pairScores.reduce(function (sum, score) { return sum + score; }, 0);
    if (total > bestScore) {
      bestScore = total;
      best = scheme;
      bestPairScores = pairScores;
    }
  });

  var strongScheme = bestPairScores.every(function (score) { return score >= 2; });

  return {
    scheme: best.label,
    pairScores: bestPairScores,
    pairScoreTotal: bestScore,
    bonusEsquema: strongScheme ? 2 : 0
  };
}

function calculateChallengeScoreFromVerse(verseText, creativityBonus) {
  var lines = getQuadraLines(verseText);
  var structure = analyzeStructureScore(lines);
  var rhyme = analyzeRhymeScore(lines);
  var creativity = Math.max(0, Math.min(2, Number(creativityBonus) || 0));
  var total = Math.max(0, structure.points + rhyme.pairScoreTotal + rhyme.bonusEsquema + creativity);

  return {
    total: total,
    scheme: rhyme.scheme,
    pontosRima: rhyme.pairScoreTotal,
    pontosForma: structure.points,
    pontosCriatividade: creativity,
    bonusEsquema: rhyme.bonusEsquema
  };
}

function registrarVerso(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName("Página1") || ss.getSheets()[0];
    var modoStr = data.modo || "Didático";
    var score = calculateChallengeScoreFromVerse(data.verso, data.pontosCriatividade);
    var pontosNum = modoStr === "Desafio" ? score.total : 0;

    sheet.appendRow([
      new Date(),
      data.nome,
      data.email,
      data.tipoAcesso,
      data.verso,
      modoStr,
      pontosNum,
      score.scheme || "—",
      score.pontosRima || 0,
      score.pontosForma || 0,
      score.pontosCriatividade || 0,
      score.bonusEsquema || 0
    ]);

    if (modoStr === "Desafio") {
      atualizarPlacar(ss, sheet);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function atualizarPlacar(ss, mainSheet) {
  var values = mainSheet.getDataRange().getValues();
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var timestamp = row[0];
    var modo = row[5];
    if (modo !== "Desafio") continue;

    var storedCreativity = Number(row[10]) || 0;
    var score = calculateChallengeScoreFromVerse(row[4], storedCreativity);

    records.push({
      timestamp: timestamp,
      autor: row[1],
      verso: row[4],
      pontos: score.total,
      pontosRima: score.pontosRima,
      pontosForma: score.pontosForma,
      pontosCriatividade: score.pontosCriatividade,
      bonusEsquema: score.bonusEsquema
    });
  }

  records.sort(function (a, b) {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.pontosRima !== a.pontosRima) return b.pontosRima - a.pontosRima;
    if (b.pontosCriatividade !== a.pontosCriatividade) return b.pontosCriatividade - a.pontosCriatividade;
    if (b.pontosForma !== a.pontosForma) return b.pontosForma - a.pontosForma;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }

  placarSheet.clear();
  placarSheet.appendRow(["Posição", "Autor", "Verso", "Pontos", "Pts Rima", "Pts Forma", "Pts Criatividade", "Bônus Esquema", "Timestamp"]);
  placarSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");

  for (var j = 0; j < records.length; j++) {
    placarSheet.appendRow([
      (j + 1) + "º",
      records[j].autor,
      records[j].verso,
      records[j].pontos,
      records[j].pontosRima,
      records[j].pontosForma,
      records[j].pontosCriatividade,
      records[j].bonusEsquema,
      records[j].timestamp
    ]);
  }
}

function doGet(e) {
  try {
    if (e.parameter.action === "getPlacar") {
      var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
      var ss = SpreadsheetApp.openById(sheetId);
      var sheet = ss.getSheetByName("placar");

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var rows = sheet.getDataRange().getValues();
      var result = [];

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (row[0]) {
          result.push({
            posicao: row[0],
            autor: row[1],
            verso: row[2],
            pontos: row[3] || 0,
            pontosRima: row[4] || 0,
            pontosForma: row[5] || 0,
            pontosCriatividade: row[6] || 0,
            bonusEsquema: row[7] || 0,
            timestamp: row[8] || ""
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Endpoint GET pronto.")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupInicial() {
  var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
  var ss = SpreadsheetApp.openById(sheetId);

  var formSheet = ss.getSheetByName("Página1");
  if (!formSheet) {
    formSheet = ss.insertSheet("Página1");
  }
  if (formSheet.getLastRow() === 0) {
    formSheet.appendRow(["Carimbo de data/hora", "Nome", "Email", "Tipo de Participante", "Verso", "Modo", "Pontos", "Esquema de Rima", "Pts Rima", "Pts Forma", "Pts Criatividade", "Bônus Esquema"]);
    formSheet.getRange("A1:L1").setFontWeight("bold").setBackground("#d9ead3");
  }

  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }
  if (placarSheet.getLastRow() === 0) {
    placarSheet.appendRow(["Posição", "Autor", "Verso", "Pontos", "Pts Rima", "Pts Forma", "Pts Criatividade", "Bônus Esquema", "Timestamp"]);
    placarSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");
  }

  Logger.log("Configuração concluída! Suas abas 'Página1' e 'placar' estão prontas.");
}

function reconstruirPlacar() {
  var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
  var ss = SpreadsheetApp.openById(sheetId);
  var formSheet = ss.getSheetByName("Página1") || ss.getSheets()[0];
  atualizarPlacar(ss, formSheet);
  Logger.log("Placar reconstruído com a nova regra de pontuação.");
}
