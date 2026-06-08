# Supabase migration notes

Run the SQL files in order from `supabase/migrations`.

Required frontend variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_INANNA_LEVEL=1
VITE_INANNA_AI_ENABLED=false
VITE_INANNA_SOCIAL_EMAIL_ENABLED=false
```

Never expose these in the frontend or GitHub:

```env
SUPABASE_SERVICE_ROLE_KEY=
MARITACA_API_KEY=
CLOUDFLARE_API_TOKEN=
```

For the historical scoreboard, export the Google Sheet tab as CSV, normalize the
columns, and import rows into `public.quadras` with:

```sql
legado_google_sheet = true,
origem_importacao = 'google-sheets'
```

The public app reads `public.placar_publico`, and new submissions insert into
`public.quadras`.
