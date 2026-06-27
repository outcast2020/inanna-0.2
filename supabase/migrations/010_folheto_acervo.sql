-- 010_folheto_acervo.sql
-- Acervo de folhetos de cordel — NFT-simulação CENTRALIZADA, modelada como blockchain
-- desde o dia 1 (analise-inanna.md §84-109). Cada folheto guarda:
--   - content_hash (sha256 do verso): a ponte que um dia ancora on-chain.
--   - metadata_json no formato ERC-721 (name, description, image, attributes[]).
--   - colunas future_* (token_id, contract, chain_status): web3-ready.
-- Raridade ligada à qualidade (quadra perfeita = dourada). SEM marketplace.
--
-- LGPD: ao contrário de uma cadeia real, este registro é apagável. Bloqueamos só
-- UPDATE (imutabilidade do "token"); DELETE fica liberado a service_role para
-- atender o direito ao esquecimento (analise §94, §99 "mantendo-o anonimizável").

create table if not exists public.folhetos_mintados (
  folheto_id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  quadra_id uuid references public.quadras(id) on delete set null,
  level integer not null default 1 check (level in (1, 2)),
  content_hash text not null,
  raridade text not null default 'comum' check (raridade in ('comum', 'rara', 'dourada')),
  pontos integer not null default 0,
  esquema_rima text,
  tema text,
  titulo text,
  metadata_json jsonb not null default '{}'::jsonb,
  future_nft_eligible boolean not null default false,
  future_chain_status text not null default 'not_enabled'
    check (future_chain_status in ('not_enabled', 'pending', 'minted', 'failed')),
  future_token_id text,
  future_contract_address text,
  minted_at timestamptz not null default now(),
  unique (participante_id, content_hash)
);

create index if not exists folhetos_mintados_participante_idx
  on public.folhetos_mintados (participante_id, minted_at desc);

alter table public.folhetos_mintados enable row level security;
revoke all on table public.folhetos_mintados from anon, authenticated;
grant select, insert, delete on table public.folhetos_mintados to service_role;

-- Imutável em UPDATE (correção = novo registro). DELETE permanece possível p/ LGPD.
create or replace function public.prevent_folheto_update()
returns trigger language plpgsql as $$
begin
  raise exception 'folhetos_mintados é imutável (mint log); correção = novo registro.';
end;
$$;
revoke execute on function public.prevent_folheto_update() from public, anon, authenticated;
drop trigger if exists folhetos_no_update on public.folhetos_mintados;
create trigger folhetos_no_update before update on public.folhetos_mintados
for each row execute function public.prevent_folheto_update();

-- Mint: lê a pontuação JÁ GRAVADA na quadra (anti-cheat — backend recalcula no save).
-- Idempotente por (participante_id, content_hash). Chamável do cliente (anon).
create or replace function public.mintar_folheto_de_quadra(
  p_quadra_id uuid,
  p_participante_id uuid
)
returns table (
  folheto_id uuid,
  participante_id uuid,
  quadra_id uuid,
  content_hash text,
  raridade text,
  pontos integer,
  esquema_rima text,
  tema text,
  titulo text,
  metadata_json jsonb,
  minted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.quadras%rowtype;
  v_hash text;
  v_rar text;
  v_titulo text;
  v_meta jsonb;
begin
  select * into q from public.quadras where id = p_quadra_id;
  if not found then
    raise exception 'Quadra nao encontrada.';
  end if;
  if q.participante_id is null or q.participante_id <> p_participante_id then
    raise exception 'Quadra nao pertence ao participante.';
  end if;

  v_hash := encode(sha256(convert_to(coalesce(q.verso, ''), 'UTF8')), 'hex');
  v_rar := case
    when coalesce(q.pontos, 0) >= 14 then 'dourada'
    when coalesce(q.pontos, 0) >= 11 then 'rara'
    else 'comum'
  end;
  v_titulo := 'Folheto • ' || coalesce(nullif(trim(q.tema), ''), 'Cordel 2.0');
  v_meta := jsonb_build_object(
    'name', v_titulo,
    'description', left(coalesce(q.verso, ''), 400),
    'image', '',
    'attributes', jsonb_build_array(
      jsonb_build_object('trait_type', 'Raridade', 'value', v_rar),
      jsonb_build_object('trait_type', 'Pontos', 'value', coalesce(q.pontos, 0)),
      jsonb_build_object('trait_type', 'Esquema', 'value', coalesce(q.esquema_rima, '-')),
      jsonb_build_object('trait_type', 'Tema', 'value', coalesce(nullif(trim(q.tema), ''), '-')),
      jsonb_build_object('trait_type', 'Nivel', 'value', 1)
    ),
    'content_hash', v_hash,
    'standard', 'ERC-721-ready'
  );

  insert into public.folhetos_mintados (
    participante_id, quadra_id, level, content_hash, raridade, pontos,
    esquema_rima, tema, titulo, metadata_json, future_nft_eligible
  ) values (
    p_participante_id, p_quadra_id, 1, v_hash, v_rar, coalesce(q.pontos, 0),
    q.esquema_rima, nullif(trim(q.tema), ''), v_titulo, v_meta, v_rar = 'dourada'
  )
  on conflict (participante_id, content_hash) do nothing;

  return query
  select f.folheto_id, f.participante_id, f.quadra_id, f.content_hash, f.raridade,
         f.pontos, f.esquema_rima, f.tema, f.titulo, f.metadata_json, f.minted_at
  from public.folhetos_mintados f
  where f.participante_id = p_participante_id and f.content_hash = v_hash
  limit 1;
end;
$$;

grant execute on function public.mintar_folheto_de_quadra(uuid, uuid) to anon, authenticated;

-- Leitura do acervo do próprio jogador ("Meu acervo de folhetos", não "carteira").
create or replace function public.listar_acervo_folhetos(p_participante_id uuid)
returns table (
  folheto_id uuid,
  content_hash text,
  raridade text,
  pontos integer,
  esquema_rima text,
  tema text,
  titulo text,
  metadata_json jsonb,
  minted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select f.folheto_id, f.content_hash, f.raridade, f.pontos, f.esquema_rima,
         f.tema, f.titulo, f.metadata_json, f.minted_at
  from public.folhetos_mintados f
  where f.participante_id = p_participante_id
  order by f.minted_at desc
  limit 200;
$$;

grant execute on function public.listar_acervo_folhetos(uuid) to anon, authenticated;
