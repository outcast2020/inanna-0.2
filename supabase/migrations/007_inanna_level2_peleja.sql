create extension if not exists pgcrypto;

create table if not exists public.inanna_players (
  player_id text primary key,
  participante_id uuid references public.participantes(id) on delete set null,
  nickname text not null default 'Jogador',
  email_hash text,
  consent_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inanna_sessions (
  session_id uuid primary key default gen_random_uuid(),
  player_id text not null references public.inanna_players(player_id) on delete cascade,
  nickname text not null default 'Jogador',
  level integer not null default 2,
  status text not null default 'active' check (status in ('active', 'finished', 'abandoned')),
  input_mode text not null default 'written' check (input_mode in ('written', 'dictation')),
  sound_mode text not null default 'none' check (sound_mode in ('none', 'white_noise', 'baiao', 'hiphop')),
  current_round integer not null default 1,
  player_wins integer not null default 0,
  inanna_wins integer not null default 0,
  social_score jsonb not null default '{}'::jsonb,
  level_progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.inanna_rounds (
  round_id uuid primary key default gen_random_uuid(),
  session_id uuid references public.inanna_sessions(session_id) on delete cascade,
  player_id text references public.inanna_players(player_id) on delete set null,
  round_number integer not null check (round_number between 1 and 3),
  theme text,
  rhyme_scheme text not null default 'AABB',
  player_original_quadra text,
  player_final_quadra text,
  inanna_quadra text,
  stolen_words jsonb not null default '[]'::jsonb,
  player_score integer not null default 0,
  inanna_score integer not null default 0,
  round_winner text check (round_winner in ('player', 'inanna', 'draw')),
  ai_evaluation_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inanna_votes (
  vote_id uuid primary key default gen_random_uuid(),
  session_id uuid references public.inanna_sessions(session_id) on delete cascade,
  round_id uuid references public.inanna_rounds(round_id) on delete cascade,
  observer_id text not null,
  vote_target text not null check (vote_target in ('player', 'inanna')),
  created_at timestamptz not null default now(),
  unique (round_id, observer_id)
);

create table if not exists public.local_lexicon_future (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  region text,
  meaning text,
  grammatical_class text,
  example text,
  familiarity_level text,
  cultural_tags text[] not null default array[]::text[],
  semantic_field text,
  sensitive_usage_notes text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inanna_sessions_player_idx
  on public.inanna_sessions (player_id, created_at desc);

create index if not exists inanna_rounds_session_idx
  on public.inanna_rounds (session_id, round_number);

create index if not exists inanna_votes_round_idx
  on public.inanna_votes (round_id, vote_target);

create or replace view public.inanna_level2_publico as
select
  s.session_id,
  s.nickname,
  s.status,
  s.player_wins,
  s.inanna_wins,
  s.current_round,
  s.sound_mode,
  s.created_at,
  s.finished_at,
  coalesce(sum(r.player_score), 0)::integer as player_score_total,
  coalesce(sum(r.inanna_score), 0)::integer as inanna_score_total,
  count(r.round_id)::integer as rounds_played
from public.inanna_sessions s
left join public.inanna_rounds r on r.session_id = s.session_id
group by s.session_id;

alter table public.inanna_players enable row level security;
alter table public.inanna_sessions enable row level security;
alter table public.inanna_rounds enable row level security;
alter table public.inanna_votes enable row level security;
alter table public.local_lexicon_future enable row level security;

revoke all on table public.inanna_players from anon, authenticated;
revoke all on table public.inanna_sessions from anon, authenticated;
revoke all on table public.inanna_rounds from anon, authenticated;
revoke all on table public.inanna_votes from anon, authenticated;
revoke all on table public.local_lexicon_future from anon, authenticated;

grant select on public.inanna_level2_publico to anon, authenticated;

drop trigger if exists touch_inanna_players_updated_at on public.inanna_players;
create trigger touch_inanna_players_updated_at
before update on public.inanna_players
for each row execute function public.touch_updated_at();
