# Inanna

Inanna e um app educativo de quadras em cordel com explicacao pedagogica de previsao de proxima palavra. O projeto esta em producao com Supabase como backend de dados, Vercel como plataforma de hospedagem e GitHub como repositorio/CI.

## Status de producao

- URL oficial: https://inanna.cordel2pontozero.com
- URL Vercel secundaria: https://inanna-five.vercel.app
- Branch principal da migracao: `feat/supabase-game`.
- Backend ativo: Supabase.
- Hosting ativo: Vercel.
- GitHub Pages, Firebase, Firestore e Google Apps Script foram removidos do fluxo de producao.
- IA generativa das sextilhas e envio social por e-mail estao suspensos por env (`VITE_INANNA_AI_ENABLED=false`, `VITE_INANNA_SOCIAL_EMAIL_ENABLED=false`).

## Arquitetura

- Frontend: `index.html`, `styles.css`, `app.js`.
- Motor de previsao: `prediction_engine_v2.js`.
- Banco lexical de rimas: `cordel_rhyme_bank.js`.
- Backend, check-in, placar e caderno de sextilhas: Supabase.
- Build/deploy: Vite em `dist`, pronto para importacao do repositorio GitHub na Vercel.
- Midias e embeds: imagens, video e snippet de footer na propria pasta.

## Backend atual

- `supabase-client.js` cria a ponte do frontend com Supabase.
- `supabase/migrations/001_inanna_game_schema.sql` cria tabelas, view publica do placar e funcoes RPC.
- `supabase/migrations/002_inanna_game_rls.sql` ativa RLS e grants minimos para o app publico.
- `supabase/migrations/003_participant_profile_legacy_import.sql` adiciona perfil estatistico de primeiro acesso, fingerprint legado e RPC de perfil.
- `supabase/migrations/004_profile_race_age.sql` acrescenta identificacao racial e faixa etaria ao perfil estatistico.
- `scripts/import-legacy-quadras.mjs` importa check-in e quadras historicas do Google Sheets de forma idempotente.
- `supabase/functions/inanna-public-config` fornece configuracao publica em runtime para o navegador quando a build da Vercel nao substitui `VITE_*`.
- `.env.example` lista apenas variaveis publicas `VITE_*` para frontend.
- IA das sextilhas e envio por e-mail ficam desligados nesta fase (`VITE_INANNA_AI_ENABLED=false`, `VITE_INANNA_SOCIAL_EMAIL_ENABLED=false`).

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
2. No primeiro acesso, completa perfil rapido: oficina Cordel 2.0, uso previo de chatbot de IA, genero, identificacao racial, faixa etaria e municipio/UF ou fora do Brasil.
3. Nos acessos seguintes, o perfil ja salvo no Supabase libera a escolha de trilha.
4. Escolhe a trilha de quadras e um tema.
5. Escreve um verso sem a ultima palavra.
6. O app reconstrui o verso com `___`.
7. O motor sugere candidatos com probabilidade.
8. A pessoa escolhe uma sugestao ou digita uma palavra propria.
9. Depois de 4 versos, a quadra e fechada.
10. No modo desafio, a quadra recebe pontuacao e pode entrar no placar.
11. A quadra pode ser copiada, continuada ou enviada para o Supabase.

## Frontend

### Constantes e estado

`app.js` usa:

- `APP_VARIANT`: `inanna-main`.
- `PLACAR_LIBRARY`: fallback local para placar quando o Supabase ainda nao estiver configurado.
- `THEMES`: curadoria local de temas e vocabulario.

O estado principal guarda:

- identidade resolvida pelo check-in;
- perfil estatistico de primeiro acesso;
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
- modal de placar Top 20.

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
- penalidade para palavra final repetida como atalho de rima.

Palavras finais repetidas nao pontuam como rima criativa: par com palavra final identica recebe penalidade, e repeticoes extras de palavra final reduzem a nota de rima da quadra.

No frontend, a quadra e pontuada apos o quarto verso.

No backend, a pontuacao e recalculada no servidor antes de gravar, para evitar dependencia do calculo do cliente.

## Backend Supabase

O check-in consulta `lookup_participante_por_email`, uma RPC que retorna apenas os dados necessarios para liberar a jornada. Quando o perfil rapido ainda esta pendente, o frontend chama `registrar_perfil_participante` para salvar oficina Cordel 2.0, uso previo de chatbot de IA, genero, identificacao racial, faixa etaria e municipio/UF. A submissao de quadras insere em `quadras`, o placar le a view `placar_publico`, e as reacoes usam a RPC `registrar_reacao_placar` para manter o limite de 3 reacoes por visitante em cada quadra.

`placar_publico` nao expoe e-mail nem campos estatisticos. A view publica somente autor, verso, pontos, breakdown, timestamp, origem legada e contagem de reacoes.

O caderno de sextilhas usa:

- `sextilha_folhetos`;
- `sextilha_texts`;
- `sextilha_versions`;
- `ai_feedback` reservado para fase futura com Cloudflare Agents + Maritaca API.

No frontend, o cronometro de escrita envia `tempoEscritaMs` e `tempoEscritaFormatado` para registro, sem efeito direto na pontuacao.

## Execucao local

Instale dependencias e rode o dev server:

```bash
pnpm install
pnpm dev
```

Para simular producao:

```bash
pnpm build
pnpm preview
```

Use `.env.local` com as mesmas chaves de `.env.example`. Somente variaveis `VITE_*` entram no frontend.

## Importacao do placar legado

O acervo historico foi importado da planilha Google em 2026-06-07:

- 18 participantes de `USERS_checkin`;
- 44 quadras historicas;
- 0 erros de parsing;
- segunda execucao idempotente: 0 importadas, 44 ignoradas por duplicidade.

Para repetir ou auditar:

```bash
IMPORT_DRY_RUN=true pnpm import:legacy-quadras
pnpm import:legacy-quadras
```

O script exige `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em ambiente local ou arquivo ignorado pelo Git. Mais detalhes em `supabase/importacao-placar-legado.md`.

## Deploy Vercel

1. Crie/aplique o schema Supabase usando `supabase/migrations`.
2. Importe participantes/check-in e quadras historicas com `pnpm import:legacy-quadras`.
3. Importe o repositorio GitHub na Vercel ou mantenha a integracao existente.
4. Configure o preset como Vite, build `pnpm build` e output `dist`.
5. Cadastre `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_INANNA_AI_ENABLED=false` e `VITE_INANNA_SOCIAL_EMAIL_ENABLED=false`.
6. Mantenha a Edge Function `inanna-public-config` implantada no Supabase como fallback publico de runtime config.
7. Valide o preview antes de promover para production.

O projeto de producao deve ser criado/importado a partir do repositorio GitHub na Vercel. O dominio proprio fica apontado para a Vercel; nao use GitHub Pages para este app em producao.

## Checklist de manutencao

- Rodar `pnpm build` antes de publicar mudancas.
- Conferir se as quatro envs `VITE_*` existem em Production na Vercel.
- Conferir se `https://ifhagjcarefdkcmjvknf.supabase.co/functions/v1/inanna-public-config` responde JavaScript valido.
- Verificar `placar_publico` apos importacoes ou alteracoes de scoring.
- Rodar o importador em `IMPORT_DRY_RUN=true` antes de qualquer nova carga historica.
- Nunca commitar `.env.local`, `not-commit-supabaseInanna.txt`, service role keys, tokens ou dumps.
- Manter IA generativa e e-mail social desligados ate a fase Cloudflare Agents + Maritaca API.

## Caderno de sextilhas

O frontend grava rascunhos, folhetos, versoes, status e historico no Supabase. A devolutiva automatica de IA e o envio por e-mail estao suspensos nesta fase para evitar chaves sensiveis no navegador.

## UX imediata

Mesmo antes da virada ao Supabase, o caderno ja recebeu ganhos locais:

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

A arquitetura atual do Inanna é coerente com esse horizonte. No jogo de quadras, não há IA generativa escrevendo pelo participante. O que existe é um motor de previsão local, explicável e deliberadamente limitado, concebido como instrumento de letramento digital e de compreensão dos mecanismos de previsão textual. Já no caderno de sextilhas, a devolutiva automatica de IA fica suspensa nesta fase; a camada futura deve ser isolada fora do frontend, com Cloudflare Agents + Maritaca API.

Esse desenho reforça quatro princípios importantes: centralidade da autoria humana; transparência sobre o uso de recursos algorítmicos; limitação funcional da IA no processo de escrita; e proteção dos dados do participante por meio de Supabase, RLS e separação de chaves sensíveis fora do navegador (BRASIL, [2026]; LABORATÓRIO CORDEL 2.0, 2026).

## Tecnologias e uso de IA

A estrutura do projeto combina frontend estatico com build Vite, Supabase para dados, GitHub para versionamento/CI e Vercel para production. No frontend, os fluxos de quadra, dashboard e editor ficam visíveis em `index.html` e são orquestrados por `app.js`, enquanto a integração com Supabase é operacionalizada em `supabase-client.js`.

As migrations Supabase criam tabelas separadas para participantes, quadras, reações, folhetos, textos e versões. A ponte `supabase-client.js` normaliza status editoriais, monta payloads de dashboard e usa headers de participante nas chamadas de caderno para acionar as políticas RLS.

Na camada de IA, o fluxo principal continua não generativo. O motor `prediction_engine_v2.js` trabalha com normalização lexical, banco de rimas, expectativas sintáticas, compatibilidade de rima e sugestão da palavra seguinte; seu papel é didático e explicável. A IA generativa para devolutiva de sextilhas fica planejada para uma etapa posterior, com segredo da Maritaca guardado no ambiente do agente/worker, nunca no frontend.

Em termos pedagógicos e éticos, isso significa que a escrita continua sendo do participante. A IA não faz o texto; ela oferece apenas um retorno leve sobre progresso, maturação e consistência, o que torna o desenho do projeto mais compatível com as recomendações de uso responsável de IA na educação (BRASIL, [2026]).

## Referências

BRASIL. Ministério da Educação. Tratamento de dados pessoais no MEC. Brasília, DF: MEC, 2025. Atualizado em: 26 mar. 2025. Disponível em: <https://www.gov.br/mec/pt-br/acesso-a-informacao/privacidade-e-protecao-de-dados-pessoais/tratamento-de-dados-pessoais-no-mec>. Acesso em: 13 abr. 2026.

BRASIL. Ministério da Educação. Referencial para desenvolvimento e uso responsáveis de inteligência artificial na educação. Brasília, DF: MEC, [2026]. Disponível em: <https://www.gov.br/mec/pt-br/media/segape/referencial-oficial-pt.pdf>. Acesso em: 13 abr. 2026.

LABORATÓRIO CORDEL 2.0. Guia de acesso, termos de uso, privacidade e créditos (v. 03/04/2026). Salvador: Cordel 2.0, 2026. Disponível em: <https://www.cordel2pontozero.com/s/laboratorio_cordel_2_0_termos_referencias_ABRIL2026.pdf>. Acesso em: 13 abr. 2026.
