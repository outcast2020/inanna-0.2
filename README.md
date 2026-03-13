# 🌵 Inanna — Proto-IA Educativa (Cordel 2.0)

Laboratório de compreensão da Inteligência Artificial. 
Inanna Proto-IA é um aplicativo educativo interativo que simula de forma transparente como sistemas de Inteligência Artificial preveem a próxima palavra em um texto. O app permite que usuários escrevam o início de um verso e observem como uma proto-IA pedagógica sugere possíveis continuidades com probabilidades associadas.

A experiência combina:
- Criatividade literária
- Cultura do Cordel
- Aprendizado sobre modelos de linguagem
- Compreensão crítica da Inteligência Artificial

O projeto é também uma homenagem à Inanna, uma gatinha siamesa adotada da rua, símbolo da união entre afeto, cuidado e tecnologia educativa. Ao longo do jogo, Inanna interage com o jogador por meio de avatares carismáticos em visualação estilo Roblox.

## 🎯 Objetivo Pedagógico

O aplicativo foi criado para ensinar como funcionam os modelos de linguagem (como os usados em IA generativa) de maneira acessível. Ele demonstra conceitos fundamentais:
- Previsão de próxima palavra (token)
- Probabilidade linguística
- Escolha entre alternativas possíveis
- Diferença entre criatividade humana e previsão algorítmica

**A Inanna não é uma IA real.** Ela é uma *proto-IA* pedagógica que permite visualizar os princípios básicos da tecnologia.

### Público-alvo (12 anos ou mais)
- Escolas e Universidades
- Oficinas de tecnologia e Laboratórios de escrita criativa
- Cursos de letramento digital
- Introdução à Inteligência Artificial

## ⚙️ Como Funciona o Jogo

O fluxo do aplicativo simula o uso de modelos de linguagem:

1. **Escolha de Contexto (Tema):** O jogador define o "Corpus" inicial, com temas variados que vão de *Nordeste* e *Festa Junina* até *Shopping* e *Tecnologia*.
2. **Entrada de Texto:** O usuário escreve o início de um verso usando uma lacuna (`___`). (Ex: "No sertão eu vi a ___")
3. **Predição e Escolha:** A Inanna aciona sua engine de probabilidade simulada e sugere continuações, separando rigorosamente listas de *substantivos*, *adjetivos* e *verbos*, e oferecendo também a possibilidade de o jogador inventar sua própria palavra (superando a máquina).
4. **Construção e Placar:** Ao finalizar uma quadra (4 versos), o jogador envia sua obra. 

### Modos de Jogo:
- **Modo Desafio:** O desafio pode ser alternado entre `[ ON ]` e `[ OFF ]`. 
  - Quando **ON**, a pontuação é ativa, rimas complexas são valorizadas, e a quadra completa pode ser enviada ao Placar Top 10 online para os melhores cordéis.
  - Quando **OFF**, o jogo corre de forma livre para experimentação e aprendizado pedagógico, sem envios ou ranqueamento competitivo.


## 🧠 Motor de Rimas (V2)

A Inanna agora incorpora um **Motor de Previsão V2** mais inteligente, que vai além das simulações de tokens, realizando:
- **Previsão contextual:** A escolha de palavras considera o tema ativo, o verso anterior e a lógica da quadra.
- **Análise fonética:** O algoritmo detecta rimas comparando sons finais (as últimas 1, 2 ou 3 letras) da última palavra do verso, priorizando terminações idênticas.
- **Banco Lexical:** A IA consulta uma base dedicada de rimas populares para guiar o fechamento de estrofes de maneira harmônica.

## 📖 Estrutura de Quadra

Para garantir uma vivência literária autêntica de Cordel, a IA aprendeu a orientar o jogador sugerindo estruturas clássicas ao longo da criação:
- **AABB (Rima em parândo):** Verso 1 rima com Verso 2; Verso 3 rima com Verso 4.
- **ABAB (Rima alternada):** Verso 1 rima com Verso 3; Verso 2 rima com Verso 4.

Essa sugestão não bloqueia a criatividade: serve como guia de onde a IA tentará focar suas previsões poéticas.

## 📚 Banco de Palavras

A inteligência da Inanna está amparada em um grande **Corpus de Rimas** customizado. Como projetos reais de Machine Learning utilizam datasets curados, nossa engine utiliza o `cordel_rhyme_bank.js`.
Este banco lexical contém **800 palavras** organizadas por terminações fonéticas (`-ão`, `-ar`, `-or`, `-eiro`, `-ia`, `-ade`, `-ente`, `-im`). O vocabulário eleva o regionalismo e foca em temas da cultura popular nortestina, sertão, cotidiano, sentimentos e festa junina.

## 🚀 Tecnologias Utilizadas e Integração

O frontend é flexível e projetado para fácil uso em instituições educacionais:
- **HTML, CSS (Vanilla) e Javascript**
- **Github Pages** para hospedagem estática direta.

O backend e banco de dados é gerido via:
- **Google Apps Script & Google Sheets:** Todas as submissões de quadras e exibição de placares são transferidas diretamente para uma planilha na nuvem via API RESTful simples (`/doPost` e `/doGet`). Este formato dispensa servidores pesados, não contém problemas de CORS Preflight perigosos graças à transmissão limpa, e armazena até os modos de partida.

### Estrutura do projeto

```text
inanna-main/
├── index.html         # Template principal da aplicação com as Etapas do Jogo
├── styles.css         # UI moderna, responsiva, glassmorphism e animações 2D/3D (float)
├── app.js             # Motor da Proto-IA, estado do jogo, Modais e Fetch Actions
├── apps_script.gs     # Lógica Back-End do Google Apps Script
├── cat_*.png          # Gatinhas Siamesas Estilo Roblox e demais assets de UI
└── README.md          # Documentação do projeto
```

## 🛠️ Como Executar Localmente

Você pode simplesmente abrir o arquivo `index.html` em qualquer navegador, e o projeto funcionará com dados pré-programados (*Mock Data/Library*) até estabelecer uma rede ao Google Apps. 

Para rodar de forma perfeitamente em torno de uma visualização host, inicie um servidor web local em sua pasta.
```bash
# Via Node.js (npx)
npx http-server ./ -p 8080

# OU Via Python
python -m http.server 8080
```
E acesse `http://localhost:8080` de seu navegador.

## 📜 Licença e Direitos Autorais

**"Inanna e Cordel 2.0" by Celeste Farias e Carlos Vidal é protegido por direitos de autor sob CC BY-ND 4.0.**

Este aplicativo faz parte do ecossistema educativo do **Projeto Cordel 2.0** — dedicado a explorar relações entre cultura popular, criatividade, educação e tecnologias emergentes.
