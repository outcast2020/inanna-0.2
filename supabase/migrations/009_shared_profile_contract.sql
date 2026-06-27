-- 009_shared_profile_contract.sql
-- Contrato de PERFIL COMPARTILHADO (modelo Inanna), versionado em perfil_versao = 1.
-- Referência reutilizável por outros apps do Laboratório (Iza, Arara) — coletar
-- "uma vez só" e ler por todos (plano-coleta-unificada.md §2, §3, §6).
--
-- Princípios LGPD aplicados aqui (plano-coleta §5):
--  - Sensíveis (genero, identificacao_racial) são OPCIONAIS e nunca bloqueiam.
--  - Perfil incompleto é estado válido; perfil_completo mede só o NÚCLEO.
--  - Menores ({menos_de_11, 12_14, 15_17}) não têm sensíveis coletados sem mediação.
--  - Consentimento sensível é registrado, versionado e append-only.
--  - Raça/cor mantém o domínio atual do Inanna (alinhamento IBGE fica para depois).

-- 1) Metadados de controle do contrato (não perguntados — gravados pelo sistema).
alter table public.participantes
  add column if not exists perfil_versao smallint not null default 1,
  add column if not exists coletado_via text,
  add column if not exists consent_perfil_versao text,
  add column if not exists consent_sensiveis_at timestamptz;

comment on column public.participantes.perfil_versao is 'Versão do schema do perfil compartilhado (contrato). v1.';
comment on column public.participantes.coletado_via is 'App que coletou/atualizou o perfil: inanna | iza | arara | checkin.';
comment on column public.participantes.consent_perfil_versao is 'Versão do termo de consentimento que cobriu esta coleta.';
comment on column public.participantes.consent_sensiveis_at is 'Quando a pessoa consentiu coletar dados sensíveis (genero/raça).';

-- 2) updated_at já existe (003) mas sem trigger; liga o touch para refletir atualizado_em.
drop trigger if exists touch_participantes_updated_at on public.participantes;
create trigger touch_participantes_updated_at
before update on public.participantes
for each row execute function public.touch_updated_at();

-- 3) Log de consentimento sensível — versionado e append-only (plano-coleta §72).
create table if not exists public.perfil_consent_log (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  consent_perfil_versao text not null,
  escopo text not null default 'dados_sensiveis',
  coletado_via text,
  consentido_em timestamptz not null default now()
);

create index if not exists perfil_consent_log_participante_idx
  on public.perfil_consent_log (participante_id, consentido_em desc);

alter table public.perfil_consent_log enable row level security;
revoke all on table public.perfil_consent_log from anon, authenticated;
grant select, insert on table public.perfil_consent_log to service_role;

-- Append-only: proíbe UPDATE/DELETE (mesmo padrão do reward_ledger em 008).
create or replace function public.prevent_perfil_consent_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'perfil_consent_log é append-only.';
end;
$$;
revoke execute on function public.prevent_perfil_consent_mutation() from public, anon, authenticated;

drop trigger if exists perfil_consent_append_only_update on public.perfil_consent_log;
create trigger perfil_consent_append_only_update
before update on public.perfil_consent_log
for each row execute function public.prevent_perfil_consent_mutation();

drop trigger if exists perfil_consent_append_only_delete on public.perfil_consent_log;
create trigger perfil_consent_append_only_delete
before delete on public.perfil_consent_log
for each row execute function public.prevent_perfil_consent_mutation();

-- 4) lookup recalcula perfil_completo pelo NÚCLEO (sensíveis não exigidos).
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
  perfil_versao smallint,
  coletado_via text,
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
    coalesce(p.perfil_versao, 1)::smallint as perfil_versao,
    p.coletado_via,
    (
      p.oficina_cordel20 is not null
      and p.usou_chatbot_ia is not null
      and p.faixa_etaria in ('menos_de_11', '12_14', '15_17', '18_29', '30_44', '45_59', 'maior_de_60')
      and nullif(trim(coalesce(p.municipio, '')), '') is not null
    ) as perfil_completo
  from public.participantes p
  where lower(p.email) = lower(trim(p_email))
  limit 1;
$$;

-- 5) RPC de registro do contrato (sensíveis opcionais + gate de menor + consentimento).
--    Assinatura estende a anterior com params OPCIONAIS (default) — retrocompatível.
drop function if exists public.registrar_perfil_participante(uuid, text, boolean, boolean, text, text, text, text, text, text);
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
  p_pais text default 'BR',
  p_coletado_via text default 'inanna',
  p_consent_perfil_versao text default null
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
  perfil_versao smallint,
  coletado_via text,
  perfil_completo boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_genero text := lower(trim(coalesce(p_genero, '')));
  v_raca text := lower(trim(coalesce(p_identificacao_racial, '')));
  v_faixa text := lower(trim(coalesce(p_faixa_etaria, '')));
  v_pais text := upper(trim(coalesce(p_pais, 'BR')));
  v_estado text := upper(trim(coalesce(p_estado, '')));
  v_via text := nullif(lower(trim(coalesce(p_coletado_via, ''))), '');
  v_is_minor boolean;
  v_sensiveis_dados boolean;
begin
  if p_participante_id is null or nullif(trim(coalesce(p_email, '')), '') is null then
    raise exception 'Participante e email sao obrigatorios.';
  end if;

  -- NÚCLEO obrigatório (baixa sensibilidade, alto uso): faixa + município.
  if v_faixa not in ('menos_de_11', '12_14', '15_17', '18_29', '30_44', '45_59', 'maior_de_60') then
    raise exception 'Faixa etaria invalida.';
  end if;
  if nullif(trim(coalesce(p_municipio, '')), '') is null then
    raise exception 'Municipio obrigatorio.';
  end if;
  if v_pais <> 'FORA_BRASIL' and v_estado !~ '^[A-Z]{2}$' then
    raise exception 'Estado invalido.';
  end if;

  -- SENSÍVEIS opcionais: vazio/"prefiro_nao_dizer"/inválido -> não grava (null).
  if v_genero not in ('feminino', 'masculino', 'outro') then
    v_genero := null;
  end if;
  if v_raca not in ('negro', 'branco', 'pardo', 'indigena', 'outro') then
    v_raca := null;
  end if;

  -- Gate de menor: não coletar sensíveis de {menos_de_11, 12_14, 15_17} sem mediação.
  v_is_minor := v_faixa in ('menos_de_11', '12_14', '15_17');
  if v_is_minor then
    v_genero := null;
    v_raca := null;
  end if;

  v_sensiveis_dados := v_genero is not null or v_raca is not null;

  update public.participantes p
  set
    oficina_cordel20 = p_oficina_cordel20,
    usou_chatbot_ia = p_usou_chatbot_ia,
    genero = v_genero,
    identificacao_racial = v_raca,
    faixa_etaria = v_faixa,
    municipio = trim(p_municipio),
    estado = case when v_pais = 'FORA_BRASIL' then 'EX' else v_estado end,
    pais = case when v_pais = 'FORA_BRASIL' then 'FORA_BRASIL' else 'BR' end,
    perfil_versao = 1,
    coletado_via = coalesce(v_via, p.coletado_via, 'inanna'),
    consent_perfil_versao = coalesce(p_consent_perfil_versao, p.consent_perfil_versao),
    consent_sensiveis_at = case
      when v_sensiveis_dados then coalesce(p.consent_sensiveis_at, now())
      else p.consent_sensiveis_at
    end,
    perfil_completo = true,
    perfil_completed_at = coalesce(p.perfil_completed_at, now())
  where p.id = p_participante_id
    and lower(p.email) = lower(trim(p_email));

  if not found then
    raise exception 'Participante nao encontrado.';
  end if;

  -- Registra consentimento sensível (append-only) quando houver dado sensível.
  if v_sensiveis_dados then
    insert into public.perfil_consent_log (participante_id, consent_perfil_versao, escopo, coletado_via)
    values (p_participante_id, coalesce(p_consent_perfil_versao, 'perfil_v1'), 'dados_sensiveis', coalesce(v_via, 'inanna'));
  end if;

  return query
  select *
  from public.lookup_participante_por_email(p_email);
end;
$$;

grant execute on function public.lookup_participante_por_email(text) to anon, authenticated;
grant execute on function public.registrar_perfil_participante(uuid, text, boolean, boolean, text, text, text, text, text, text, text, text) to anon, authenticated;

-- 6) View canônica do perfil compartilhado (o que outros apps leem). Read-only.
create or replace view public.perfil_compartilhado_v1 as
select
  p.id            as participante_id,
  p.oficina_cordel20,
  p.usou_chatbot_ia,
  p.faixa_etaria,
  p.municipio,
  p.estado        as uf,
  coalesce(nullif(p.pais, ''), 'BR') as pais,
  p.genero,
  p.identificacao_racial,
  coalesce(p.perfil_versao, 1) as perfil_versao,
  p.coletado_via,
  p.perfil_completed_at as coletado_em,
  p.updated_at    as atualizado_em,
  p.consent_perfil_versao,
  coalesce(p.perfil_completo, false) as perfil_completo
from public.participantes p;

comment on view public.perfil_compartilhado_v1 is
  'Perfil compartilhado (modelo Inanna), contrato v1 — leitura canônica para Inanna/Iza/Arara. Sensíveis só em agregado na saída.';

revoke all on public.perfil_compartilhado_v1 from anon, authenticated;
grant select on public.perfil_compartilhado_v1 to service_role;
