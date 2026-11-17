import { canTrack, readChoice } from "./consent";
export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const VISITOR_MONTHS = 13;
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"] as const;
const CLICK_KEYS = new Set<string>(["gclid", "gbraid", "wbraid", "fbclid"]);
export type Origin = Record<string, string>;
export type JourneySession = { id: string; last: number; started: number; interacted: boolean };
let memoryId: string = crypto.randomUUID();
let memorySession: JourneySession | undefined;
let capability: Promise<string> | undefined;
let persistence = false;
function cookie(key: string) { try { return decodeURIComponent(document.cookie.split("; ").find(v => v.startsWith(`${key}=`))?.slice(key.length + 1) || ""); } catch { return ""; } }
function writeCookie(key: string, value: string) {
  const expires = new Date(); expires.setMonth(expires.getMonth() + VISITOR_MONTHS);
  document.cookie = `${key}=${encodeURIComponent(value)}; Expires=${expires.toUTCString()}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}
export function safePage(url = location.href): string {
  try { const u = new URL(url, location.origin); return u.origin + u.pathname; } catch { return ""; }
}
export function incomingOrigin(advertising = false): Origin {
  const params = new URLSearchParams(location.search);
  const o: Origin = { referrer: document.referrer ? safePage(document.referrer) : "", landing_page: location.pathname, landing_url: safePage(), at: new Date().toISOString() };
  for (const k of KEYS) { if (CLICK_KEYS.has(k) && !advertising) continue; const v = params.get(k); if (v) o[k] = v.slice(0, 200); }
  return o;
}
export function getJourneyVisitorId(): string {
  if (!persistence || readChoice("analytics") === "denied") return memoryId;
  try {
    const saved = cookie("uhs_vid") || localStorage.getItem("uhs_vid") || localStorage.getItem("uhome_visitor_id");
    if (saved && /^[0-9a-f-]{36}$/i.test(saved)) memoryId = saved;
    writeCookie("uhs_vid", memoryId); localStorage.setItem("uhs_vid", memoryId); localStorage.setItem("uhome_visitor_id", memoryId);
  } catch { /* ephemeral id still works */ }
  return memoryId;
}
export function sessionAt(previous: JourneySession | undefined, now: number): JourneySession {
  return !previous || now - previous.last >= SESSION_IDLE_MS
    ? { id: crypto.randomUUID(), last: now, started: now, interacted: false }
    : previous;
}
export function getJourneySession(): JourneySession {
  let previous = memorySession;
  if (persistence) { try { previous = JSON.parse(localStorage.getItem("uhs_session") || "null") || previous; } catch { /* */ } }
  memorySession = sessionAt(previous, Date.now());
  if (persistence) localStorage.setItem("uhs_session", JSON.stringify(memorySession));
  return memorySession;
}
export function touchJourney(trusted = true): void {
  if (!trusted) return;
  const s = getJourneySession(); s.last = Date.now(); s.interacted = true; memorySession = s;
  if (persistence) localStorage.setItem("uhs_session", JSON.stringify(s));
}
export function origins(): { primeira_origem: Origin; ultima_origem: Origin } {
  let first: Origin = {}, last: Origin = {};
  try { first = JSON.parse(cookie("uhs_first") || "{}"); last = JSON.parse(cookie("uhs_last") || "{}"); } catch { /* */ }
  return { primeira_origem: first, ultima_origem: last };
}
export async function captureJourneyOrigin(): Promise<void> {
  if (!(await canTrack("analytics"))) return;
  persistence = true; getJourneyVisitorId();
  const advertising = await canTrack("advertising");
  const incoming = incomingOrigin(advertising);
  const { primeira_origem } = origins();
  if (!Object.keys(primeira_origem).length) writeCookie("uhs_first", JSON.stringify(incoming));
  const last = origins().ultima_origem;
  if (last.landing_page !== incoming.landing_page || last.utm_campaign !== incoming.utm_campaign || last.utm_source !== incoming.utm_source) writeCookie("uhs_last", JSON.stringify(incoming));
}
export async function journeyEnvelope() {
  const allowed = await canTrack("analytics");
  if (allowed && !persistence) await captureJourneyOrigin();
  const vid = getJourneyVisitorId();
  const savedToken = allowed ? localStorage.getItem("uhs_capability") : null;
  if (!capability) capability = fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-journey`, {
    method: "POST", headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ action: "bootstrap", visitor_id: vid, ...origins(), analytics_allowed: allowed, token: savedToken || undefined }),
  }).then(async r => { if (!r.ok) throw new Error("journey bootstrap"); const d = await r.json(); if (allowed) localStorage.setItem("uhs_capability", d.token); return d.token as string; }).catch(e => { capability = undefined; throw e; });
  const s = getJourneySession();
  return { visitor_id: vid, session_id: s.id, token: await capability, interacted: s.interacted, ...origins(), analytics_allowed: allowed };
}
export function clearJourneyAnalysis() {
  persistence = false; capability = undefined;
  for (const key of ["uhs_vid", "uhs_first", "uhs_last"]) document.cookie = `${key}=; Max-Age=0; Path=/; SameSite=Lax`;
  for (const key of ["uhs_vid", "uhs_capability", "uhome_visitor_id", "uhs_session", "uhome_utm_data", "uhome_gclid", "uhome_visitas", "imoveis_vistos"]) localStorage.removeItem(key);
  memoryId = crypto.randomUUID(); memorySession = undefined;
}
