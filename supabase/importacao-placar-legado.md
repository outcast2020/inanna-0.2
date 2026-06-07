# Importação do Placar Legado

Este processo importa o acervo histórico da planilha Google para o Supabase sem gravar segredos no repositório.

## Fontes

- Planilha: https://docs.google.com/spreadsheets/d/1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc/edit?usp=sharing
- Cadastro/check-in: aba `USERS_checkin`
- Quadras históricas: abas `Página1` e `backup_registros_20260401_153714`
- A aba `placar` é ranking derivado. A importação principal usa as abas de registros para preservar e-mail, breakdown de pontos, modo, timestamp e metadados quando existirem.
- O perfil estatístico exato é completado no primeiro acesso ao app. Se um CSV futuro trouxer identificação racial ou faixa etária nas opções atuais, o importador preserva; valores legados amplos como `MAIOR` não são convertidos por inferência.

## Variáveis Locais

Use variáveis de ambiente ou um arquivo local ignorado pelo Git, como `not-commit-supabaseInanna.txt`.

```bash
SUPABASE_URL=https://ifhagjcarefdkcmjvknf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Nunca commite `.env.local`, `not-commit-supabaseInanna.txt`, service role keys, tokens ou dumps contendo dados pessoais.

## Comandos

Dry run, sem inserir:

```bash
IMPORT_DRY_RUN=true pnpm import:legacy-quadras
```

Importação real:

```bash
pnpm import:legacy-quadras
```

Opções úteis:

```bash
LEGACY_QUADRAS_SHEETS=Página1 pnpm import:legacy-quadras
LEGACY_CHECKIN_CSV_PATH=exports/USERS_checkin.csv LEGACY_QUADRAS_SHEETS=Página1 pnpm import:legacy-quadras
IMPORT_TIMEZONE_OFFSET=-03:00 pnpm import:legacy-quadras
```

## Deduplicação

Cada quadra recebe `legacy_fingerprint` calculado por SHA-256 sobre:

- autor normalizado;
- verso normalizado;
- timestamp normalizado;
- pontuação total.

A coluna `quadras.legacy_fingerprint` tem índice único. Rodar o script novamente não duplica quadras já importadas.

## Resultado Aplicado Em 2026-06-07

- Registros lidos de `USERS_checkin`: 18
- Participantes preparados/importados: 18
- Registros lidos de quadras: 44
- Quadras históricas importadas: 44
- Duplicidades na primeira importação: 0
- Erros de parsing: 0
- Segunda execução idempotente: 0 importadas, 44 ignoradas por duplicidade
- Total final em `quadras` com `legado_google_sheet=true`: 44

## Verificação SQL

```sql
select
  (select count(*) from public.participantes where origem_importacao = 'google-sheets') as participantes_google_sheets,
  (select count(*) from public.quadras where legado_google_sheet) as quadras_legado,
  (select count(*) from public.placar_publico) as placar_publico;
```

O placar público deve exibir somente dados não sensíveis: autor, verso, pontuação, breakdown, timestamp e reações. E-mail, gênero, identificação racial, faixa etária e demais estatísticas não aparecem em `placar_publico`.
