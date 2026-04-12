# Inanna

Inanna e um app educativo de quadras em cordel com explicacao pedagogica de previsao de proxima palavra. O projeto mistura frontend estatico, um motor preditivo simplificado, banco local de rimas e backend em Google Apps Script para registro e placar.

## Arquitetura

- Frontend: `index.html`, `styles.css`, `app.js`.
- Motor de previsao: `prediction_engine_v2.js`.
- Banco lexical de rimas: `cordel_rhyme_bank.js`.
- Backend e placar: `Code.gs`.
- Midias e embeds: imagens, video e snippet de footer na propria pasta.

## Licenciamento

- O aplicativo Inanna e este repositorio estao licenciados sob MIT. Veja `LICENSE`.
- Os textos produzidos por cada usuario permanecem de autoria de seus respectivos criadores e sao disponibilizados sob CC BY-ND 4.0.

## Objetivo pedagogico

O app nao tenta simular um LLM real. Ele mostra de forma legivel como um sistema escolhe palavras a partir de:

- tema;
- contexto sintatico;
- rima;
- coerencia com a quadra;
- frequencia no mini-corpus.

O usuario pode:

- aceitar uma sugestao da IA;
- ver o vetor que levou a aquela sugestao;
- inventar a propria palavra;
- comparar escolha humana e escolha estatistica.

## Fluxo da experiencia

1. A pessoa informa e-mail e precisa validar identidade pelo lookup de check-in.
2. Escolhe um tema.
3. Escreve um verso sem a ultima palavra.
4. O app reconstrui o verso com `___`.
5. O motor sugere candidatos com probabilidade.
6. A pessoa escolhe uma sugestao ou digita uma palavra propria.
7. Depois de 4 versos, a quadra e fechada.
8. No modo desafio, a quadra recebe pontuacao e pode entrar no placar.
9. A quadra pode ser copiada, continuada ou enviada para a planilha.

## Frontend

### Constantes e estado

`app.js` usa:

- `WEB_APP_URL`: URL do Web App Apps Script.
- `APP_VARIANT`: `inanna-main`.
- `PLACAR_LIBRARY`: fallback local para placar quando nao houver backend ativo.
- `THEMES`: curadoria local de temas e vocabulario.

O estado principal guarda:

- identidade resolvida pelo check-in;
- tema escolhido;
- versos acumulados;
- predicao atual;
- esquema de rima;
- pontuacao;
- modo desafio ligado/desligado.

### Temas

Os temas locais incluem categorias como:

- `nordeste`
- `festajunina`
- `praia`
- `rua`
- `escola`
- `faculdade`
- `amizade`
- `pet`
- `trabalho`

Cada tema traz vocabulario dividido em:

- `substantivos`
- `verbos`
- `adjetivos`
- `lugares`
- `acoes`
- `objetosCulturais`

### Fases da interface

O frontend avanca por fases:

- check-in / entrada
- escolha de tema
- analise do verso
- escolha da palavra
- fechamento da quadra

O app tambem inclui:

- modal de vetor;
- modal pedagogico de embeddings;
- modal de placar Top 10.

## Motor preditivo

`prediction_engine_v2.js` calcula previsoes com cinco dimensoes:

1. tema da trilha
2. rima esperada
3. pista sintatica
4. coerencia da quadra
5. frequencia no mini-corpus

O arquivo implementa, entre outras coisas:

- normalizacao de tokens;
- lookup de vocabulario do tema;
- deteccao de expectativas sintaticas;
- busca de rimas por finais de 3, 2 e 1 letras;
- sugestao de palavra-alvo conforme esquema `AABB`, `ABAB` ou `ABBA`;
- detalhamento por dimensao para exibir no modal de vetor.

`cordel_rhyme_bank.js` complementa esse motor com o banco local de rimas.

## Pontuacao

O modo desafio trabalha com:

- forma da quadra;
- qualidade das rimas;
- bonus de esquema;
- criatividade autoral.

No frontend, a quadra e pontuada apos o quarto verso.

No backend, a pontuacao e recalculada no servidor antes de gravar, para evitar dependencia do calculo do cliente.

## Backend em `Code.gs`

### Endpoints

- `doPost(e)`: recebe a quadra e grava o registro.
- `doGet(e)` com `action=getPlacar`: devolve o placar em JSON.
- `doGet(e)` com `action=checkin_lookup`: devolve identidade por JSONP.
- `doGet(e)` com `action=get_user_dashboard`: devolve o resumo do caderno de sextilhas.
- `doGet(e)` com `action=get_text`: devolve um texto da trilha de sextilhas.
- `doGet(e)` com `action=get_text_versions`: devolve o historico de versoes.
- `doGet(e)` com `action=get_firebase_custom_token`: devolve um custom token para autenticar o frontend no Firebase.
- `doPost(e)` com `action=create_text`: cria um novo rascunho de sextilha.
- `doPost(e)` com `action=save_text_version`: salva uma nova versao e pode gerar devolutiva curta da Inanna via Gemini.
- `doPost(e)` com `action=archive_text`: arquiva um texto sem apagar seu historico.

### Planilha principal

`FORM_HEADERS` inclui campos como:

- `Nome`
- `Email`
- `Tipo de Participante`
- `Verso`
- `Modo`
- `Tempo Escrita (ms)`
- `Tempo Escrita`
- `Pontos`
- `Esquema de Rima`
- `Pts Rima`
- `Pts Forma`
- `Pts Criatividade`
- `Bonus Esquema`
- `PARTICIPANT_ID`
- `CHECKIN_USER_ID`
- `CHECKIN_MATCH_STATUS`
- `CHECKIN_MATCH_METHOD`
- `TEACHER_GROUP`
- `MUNICIPIO`
- `ESTADO`
- `ORIGEM`
- `APP_VARIANT`

No frontend, o cronometro de escrita substitui a antiga medida visual de confianca. O cliente envia ao backend os campos `tempoEscritaMs` e `tempoEscritaFormatado`, para registro sem efeito na pontuacao.

### Placar

`PLACAR_HEADERS` inclui:

- `Posicao`
- `Autor`
- `Verso`
- `Pontos`
- `Pts Rima`
- `Pts Forma`
- `Pts Criatividade`
- `Bonus Esquema`
- `Timestamp`

Regras:

- ordenacao por maior pontuacao;
- desempate pelo registro mais recente;
- exibicao do Top 10.

### Check-in

O backend tenta casar identidade por:

1. e-mail
2. nome + coorte
3. nome + municipio

As propriedades opcionais para a planilha de check-in sao:

- `IZA_CHECKIN_SPREADSHEET_ID`
- `IZA_CHECKIN_SHEET_NAME`
- `IZA_DEBUG_CHECKIN_EMAIL`

### Triggers e manutencao

Funcoes operacionais importantes:

- `setupInicial()`
- `reconstruirPlacar()`
- `instalarTriggersDoPlacar()`
- `limparTriggersDoPlacar()`
- `resetPlacarERegistrosComBackup()`

Os triggers instalados mantem o placar sincronizado em:

- `onFormSubmit`
- `onEdit`

Antes de resetar o placar e os registros, o script cria abas de backup com timestamp.

## Execucao local

Como o frontend e estatico, voce pode:

1. abrir `index.html` no navegador;
2. ou servir a pasta com um servidor estatico simples.

Exemplos:

```bash
npx http-server ./ -p 8080
```

```bash
python -m http.server 8080
```

## Deploy recomendado

1. Atualize `Code.gs` no Apps Script.
2. Rode `setupInicial()` e `reconfigurarPlanilhaInanna()` na primeira configuracao.
3. Rode `instalarTriggersDoPlacar()` se precisar reinstalar os gatilhos.
4. Publique o Web App.
5. Atualize `WEB_APP_URL` em `app.js` se a URL mudar.

## Caderno de sextilhas

O frontend agora tem uma camada de dados unica para a trilha de sextilhas.

- Se `window.INANNA_FIREBASE_OPTIONS.mode` estiver como `apps-script`, o caderno continua lendo e gravando pelo Web App.
- Se `window.INANNA_FIREBASE_OPTIONS.mode` estiver como `firestore` e o Firebase estiver configurado, o app tenta autenticar no Firebase com custom token e passa a ler e gravar o caderno direto no Firestore.
- Em caso de falha na camada Firebase, o frontend faz fallback automatico para o Apps Script.

Arquivos novos dessa fase:

- `firebase-config.js`: chave de configuracao local da camada Firebase.
- `firebase-sextilhas.js`: ponte do frontend para Firestore.

## Fase 1: feedback leve com Gemini

O `save_text_version` pode gerar uma devolutiva curta da Inanna usando os indicadores ja calculados pelo proprio backend.

Propriedades esperadas no Apps Script:

- `INANNA_AI_FEEDBACK_ENABLED=true`
- `INANNA_GEMINI_API_KEY=...`
- `INANNA_GEMINI_MODEL=gemini-2.5-flash`

Teste rapido no Apps Script:

- execute `testarInannaAi()` no editor do Apps Script;
- a funcao verifica se a IA esta habilitada, se a chave existe e faz uma chamada de smoke test ao Gemini;
- o retorno aparece em `Executions` e tambem no `Logger`, incluindo `sampleFeedback` quando a resposta vier correta.

Com isso ativo, cada salvamento relevante:

- registra a nova versao na aba `TEXT_VERSIONS`;
- salva a devolutiva gerada na aba `TEXT_FEEDBACK`;
- devolve `aiFeedback` no JSON para o frontend mostrar no editor.

## Fase 2: preparo para Firestore

O fluxo seguro recomendado e:

1. O aluno valida o e-mail pelo Apps Script.
2. O frontend pede `action=get_firebase_custom_token`.
3. O Apps Script verifica `participantId`, `checkinUserId` e e-mail.
4. O Apps Script assina um custom token do Firebase com claims como `participantId`.
5. O frontend usa esse token para autenticar no Firebase e acessar apenas `/participants/{participantId}/texts/...`.

Observacao:

- o custom token serve para o login inicial no Firebase;
- depois disso, o proprio SDK web mantem a sessao do usuario na aba e renova seu ID token internamente.

Propriedades esperadas no Apps Script para o token:

- `INANNA_FIREBASE_PROJECT_ID`
- `INANNA_FIREBASE_SERVICE_ACCOUNT_EMAIL`
- `INANNA_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY`

No frontend, preencha `window.INANNA_FIREBASE_CONFIG` com os dados publicos do app Web do Firebase e troque `mode` para `firestore`.

No modelo atual, o status `arquivada` fica apenas no documento pai do texto. As versoes salvas em `/versions/{versionId}` continuam imutaveis.

## Regras sugeridas do Firestore

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(participantId) {
      return request.auth != null
        && request.auth.token.participantId == participantId;
    }

    match /participants/{participantId}/texts/{textId} {
      allow read, create, update: if isOwner(participantId);
      allow delete: if false;

      match /versions/{versionId} {
        allow read, create: if isOwner(participantId);
        allow update, delete: if false;
      }
    }
  }
}
```

## UX imediata

Mesmo antes da virada ao Firestore, o caderno ja recebeu dois ganhos locais:

- skeleton loaders no dashboard e no historico de versoes;
- menos round-trips apos `save_text_version`, porque o editor reaproveita o retorno do proprio salvamento em vez de consultar tudo de novo;
- feedback progressivo no botao de salvar: primeiro `Salvando rascunho...` e, em esperas mais longas, `Inanna esta lendo...`;
- comparacao lado a lado entre duas versoes, destacando versos alterados.

## Observacoes

- O app combina explicacao conceitual de IA com um jogo de escrita formal.
- Mesmo quando o frontend calcula a pontuacao, o backend recalcula tudo na gravacao final.
- O README antigo focava mais no conceito; este arquivo passa a cobrir tambem operacao, backend e check-in.
