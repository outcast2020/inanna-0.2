-- Tighten public game writes and add indexes recommended by Supabase advisors.

alter function public.request_header_value(text) set search_path = public, pg_temp;
alter function public.request_participant_id() set search_path = public, pg_temp;
alter function public.request_viewer_key() set search_path = public, pg_temp;
alter function public.touch_updated_at() set search_path = public, pg_temp;

drop policy if exists permitir_insert_quadra_publico on public.quadras;

create policy permitir_insert_quadra_participante
on public.quadras
for insert
to anon, authenticated
with check (
  participante_id is not null
  and participante_id = public.request_participant_id()
  and nullif(trim(verso), '') is not null
  and length(trim(verso)) <= 4000
);

create index if not exists quadras_participante_id_idx
  on public.quadras (participante_id);

create index if not exists placar_reactions_participante_id_idx
  on public.placar_reactions (participante_id);

create index if not exists sextilha_versions_participante_id_idx
  on public.sextilha_versions (participante_id);

create index if not exists sextilha_versions_folheto_id_idx
  on public.sextilha_versions (folheto_id);

create index if not exists ai_feedback_text_version_id_idx
  on public.ai_feedback (text_version_id);
