alter table public.participantes
  add column if not exists pais text default 'BR',
  add column if not exists oficina_cordel20 boolean,
  add column if not exists usou_chatbot_ia boolean,
  add column if not exists genero text,
  add column if not exists perfil_completo boolean default false,
  add column if not exists perfil_completed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.quadras
  add column if not exists pais text,
  add column if not exists oficina_cordel20 boolean,
  add column if not exists usou_chatbot_ia boolean,
  add column if not exists genero text,
  add column if not exists legacy_fingerprint text,
  add column if not exists legacy_source_row text,
  add column if not exists legacy_sheet_name text,
  add column if not exists imported_at timestamptz;

drop index if exists public.quadras_legacy_fingerprint_uniq;
create unique index if not exists quadras_legacy_fingerprint_uniq
  on public.quadras (legacy_fingerprint);

create index if not exists participantes_email_lower_idx
  on public.participantes (lower(email));

create index if not exists quadras_importacao_idx
  on public.quadras (origem_importacao, legado_google_sheet, created_at desc);

drop trigger if exists touch_participantes_updated_at on public.participantes;
create trigger touch_participantes_updated_at
before update on public.participantes
for each row execute function public.touch_updated_at();

drop view if exists public.placar_publico;
create view public.placar_publico as
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
  ranked.origem_importacao,
  ranked.legado_google_sheet,
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
where ranked.posicao <= 20
order by ranked.posicao;

drop function if exists public.registrar_perfil_participante(uuid, text, boolean, boolean, text, text, text, text);
drop function if exists public.lookup_participante_por_email(text);

create function public.lookup_participante_por_email(p_email text)
returns table (
  id uuid,
  nome text,
  email text,
  tipo_participante text,
  municipio text,
  estado text,
  pais text,
  origem text,
  teacher_group text,
  checkin_user_id text,
  oficina_cordel20 boolean,
  usou_chatbot_ia boolean,
  genero text,
  perfil_completo boolean
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
    coalesce(nullif(p.pais, ''), 'BR') as pais,
    p.origem,
    p.teacher_group,
    coalesce(nullif(p.checkin_user_id, ''), p.id::text) as checkin_user_id,
    p.oficina_cordel20,
    p.usou_chatbot_ia,
    p.genero,
    coalesce(p.perfil_completo, false) as perfil_completo
  from public.participantes p
  where lower(p.email) = lower(trim(p_email))
  limit 1;
$$;

create or replace function public.registrar_perfil_participante(
  p_participante_id uuid,
  p_email text,
  p_oficina_cordel20 boolean,
  p_usou_chatbot_ia boolean,
  p_genero text,
  p_municipio text,
  p_estado text,
  p_pais text default 'BR'
)
returns table (
  id uuid,
  nome text,
  email text,
  tipo_participante text,
  municipio text,
  estado text,
  pais text,
  origem text,
  teacher_group text,
  checkin_user_id text,
  oficina_cordel20 boolean,
  usou_chatbot_ia boolean,
  genero text,
  perfil_completo boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_genero text := lower(trim(coalesce(p_genero, '')));
  v_pais text := upper(trim(coalesce(p_pais, 'BR')));
  v_estado text := upper(trim(coalesce(p_estado, '')));
begin
  if p_participante_id is null or nullif(trim(coalesce(p_email, '')), '') is null then
    raise exception 'Participante e email sao obrigatorios.';
  end if;

  if v_genero not in ('feminino', 'masculino', 'outro', 'prefiro_nao_dizer') then
    raise exception 'Genero invalido.';
  end if;

  if nullif(trim(coalesce(p_municipio, '')), '') is null then
    raise exception 'Municipio obrigatorio.';
  end if;

  if v_pais <> 'FORA_BRASIL' and v_estado !~ '^[A-Z]{2}$' then
    raise exception 'Estado invalido.';
  end if;

  update public.participantes p
  set
    oficina_cordel20 = p_oficina_cordel20,
    usou_chatbot_ia = p_usou_chatbot_ia,
    genero = v_genero,
    municipio = trim(p_municipio),
    estado = case when v_pais = 'FORA_BRASIL' then 'EX' else v_estado end,
    pais = case when v_pais = 'FORA_BRASIL' then 'FORA_BRASIL' else 'BR' end,
    perfil_completo = true,
    perfil_completed_at = coalesce(p.perfil_completed_at, now())
  where p.id = p_participante_id
    and lower(p.email) = lower(trim(p_email));

  if not found then
    raise exception 'Participante nao encontrado.';
  end if;

  return query
  select *
  from public.lookup_participante_por_email(p_email);
end;
$$;

grant execute on function public.lookup_participante_por_email(text) to anon, authenticated;
grant execute on function public.registrar_perfil_participante(uuid, text, boolean, boolean, text, text, text, text) to anon, authenticated;
grant select on public.placar_publico to anon, authenticated;
