/**
 * Comportamento da landing /investir-studios: formulário em passos, opções, simulador,
 * calendário, contagem regressiva e barra fixa do celular.
 *
 * A marcação vem pronta de markup.html; este módulo só liga os comportamentos e
 * devolve uma função de limpeza (o React chama ao sair da página).
 */
import { simular, type SimMes, type SimParams } from "./calc";
import type { LpData, LpProduto } from "./data";

export interface SimulacaoResumo {
  studio: string;
  noites: number;
  sobraMenosParcela: number;
  quitadoAnos: number | null;
}

export interface LeadQualificado {
  nome: string;
  /** Só dígitos, com DDD (sem 55). */
  digitos: string;
  /** Formato (51) 99999-9999, igual aos outros formulários do site. */
  telefone: string;
  studioId: string;
  studioNome: string;
  produto: LpProduto | null;
  entrada: string;
  momento: string;
  formato: string;
  dia: string;
  periodo: string;
  score: number;
  prioridade: "Alta" | "Média" | "Baixa";
  origem: string;
  simulacao: SimulacaoResumo | null;
  /** gclid, gbraid, wbraid, fbclid e UTMs desta visita. */
  clique: Record<string, string>;
}

export interface LandingDeps {
  data: LpData;
  /** Registra o lead. Devolve true se entrou no CRM, false se falhou (aí mostramos o WhatsApp). */
  onLead: (lead: LeadQualificado) => Promise<boolean>;
  onWhatsApp: (local: string) => void;
  track: (event: string, params?: Record<string, unknown>) => void;
}

const ENTRADAS: [string, number][] = [
  ["Até R$ 50 mil", 2],
  ["De R$ 50 a 100 mil", 3],
  ["Mais de R$ 100 mil", 3],
  ["Ainda não sei", 1],
];
const MOMENTOS: [string, number][] = [
  ["Agora, aproveitando a condição de fim de ano", 3],
  ["Nos próximos 3 meses", 2],
  ["Daqui a mais de 3 meses", 1],
  ["Só estou pesquisando por enquanto", 0],
];
const MOMENTO_SEM_OFERTA = "O quanto antes";
const PERIODOS: [string, string][] = [
  ["Manhã", "8h às 12h"],
  ["Tarde", "12h às 18h"],
  ["Noite", "18h às 21h"],
];
const SEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TOTAL_PASSOS = 5;
const CLIQUE_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

const brl = (v: number) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const mil = (v: number) => "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil";
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export function mascaraTelefone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d.length ? "(" + d : "";
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

/** WhatsApp brasileiro plausível: DDD válido, 10 ou 11 dígitos, celular com 9, sem repetição. */
export function telefoneValido(digitos: string) {
  if (digitos.length < 10 || digitos.length > 11) return false;
  if (/^(\d)\1+$/.test(digitos)) return false;
  if (digitos[0] === "0" || digitos[1] === "0") return false;
  if (digitos.length === 11 && digitos[2] !== "9") return false;
  return true;
}

export function prioridadeDe(score: number): LeadQualificado["prioridade"] {
  return score >= 6 ? "Alta" : score >= 4 ? "Média" : "Baixa";
}

function proximosDias(n = 8) {
  const hoje = new Date();
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    const dd = String(x.getDate()).padStart(2, "0") + "/" + String(x.getMonth() + 1).padStart(2, "0");
    return { v: SEM[x.getDay()] + " " + dd, t: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : SEM[x.getDay()], s: dd };
  });
}

function lerClique(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const q = new URLSearchParams(window.location.search);
    CLIQUE_KEYS.forEach((k) => {
      const v = q.get(k);
      if (v) out[k] = v.slice(0, 300);
    });
    if (Object.keys(out).length) sessionStorage.setItem("lpi_clique", JSON.stringify(out));
    else {
      const sv = sessionStorage.getItem("lpi_clique");
      if (sv) return JSON.parse(sv);
    }
  } catch {
    /* sessionStorage indisponível: segue sem a origem */
  }
  return out;
}

interface FormState {
  studio?: string;
  entrada?: string;
  momento?: string;
  formato: string;
  dia?: string;
  periodo?: string;
  nome?: string;
  fone?: string;
}

export function initLanding(root: HTMLElement, deps: LandingDeps): () => void {
  const { data: D } = deps;
  const ac = new AbortController();
  const on = <K extends keyof HTMLElementEventMap>(el: Element | Window | null, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el?.addEventListener(ev, fn as EventListener, { signal: ac.signal });
  };
  const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = root) => r.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = root) => Array.from(r.querySelectorAll<T>(s));
  const timers: number[] = [];
  const observers: IntersectionObserver[] = [];
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const P: Record<string, LpProduto> = {};
  D.produtos.forEach((p) => (P[p.id] = p));
  const clique = lerClique();
  const fim = new Date(D.ofertaFim).getTime();
  const ofertaAtiva = () => Date.now() < fim;
  const scrollTo = (el: Element | null, block: ScrollLogicalPosition = "start") =>
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block });
  const waUrl = (text: string) => "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(text);

  root.classList.add("js");
  document.documentElement.classList.add("lpi-html");

  /* ---------- WhatsApp ---------- */
  $$<HTMLAnchorElement>("[data-wa]").forEach((a) => {
    a.href = waUrl(D.waPadrao);
    a.target = "_blank";
    a.rel = "noopener";
    on(a, "click", () => deps.onWhatsApp(a.getAttribute("data-place") || "pagina"));
  });

  /* ---------- âncoras internas: rola sem mexer na URL (preserva o gclid) ---------- */
  on(root, "click", (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hasAttribute("data-wa")) return;
    const id = a.getAttribute("href")!.slice(1);
    const alvo = id ? document.getElementById(id) : null;
    if (!alvo) return;
    e.preventDefault();
    if (alvo instanceof HTMLDetailsElement) alvo.open = true;
    scrollTo(alvo, id === "privacidade" ? "center" : "start");
  });

  /* ---------- prazo da condição ---------- */
  const tick = () => {
    const ms = fim - Date.now();
    if (ms <= 0) {
      root.classList.add("offer-over");
      return false;
    }
    const d = Math.floor(ms / 864e5);
    const h = Math.floor((ms % 864e5) / 36e5);
    const m = Math.floor((ms % 36e5) / 6e4);
    const t = (d ? d + (d > 1 ? " dias " : " dia ") : "") + String(h).padStart(2, "0") + "h " + String(m).padStart(2, "0") + "min";
    $$("[data-cd]").forEach((el) => (el.textContent = t));
    return true;
  };
  if (tick()) timers.push(window.setInterval(tick, 20000));

  /* ---------- simulador (estado usado também no formulário) ---------- */
  const sim = { prod: "connect", noites: 20, tocado: false, ultimo: null as SimulacaoResumo | null };

  /* ---------- formulário em passos ---------- */
  class Form {
    s: FormState = { formato: "Videochamada" };
    step = 0;
    origem: string;
    ok = false;
    enviando = false;
    msg = "";
    constructor(public el: HTMLElement, origem: string) {
      this.origem = origem;
      this.render(false);
      on(el, "click", (e) => this.click(e));
      on(el, "submit", (e) => {
        e.preventDefault();
        void this.submit();
      });
      on(el, "input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.name === "fone") t.value = mascaraTelefone(t.value);
        (this.s as unknown as Record<string, string>)[t.name] = t.value;
        t.removeAttribute("aria-invalid");
        const er = $("#" + t.id + "-e", el);
        if (er) er.textContent = "";
      });
    }
    head() {
      const n = Math.min(this.step + 1, TOTAL_PASSOS);
      return (
        '<div class="card-h"><span class="pr">a partir de <b class="num">R$ ' + Math.floor(Math.min(...D.produtos.map((p) => p.preco)) / 1000) + " mil</b></span>" +
        '<span class="rt" data-offer><svg class="ic"><use href="#i-gift"/></svg>Bônus até 30/11</span></div>' +
        (this.step >= TOTAL_PASSOS
          ? ""
          : '<div class="card-t"><h3>Receba a simulação do seu studio</h3><p>Leva menos de 1 minuto. A conta do studio escolhido chega no seu WhatsApp.</p></div>' +
            '<div class="prog" aria-hidden="true">' +
            Array.from({ length: TOTAL_PASSOS }, (_, i) => '<i class="' + (i < n ? "on" : "") + '"></i>').join("") +
            "</div>")
      );
    }
    top(q: string) {
      return (
        (this.step > 0 ? '<button type="button" class="back" data-back><svg class="ic"><use href="#i-left"/></svg>Voltar</button>' : "") +
        '<div class="st-top"><h4 class="st-q" tabindex="-1">' + q + '</h4><span class="st-n">Passo ' + (this.step + 1) + " de " + TOTAL_PASSOS + "</span></div>"
      );
    }
    opcoes(k: keyof FormState, lista: string[]) {
      const s = this.s;
      return (
        '<div class="choices">' +
        lista.map((e) => '<button type="button" class="choice" data-k="' + k + '" data-v="' + esc(e) + '" aria-pressed="' + (s[k] === e) + '">' + esc(e) + "</button>").join("") +
        "</div>"
      );
    }
    render(focus: boolean) {
      const s = this.s;
      let h = "";
      if (this.step === 0) {
        h =
          this.top("Qual studio te interessa?") +
          '<div class="tiles">' +
          D.produtos
            .map((p) => {
              const pronto = p.status === "Pronto para morar";
              return (
                '<button type="button" class="tile" data-k="studio" data-v="' + p.id + '" aria-pressed="' + (s.studio === p.id) + '">' +
                '<img src="' + p.thumb + '" alt="" width="260" height="170"><span class="tn">' + esc(p.curto) + "</span>" +
                '<span class="tp">a partir de ' + mil(p.preco) + '</span><span class="ts' + (pronto ? "" : " ob") + '">' + esc(p.stCurto) + "</span></button>"
              );
            })
            .join("") +
          '</div><button type="button" class="opt-help" data-k="studio" data-v="ajuda">Ainda não sei, quero ajuda para escolher</button>';
      } else if (this.step === 1) {
        h = this.top("Quanto você pensa em colocar de entrada?") + this.opcoes("entrada", ENTRADAS.map((e) => e[0]));
      } else if (this.step === 2) {
        const lista = MOMENTOS.map((m) => m[0]);
        if (!ofertaAtiva()) lista[0] = MOMENTO_SEM_OFERTA;
        h = this.top("Quando você pensa em investir?") + this.opcoes("momento", lista);
      } else if (this.step === 3) {
        h =
          this.top("Quando fica bom conversar?") +
          '<div class="seg" role="group" aria-label="Formato"><button type="button" data-k="formato" data-v="Videochamada" aria-pressed="' + (s.formato === "Videochamada") + '"><svg class="ic"><use href="#i-video"/></svg>Videochamada</button>' +
          '<button type="button" data-k="formato" data-v="Visita aos studios" aria-pressed="' + (s.formato === "Visita aos studios") + '"><svg class="ic"><use href="#i-key"/></svg>Visita aos studios</button></div>' +
          '<span class="lbl">Melhor dia</span><div class="days">' +
          proximosDias()
            .map((d) => '<button type="button" class="chip" data-k="dia" data-v="' + d.v + '" aria-pressed="' + (s.dia === d.v) + '">' + d.t + "<small>" + d.s + "</small></button>")
            .join("") +
          '</div><span class="lbl">Melhor período</span><div class="pers">' +
          PERIODOS.map((p) => '<button type="button" class="chip" data-k="periodo" data-v="' + p[0] + '" aria-pressed="' + (s.periodo === p[0]) + '">' + p[0] + "<small>" + p[1] + "</small></button>").join("") +
          '</div><button type="button" class="btn btn-p full" data-next' + (s.dia && s.periodo ? "" : " disabled") + ">Continuar</button>";
      } else if (this.step === 4) {
        const id = "f" + Math.random().toString(36).slice(2, 7);
        h =
          this.top("Para onde mandamos a sua simulação?") +
          "<form novalidate>" +
          '<div class="fld"><label class="lbl" for="' + id + 'n">Seu nome</label><input id="' + id + 'n" name="nome" autocomplete="name" maxlength="80" value="' + esc(s.nome) + '" aria-describedby="' + id + 'n-e"><span class="err" id="' + id + 'n-e" role="alert"></span></div>' +
          '<div class="fld"><label class="lbl" for="' + id + 'w">WhatsApp com DDD</label><input id="' + id + 'w" name="fone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(51) 99999-9999" value="' + esc(s.fone) + '" aria-describedby="' + id + 'w-e"><span class="err" id="' + id + 'w-e" role="alert"></span></div>' +
          '<button type="submit" class="btn btn-p full"' + (this.enviando ? " disabled" : "") + ">" + (this.enviando ? "Enviando…" : 'Receber minha simulação<svg class="ic"><use href="#i-arrow"/></svg>') + "</button>" +
          '<p class="consent">Ao enviar, você aceita receber o contato da Uhome pelo WhatsApp sobre estes studios. <a href="#privacidade">Como usamos seus dados</a>.</p></form>';
      } else {
        const nome = esc((s.nome || "").trim().split(" ")[0]);
        h =
          '<div class="done"><div class="ok"><svg class="ic"><use href="#i-check"/></svg></div>' +
          "<h3>" + (this.ok ? "Pronto" + (nome ? ", " + nome : "") + "!" : "Falta só um toque" + (nome ? ", " + nome : "")) + "</h3>" +
          (this.ok
            ? "<p>Recebemos suas respostas. Um consultor da Uhome vai te chamar no WhatsApp com a simulação do seu studio.</p>"
            : "<p>Não conseguimos registrar agora. Toque abaixo para mandar suas respostas pelo WhatsApp e um consultor responde com a simulação.</p>") +
          '<div class="sumry"><b>Studio:</b> ' + esc(this.studioNome()) + "<br><b>Entrada:</b> " + esc(s.entrada) + "<br><b>Quando investir:</b> " + esc(s.momento) +
          "<br><b>" + esc(s.formato) + ":</b> " + esc(s.dia) + ", " + esc((s.periodo || "").toLowerCase()) + "</div>" +
          '<a class="btn ' + (this.ok ? "btn-o" : "btn-p") + ' full" href="' + waUrl(this.msg) + '" target="_blank" rel="noopener" data-wa-done><svg class="ic"><use href="#i-chat"/></svg>' +
          (this.ok ? "Falar agora no WhatsApp" : "Enviar pelo WhatsApp") + "</a></div>";
      }
      this.el.innerHTML =
        this.head() +
        '<div class="stepw">' + h + "</div>" +
        (this.step < TOTAL_PASSOS ? '<div class="card-f"><svg class="ic"><use href="#i-shield"/></svg>Sem compromisso. Seus dados ficam só com a Uhome.</div>' : "");
      if (focus) {
        const f = $(".st-q, .done h3", this.el);
        if (f) {
          f.setAttribute("tabindex", "-1");
          f.focus({ preventScroll: true });
        }
      }
    }
    studioNome() {
      return this.s.studio === "ajuda" ? "Quero ajuda para escolher" : this.s.studio ? P[this.s.studio].nome : "";
    }
    go(n: number) {
      this.step = n;
      this.render(true);
    }
    click(e: Event) {
      const b = (e.target as Element).closest<HTMLElement>("button, a");
      if (!b) return;
      if (b.hasAttribute("data-back")) return this.go(this.step - 1);
      if (b.hasAttribute("data-next")) return this.go(4);
      if (b.hasAttribute("data-wa-done")) return deps.onWhatsApp(this.ok ? "formulario_concluido" : "formulario_falha");
      const k = b.getAttribute("data-k") as keyof FormState | null;
      if (!k) return;
      (this.s as unknown as Record<string, string>)[k] = b.getAttribute("data-v") || "";
      if (k === "studio") {
        deps.track("lpi_passo", { passo: 1, studio: this.s.studio, origem: this.origem });
        this.go(1);
      } else if (k === "entrada") {
        deps.track("lpi_passo", { passo: 2, entrada: this.s.entrada });
        this.go(2);
      } else if (k === "momento") {
        deps.track("lpi_passo", { passo: 3, momento: this.s.momento });
        this.go(3);
      } else {
        this.render(false);
        const q = $<HTMLElement>('[data-k="' + k + '"][data-v="' + this.s[k] + '"]', this.el);
        q?.focus();
        if (this.s.dia && this.s.periodo && k === "periodo") {
          deps.track("lpi_passo", { passo: 4, formato: this.s.formato });
          this.go(4);
        }
      }
    }
    preset(id: string, origem: string) {
      this.s.studio = id;
      this.origem = origem;
      this.step = 1;
      this.render(true);
    }
    score() {
      const s = this.s;
      const e = ENTRADAS.find((x) => x[0] === s.entrada)?.[1] ?? 0;
      const m = s.momento === MOMENTO_SEM_OFERTA ? 3 : MOMENTOS.find((x) => x[0] === s.momento)?.[1] ?? 0;
      return e + m + (s.formato === "Visita aos studios" ? 1 : 0);
    }
    async submit() {
      if (this.enviando) return;
      const s = this.s;
      const nomeEl = $<HTMLInputElement>("input[name=nome]", this.el)!;
      const foneEl = $<HTMLInputElement>("input[name=fone]", this.el)!;
      const dig = (s.fone || "").replace(/\D/g, "");
      let ok = true;
      if (!s.nome || s.nome.trim().length < 2 || !/[A-Za-zÀ-ÿ]/.test(s.nome)) {
        ok = false;
        nomeEl.setAttribute("aria-invalid", "true");
        $("#" + nomeEl.id + "-e", this.el)!.textContent = "Digite seu nome.";
      }
      if (!telefoneValido(dig)) {
        ok = false;
        foneEl.setAttribute("aria-invalid", "true");
        $("#" + foneEl.id + "-e", this.el)!.textContent = "Digite o WhatsApp com DDD, por exemplo (51) 99999-9999.";
      }
      if (!ok) {
        (nomeEl.getAttribute("aria-invalid") ? nomeEl : foneEl).focus();
        return;
      }
      const score = this.score();
      const lead: LeadQualificado = {
        nome: s.nome!.trim().replace(/\s+/g, " "),
        digitos: dig,
        telefone: mascaraTelefone(dig),
        studioId: s.studio || "ajuda",
        studioNome: this.studioNome(),
        produto: s.studio && s.studio !== "ajuda" ? P[s.studio] : null,
        entrada: s.entrada || "",
        momento: s.momento || "",
        formato: s.formato,
        dia: s.dia || "",
        periodo: s.periodo || "",
        score,
        prioridade: prioridadeDe(score),
        origem: this.origem,
        simulacao: sim.tocado ? sim.ultimo : null,
        clique,
      };
      this.msg =
        "Olá! Sou " + lead.nome + ". Vi a página de studios Cyrela da Uhome e quero a simulação" +
        (lead.studioId === "ajuda" ? " para escolher o melhor studio." : " do " + lead.studioNome + ".") +
        " Entrada: " + lead.entrada.toLowerCase() + ". Quando investir: " + lead.momento.toLowerCase() + "." +
        " Prefiro " + lead.formato.toLowerCase() + " no dia " + lead.dia + ", " + lead.periodo.toLowerCase() + ".";
      this.enviando = true;
      this.render(false);
      let registrado = false;
      try {
        registrado = await deps.onLead(lead);
      } catch {
        registrado = false;
      }
      this.enviando = false;
      this.ok = registrado;
      deps.track(registrado ? "lpi_lead" : "lpi_lead_falha", {
        studio: lead.studioId,
        entrada: lead.entrada,
        momento: lead.momento,
        formato: lead.formato,
        prioridade: lead.prioridade,
        lead_score: score,
        origem: lead.origem,
      });
      this.go(TOTAL_PASSOS);
    }
  }

  const forms: Record<string, Form> = {};
  $$("[data-form]").forEach((el) => {
    const nome = el.getAttribute("data-form")!;
    forms[nome] = new Form(el, "formulario_" + nome);
  });
  const pickStudio = (id: string, origem: string) => {
    forms.topo?.preset(id, origem);
    scrollTo($("#form-topo"));
  };

  /* ---------- cartões das opções ---------- */
  const ops = $("#ops");
  if (ops) {
    ops.innerHTML = D.produtos
      .map((p) => {
        const pronto = p.status === "Pronto para morar";
        const f = p.obra
          ? '<div><span>Entrada</span><b class="num">' + mil(p.obra.entrada) + '</b></div><div><span>Parcela na entrega</span><b class="num">' + brl(p.parcela) + "</b></div>"
          : '<div><span>Entrada (10%)</span><b class="num">' + mil(p.entrada) + '</b></div><div><span>Parcela Caixa</span><b class="num">' + brl(p.parcela) + "</b></div>";
        const tag = p.bonus
          ? '<p class="op-tag g" data-offer>ITBI, registro e 12 meses de condomínio grátis até 30/11</p>'
          : '<p class="op-tag">' + esc(p.entrega) + "</p>";
        return (
          '<article class="op"><div class="op-ph"><img src="' + p.img + '" alt="' + esc(p.nome) + '" loading="lazy" decoding="async">' +
          '<span class="st' + (pronto ? "" : " ob") + '">' + esc(p.status) + '</span><span class="thumb"><img src="' + p.img2 + '" alt="" loading="lazy" decoding="async"></span></div>' +
          '<div class="op-b"><h3>' + esc(p.nome) + '</h3><p class="op-loc">' + esc(p.local) + " · studio de " + esc(p.m2) + "</p>" +
          '<p class="op-pr">a partir de<b class="num">' + brl(p.preco) + '</b></p><div class="op-f">' + f + "</div>" + tag +
          "<ul>" + p.porque.map((w) => '<li><svg class="ic"><use href="#i-check"/></svg><span>' + esc(w) + "</span></li>").join("") + "</ul>" +
          '<div class="op-a"><button type="button" class="btn btn-p" data-pick="' + p.id + '">Quero este studio</button>' +
          '<button type="button" class="btn btn-o" data-sim="' + p.id + '">Simular este</button></div></div></article>'
        );
      })
      .join("");
    on(ops, "click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.dataset.pick) {
        deps.track("lpi_opcao", { studio: b.dataset.pick, acao: "quero" });
        pickStudio(b.dataset.pick, "opcao_" + b.dataset.pick);
      }
      if (b.dataset.sim) {
        deps.track("lpi_opcao", { studio: b.dataset.sim, acao: "simular" });
        sim.prod = b.dataset.sim;
        sim.tocado = true;
        runSim();
        scrollTo($("#simule"));
      }
    });
  }

  /* ---------- calendário de demanda ---------- */
  const cal = $("#cal");
  if (cal) {
    cal.innerHTML = D.saz
      .map((m) => {
        const cls = m.idx >= 1.06 ? "hi" : m.idx < 0.95 ? "lo" : "";
        return '<div class="mo ' + cls + '"><span class="ev">' + esc(m.ev) + '</span><span class="bar" style="height:' + Math.round(40 + (m.idx - 0.7) * 260) + 'px"></span><span class="m">' + m.mes + "</span></div>";
      })
      .join("");
  }

  /* ---------- simulador ---------- */
  const simPs = $("#sim-ps");
  const rng = $<HTMLInputElement>("#noites");
  const media = (a: SimMes[], k: keyof SimMes) => a.reduce((t, m) => t + m[k], 0) / (a.length || 1);
  const setText = (sel: string, txt: string) => {
    const el = $(sel);
    if (el) el.textContent = txt;
  };

  function runSim() {
    const p = P[sim.prod];
    if (!p || !rng) return;
    $$("#sim-ps button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === sim.prod)));
    rng.style.setProperty("--p", ((sim.noites - 12) / 16) * 100 + "%");
    setText("#o-noites", sim.noites + " noites");
    const par: SimParams = {
      ...D.base,
      preco: p.preco,
      faturamentoMes: sim.noites * D.diaria,
      irAluguel: 0,
      horizonteAnos: 30,
      condoGratisMeses: p.bonus ? D.base.condoGratisMeses : 0,
      entradaPct: p.fluxo ? 1 - p.fluxo.financiado : D.base.entradaPct,
    };
    const r = simular(par);
    const s = r.serie;
    const op = s.slice(par.mesesImplantacao, par.mesesImplantacao + 12);
    const fat = media(op, "fat"), cust = media(op, "custos"), fixo = media(op, "fixo"), mob = media(op, "mob"), sobra = media(op, "caixa");
    const emObra = p.status !== "Pronto para morar";
    setText("#s-ini-l", p.fluxo ? "Até as chaves" : "Para começar");
    setText("#s-ini", brl(r.capitalInicial));
    setText("#s-ini-d", p.fluxo ? "30% durante a obra + entrada da mobília" : "entrada de 10% + entrada da mobília");
    setText("#s-parc-l", emObra ? "Parcela Caixa na entrega" : "Parcela da Caixa");
    setText("#s-parc", brl(r.parcelaComSeguro));
    setText("#s-fat", brl(fat));
    setText("#s-cust", "– " + brl(cust));
    setText("#s-fixo", "– " + brl(fixo));
    setText("#s-mob", "– " + brl(mob));
    setText("#s-sobra", brl(sobra));
    const dif = sobra - r.parcelaComSeguro;
    const semMob = sobra + mob - r.parcelaComSeguro;
    const v = $("#s-verd");
    if (v) {
      if (dif >= 0) {
        v.className = "verd";
        v.innerHTML = "A renda paga a parcela e ainda <b>sobram cerca de " + brl(dif) + " por mês</b> para quitar mais rápido.";
      } else if (semMob >= 0) {
        v.className = "verd";
        v.innerHTML = "Enquanto paga a mobília, você completa cerca de <b>" + brl(-dif) + " por mês</b>. Depois, a renda paga a parcela sozinha.";
      } else {
        v.className = "verd n";
        v.innerHTML = "Com essa ocupação, você completa cerca de <b>" + brl(-dif) + " por mês</b>. Mais noites ocupadas fecham a conta.";
      }
    }
    const qm = r.quitadoEm;
    setText("#s-quita", qm ? (qm / 12).toFixed(1).replace(".", ",") + " anos" : "mais de 30 anos");
    const qbar = $("#s-qbar");
    if (qbar) qbar.style.width = (qm ? Math.min(qm / 360, 1) * 100 : 100) + "%";
    const pos = qm ? s.slice(qm, qm + 12) : [];
    const renda = pos.length ? media(pos, "rendaLivre") : 0;
    setText("#s-renda", renda ? "~" + brl(renda) + "/mês" : "–");
    setText("#s-renda-d", renda && qm ? "de renda livre, com um imóvel quitado de " + mil(s[qm - 1].valorImovel) : "aumente as noites para ver");
    const ob = $("#s-obra");
    if (ob) {
      if (p.obra) {
        ob.hidden = false;
        ob.textContent =
          "Durante a obra: entrada de " + mil(p.obra.entrada) + ", 24 mensais de cerca de " + brl(p.obra.mensal) + " e 2 reforços anuais de " + mil(p.obra.reforco) +
          ", corrigidos pelo INCC. A conta começa na entrega, em dezembro de 2028.";
      } else if (emObra) {
        ob.hidden = false;
        ob.textContent = "Entrega prevista para abril de 2027. A conta começa na entrega das chaves.";
      } else ob.hidden = true;
    }
    sim.ultimo = { studio: p.nome, noites: sim.noites, sobraMenosParcela: Math.round(dif), quitadoAnos: qm ? Math.round((qm / 12) * 10) / 10 : null };
  }

  if (simPs && rng) {
    simPs.innerHTML = D.produtos
      .map((p) => '<button type="button" data-p="' + p.id + '" aria-pressed="false">' + esc(p.curto.split(" ")[0]) + "<small>" + esc(p.stCurto) + "</small></button>")
      .join("");
    on(simPs, "click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button");
      if (b?.dataset.p) {
        sim.prod = b.dataset.p;
        sim.tocado = true;
        runSim();
      }
    });
    on(rng, "input", () => {
      sim.noites = Number(rng.value);
      sim.tocado = true;
      runSim();
    });
    runSim();
  }
  on($("#sim-go"), "click", () => {
    sim.tocado = true;
    deps.track("lpi_simulador_cta", { studio: sim.prod, noites: sim.noites });
    pickStudio(sim.prod, "simulador");
  });

  /* ---------- extrato que entra na tela ---------- */
  const st = $("#stmt");
  const countUp = () => {
    if (reduce || !st) return;
    $$("[data-count]", st).forEach((el) => {
      const to = Number(el.getAttribute("data-count"));
      const neg = to < 0, abs = Math.abs(to), t0 = performance.now();
      const f = (t: number) => {
        const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (neg ? "– " : "") + brl(abs * e);
        if (k < 1 && !ac.signal.aborted) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
  };
  if (st) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (es) => es.forEach((en) => {
          if (en.isIntersecting) {
            st.classList.add("on");
            countUp();
            io.disconnect();
          }
        }),
        { threshold: 0.4 },
      );
      io.observe(st);
      observers.push(io);
    } else st.classList.add("on");
  }

  /* ---------- barra fixa do celular ---------- */
  const bar = $("#mbar");
  if (bar && "IntersectionObserver" in window) {
    const vis = new Set<Element>();
    const io2 = new IntersectionObserver(
      (es) => {
        es.forEach((en) => (en.isIntersecting ? vis.add(en.target) : vis.delete(en.target)));
        bar.classList.toggle("hide", vis.size > 0);
      },
      { threshold: 0.15 },
    );
    $$("[data-form]").forEach((el) => io2.observe(el));
    observers.push(io2);
  }
  on($("#mbar-go"), "click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deps.track("lpi_barra_cta");
    scrollTo($("#form-topo"));
  });

  return () => {
    ac.abort();
    timers.forEach((t) => clearInterval(t));
    observers.forEach((o) => o.disconnect());
    root.classList.remove("js", "offer-over");
    document.documentElement.classList.remove("lpi-html");
  };
}
