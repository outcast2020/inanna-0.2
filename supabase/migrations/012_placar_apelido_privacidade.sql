-- 012 — Privacidade do placar: o público vê apelido, nunca o nome civil.
--
-- CONTEXTO
-- O jogador escolhe um apelido no painel ("Como Inanna chama você"), mas o placar
-- do Nível 1 exibia o nome completo do check-in: o frontend gravava `state.name`
-- em `quadras.nome`, e a view `placar_publico` projeta essa coluna como `autor`.
--
-- O QUE JÁ FOI CORRIGIDO NO FRONTEND (deploy de app.js, sem depender deste arquivo)
--   * `quadras.nome` passa a receber o APELIDO (getPlayerDisplayName()).
--   * O apelido nunca mais cai no nome do check-in — sem apelido escolhido,
--     grava "Cordelista anônimo".
--   * O placar encurta na renderização qualquer autor com 3+ nomes significativos.
-- A identidade real da pesquisa NÃO se perde: continua em `quadras.email` e no
-- vínculo `quadras.participante_id` -> `participantes.nome`.
--
-- O QUE ESTE ARQUIVO FAZ
--   (1) Encurta os nomes civis JÁ gravados em `quadras` (linhas anteriores ao fix).
--   (2) Fecha o acesso anônimo à view `inanna_level2_publico`, que expunha
--       `inanna_sessions.nickname` para qualquer portador da anon key.
--
-- ATENÇÃO: o passo (1) reescreve dados. Faça backup da tabela `quadras` antes:
--   create table public.quadras_backup_012 as select * from public.quadras;
-- Para as linhas com `participante_id` preenchido o nome civil segue recuperável
-- em `participantes`. Para linhas legadas sem participante, o encurtamento é
-- definitivo — que é justamente o objetivo do expurgo.

-- ── (1) Encurtar nomes civis já gravados ────────────────────────────────────

-- Mesma regra do frontend (formatPlacarAuthor): conectivos não contam como nome,
-- para não mutilar apelidos do tipo "Zé da Manga".
create or replace function public.encurtar_nome_publico(p_nome text)
returns text
language plpgsql
immutable
as $$
declare
  v_clean text;
  v_sig text[] := array[]::text[];
  v_part text;
  v_total int;
begin
  v_clean := btrim(regexp_replace(coalesce(p_nome, ''), '\s+', ' ', 'g'));
  if v_clean = '' then
    return 'Autor anônimo';
  end if;

  foreach v_part in array string_to_array(v_clean, ' ') loop
    if lower(v_part) not in ('de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du', 'del', 'la') then
      v_sig := array_append(v_sig, v_part);
    end if;
  end loop;

  v_total := coalesce(array_length(v_sig, 1), 0);
  -- Um ou dois nomes significativos já é apelido: preserva como está.
  if v_total < 3 then
    return v_clean;
  end if;

  return v_sig[1] || ' ' || upper(left(v_sig[v_total], 1)) || '.';
end;
$$;

comment on function public.encurtar_nome_publico(text) is
  'Reduz um nome a "Primeiro I." quando ele tem 3+ nomes significativos. Idempotente: reaplicar não muda o resultado.';

-- Idempotente: quem já está curto não é tocado, então rodar de novo é no-op.
update public.quadras
set nome = public.encurtar_nome_publico(nome)
where coalesce(nome, '') <> ''
  and public.encurtar_nome_publico(nome) is distinct from nome;

comment on column public.quadras.nome is
  'Nome PÚBLICO (apelido escolhido pelo jogador) — alimenta placar_publico.autor. Nunca o nome civil: esse fica em participantes.nome via participante_id.';

-- ── (2) Fechar o vazamento de apelidos do Nível 2 pela API ──────────────────

-- `inanna_level2_publico` expõe inanna_sessions.nickname e tinha grant para anon
-- (migration 007). Nenhuma tela do app lê esta view — todo o Nível 2 passa pelo
-- Worker com service_role —, então o grant só servia para dumpar a lista de
-- jogadores com a anon key, que é pública por natureza.
revoke select on table public.inanna_level2_publico from anon;
revoke select on table public.inanna_level2_publico from authenticated;

comment on view public.inanna_level2_publico is
  'Uso interno (service_role / Worker). Não conceder select a anon: a coluna nickname é dado de jogador.';
