alter table public.participantes enable row level security;
alter table public.quadras enable row level security;
alter table public.placar_reactions enable row level security;
alter table public.sextilha_folhetos enable row level security;
alter table public.sextilha_texts enable row level security;
alter table public.sextilha_versions enable row level security;
alter table public.ai_feedback enable row level security;

revoke all on table public.participantes from anon, authenticated;
revoke all on table public.quadras from anon, authenticated;
revoke all on table public.placar_reactions from anon, authenticated;
revoke all on table public.sextilha_folhetos from anon, authenticated;
revoke all on table public.sextilha_texts from anon, authenticated;
revoke all on table public.sextilha_versions from anon, authenticated;
revoke all on table public.ai_feedback from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.placar_publico to anon, authenticated;
grant insert on public.quadras to anon, authenticated;
grant select on public.placar_reactions to anon, authenticated;
grant select, insert, update on public.sextilha_folhetos to anon, authenticated;
grant select, insert, update on public.sextilha_texts to anon, authenticated;
grant select, insert, update on public.sextilha_versions to anon, authenticated;

grant execute on function public.lookup_participante_por_email(text) to anon, authenticated;
grant execute on function public.registrar_reacao_placar(uuid, text, text, uuid) to anon, authenticated;
grant execute on function public.request_header_value(text) to anon, authenticated;
grant execute on function public.request_participant_id() to anon, authenticated;
grant execute on function public.request_viewer_key() to anon, authenticated;

drop policy if exists permitir_insert_quadra_publico on public.quadras;
create policy permitir_insert_quadra_publico
on public.quadras
for insert
to anon, authenticated
with check (true);

drop policy if exists permitir_select_reacao_do_viewer on public.placar_reactions;
create policy permitir_select_reacao_do_viewer
on public.placar_reactions
for select
to anon, authenticated
using (viewer_key = public.request_viewer_key());

drop policy if exists sextilha_folhetos_select_participante on public.sextilha_folhetos;
create policy sextilha_folhetos_select_participante
on public.sextilha_folhetos
for select
to anon, authenticated
using (participante_id = public.request_participant_id());

drop policy if exists sextilha_folhetos_insert_participante on public.sextilha_folhetos;
create policy sextilha_folhetos_insert_participante
on public.sextilha_folhetos
for insert
to anon, authenticated
with check (participante_id = public.request_participant_id());

drop policy if exists sextilha_folhetos_update_participante on public.sextilha_folhetos;
create policy sextilha_folhetos_update_participante
on public.sextilha_folhetos
for update
to anon, authenticated
using (participante_id = public.request_participant_id())
with check (participante_id = public.request_participant_id());

drop policy if exists sextilha_texts_select_participante on public.sextilha_texts;
create policy sextilha_texts_select_participante
on public.sextilha_texts
for select
to anon, authenticated
using (participante_id = public.request_participant_id());

drop policy if exists sextilha_texts_insert_participante on public.sextilha_texts;
create policy sextilha_texts_insert_participante
on public.sextilha_texts
for insert
to anon, authenticated
with check (participante_id = public.request_participant_id());

drop policy if exists sextilha_texts_update_participante on public.sextilha_texts;
create policy sextilha_texts_update_participante
on public.sextilha_texts
for update
to anon, authenticated
using (participante_id = public.request_participant_id())
with check (participante_id = public.request_participant_id());

drop policy if exists sextilha_versions_select_participante on public.sextilha_versions;
create policy sextilha_versions_select_participante
on public.sextilha_versions
for select
to anon, authenticated
using (participante_id = public.request_participant_id());

drop policy if exists sextilha_versions_insert_participante on public.sextilha_versions;
create policy sextilha_versions_insert_participante
on public.sextilha_versions
for insert
to anon, authenticated
with check (participante_id = public.request_participant_id());

drop policy if exists sextilha_versions_update_participante on public.sextilha_versions;
create policy sextilha_versions_update_participante
on public.sextilha_versions
for update
to anon, authenticated
using (participante_id = public.request_participant_id())
with check (participante_id = public.request_participant_id());
