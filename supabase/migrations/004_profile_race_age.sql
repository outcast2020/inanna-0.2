alter table public.participantes
  add column if not exists identificacao_racial text,
  add column if not exists faixa_etaria text;

alter table public.quadras
  add column if not exists identificacao_racial text,
  add column if not exists faixa_etaria text;

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
  identificacao_racial text,
  faixa_etaria text,
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
    p.identificacao_racial,
    p.faixa_etaria,
    (
      coalesce(p.perfil_completo, false)
      and p.oficina_cordel20 is not null
      and p.usou_chatbot_ia is not null
      and p.genero in ('feminino', 'masculino', 'outro', 'prefiro_nao_dizer')
      and p.identificacao_racial in ('negro', 'branco', 'pardo', 'indigena', 'outro')
      and p.faixa_etaria in ('menos_de_11', '12_14', '15_17', '18_29', '30_44', '45_59', 'maior_de_60')
      and nullif(trim(coalesce(p.municipio, '')), '') is not null
    ) as perfil_completo
  from public.participantes p
  where lower(p.email) = lower(trim(p_email))
  limit 1;
$$;

create function public.registrar_perfil_participante(
  p_participante_id uuid,
  p_email text,
  p_oficina_cordel20 boolean,
  p_usou_chatbot_ia boolean,
  p_genero text,
  p_identificacao_racial text,
  p_faixa_etaria text,
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
  identificacao_racial text,
  faixa_etaria text,
  perfil_completo boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_genero text := lower(trim(coalesce(p_genero, '')));
  v_identificacao_racial text := lower(trim(coalesce(p_identificacao_racial, '')));
  v_faixa_etaria text := lower(trim(coalesce(p_faixa_etaria, '')));
  v_pais text := upper(trim(coalesce(p_pais, 'BR')));
  v_estado text := upper(trim(coalesce(p_estado, '')));
begin
  if p_participante_id is null or nullif(trim(coalesce(p_email, '')), '') is null then
    raise exception 'Participante e email sao obrigatorios.';
  end if;

  if v_genero not in ('feminino', 'masculino', 'outro', 'prefiro_nao_dizer') then
    raise exception 'Genero invalido.';
  end if;

  if v_identificacao_racial not in ('negro', 'branco', 'pardo', 'indigena', 'outro') then
    raise exception 'Identificacao racial invalida.';
  end if;

  if v_faixa_etaria not in ('menos_de_11', '12_14', '15_17', '18_29', '30_44', '45_59', 'maior_de_60') then
    raise exception 'Faixa etaria invalida.';
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
    identificacao_racial = v_identificacao_racial,
    faixa_etaria = v_faixa_etaria,
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
grant execute on function public.registrar_perfil_participante(uuid, text, boolean, boolean, text, text, text, text, text, text) to anon, authenticated;
