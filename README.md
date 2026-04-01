# Inanna - Proto-IA Educativa (Cordel 2.0)

Inanna e um app educativo que junta escrita de cordel, rima em quadras e letramento digital em IA.

Hoje o projeto trabalha com dois objetivos pedagogicos centrais:

1. Aprender a rimar quadras.
2. Entender como um sistema preditivo organiza palavras, pesos e probabilidades.

O app nao tenta esconder o processo. Ele foi desenhado para mostrar, de forma acessivel, como uma "proto-IA" escolhe palavras a partir de contexto, rima e distribuicao de chances.

## Visao geral

Na pratica, a experiencia funciona assim:

1. A pessoa escolhe uma trilha tematica.
2. Escreve o verso sem a ultima palavra.
3. A lacuna final fica fixa como `___`.
4. A Inanna sugere palavras para fechar o verso.
5. Cada sugestao mostra uma probabilidade.
6. O usuario pode escolher uma sugestao ou inventar sua propria palavra.
7. Depois de 4 versos, a quadra fecha de forma explicita.
8. Se quiser, a pessoa pode abrir outra quadra de 4 versos, com a contagem zerada.

## Proposito pedagogico

O app foi pensado como laboratorio de compreensao da IA, nao como "IA magica".

Ele ajuda a visualizar:

- previsao de proxima palavra;
- probabilidade linguistica;
- diferenca entre escolha humana e sugestao algoritimica;
- construcao de sentido por relacoes numericas;
- limite entre criatividade humana e reorganizacao estatistica.

Observacao importante:

**A Inanna nao usa embeddings reais de um grande modelo treinado.**

Ela usa um **vetor pedagogico simplificado**, criado para ensinar o principio geral: palavra vira numero, numeros recebem pesos, e a soma gera uma distribuicao de probabilidades.

## Fluxo atual do jogo

### Etapa 1 - trilha

O usuario escolhe um tema, como praia, pet, rua, tecnologia, cultura popular ou aniversario.

### Etapa 2 - verso com lacuna final

O usuario escreve o verso sem a ultima palavra. O sistema obriga a lacuna final, para que a rima fique concentrada no fechamento do verso.

Exemplo:

```text
No calor eu gosto de mergulhar no ___
```

### Etapa 3 - sugestoes e vetor

Na tela principal aparecem apenas:

- as palavras sugeridas;
- a probabilidade de cada uma;
- o campo para digitar uma palavra propria.

Cada sugestao tem o botao `Ver vetor`, que abre um modal com:

- o vetor pedagogico da palavra;
- os pesos usados na rodada;
- a soma ponderada;
- a distribuicao probabilistica entre as candidatas;
- uma explicacao em linguagem simples sobre a dimensao estocastica.

### Fechamento da quadra

Quando o quarto verso termina, o app entra em estado de "quadra pronta". O usuario ve a quadra concluida, a leitura de rima e a pontuacao do modo desafio.

## Motor preditivo pedagogico

O motor atual fica em [prediction_engine_v2.js](C:/Users/Carlos/Documents/ai%20BOT/Lab/Inanna/inanna-main/prediction_engine_v2.js) e trabalha com 5 dimensoes.

Cada palavra candidata recebe um vetor pedagogico com notas de 0 a 1 nestes eixos:

1. Tema da trilha
2. Rima esperada
3. Pista sintatica
4. Coerencia da quadra
5. Frequencia no mini-corpus

Depois, cada eixo recebe um peso. A configuracao atual e:

```text
Tema da trilha        0.20
Rima esperada         0.34
Pista sintatica       0.18
Coerencia da quadra   0.14
Frequencia corpus     0.14
```

A soma ponderada dessas cinco dimensoes gera a forca total da palavra na rodada. Em seguida, o sistema normaliza as candidatas do topo para construir a probabilidade mostrada na interface.

Formula simplificada:

```text
palavra -> vetor -> pesos -> soma -> probabilidade
```

## Mini-aula de vetores

O modal pedagogico do app tambem apresenta uma camada conceitual inspirada no ensino de embeddings:

- linguagem como espaco vetorial;
- palavras como posicoes numericas;
- semantica como relacao e diferenca;
- exemplo classico `Rei - Homem + Mulher ~= Rainha`;
- ideia de que a IA nao "entende" como humano, mas opera sobre relacoes matematicas.

O texto-base dessa mini-aula foi incorporado ao frontend para apoiar oficinas, aulas e conversas sobre letramento digital em IA.

## Aprendizagem de rima

O app foi reorganizado para favorecer a aprendizagem de quadras:

- a ultima palavra do verso fica sempre em aberto;
- a rima passa a ser decidida no fechamento do verso;
- o fim da quadra fica explicito;
- a interface sugere continuidade para nova quadra, nao para "verso infinito";
- o modo desafio valoriza mais a qualidade formal da quadra.

Esquemas trabalhados:

- `AABB`
- `ABAB`
- `ABBA`

## Pontuacao atual do modo desafio

O modo desafio usa uma regra mais formal e pedagogica.

### Forma da quadra

- `+2` se os 4 versos estiverem bem fechados e com leitura clara.
- `+1` se ao menos 3 versos estiverem bem fechados.

### Rima final

Cada par de rima recebe:

- `+3` para rima forte;
- `+2` para rima boa;
- `+1` para aproximacao fraca;
- `-1` quando a rima falha.

### Bonus de esquema

- `+2` quando os dois pares do esquema escolhido ficam com rima boa ou forte.

### Criatividade autoral

- `+1` por palavra digitada fora das sugestoes que ainda sustente a rima;
- maximo de `+2`.

### Maximo

- `12 pontos`

## Placar

O placar online mostra o Top 10 do modo desafio.

Regras de ordenacao:

1. maior pontuacao;
2. em caso de empate, vence o registro mais recente.

O frontend mostra Top 3 na lateral e abre o Top 10 completo em modal.

## Registro e backend

O backend fica em [Auto_Inanna.gs](C:/Users/Carlos/Documents/ai%20BOT/Lab/Inanna/inanna-main/Auto_Inanna.gs) e usa Google Apps Script com Google Sheets.

Hoje ele:

- recebe quadras via `doPost`;
- recalcula a pontuacao no servidor;
- atualiza o placar;
- entrega o placar via `doGet?action=getPlacar`;
- faz backup antes de resetar registros e placar;
- reconstrui o ranking historico quando necessario.

Funcoes uteis do Apps Script:

- `setupInicial()`
- `reconstruirPlacar()`
- `resetPlacarERegistrosComBackup()`
- `instalarTriggersDoPlacar()`

Observacao:

Mesmo sem depender totalmente de trigger, o `doGet` do placar tambem sincroniza o ranking antes de devolver os dados, para reduzir risco de desatualizacao.

## Estrutura do projeto

```text
inanna-main/
|-- index.html                # estrutura principal da experiencia
|-- styles.css                # estilos da interface e dos modais pedagogicos
|-- app.js                    # fluxo do jogo, UI, envio, placar e modais
|-- prediction_engine_v2.js   # motor preditivo pedagogico de 5 dimensoes
|-- cordel_rhyme_bank.js      # banco lexical de rimas
|-- Auto_Inanna.gs            # backend Google Apps Script + Google Sheets
|-- iframe MODELO.txt         # snippet/apoio de embed e textos relacionados
|-- emoji.png                 # avatar principal da Inanna
`-- README.md                 # documentacao do projeto
```

## Como executar localmente

Voce pode abrir [index.html](C:/Users/Carlos/Documents/ai%20BOT/Lab/Inanna/inanna-main/index.html) direto no navegador para testar a interface.

Se quiser um ambiente local simples:

```bash
npx http-server ./ -p 8080
```

ou:

```bash
python -m http.server 8080
```

Depois, abra:

```text
http://localhost:8080
```

## Configuracao da integracao online

No frontend, a URL do Apps Script fica em [app.js](C:/Users/Carlos/Documents/ai%20BOT/Lab/Inanna/inanna-main/app.js), na constante `WEB_APP_URL`.

Quando uma nova versao do Web App for publicada no Google Apps Script, essa URL precisa ser atualizada no frontend.

## Estado atual do projeto

Neste momento, o app ja incorpora:

- lacuna final obrigatoria;
- fechamento explicito da quadra;
- nova quadra com reset de pontos;
- placar Top 10 online;
- pontuacao formal por rima, forma e criatividade;
- visualizacao de vetor pedagogico;
- mini-aula sobre embeddings e estocastica.

Pontos ainda abertos para futuras iteracoes:

- refinamento fino das regras de pontuacao;
- evolucao do modulo pedagogico de vetores;
- possivel ampliacao do corpus e das explicacoes comparativas.

## Creditos

Projeto ligado ao ecossistema educativo do Cordel 2.0.

Identidade e concepcao:

- Celeste Farias
- Carlos Vidal

A Inanna aparece no projeto como figura afetiva e pedagogica do laboratorio.

## Licenca e direitos

`Inanna e Cordel 2.0`, de Celeste Farias e Carlos Vidal, esta protegido por direitos de autor sob `CC BY-ND 4.0`.
