(function () {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const CONFIG = window.INANNA_APP_CONFIG || {};
  let baseClient = null;

  function cleanConfigValue(value) {
    const text = String(value || "").trim();
    if (!text || /^%VITE_[A-Z0-9_]+%$/.test(text)) return "";
    return text;
  }

  function readBoolean(value, fallback = false) {
    const text = cleanConfigValue(value).toLowerCase();
    if (!text) return fallback;
    return ["1", "true", "yes", "on"].includes(text);
  }

  const SUPABASE_URL = cleanConfigValue(CONFIG.supabaseUrl || window.INANNA_SUPABASE_URL);
  const SUPABASE_ANON_KEY = cleanConfigValue(CONFIG.supabaseAnonKey || window.INANNA_SUPABASE_ANON_KEY);

  window.INANNA_APP_CONFIG = {
    ...CONFIG,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    aiEnabled: readBoolean(CONFIG.aiEnabled, false),
    socialEmailEnabled: readBoolean(CONFIG.socialEmailEnabled, false),
  };

  function getSupabaseFactory() {
    return window.supabase?.createClient || window.supabaseJs?.createClient || null;
  }

  function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY && getSupabaseFactory());
  }

  function createClient(headers = {}) {
    const factory = getSupabaseFactory();
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !factory) {
      throw new Error("Supabase ainda nao foi configurado para a Inanna.");
    }

    return factory(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers,
      },
    });
  }

  function getBaseClient() {
    if (!baseClient) baseClient = createClient();
    return baseClient;
  }

  function scopedClient(scope = {}) {
    const headers = {};
    const participantId = normalizeUuid(scope.participantId || scope.participanteId);
    const viewerKey = String(scope.viewerKey || "").trim();
    if (participantId) headers["x-inanna-participant-id"] = participantId;
    if (viewerKey) headers["x-inanna-viewer-key"] = viewerKey;
    return createClient(headers);
  }

  function normalizeUuid(value) {
    const text = String(value || "").trim();
    return UUID_RE.test(text) ? text : "";
  }

  function normalizeStatus(status, sharedWithEducator) {
    const normalized = String(status || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalized) return sharedWithEducator ? "compartilhada com educador" : "rascunho";
    if (normalized.startsWith("selecion")) return "selecionada para antologia";
    if (normalized.startsWith("compart")) return "compartilhada com educador";
    if (normalized.startsWith("em revis")) return "em revisao";
    if (normalized.startsWith("conclu")) return "concluida";
    if (normalized.startsWith("arquiv")) return "arquivada";
    return "rascunho";
  }

  function normalizeVerses(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || "").trim()).slice(0, 6).concat(["", "", "", "", "", ""]).slice(0, 6);
    }
    if (typeof value === "string") {
      try {
        return normalizeVerses(JSON.parse(value));
      } catch (_) {
        return ["", "", "", "", "", ""];
      }
    }
    return ["", "", "", "", "", ""];
  }

  function defaultIndicators(versionCount) {
    const revisionCount = Number(versionCount) || 0;
    return {
      completude: "0/6 versos preenchidos",
      fechamento: "texto iniciando",
      rimaStatus: "rima em formacao",
      coerenciaTematica: "tema em formacao",
      repeticaoLexical: "boa variedade lexical",
      numberOfRevisions: revisionCount,
      maturacao:
        revisionCount >= 4
          ? "texto amadurecido"
          : revisionCount >= 2
            ? "texto amadurecendo"
            : revisionCount === 1
              ? "primeira versao registrada"
              : "texto iniciando",
    };
  }

  function normalizeIndicators(indicators, versionCount) {
    const fallback = defaultIndicators(versionCount);
    const source = indicators || {};
    return {
      completude: String(source.completude || fallback.completude),
      fechamento: String(source.fechamento || fallback.fechamento),
      rimaStatus: String(source.rimaStatus || fallback.rimaStatus),
      coerenciaTematica: String(source.coerenciaTematica || fallback.coerenciaTematica),
      repeticaoLexical: String(source.repeticaoLexical || fallback.repeticaoLexical),
      numberOfRevisions: Number(source.numberOfRevisions || versionCount || 0),
      maturacao: String(source.maturacao || fallback.maturacao),
    };
  }

  function mapVersionRow(row) {
    if (!row) return null;
    return {
      versionId: String(row.id || row.versionId || "").trim(),
      textId: String(row.text_id || row.textId || "").trim(),
      folhetoId: String(row.folheto_id || row.folhetoId || "").trim(),
      folhetoTitle: String(row.folheto_title || row.folhetoTitle || "").trim(),
      folhetoOrder: Number(row.folheto_order ?? row.folhetoOrder ?? 0),
      participantId: String(row.participante_id || row.participantId || "").trim(),
      versionNumber: Number(row.numero_versao ?? row.versionNumber ?? 0),
      title: String(row.titulo || row.title || "").trim(),
      theme: String(row.tema || row.theme || "").trim(),
      note: String(row.nota || row.note || "").trim(),
      verses: normalizeVerses(row.versos || row.verses),
      status: normalizeStatus(row.status, row.compartilhada_com_educador ?? row.sharedWithEducator),
      sharedWithEducator: !!(row.compartilhada_com_educador ?? row.sharedWithEducator),
      createdAt: String(row.created_at || row.createdAt || ""),
      indicators: normalizeIndicators(row.indicadores || row.indicators, row.numero_versao ?? row.versionNumber),
      revisionNote: String(row.revision_note || row.revisionNote || "").trim(),
    };
  }

  function mapTextRow(row) {
    if (!row) return null;
    const versionCount = Number(row.version_count ?? row.versionCount ?? 0);
    const latestVersion = row.latest_version ? mapVersionRow(row.latest_version) : null;
    return {
      textId: String(row.id || row.textId || "").trim(),
      folhetoId: String(row.folheto_id || row.folhetoId || "").trim(),
      folhetoTitle: String(row.folheto_title || row.folhetoTitle || "").trim(),
      folhetoOrder: Number(row.folheto_order ?? row.folhetoOrder ?? 0),
      title: String(row.titulo || row.title || "").trim(),
      theme: String(row.tema || row.theme || "").trim(),
      note: String(row.nota || row.note || "").trim(),
      status: normalizeStatus(row.status, row.compartilhada_com_educador ?? row.sharedWithEducator),
      createdAt: String(row.created_at || row.createdAt || ""),
      updatedAt: String(row.updated_at || row.updatedAt || row.created_at || ""),
      currentVersionId: String(row.current_version_id || row.currentVersionId || "").trim(),
      versionCount,
      sharedWithEducator: !!(row.compartilhada_com_educador ?? row.sharedWithEducator),
      selectedForAnthology: !!(row.selecionada_para_antologia ?? row.selectedForAnthology),
      reopenRequested: !!(row.reabertura_solicitada ?? row.reopenRequested),
      indicators: normalizeIndicators(row.indicadores || row.indicators, versionCount),
      participantId: String(row.participante_id || row.participantId || "").trim(),
      checkinUserId: String(row.checkin_user_id || row.checkinUserId || "").trim(),
      teacherGroup: String(row.teacher_group || row.teacherGroup || "").trim(),
      verses: normalizeVerses(row.versos || row.verses),
      latestVersion,
    };
  }

  function mapFolhetoRow(row, texts = []) {
    if (!row) return null;
    const folhetoId = String(row.id || row.folhetoId || "").trim();
    const relatedTexts = texts.filter((text) => String(text.folhetoId || "") === folhetoId);
    const completedCount = relatedTexts.filter((text) => normalizeStatus(text.status) === "concluida").length;
    return {
      folhetoId,
      title: String(row.title || "").trim() || "Folheto sem titulo",
      createdAt: String(row.created_at || row.createdAt || ""),
      updatedAt: String(row.updated_at || row.updatedAt || row.created_at || ""),
      participantId: String(row.participante_id || row.participantId || "").trim(),
      checkinUserId: String(row.checkin_user_id || row.checkinUserId || "").trim(),
      teacherGroup: String(row.teacher_group || row.teacherGroup || "").trim(),
      textCount: relatedTexts.length,
      completedCount,
    };
  }

  function buildDashboardPayload(texts, folhetos = []) {
    const completedCount = texts.filter((item) => normalizeStatus(item.status) === "concluida").length;
    const sortedTexts = [...texts].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    const sortedFolhetos = [...folhetos].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return {
      status: "success",
      folhetoCount: sortedFolhetos.length,
      textCount: sortedTexts.length,
      completedCount,
      lastEditedAt: sortedTexts[0]?.updatedAt || "",
      folhetos: sortedFolhetos,
      texts: sortedTexts,
    };
  }

  function assertIdentity(identity) {
    const participantId = normalizeUuid(identity?.participantId);
    if (!participantId) {
      throw new Error("Participante Supabase invalido ou ausente.");
    }
    return participantId;
  }

  function scopedForIdentity(identity) {
    const participantId = assertIdentity(identity);
    return {
      participantId,
      client: scopedClient({ participantId }),
    };
  }

  async function lookupParticipantByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return { ok: false, status: "error", error: "invalid_email" };
    }

    const { data, error } = await getBaseClient()
      .rpc("lookup_participante_por_email", { p_email: normalizedEmail })
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, status: "unmatched", error: "email_not_found" };

    return {
      ok: true,
      status: "matched",
      participantId: data.id,
      checkinUserId: data.checkin_user_id || data.id,
      participantIdSource: "supabase",
      checkinUserIdSource: "supabase",
      matchMethod: "email",
      name: data.nome || "Participante",
      email: data.email || normalizedEmail,
      tipoParticipante: data.tipo_participante || "",
      municipio: data.municipio || "",
      estado: data.estado || "",
      origem: data.origem || "",
      teacherGroup: data.teacher_group || "",
    };
  }

  async function submitQuadra(payload) {
    const participantId = normalizeUuid(payload.participantId);
    const row = {
      participante_id: participantId || null,
      external_participant_id: participantId ? null : String(payload.participantId || "").trim(),
      checkin_user_id: String(payload.checkinUserId || "").trim(),
      checkin_match_status: String(payload.checkinMatchStatus || "").trim(),
      checkin_match_method: String(payload.checkinMatchMethod || "").trim(),
      nome: String(payload.nome || payload.name || "").trim(),
      email: String(payload.email || "").trim().toLowerCase(),
      tipo_participante: String(payload.tipoAcesso || payload.tipoParticipante || "").trim(),
      municipio: String(payload.municipio || "").trim(),
      estado: String(payload.estado || "").trim(),
      origem: String(payload.origem || "").trim(),
      teacher_group: String(payload.teacherGroup || "").trim(),
      verso: String(payload.verso || "").trim(),
      modo: String(payload.modo || "").trim(),
      tema: String(payload.tema || "").trim(),
      pontos: Number(payload.pontos || 0),
      esquema_rima: String(payload.esquemaRima || "").trim(),
      pontos_rima: Number(payload.pontosRima || 0),
      pontos_forma: Number(payload.pontosForma || 0),
      pontos_criatividade: Number(payload.pontosCriatividade || 0),
      bonus_esquema: Number(payload.bonusEsquema || 0),
      tempo_escrita_ms: Number(payload.tempoEscritaMs || 0),
      tempo_escrita_formatado: String(payload.tempoEscritaFormatado || "").trim(),
      app_variant: String(payload.appVariant || "inanna-main").trim() || "inanna-main",
      origem_importacao: "supabase",
    };

    if (!row.verso) throw new Error("Quadra vazia.");

    const { error } = await getBaseClient().from("quadras").insert(row);
    if (error) throw error;
    return { status: "success" };
  }

  function mapViewerReactions(rows) {
    return (rows || []).reduce((acc, row) => {
      const key = String(row.reaction || "").trim();
      if (!["thumb", "heart", "wow"].includes(key)) return acc;
      acc[key] += 1;
      acc.total += 1;
      return acc;
    }, { thumb: 0, heart: 0, wow: 0, total: 0 });
  }

  function mapPlacarRow(row, viewerRows = []) {
    const counts = row.reactions || {};
    return {
      id: row.id,
      entryKey: String(row.entry_key || row.id || "").trim(),
      posicao: row.posicao,
      autor: row.autor || "Autor anonimo",
      verso: row.verso || "",
      pontos: Number(row.pontos || 0),
      pontosRima: Number(row.pontos_rima || 0),
      pontosForma: Number(row.pontos_forma || 0),
      pontosCriatividade: Number(row.pontos_criatividade || 0),
      bonusEsquema: Number(row.bonus_esquema || 0),
      timestamp: row.timestamp || row.created_at || "",
      reactions: {
        thumb: Number(counts.thumb || 0),
        heart: Number(counts.heart || 0),
        wow: Number(counts.wow || 0),
        total: Number(counts.total || 0),
      },
      viewerReactions: mapViewerReactions(viewerRows),
    };
  }

  async function loadPlacar(viewerKey = "") {
    const { data, error } = await getBaseClient()
      .from("placar_publico")
      .select("*")
      .order("pontos", { ascending: false })
      .limit(20);

    if (error) throw error;
    const rows = data || [];
    const ids = rows.map((row) => row.id).filter(Boolean);
    let viewerRows = [];

    if (viewerKey && ids.length) {
      const viewerClient = scopedClient({ viewerKey });
      const viewerResult = await viewerClient
        .from("placar_reactions")
        .select("quadra_id,reaction")
        .in("quadra_id", ids)
        .eq("viewer_key", viewerKey);

      if (viewerResult.error) throw viewerResult.error;
      viewerRows = viewerResult.data || [];
    }

    return rows.map((row) => mapPlacarRow(
      row,
      viewerRows.filter((reaction) => String(reaction.quadra_id) === String(row.id))
    ));
  }

  async function reactPlacar(payload = {}) {
    const quadraId = normalizeUuid(payload.entryKey || payload.quadraId);
    const reaction = String(payload.reaction || "").trim();
    const viewerKey = String(payload.viewerKey || "").trim();
    const participantId = normalizeUuid(payload.participantId);

    if (!quadraId) throw new Error("Quadra invalida para reacao.");
    if (!viewerKey) throw new Error("Identificador local de visitante ausente.");

    const { error } = await getBaseClient().rpc("registrar_reacao_placar", {
      p_quadra_id: quadraId,
      p_reaction: reaction,
      p_viewer_key: viewerKey,
      p_participante_id: participantId || null,
    });

    if (error) throw error;
    return { status: "success", placar: await loadPlacar(viewerKey) };
  }

  async function getUserDashboard(identity) {
    const { participantId, client } = scopedForIdentity(identity);
    const [textsResult, folhetosResult] = await Promise.all([
      client
        .from("sextilha_texts")
        .select("*")
        .eq("participante_id", participantId)
        .order("updated_at", { ascending: false }),
      client
        .from("sextilha_folhetos")
        .select("*")
        .eq("participante_id", participantId)
        .order("updated_at", { ascending: false }),
    ]);

    if (textsResult.error) throw textsResult.error;
    if (folhetosResult.error) throw folhetosResult.error;

    const texts = (textsResult.data || []).map(mapTextRow).filter(Boolean);
    const folhetos = (folhetosResult.data || []).map((row) => mapFolhetoRow(row, texts)).filter(Boolean);
    return buildDashboardPayload(texts, folhetos);
  }

  async function touchFolheto(identity, folhetoId, updates = {}) {
    const normalizedFolhetoId = normalizeUuid(folhetoId);
    if (!normalizedFolhetoId) return;
    const { client } = scopedForIdentity(identity);
    const { error } = await client
      .from("sextilha_folhetos")
      .update({
        title: String(updates.title || "Folheto sem titulo").trim(),
      })
      .eq("id", normalizedFolhetoId);
    if (error) throw error;
  }

  async function createFolheto(identity, payload) {
    const { participantId, client } = scopedForIdentity(identity);
    const { data, error } = await client
      .from("sextilha_folhetos")
      .insert({
        participante_id: participantId,
        checkin_user_id: String(identity.checkinUserId || "").trim(),
        teacher_group: String(identity.teacherGroup || "").trim(),
        title: String(payload.title || "").trim() || "Folheto sem titulo",
        app_variant: String(identity.appVariant || "inanna-main").trim() || "inanna-main",
      })
      .select("*")
      .single();

    if (error) throw error;
    return {
      ok: true,
      status: "success",
      folheto: mapFolhetoRow(data),
    };
  }

  async function createText(identity, payload) {
    const { participantId, client } = scopedForIdentity(identity);
    const folhetoId = normalizeUuid(payload.folhetoId);
    const { data, error } = await client
      .from("sextilha_texts")
      .insert({
        participante_id: participantId,
        checkin_user_id: String(identity.checkinUserId || "").trim(),
        teacher_group: String(identity.teacherGroup || "").trim(),
        folheto_id: folhetoId || null,
        folheto_title: String(payload.folhetoTitle || "").trim(),
        folheto_order: Number(payload.folhetoOrder || 0),
        titulo: String(payload.title || "").trim(),
        tema: String(payload.theme || "").trim(),
        nota: String(payload.note || payload.observation || "").trim(),
        status: normalizeStatus(payload.status, false),
        indicadores: defaultIndicators(0),
        versos: ["", "", "", "", "", ""],
        app_variant: String(identity.appVariant || "inanna-main").trim() || "inanna-main",
      })
      .select("*")
      .single();

    if (error) throw error;
    if (folhetoId) await touchFolheto(identity, folhetoId, { title: payload.folhetoTitle });
    return {
      ok: true,
      status: "success",
      text: mapTextRow(data),
    };
  }

  async function getText(identity, textId) {
    const { participantId, client } = scopedForIdentity(identity);
    const { data, error } = await client
      .from("sextilha_texts")
      .select("*")
      .eq("participante_id", participantId)
      .eq("id", textId)
      .single();

    if (error) throw error;
    const text = mapTextRow(data);
    return {
      status: "success",
      text,
      latestVersion: text?.latestVersion || null,
    };
  }

  async function getTextVersions(identity, textId) {
    const { participantId, client } = scopedForIdentity(identity);
    const { data, error } = await client
      .from("sextilha_versions")
      .select("*")
      .eq("participante_id", participantId)
      .eq("text_id", textId)
      .order("numero_versao", { ascending: false });

    if (error) throw error;
    return {
      status: "success",
      textId,
      versions: (data || []).map(mapVersionRow).filter(Boolean),
    };
  }

  async function saveTextVersion(identity, payload) {
    const { participantId, client } = scopedForIdentity(identity);
    const textId = normalizeUuid(payload.textId);
    if (!textId) throw new Error("textId obrigatorio.");

    const currentResponse = await getText(identity, textId);
    const currentText = currentResponse.text;
    if (!currentText) throw new Error("Texto nao encontrado.");

    const nextVersionNumber = Number(currentText.versionCount || 0) + 1;
    const sharedWithEducator = !!payload.sharedWithEducator;
    const status = normalizeStatus(payload.status || currentText.status, sharedWithEducator);
    const verses = normalizeVerses(payload.verses);
    const indicators = normalizeIndicators(payload.indicators, nextVersionNumber);
    const folhetoId = normalizeUuid(currentText.folhetoId || payload.folhetoId);

    const versionInsert = {
      text_id: textId,
      participante_id: participantId,
      checkin_user_id: String(identity.checkinUserId || "").trim(),
      teacher_group: String(identity.teacherGroup || "").trim(),
      folheto_id: folhetoId || null,
      folheto_title: currentText.folhetoTitle || String(payload.folhetoTitle || "").trim(),
      folheto_order: Number(currentText.folhetoOrder || payload.folhetoOrder || 0),
      numero_versao: nextVersionNumber,
      titulo: String(payload.title || currentText.title || "").trim(),
      tema: String(payload.theme || currentText.theme || "").trim(),
      nota: String(payload.note || payload.observation || currentText.note || "").trim(),
      versos: verses,
      status,
      compartilhada_com_educador: sharedWithEducator,
      indicadores: indicators,
      revision_note: String(payload.revisionNote || "").trim(),
    };

    const versionResult = await client
      .from("sextilha_versions")
      .insert(versionInsert)
      .select("*")
      .single();
    if (versionResult.error) throw versionResult.error;

    const versionRow = versionResult.data;
    const textUpdate = {
      folheto_id: versionInsert.folheto_id,
      folheto_title: versionInsert.folheto_title,
      folheto_order: versionInsert.folheto_order,
      titulo: versionInsert.titulo,
      tema: versionInsert.tema,
      nota: versionInsert.nota,
      status,
      current_version_id: versionRow.id,
      version_count: nextVersionNumber,
      compartilhada_com_educador: sharedWithEducator,
      indicadores: indicators,
      versos: verses,
      latest_version: versionRow,
    };

    const textResult = await client
      .from("sextilha_texts")
      .update(textUpdate)
      .eq("participante_id", participantId)
      .eq("id", textId)
      .select("*")
      .single();
    if (textResult.error) throw textResult.error;

    if (folhetoId) await touchFolheto(identity, folhetoId, { title: versionInsert.folheto_title });

    return {
      ok: true,
      status: "success",
      text: mapTextRow(textResult.data),
      version: mapVersionRow(versionRow),
    };
  }

  async function updateTextStatus(identity, payload) {
    const { participantId, client } = scopedForIdentity(identity);
    const textId = normalizeUuid(payload.textId);
    if (!textId) throw new Error("textId obrigatorio.");

    const currentResponse = await getText(identity, textId);
    const currentText = currentResponse.text;
    if (!currentText) throw new Error("Texto nao encontrado.");

    const sharedWithEducator = payload.sharedWithEducator === undefined
      ? !!currentText.sharedWithEducator
      : !!payload.sharedWithEducator;
    const nextStatus = normalizeStatus(payload.status || currentText.status || "rascunho", sharedWithEducator);
    let reopenRequested = payload.reopenRequested === undefined
      ? !!currentText.reopenRequested
      : !!payload.reopenRequested;
    if (nextStatus !== "concluida") reopenRequested = false;

    const nextLatestVersion = currentText.latestVersion
      ? {
        ...currentText.latestVersion,
        status: nextStatus,
        sharedWithEducator,
      }
      : null;

    const updateResult = await client
      .from("sextilha_texts")
      .update({
        status: nextStatus,
        compartilhada_com_educador: sharedWithEducator,
        reabertura_solicitada: reopenRequested,
        latest_version: nextLatestVersion,
      })
      .eq("participante_id", participantId)
      .eq("id", textId)
      .select("*")
      .single();
    if (updateResult.error) throw updateResult.error;

    if (currentText.currentVersionId) {
      const versionUpdate = await client
        .from("sextilha_versions")
        .update({
          status: nextStatus,
          compartilhada_com_educador: sharedWithEducator,
        })
        .eq("participante_id", participantId)
        .eq("id", currentText.currentVersionId);
      if (versionUpdate.error) throw versionUpdate.error;
    }

    if (currentText.folhetoId) {
      await touchFolheto(identity, currentText.folhetoId, {
        title: currentText.folhetoTitle || "Folheto sem titulo",
      });
    }

    return {
      ok: true,
      status: "success",
      text: mapTextRow(updateResult.data),
    };
  }

  async function archiveText(identity, payload) {
    return updateTextStatus(identity, {
      ...payload,
      status: payload.status || "arquivada",
    });
  }

  window.InannaSupabaseBridge = {
    isConfigured,
    getMode() {
      return "supabase";
    },
    lookupParticipantByEmail,
    submitQuadra,
    loadPlacar,
    reactPlacar,
    getUserDashboard,
    createFolheto,
    createText,
    getText,
    getTextVersions,
    saveTextVersion,
    updateTextStatus,
    archiveText,
  };
})();
