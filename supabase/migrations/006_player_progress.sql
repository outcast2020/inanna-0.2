create table if not exists public.player_progress (
  id uuid primary key default gen_random_uuid(),
  player_id text not null unique,
  nickname text,
  level_unlocked int default 1,
  perfect_quadras_count int default 0,
  unique_perfect_quadra_hashes jsonb default '[]'::jsonb,
  mastery jsonb default '{}'::jsonb,
  schemes_used jsonb default '{}'::jsonb,
  total_challenge_quadras int default 0,
  best_score int default 0,
  updated_at timestamptz default now()
);

alter table public.player_progress enable row level security;

revoke all on table public.player_progress from anon, authenticated;

create index if not exists player_progress_player_id_idx
  on public.player_progress (player_id);

