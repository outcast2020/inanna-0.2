function doPost(e) {
  return registrarVerso(e);
}

function registrarVerso(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
    var ss = SpreadsheetApp.openById(sheetId);
    
    // Supondo que a primeira aba ou aba "Página1" receba os registros
    var sheet = ss.getSheetByName("Página1") || ss.getSheets()[0];
    
    // Colunas: Timestamp, Nome, Email, Tipo de participante, Verso, Modo, Pontos, Esquema de Rima, Pts Rima
    var modoStr = data.modo || "Didático";
    var pontosNum = Number(data.pontos) || 0;
    
    sheet.appendRow([
      new Date(),
      data.nome,
      data.email,
      data.tipoAcesso,
      data.verso,
      modoStr,
      pontosNum,
      data.esquemaRima || "—",
      data.pontosRima || 0
    ]);

    // Update placar se for modo Desafio
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
  var dataRange = mainSheet.getDataRange();
  var values = dataRange.getValues();
  
  var records = [];
  // Ignora o cabeçalho (i=1)
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var timestamp = row[0];
    var modo = row[5];
    var pontos = Number(row[6]) || 0;
    
    // row[1] = Nome, row[4] = Verso
    if (modo === "Desafio") {
      records.push({
        timestamp: timestamp,
        autor: row[1],
        verso: row[4],
        pontos: pontos
      });
    }
  }
  
  // Ordenar por pontos; em empate, vence o registro mais recente
  records.sort(function(a, b) {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Manter o placar completo ordenado para o app exibir Top 10 e modal completo
  var rankedRecords = records;
  
  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }
  
  // Limpar a aba placar e recriar o cabeçalho
  placarSheet.clear();
  placarSheet.appendRow(["Posição", "Autor", "Verso", "Pontos", "Timestamp"]);
  placarSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#fff2cc");
  
  // Inserir todos os registros ranqueados
  for (var j = 0; j < rankedRecords.length; j++) {
    var pos = (j + 1) + "º";
    placarSheet.appendRow([
      pos,
      rankedRecords[j].autor,
      rankedRecords[j].verso,
      rankedRecords[j].pontos,
      rankedRecords[j].timestamp
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
        if(row[0]) {
            result.push({
            posicao: row[0],
            autor: row[1],
            verso: row[2],
            pontos: row[3] || 0,
            timestamp: row[4] || ""
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
    formSheet.appendRow(["Carimbo de data/hora", "Nome", "Email", "Tipo de Participante", "Verso", "Modo", "Pontos", "Esquema de Rima", "Pts Rima"]);
    formSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#d9ead3");
  }
  
  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }
  if (placarSheet.getLastRow() === 0) {
    placarSheet.appendRow(["Posição", "Autor", "Verso", "Pontos", "Timestamp"]);
    placarSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#fff2cc");
  }
  
  Logger.log("Configuração concluída! Suas abas 'Página1' e 'placar' estão prontas.");
}

function reconstruirPlacar() {
  var sheetId = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
  var ss = SpreadsheetApp.openById(sheetId);
  var formSheet = ss.getSheetByName("Página1") || ss.getSheets()[0];
  atualizarPlacar(ss, formSheet);
  Logger.log("Placar reconstruído com todos os registros de modo Desafio.");
}
