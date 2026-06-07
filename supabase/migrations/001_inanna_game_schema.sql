create extension if not exists pgcrypto;

create table if not exists public.participantes (
  id uuid primary key default gen_random_uuid(),
  nome text,
  email text unique,
  tipo_participante text,
  municipio text,
  estado text,
  origem text,
  teacher_group text,
  checkin_user_id text,
  origem_importacao text default 'supabase',
  created_at timestamptz default now()
);

create table if not exists public.quadras (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid references public.participantes(id),
  external_participant_id text,
  checkin_user_id text,
  checkin_match_status text,
  checkin_match_method text,
  nome text,
  email text,
  tipo_participante text,
  municipio text,
  estado text,
  origem text,
  teacher_group text,
  verso text not null,
  modo text,
  tema text,
  pontos integer default 0,
  esquema_rima text,
  pontos_rima integer default 0,
  pontos_forma integer default 0,
  pontos_criatividade integer default 0,
  bonus_esquema integer default 0,
  tempo_escrita_ms integer,
  tempo_escrita_formatado text,
  app_variant text default 'inanna-main',
  origem_importacao text default 'supabase',
  legado_google_sheet boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.placar_reactions (
  id uuid primary key default gen_random_uuid(),
  quadra_id uuid references public.quadras(id) on delete cascade,
  reaction text check (reaction in ('thumb', 'heart', 'wow')),
  viewer_key text not null,
  participante_id uuid references public.participantes(id),
  created_at timestamptz default now()
);

create index if not exists quadras_placar_idx
  on public.quadras (modo, pontos desc, created_at desc);

create index if not exists placar_reactions_quadra_idx
  on public.placar_reactions (quadra_id, reaction);

create index if not exists placar_reactions_viewer_idx
  on public.placar_reactions (quadra_id, viewer_key);

create table if not exists public.sextilha_folhetos (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  checkin_user_id text,
  teacher_group text,
  title text,
  app_variant text default 'inanna-main',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sextilha_texts (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  checkin_user_id text,
  teacher_group text,
  folheto_id uuid references public.sextilha_folhetos(id) on delete set null,
  folheto_title text,
  folheto_order integer default 0,
  titulo text,
  tema text,
  nota text,
  status text default 'rascunho',
  arquivada boolean default false,
  compartilhada_com_educador boolean default false,
  selecionada_para_antologia boolean default false,
  reabertura_solicitada boolean default false,
  versos jsonb default '["", "", "", "", "", ""]'::jsonb,
  indicadores jsonb default '{}'::jsonb,
  latest_version jsonb,
  current_version_id uuid,
  version_count integer default 0,
  app_variant text default 'inanna-main',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sextilha_versions (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.sextilha_texts(id) on delete cascade,
  participante_id uuid not null references public.participantes(id) on delete cascade,
  checkin_user_id text,
  teacher_group text,
  folheto_id uuid references public.sextilha_folhetos(id) on delete set null,
  folheto_title text,
  folheto_order integer default 0,
  numero_versao integer not null,
  titulo text,
  tema text,
  nota text,
  versos jsonb not null,
  status text default 'rascunho',
  compartilhada_com_educador boolean default false,
  indicadores jsonb default '{}'::jsonb,
  revision_note text,
  tempo_escrita_ms integer,
  created_at timestamptz default now()
);

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  text_version_id uuid references public.sextilha_versions(id) on delete cascade,
  provider text default 'maritaca',
  model text,
  feedback text,
  created_at timestamptz default now()
);

create index if not exists sextilha_folhetos_participante_idx
  on public.sextilha_folhetos (participante_id, updated_at desc);

create index if not exists sextilha_texts_participante_idx
  on public.sextilha_texts (participante_id, updated_at desc);

create index if not exists sextilha_texts_folheto_idx
  on public.sextilha_texts (folheto_id, folheto_order);

create index if not exists sextilha_versions_text_idx
  on public.sextilha_versions (text_id, numero_versao desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_sextilha_folhetos_updated_at on public.sextilha_folhetos;
create trigger touch_sextilha_folhetos_updated_at
before update on public.sextilha_folhetos
for each row execute function public.touch_updated_at();

drop trigger if exists touch_sextilha_texts_updated_at on public.sextilha_texts;
create trigger touch_sextilha_texts_updated_at
before update on public.sextilha_texts
for each row execute function public.touch_updated_at();

create or replace view public.placar_publico as
select
  ranked.id,
  ranked.id::text as entry_key,
  ranked.posicao,
  coalesce(nullif(ranked.nome, ''), 'Autor anonimo') as autor,
  ranked.verso,
  ranked.pontos,
  ranked.pontos_rima,
  ranked.pontos_forma,
  ranked.pontos_criatividade,
  ranked.bonus_esquema,
  ranked.created_at as "timestamp",
  jsonb_build_object(
    'thumb', coalesce(reactions.thumb, 0),
    'heart', coalesce(reactions.heart, 0),
    'wow', coalesce(reactions.wow, 0),
    'total', coalesce(reactions.total, 0)
  ) as reactions
from (
  select
    q.*,
    row_number() over (order by q.pontos desc, q.created_at desc) as posicao
  from public.quadras q
  where q.modo = 'Desafio'
) ranked
left join lateral (
  select
    count(*) filter (where pr.reaction = 'thumb')::integer as thumb,
    count(*) filter (where pr.reaction = 'heart')::integer as heart,
    count(*) filter (where pr.reaction = 'wow')::integer as wow,
    count(*)::integer as total
  from public.placar_reactions pr
  where pr.quadra_id = ranked.id
) reactions on true
where ranked.posicao <= 20;

create or replace function public.lookup_participante_por_email(p_email text)
returns table (
  id uuid,
  nome text,
  email text,
  tipo_participante text,
  municipio text,
  estado text,
  origem text,
  teacher_group text,
  checkin_user_id text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.nome,
    p.email,
    p.tipo_participante,
    p.municipio,
    p.estado,
    p.origem,
    p.teacher_group,
    coalesce(nullif(p.checkin_user_id, ''), p.id::text) as checkin_user_id
  from public.participantes p
  where lower(p.email) = lower(trim(p_email))
  limit 1;
$$;

create or replace function public.registrar_reacao_placar(
  p_quadra_id uuid,
  p_reaction text,
  p_viewer_key text,
  p_participante_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_count integer;
begin
  if p_reaction not in ('thumb', 'heart', 'wow') then
    raise exception 'Reacao invalida.';
  end if;

  if nullif(trim(p_viewer_key), '') is null then
    raise exception 'viewer_key obrigatorio.';
  end if;

  if length(p_viewer_key) > 160 then
    raise exception 'viewer_key muito longo.';
  end if;

  select count(*) into existing_count
  from public.placar_reactions
  where quadra_id = p_quadra_id
    and viewer_key = p_viewer_key;

  if existing_count >= 3 then
    raise exception 'Limite de 3 reacoes atingido nesta quadra.';
  end if;

  insert into public.placar_reactions (quadra_id, reaction, viewer_key, participante_id)
  values (p_quadra_id, p_reaction, p_viewer_key, p_participante_id);
end;
$$;

create or replace function public.request_header_value(header_name text)
returns text
language plpgsql
stable
as $$
declare
  headers jsonb;
begin
  headers := nullif(current_setting('request.headers', true), '')::jsonb;
  return nullif(headers ->> lower(header_name), '');
exception
  when others then
    return null;
end;
$$;

create or replace function public.request_participant_id()
returns uuid
language plpgsql
stable
as $$
declare
  raw_value text;
begin
  raw_value := public.request_header_value('x-inanna-participant-id');
  if raw_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return raw_value::uuid;
  end if;
  return null;
end;
$$;

create or replace function public.request_viewer_key()
returns text
language sql
stable
as $$
  select public.request_header_value('x-inanna-viewer-key');
$$;
