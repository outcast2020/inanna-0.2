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


## Conformidade com LGPD e privacidade

Este projeto adota uma lógica de minimização de dados e busca tratar apenas as informações estritamente necessárias para identificação do participante, organização pedagógica e funcionamento do caderno de sextilhas, em consonância com o guia do Laboratório Cordel 2.0 (LABORATÓRIO CORDEL 2.0, 2026) e com as orientações do Ministério da Educação sobre tratamento de dados pessoais (BRASIL, 2025).

No fluxo de uso, o laboratório prioriza a coleta mínima de dados, como nome ou pseudônimo, e-mail, produção textual, escola, turma ou oficina quando isso for relevante para organização pedagógica. Ao mesmo tempo, recomenda que não sejam inseridos dados sensíveis ou desnecessários, como endereço residencial, documentos, biometria, saúde, religião ou opinião política (LABORATÓRIO CORDEL 2.0, 2026).

Em casos de placar, mostras, antologias, exposições ou circulação pública, a recomendação institucional é priorizar formas reduzidas de identificação, como apelido, primeiro nome ou pseudônimo. Também se prevê moderação prévia, ocultação, correção ou retirada de conteúdos quando isso for necessário para proteção dos participantes (LABORATÓRIO CORDEL 2.0, 2026).

O titular, ou seu responsável legal quando aplicável, pode solicitar informação, correção, anonimização, revisão de exposição pública indevida e exclusão de dados nos limites legais e institucionais. Esse ponto reforça o alinhamento do projeto com a LGPD e com a noção de proteção de dados como direito fundamental no contexto educacional (BRASIL, 2025; BRASIL, [2026]).

## Termos de uso e responsabilidade pedagógica

Ao realizar o check-in, o participante ingressa em um ambiente explicitamente descrito como educativo, cultural e experimental, no qual a tecnologia funciona como apoio à criação, à análise e à reflexão, mas não substitui autoria humana, mediação pedagógica, responsabilidade ética nem identidade cultural (LABORATÓRIO CORDEL 2.0, 2026).

No caso específico da Inanna, o próprio termo do laboratório define a ferramenta como uma “Proto-IA”, isto é, um dispositivo pedagógico voltado à exploração de padrões, previsões e combinações textuais. Isso dialoga diretamente com a arquitetura do app, em que o motor de previsão trabalha com contexto sintático, rima, coerência e frequência local, sem operar como um modelo generativo de linguagem completo.

O participante também se compromete a usar o ambiente de forma ética e respeitosa. O laboratório veda conteúdo ofensivo, discriminatório ou violento, exposição de dados pessoais de terceiros sem autorização, simulação de identidade, violação de direitos autorais e qualquer uso voltado a assédio, humilhação, vigilância indevida ou dano moral (LABORATÓRIO CORDEL 2.0, 2026).

Quando houver participação de crianças e adolescentes, o uso deve ocorrer com mediação pedagógica adequada, linguagem compatível com a faixa etária e atenção aos riscos de simplificação indevida, automação acrítica e reprodução de vieses. Além disso, todo conteúdo sugerido, previsto, classificado ou gerado por ferramenta do laboratório deve passar por validação humana antes de uso pedagógico decisivo, publicação ou circulação pública (LABORATÓRIO CORDEL 2.0, 2026; BRASIL, [2026]).

## Diretrizes de IA do MEC e posicionamento do projeto

O Referencial para Desenvolvimento e Uso Responsáveis de Inteligência Artificial na Educação, elaborado no âmbito do MEC, propõe que a adoção de IA no campo educacional esteja baseada em equidade, inclusão, centralidade dos educadores, transparência, explicabilidade e governança de dados para confiança, segurança e privacidade (BRASIL, [2026]).

Esse mesmo referencial distingue oportunidades e desafios. Entre os desafios, estão a transparência dos sistemas, os vieses, a segurança e privacidade, os direitos autorais, o risco de plágio, as alucinações em IA generativa, a dependência excessiva e as desigualdades digitais. Por isso, o documento defende supervisão humana significativa e alinhamento da tecnologia às finalidades educacionais (BRASIL, [2026]).

A arquitetura atual do Inanna é coerente com esse horizonte. No jogo de quadras, não há IA generativa escrevendo pelo participante. O que existe é um motor de previsão local, explicável e deliberadamente limitado, concebido como instrumento de letramento digital e de compreensão dos mecanismos de previsão textual. Já no caderno de sextilhas, a API Gemini 2.5 Flash aparece somente na etapa de devolutiva leve de progresso, sem assumir a escrita dos versos. Assim, a IA não ocupa o lugar do autor; ela apenas oferece uma análise breve orientada por indicadores já calculados pelo próprio backend.

Esse desenho reforça quatro princípios importantes: centralidade da autoria humana; transparência sobre o uso de recursos algorítmicos; limitação funcional da IA no processo de escrita; e proteção dos dados do participante por meio da combinação entre Apps Script, autenticação customizada e Firestore (BRASIL, [2026]; LABORATÓRIO CORDEL 2.0, 2026).

## Tecnologias e uso de IA

A estrutura do projeto combina frontend estático, backend em Google Apps Script, autenticação e persistência opcional em Firebase/Firestore e uma chamada restrita à API Gemini 2.5 Flash para feedback curto de progresso. No frontend, os fluxos de quadra, dashboard e editor ficam visíveis em `index.html` e são orquestrados por `app.js`, enquanto a integração com Firebase é configurada em `firebase-config.js` e operacionalizada em `firebase-sextilhas.js`.

O arquivo de configuração do Firebase já define o modo `firestore`, além de `collectionRoot = "participants"`, `textCollectionName = "texts"` e `versionCollectionName = "versions"`, o que confirma que o caderno de sextilhas foi pensado para armazenamento estruturado por participante. Já a ponte `firebase-sextilhas.js` cria autenticação com custom token, normaliza status editoriais, monta payloads de dashboard e restringe o acesso ao documento do próprio participante, reforçando a separação entre identidade e conteúdo autoral do caderno.

Na camada de IA, o fluxo principal continua não generativo. O motor `prediction_engine_v2.js` trabalha com normalização lexical, banco de rimas, expectativas sintáticas, compatibilidade de rima e sugestão da palavra seguinte; seu papel é didático e explicável. O uso de IA generativa propriamente dita aparece apenas no endpoint `save_text_version`, onde uma devolutiva curta pode ser gerada via Gemini 2.5 Flash, desde que as propriedades `INANNA_AI_FEEDBACK_ENABLED`, `INANNA_GEMINI_API_KEY` e `INANNA_GEMINI_MODEL=gemini-2.5-flash` estejam configuradas.

Em termos pedagógicos e éticos, isso significa que a escrita continua sendo do participante. A IA não faz o texto; ela oferece apenas um retorno leve sobre progresso, maturação e consistência, o que torna o desenho do projeto mais compatível com as recomendações de uso responsável de IA na educação (BRASIL, [2026]).

## Referências

BRASIL. Ministério da Educação. Tratamento de dados pessoais no MEC. Brasília, DF: MEC, 2025. Atualizado em: 26 mar. 2025. Disponível em: <https://www.gov.br/mec/pt-br/acesso-a-informacao/privacidade-e-protecao-de-dados-pessoais/tratamento-de-dados-pessoais-no-mec>. Acesso em: 13 abr. 2026.

BRASIL. Ministério da Educação. Referencial para desenvolvimento e uso responsáveis de inteligência artificial na educação. Brasília, DF: MEC, [2026]. Disponível em: <https://www.gov.br/mec/pt-br/media/segape/referencial-oficial-pt.pdf>. Acesso em: 13 abr. 2026.

LABORATÓRIO CORDEL 2.0. Guia de acesso, termos de uso, privacidade e créditos (v. 03/04/2026). Salvador: Cordel 2.0, 2026. Disponível em: <https://www.cordel2pontozero.com/s/laboratorio_cordel_2_0_termos_referencias_ABRIL2026.pdf>. Acesso em: 13 abr. 2026.
