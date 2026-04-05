# Inanna

Inanna e um app educativo de quadras em cordel com explicacao pedagogica de previsao de proxima palavra. O projeto mistura frontend estatico, um motor preditivo simplificado, banco local de rimas e backend em Google Apps Script para registro e placar.

## Arquitetura

- Frontend: `index.html`, `styles.css`, `app.js`.
- Motor de previsao: `prediction_engine_v2.js`.
- Banco lexical de rimas: `cordel_rhyme_bank.js`.
- Backend e placar: `Auto_Inanna.gs`.
- Midias e embeds: imagens, video e snippet de footer na propria pasta.

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

## Backend em `Auto_Inanna.gs`

### Endpoints

- `doPost(e)`: recebe a quadra e grava o registro.
- `doGet(e)` com `action=getPlacar`: devolve o placar em JSON.
- `doGet(e)` com `action=checkin_lookup`: devolve identidade por JSONP.

### Planilha principal

`FORM_HEADERS` inclui campos como:

- `Nome`
- `Email`
- `Tipo de Participante`
- `Verso`
- `Modo`
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

1. Atualize `Auto_Inanna.gs` no Apps Script.
2. Rode `setupInicial()` na primeira configuracao.
3. Rode `instalarTriggersDoPlacar()` se precisar reinstalar os gatilhos.
4. Publique o Web App.
5. Atualize `WEB_APP_URL` em `app.js` se a URL mudar.

## Observacoes

- O app combina explicacao conceitual de IA com um jogo de escrita formal.
- Mesmo quando o frontend calcula a pontuacao, o backend recalcula tudo na gravacao final.
- O README antigo focava mais no conceito; este arquivo passa a cobrir tambem operacao, backend e check-in.
