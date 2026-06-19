create table if not exists public.player_wallets (
  wallet_id uuid primary key default gen_random_uuid(),
  player_id text not null unique references public.inanna_players(player_id) on delete cascade,
  internal_balance_pieces integer not null default 0 check (internal_balance_pieces >= 0),
  internal_balance_peleja_points integer not null default 0 check (internal_balance_peleja_points >= 0),
  level1_pieces_count integer not null default 0 check (level1_pieces_count >= 0),
  level2_pieces_count integer not null default 0 check (level2_pieces_count >= 0),
  completed_puzzles_count integer not null default 0 check (completed_puzzles_count >= 0),
  future_wallet_address text,
  future_wallet_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inanna_rounds
  add column if not exists content_privacy_json jsonb not null default '{}'::jsonb;

create table if not exists public.puzzles (
  puzzle_id uuid primary key default gen_random_uuid(),
  level integer not null check (level in (1, 2)),
  slug text not null unique,
  title text not null,
  description text,
  total_pieces integer not null default 30 check (total_pieces > 0),
  image_url text,
  future_nft_eligible boolean not null default false,
  future_contract_address text,
  created_at timestamptz not null default now()
);

insert into public.puzzles (level, slug, title, description, total_pieces, image_url, future_nft_eligible)
values
  (1, 'inanna-siamesa', 'Inanna encontrada', 'Imagem simbolica liberada por pedacinhos poeticos do Nivel 1.', 12, 'cat_siamese_happy.png', false),
  (2, 'xilogravura-peleja', 'Xilogravura da peleja', 'Quebra-cabeca simbolico do percurso criativo no Nivel 2.', 30, null, true)
on conflict (slug) do update
set
  level = excluded.level,
  title = excluded.title,
  description = excluded.description,
  total_pieces = excluded.total_pieces,
  image_url = excluded.image_url,
  future_nft_eligible = excluded.future_nft_eligible;

create table if not exists public.puzzle_pieces (
  piece_id uuid primary key default gen_random_uuid(),
  player_id text not null references public.inanna_players(player_id) on delete cascade,
  puzzle_id uuid not null references public.puzzles(puzzle_id) on delete restrict,
  level integer not null check (level in (1, 2)),
  session_id uuid references public.inanna_sessions(session_id) on delete set null,
  round_id uuid references public.inanna_rounds(round_id) on delete set null,
  piece_index integer not null check (piece_index > 0),
  piece_color text,
  criterion_source text not null,
  status text not null default 'earned' check (status in ('earned', 'exchanged', 'revoked', 'future_minted')),
  earned_at timestamptz not null default now(),
  exchanged_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb,
  unique (player_id, puzzle_id, piece_index)
);

create table if not exists public.reward_ledger (
  ledger_id uuid primary key default gen_random_uuid(),
  player_id text not null references public.inanna_players(player_id) on delete cascade,
  session_id uuid references public.inanna_sessions(session_id) on delete set null,
  level integer not null check (level in (1, 2)),
  event_type text not null check (
    event_type in (
      'piece_earned',
      'piece_exchanged',
      'puzzle_completed',
      'level_unlocked',
      'rhyme_bonus',
      'creativity_bonus',
      'penalty_repetition',
      'future_mint_requested',
      'future_mint_completed',
      'correction_reversal'
    )
  ),
  amount integer not null,
  reward_unit text not null check (
    reward_unit in (
      'inanna_piece',
      'xilo_piece',
      'peleja_point',
      'authorship_mark',
      'future_token_credit'
    )
  ),
  reason text not null,
  related_piece_id uuid references public.puzzle_pieces(piece_id) on delete set null,
  related_quadra_id uuid references public.quadras(id) on delete set null,
  related_round_id uuid references public.inanna_rounds(round_id) on delete set null,
  metadata_json jsonb not null default '{}'::jsonb,
  future_chain_status text not null default 'not_enabled' check (future_chain_status in ('not_enabled', 'pending', 'minted', 'failed')),
  future_token_id text,
  future_contract_address text,
  future_transaction_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.level2_rhyme_bank (
  rhyme_id uuid primary key default gen_random_uuid(),
  player_id text not null references public.inanna_players(player_id) on delete cascade,
  session_id uuid not null references public.inanna_sessions(session_id) on delete cascade,
  round_id uuid references public.inanna_rounds(round_id) on delete set null,
  quadra_id uuid,
  verse_number integer not null check (verse_number > 0),
  final_word text not null,
  normalized_final_word text not null,
  rhyme_key text not null,
  rhyme_family text not null,
  full_verse text not null,
  is_repeated_exact_word boolean not null default false,
  is_repeated_rhyme_family boolean not null default false,
  earned_originality_bonus boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists player_wallets_player_idx
  on public.player_wallets (player_id);

create index if not exists puzzle_pieces_player_puzzle_idx
  on public.puzzle_pieces (player_id, puzzle_id, piece_index);

create index if not exists reward_ledger_player_created_idx
  on public.reward_ledger (player_id, created_at desc);

create index if not exists reward_ledger_session_idx
  on public.reward_ledger (session_id, created_at desc);

create index if not exists level2_rhyme_bank_session_idx
  on public.level2_rhyme_bank (session_id, created_at desc);

create index if not exists level2_rhyme_bank_session_player_key_idx
  on public.level2_rhyme_bank (session_id, player_id, rhyme_key);

create index if not exists level2_rhyme_bank_session_player_word_idx
  on public.level2_rhyme_bank (session_id, player_id, normalized_final_word);

alter table public.player_wallets enable row level security;
alter table public.puzzles enable row level security;
alter table public.puzzle_pieces enable row level security;
alter table public.reward_ledger enable row level security;
alter table public.level2_rhyme_bank enable row level security;

revoke all on table public.player_wallets from anon, authenticated;
revoke all on table public.puzzles from anon, authenticated;
revoke all on table public.puzzle_pieces from anon, authenticated;
revoke all on table public.reward_ledger from anon, authenticated;
revoke all on table public.level2_rhyme_bank from anon, authenticated;

grant select, insert, update on table public.player_wallets to service_role;
grant select, insert, update on table public.puzzles to service_role;
grant select, insert, update on table public.puzzle_pieces to service_role;
grant select, insert on table public.reward_ledger to service_role;
grant select, insert, update, delete on table public.level2_rhyme_bank to service_role;

drop trigger if exists touch_player_wallets_updated_at on public.player_wallets;
create trigger touch_player_wallets_updated_at
before update on public.player_wallets
for each row execute function public.touch_updated_at();

create or replace function public.prevent_reward_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'reward_ledger is append-only; write a correction_reversal entry instead';
end;
$$;

revoke execute on function public.prevent_reward_ledger_mutation() from public, anon, authenticated;

drop trigger if exists reward_ledger_append_only_update on public.reward_ledger;
create trigger reward_ledger_append_only_update
before update on public.reward_ledger
for each row execute function public.prevent_reward_ledger_mutation();

drop trigger if exists reward_ledger_append_only_delete on public.reward_ledger;
create trigger reward_ledger_append_only_delete
before delete on public.reward_ledger
for each row execute function public.prevent_reward_ledger_mutation();
