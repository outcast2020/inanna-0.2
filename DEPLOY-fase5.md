# Runbook de deploy — Fase 5 (MVP seguro)

Estado: Fases 0–4 commitadas no branch `feat/mvp-seguro` (PR #6). Este runbook leva à
produção. Ordene os passos como abaixo — a ordem importa (segurança do primeiro acesso).

## Acesso verificado
| Plataforma | Status | Uso |
|---|---|---|
| GitHub `outcast2020/inanna-0.2` | ✅ `gh` autenticado (owner) | merge/PR/tag |
| Cloudflare | ✅ token válido (verify 200) | `wrangler deploy` |
| Supabase `ifhagjcarefdkcmjvknf` | ✅ alcançável (DB password local) | migrations 009/010 |
| Vercel | via integração GitHub→build no push a `main` | frontend |
| Maritaca | chave já é secret do Worker | runtime |

> **service_role NÃO está nos arquivos locais** — e não precisa: o Worker e o Apps
> Script já a têm configurada em produção. `wrangler deploy` preserva secrets existentes.

## Passo 1 — Migrations Supabase (009 + 010)  ⚠️ irreversível (muta DB de produção)
Apenas 009 e 010 são novas (001–008 já aplicadas). Ambas são aditivas/idempotentes,
validadas por parser (pglast). 009 **substitui** os RPCs vivos `lookup_participante_por_email`
e `registrar_perfil_participante` — testar o check-in logo após.

```bash
# opção A (CLI, transacional — recomendado):
export SUPABASE_ACCESS_TOKEN=<token de acesso supabase>
npx supabase link --project-ref ifhagjcarefdkcmjvknf
npx supabase db push            # aplica só as migrations pendentes, com rollback em erro

# opção B (psql direto, se preferir): aplicar 009 e 010 dentro de uma transação.
```
**Rollback:** restaurar de backup PITR do Supabase. Por isso: snapshot antes.
**Validar depois:** check-in por e-mail funciona; salvar perfil (com e sem sensíveis) funciona.

## Passo 2 — Worker (determinismo da rubrica)  ✅ reversível
```bash
cd inanna-level2-agent
export CLOUDFLARE_API_TOKEN=<token>      # de not-commit-CLOUDFLARE_API_TOKEN.txt
npx wrangler deploy
```
Secrets já configurados (não re-setar): `SUPABASE_SERVICE_ROLE_KEY`, `MARITACA_API_KEY`,
`INANNA_WORKER_ADMIN_TOKEN`, `TURNSTILE_SECRET_KEY`.
**Rollback:** `npx wrangler rollback`.

## Passo 3 — Vercel (frontend)  ⚠️ outward-facing (deploy de produção)
Os flags novos têm default seguro (OFF) via Edge Function `inanna-public-config`, então
**produção não muda de comportamento** mesmo sem novas envs. Para habilitar depois:
`VITE_INANNA_GUEST_MODE_ENABLED`, `VITE_INANNA_NFT_MINTING_ENABLED` (Vercel → Production).

Deploy = merge do PR #6 em `main` (a integração GitHub→Vercel builda produção).

## Passo 4 — Apps Script (primeiro acesso endurecido)  ⚠️ manual (não automatizável)
Necessário porque a Fase 0 tornou o endpoint *fail-closed*. **Ordem obrigatória:**
1. No editor do Apps Script: cole `scripts/google-apps-script/inanna-first-access.gs`.
2. Script Properties: defina `INANNA_FIRST_ACCESS_LOOKUP_TOKEN` (valor em
   `not-commit-FIRST_ACCESS_TOKEN.txt`), `INANNA_USERS_SPREADSHEET_ID`,
   `INANNA_SUPABASE_SERVICE_ROLE_KEY` (a mesma já usada hoje).
3. Vercel: `VITE_INANNA_FIRST_ACCESS_LOOKUP_TOKEN` = **mesmo** valor do token.
4. Implante como Web App (executar como proprietário, acesso "Qualquer pessoa").

> Se redeployar o `.gs` (fail-closed) SEM setar o token no Apps Script E na Vercel, o
> primeiro acesso de usuários novos para. Por isso o passo 4 vem por último e em conjunto.
> Enquanto não redeployar, o `.gs` antigo (aberto) segue rodando — o frontend novo é
> retrocompatível (já envia o token).

## Passo 5 — Tag e smoke test
```bash
git tag v0.2 && git push origin v0.2
```
Smoke: carregar produção, check-in, fechar 1 quadra (ver convite de perfil diferido),
salvar quadra, conferir placar. Worker: rodar uma peleja (nota estável em repetição).

## Matriz de secrets (onde cada um vive)
| Secret | Vive em | Fonte local |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Worker (CF secret) + Apps Script (Script Property) | já em prod |
| `MARITACA_API_KEY` | Worker (CF secret) | not-commit-MaritacaAPI.txt |
| `INANNA_WORKER_ADMIN_TOKEN` | Worker (CF secret) | inanna-level2-agent/not-commit-Token.txt |
| `TURNSTILE_SECRET_KEY` | Worker (CF secret) | idem |
| `CLOUDFLARE_API_TOKEN` | só p/ deploy (env local) | not-commit-CLOUDFLARE_API_TOKEN.txt |
| `INANNA_FIRST_ACCESS_LOOKUP_TOKEN` | Apps Script + Vercel | not-commit-FIRST_ACCESS_TOKEN.txt |
| `VITE_SUPABASE_ANON_KEY` (público) | Vercel | not-commit-supabaseInanna.txt |
| DB password | só p/ migrations | not-commit-supabaseInanna.txt |
