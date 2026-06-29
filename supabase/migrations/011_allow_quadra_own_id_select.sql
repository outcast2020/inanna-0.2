-- Corrige o bug critico de envio da quadra no Nivel 1.
--
-- Sintoma: ao fechar a quadra, o app mostrava "Falha ao enviar, verifique o
-- console." e a quadra nao era gravada nem entrava no placar (perda de dado).
--
-- Causa raiz: o frontend insere a quadra com `.insert(row).select("id")`, que o
-- PostgREST traduz para `INSERT ... RETURNING id`. O PostgreSQL exige privilegio
-- SELECT sobre as colunas do RETURNING. As migrations 002/005 concedem apenas
-- INSERT em public.quadras a anon/authenticated (sem SELECT e sem policy de
-- SELECT), entao o RETURNING falha com 42501 (permission denied) e a INSTRUCAO
-- INTEIRA sofre rollback -> a quadra nao e salva e o usuario ve a falha.
--
-- Correcao minima e preservadora de privacidade (LGPD): em vez de liberar SELECT
-- na tabela inteira (que contem e-mail, municipio, genero, identificacao racial
-- etc.), concedemos SELECT apenas na coluna `id` e adicionamos uma policy de
-- SELECT restrita ao proprio participante. Isso e exatamente o que o
-- `.select("id")` precisa para devolver o id recem-inserido (e habilitar o mint
-- do folheto), sem expor nenhum dado pessoal. Os ids de quadra ja sao publicos
-- pela view placar_publico, entao isso nao amplia a superficie de exposicao.
--
-- A view publica do placar (placar_publico) roda com privilegios do dono e nao
-- e afetada por esta policy; ela continua mostrando o ranking normalmente.

grant select (id) on public.quadras to anon, authenticated;

drop policy if exists permitir_select_quadra_propria on public.quadras;
create policy permitir_select_quadra_propria
on public.quadras
for select
to anon, authenticated
using (participante_id = public.request_participant_id());
