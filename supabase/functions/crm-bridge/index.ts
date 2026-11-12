// CRM Bridge - endpoint compartilhado entre Site Uhome e CRM uhomesales
// Auth: header x-crm-token validado contra secret CRM_BRIDGE_TOKEN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { montarLinksNatal, validarCorretor } from "../_shared/natalLinks.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-crm-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Auth via token compartilhado
  const expected = Deno.env.get("CRM_BRIDGE_TOKEN");
  if (!expected) return json({ error: "Bridge not configured" }, 500);
  const provided = req.headers.get("x-crm-token");
  if (!provided || provided !== expected) return json({ error: "Unauthorized" }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { action, payload = {} } = body ?? {};
  if (!action) return json({ error: "Missing action" }, 400);

  // Cliente com service role (server-side, sem RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    switch (action) {
      // ─── VITRINES ──────────────────────────────────────────────
      case "create_vitrine": {
        const {
          corretor_id,
          corretor_slug,
          imovel_codigos,
          mensagem,
          mensagem_corretor,
          tipo = "property_selection",
          titulo,
          subtitulo,
          dados_custom,
          pipeline_lead_id,
          lead_id,
          lead_nome,
          lead_telefone,
          expires_at,
          created_by,
        } = payload;

        if (!Array.isArray(imovel_codigos) || imovel_codigos.length === 0) {
          return json({ error: "imovel_codigos required" }, 400);
        }

        // Resolve imóveis pelos códigos para criar snapshot
        const { data: imoveisAtuais } = await supabase
          .rpc("get_imoveis_by_codigos", { codigos: imovel_codigos });

        const snapshot = (imoveisAtuais ?? []).map((im: any) => ({
          id: im.id,
          jetimob_id: im.jetimob_id,
          slug: im.slug,
          titulo: im.titulo,
          tipo: im.tipo,
          preco: im.preco,
          preco_condominio: im.preco_condominio,
          area_total: im.area_total,
          area_util: im.area_util,
          quartos: im.quartos,
          banheiros: im.banheiros,
          vagas: im.vagas,
          bairro: im.bairro,
          cidade: im.cidade,
          foto_principal: im.foto_principal,
          status: im.status,
        }));

        const insertRow: Record<string, unknown> = {
          corretor_id: corretor_id ?? null,
          corretor_slug: corretor_slug ?? null,
          imovel_codigos,
          mensagem: mensagem ?? null,
          mensagem_corretor: mensagem_corretor ?? null,
          tipo,
          titulo: titulo ?? null,
          subtitulo: subtitulo ?? null,
          dados_custom: dados_custom ?? null,
          pipeline_lead_id: pipeline_lead_id ?? null,
          lead_id: lead_id ?? null,
          lead_nome: lead_nome ?? null,
          lead_telefone: lead_telefone ?? null,
          expires_at: expires_at ?? null,
          // created_by é NOT NULL pela RLS pública; cai no corretor_id se vier
          created_by: created_by ?? corretor_id ?? null,
          imoveis_resolvidos: snapshot,
        };

        const { data, error } = await supabase
          .from("vitrines")
          .insert(insertRow)
          .select()
          .single();
        if (error) throw error;
        return json({ ok: true, vitrine: data });
      }

      case "get_vitrine": {
        const { id } = payload;
        if (!id) return json({ error: "id required" }, 400);
        const { data, error } = await supabase
          .from("vitrines")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!data) return json({ error: "not found" }, 404);
        return json({ ok: true, vitrine: data });
      }

      case "list_vitrines": {
        const { corretor_id, corretor_slug, limit = 50, offset = 0 } = payload;
        let q = supabase
          .from("vitrines")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (corretor_id) q = q.eq("corretor_id", corretor_id);
        else if (corretor_slug) q = q.eq("corretor_slug", corretor_slug);
        const { data, count, error } = await q;
        if (error) throw error;
        return json({ ok: true, vitrines: data, total: count });
      }

      case "increment_vitrine_counter": {
        // tipo: 'view' | 'whatsapp'
        const { id, tipo } = payload;
        if (!id || !tipo) return json({ error: "id and tipo required" }, 400);
        const col = tipo === "whatsapp" ? "cliques_whatsapp" : "visualizacoes";
        const { data: current, error: e1 } = await supabase
          .from("vitrines")
          .select(`id, ${col}`)
          .eq("id", id)
          .maybeSingle();
        if (e1) throw e1;
        if (!current) return json({ error: "not found" }, 404);
        const next = ((current as any)[col] ?? 0) + 1;
        const { error: e2 } = await supabase
          .from("vitrines")
          .update({ [col]: next })
          .eq("id", id);
        if (e2) throw e2;
        return json({ ok: true, [col]: next });
      }

      // ─── INTERACOES ────────────────────────────────────────────
      case "track_event": {
        // mapeia event_type → tipo (schema atual usa "tipo")
        const {
          vitrine_id,
          event_type,
          tipo,
          imovel_id,
          imovel_codigo,
          metadata,
          lead_nome,
          lead_telefone,
        } = payload;
        if (!vitrine_id) return json({ error: "vitrine_id required" }, 400);
        const tipoFinal = tipo ?? event_type;
        if (!tipoFinal) return json({ error: "tipo/event_type required" }, 400);

        const validTipos = ["view", "favorite", "whatsapp_click", "schedule_click", "compare_open"];
        if (!validTipos.includes(tipoFinal)) {
          return json({ error: `tipo invalido. validos: ${validTipos.join(", ")}` }, 400);
        }

        const { data, error } = await supabase
          .from("vitrine_interacoes")
          .insert({
            vitrine_id,
            tipo: tipoFinal,
            imovel_id: imovel_id ?? imovel_codigo ?? null,
            metadata: metadata ?? {},
            lead_nome: lead_nome ?? null,
            lead_telefone: lead_telefone ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return json({ ok: true, interacao: data });
      }

      case "get_analytics": {
        const { vitrine_id } = payload;
        if (!vitrine_id) return json({ error: "vitrine_id required" }, 400);

        const { data: vitrine, error: ev } = await supabase
          .from("vitrines")
          .select("id, visualizacoes, cliques_whatsapp, created_at")
          .eq("id", vitrine_id)
          .maybeSingle();
        if (ev) throw ev;
        if (!vitrine) return json({ error: "vitrine not found" }, 404);

        const { data: interacoes, error: ei } = await supabase
          .from("vitrine_interacoes")
          .select("tipo, imovel_id, metadata, created_at")
          .eq("vitrine_id", vitrine_id)
          .order("created_at", { ascending: false });
        if (ei) throw ei;

        const counts: Record<string, number> = {};
        for (const i of interacoes ?? []) counts[i.tipo] = (counts[i.tipo] ?? 0) + 1;

        return json({
          ok: true,
          vitrine,
          totals: {
            visualizacoes: vitrine.visualizacoes,
            cliques_whatsapp: vitrine.cliques_whatsapp,
            por_tipo: counts,
            total_interacoes: interacoes?.length ?? 0,
          },
          interacoes,
        });
      }

      // ─── IMOVEIS (read-only) ───────────────────────────────────
      case "resolve_imoveis": {
        // Aceita códigos (jetimob_id) OU slugs OU ids uuid
        const { codigos } = payload;
        if (!Array.isArray(codigos) || codigos.length === 0) {
          return json({ error: "codigos[] required" }, 400);
        }

        // Tenta resolver por jetimob_id, slug e id (uuid)
        const isUuid = (s: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
        const uuids = codigos.filter(isUuid);
        const others = codigos.filter((c: string) => !isUuid(c));

        const { data, error } = await supabase
          .from("imoveis")
          .select(
            "id, slug, jetimob_id, titulo, tipo, finalidade, preco, preco_condominio, preco_iptu, area_total, area_util, quartos, banheiros, vagas, bairro, cidade, uf, endereco_completo, foto_principal, fotos, status, fase, latitude, longitude, condominio_nome"
          )
          .or(
            [
              uuids.length ? `id.in.(${uuids.join(",")})` : null,
              others.length ? `jetimob_id.in.(${others.map((c) => `"${c}"`).join(",")})` : null,
              others.length ? `slug.in.(${others.map((c) => `"${c}"`).join(",")})` : null,
            ]
              .filter(Boolean)
              .join(",")
          );
        if (error) throw error;
        return json({ ok: true, imoveis: data });
      }

      case "resolve_imoveis_by_codigos": {
        // Versão simples via RPC - busca apenas por jetimob_id
        const { codigos } = payload;
        if (!Array.isArray(codigos) || codigos.length === 0) {
          return json({ error: "codigos[] required" }, 400);
        }
        const { data, error } = await supabase.rpc("get_imoveis_by_codigos", { codigos });
        if (error) throw error;
        return json({ ok: true, imoveis: data });
      }

      // ─── CORRETORES ────────────────────────────────────────────
      case "upsert_corretor": {
        const { crm_user_id, email, nome, telefone, foto_url } = payload;
        if (!crm_user_id || !email) {
          return json({ error: "crm_user_id and email required" }, 400);
        }
        const { data, error } = await supabase.rpc("upsert_corretor_from_crm", {
          _crm_user_id: crm_user_id,
          _email: email,
          _nome: nome ?? null,
          _telefone: telefone ?? null,
          _foto_url: foto_url ?? null,
        });
        if (error) throw error;
        return json({ ok: true, profile_id: data });
      }

      // ─── NATAL: links personalizados ───────────────────────────
      // ─── LIA: conversas do site ───────────────────────────────
      case "list_lia_conversas": {
        const limit = Math.min(Math.max(Number(payload.limit) || 50, 1), 200);
        const offset = Math.max(Number(payload.offset) || 0, 0);
        let q = supabase
          .from("lia_conversas")
          .select("id,session_id,etapa,lead_id,agendamento_id,contexto,mensagens,created_at,updated_at", { count: "exact" })
          .order("updated_at", { ascending: false })
          .range(offset, offset + limit - 1);
        if (payload.desde) q = q.gte("updated_at", String(payload.desde));
        if (payload.ate) q = q.lte("updated_at", String(payload.ate));
        if (payload.etapa) q = q.eq("etapa", String(payload.etapa));
        if (payload.so_com_telefone) q = q.not("lead_id", "is", null);
        const { data, error, count } = await q;
        if (error) throw error;
        const ids = (data ?? []).map((c: any) => c.lead_id).filter(Boolean);
        const { data: leads } = ids.length
          ? await supabase.from("public_leads").select("id,nome,telefone,uhomesales_lead_id").in("id", ids)
          : { data: [] as any[] };
        const byId = new Map((leads ?? []).map((l: any) => [l.id, l]));
        const itens = (data ?? []).map((c: any) => {
          const l: any = c.lead_id ? byId.get(c.lead_id) : null;
          const ctx = c.contexto ?? {};
          const msgs = Array.isArray(c.mensagens) ? c.mensagens : [];
          const ultima = msgs[msgs.length - 1];
          return {
            id: c.id,
            etapa: c.etapa,
            situacao: c.agendamento_id ? "visita_marcada" : c.lead_id ? "contato_capturado" : "conversando",
            nome: l?.nome ?? null,
            telefone: l?.telefone ?? null,
            crm_lead_id: l?.uhomesales_lead_id ?? null,
            pagina: ctx.pagina ?? null,
            imovel: ctx.imovel?.titulo ?? ctx.produto ?? null,
            utm_campaign: ctx.utm_campaign ?? null,
            utm_term: ctx.utm_term ?? null,
            total_mensagens: msgs.length,
            ultima_mensagem: ultima ? String(ultima.content ?? "").slice(0, 160) : null,
            created_at: c.created_at,
            updated_at: c.updated_at,
          };
        });
        return json({ ok: true, total: count ?? 0, itens });
      }

      case "get_lia_conversa": {
        if (!payload.id) return json({ error: "id required" }, 400);
        const { data: c, error } = await supabase.from("lia_conversas").select("*").eq("id", String(payload.id)).maybeSingle();
        if (error) throw error;
        if (!c) return json({ error: "not found" }, 404);
        const { data: lead } = c.lead_id
          ? await supabase.from("public_leads").select("id,nome,telefone,email,uhomesales_lead_id,imovel_titulo,utm_campaign,utm_term").eq("id", c.lead_id).maybeSingle()
          : { data: null };
        const { data: agendamento } = c.agendamento_id
          ? await supabase.from("agendamentos").select("id,data_visita,turno,horario,imovel_titulo").eq("id", c.agendamento_id).maybeSingle()
          : { data: null };
        return json({ ok: true, conversa: c, lead, agendamento });
      }

      case "list_natal_links": {
        const { corretor_slug, email } = payload;
        if (!corretor_slug && !email) return json({ error: "corretor_slug or email required" }, 400);
        let q = supabase.from("profiles").select("slug_ref, ativo, nome, foto_url, telefone").limit(1);
        q = corretor_slug ? q.eq("slug_ref", String(corretor_slug)) : q.ilike("email", String(email));
        const { data: prof } = await q.maybeSingle();
        const erro = validarCorretor(prof as any);
        if (erro) return json({ ok: false, error: erro }, 404);

        const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
        const { data: camps } = await supabase
          .from("campanhas")
          .select("id, slug, nome, titulo, inicio, fim")
          .eq("ativo", true)
          .or(`inicio.is.null,inicio.lte.${hoje}`)
          .or(`fim.is.null,fim.gte.${hoje}`)
          .order("destaque_home", { ascending: false })
          .order("ordem");
        const camp = (camps ?? []).find((c: any) => /natal/i.test(c.slug)) ?? camps?.[0];
        if (!camp) return json({ ok: false, error: "Nenhuma campanha vigente" }, 404);

        const { data: cp } = await supabase
          .from("campanha_produtos")
          .select("ordem, produtos_foco(slug, nome, bairro, cidade, capa_url, preco_texto, preco_a_partir, entrega, ativo)")
          .eq("campanha_id", camp.id)
          .order("ordem");
        const produtos = (cp ?? [])
          .map((r: any) => r.produtos_foco)
          .filter((p: any) => p && p.ativo)
          .map(({ ativo: _a, ...p }: any) => p);

        const links = montarLinksNatal(prof!.slug_ref!, camp.slug, produtos);
        return json({
          ok: true,
          corretor: { nome: prof!.nome, slug: prof!.slug_ref, foto_url: prof!.foto_url, tem_foto: !!prof!.foto_url },
          campanha: { slug: camp.slug, nome: camp.nome, fim: camp.fim },
          ...links,
        });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: any) {
    console.error("[crm-bridge]", action, err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});
