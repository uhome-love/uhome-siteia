import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchPropertyCard } from "@/components/SearchPropertyCard";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritos } from "@/hooks/useFavoritos";
import { supabase } from "@/integrations/supabase/client";
import { type Imovel } from "@/services/imoveis";
import { CalendarDays, FolderPlus, Heart, Loader2, Pencil, Share2, Trash2 } from "lucide-react";
import { useProdutosFoco } from "@/lib/produtosFoco";
import { ProdutoFocoCard } from "@/components/foco/FocoShared";
import { PriceNotice } from '@/components/search/PriceNotice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgendamentoVisita } from "@/components/AgendamentoVisita";
import { toast } from "sonner";
import { type EstadoPastas, lerPastas, salvarPastas, criarPasta, renomearPasta, apagarPasta, alternarNaPasta, definirNota, juntarPastas, linkPasta } from "@/lib/favoritosPastas";

function parseFotos(fotos: any) {
  if (!fotos) return [];
  if (typeof fotos === "string") { try { return JSON.parse(fotos); } catch { return []; } }
  return Array.isArray(fotos) ? fotos : [];
}
const NOTAS_ID = "_notas";

function usePastas(userId?: string) {
  const [estado, setEstado] = useState<EstadoPastas>(lerPastas);
  useEffect(() => { const on = () => setEstado(lerPastas()); window.addEventListener('uhome:pastas', on); return () => window.removeEventListener('uhome:pastas', on); }, []);
  useEffect(() => {
    if (!userId) return;
    supabase.from("favorito_pastas").select("local_id,nome,ordem,itens").eq("user_id", userId).then(({ data }) => {
      const rows = data ?? [];
      const notas = (rows.find(r => r.local_id === NOTAS_ID)?.itens ?? {}) as Record<string, string>;
      const conta: EstadoPastas = { notas, pastas: rows.filter(r => r.local_id !== NOTAS_ID).map(r => ({ id: r.local_id, nome: r.nome, ordem: r.ordem, itens: (r.itens as string[]) ?? [] })) };
      const junto = juntarPastas(lerPastas(), conta); salvarPastas(junto); void enviar(userId, junto, rows.map(r => r.local_id));
    });
  }, [userId]);
  const atualizar = (e: EstadoPastas) => { const antes = estado.pastas.map(p => p.id); salvarPastas(e); setEstado(e); if (userId) void enviar(userId, e, antes); };
  return { estado, atualizar };
}
async function enviar(userId: string, e: EstadoPastas, idsAntes: string[]) {
  const linhas = [...e.pastas.map(p => ({ user_id: userId, local_id: p.id, nome: p.nome, ordem: p.ordem, itens: p.itens })), { user_id: userId, local_id: NOTAS_ID, nome: NOTAS_ID, ordem: -1, itens: e.notas as any }];
  await supabase.from("favorito_pastas").upsert(linhas, { onConflict: "user_id,local_id" });
  const sairam = idsAntes.filter(id => id !== NOTAS_ID && !e.pastas.some(p => p.id === id));
  if (sairam.length) await supabase.from("favorito_pastas").delete().eq("user_id", userId).in("local_id", sairam);
}

async function carregarImoveis(ids: string[]): Promise<Imovel[]> {
  if (!ids.length) return [];
  const { data } = await supabase.from("imoveis").select("*").in("id", ids);
  return (data ?? []).map((r: any) => ({ ...r, fotos: parseFotos(r.fotos), diferenciais: r.diferenciais || [], destaque: r.destaque ?? false, cidade: r.cidade ?? "Porto Alegre", uf: r.uf ?? "RS" }));
}

const chip = (ativo: boolean) => `inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${ativo ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:bg-muted"}`;

function PastaCompartilhada({ token }: { token: string }) {
  const [nome, setNome] = useState(""); const [imoveis, setImoveis] = useState<Imovel[] | null>(null);
  useEffect(() => { supabase.rpc("pasta_compartilhada", { p_token: token }).then(async ({ data }) => { const d = data as any; if (!d) { setImoveis([]); return; } setNome(d.nome); setImoveis(await carregarImoveis(d.imoveis)); }); }, [token]);
  const { isFavorito, toggleFavorito } = useFavoritos();
  return (
    <div className="min-h-screen bg-background"><meta name="robots" content="noindex" /><Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-36 sm:px-6 lg:pt-28">
        <p className="text-sm font-semibold text-muted-foreground">Pasta compartilhada</p>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground">{nome || "Favoritos"}</h1>
        {imoveis === null ? <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin text-primary" /> : imoveis.length === 0 ? <p className="mt-10 text-muted-foreground">Esta pasta não está mais disponível.</p> :
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{imoveis.map((m, i) => <SearchPropertyCard key={m.id} imovel={m} index={i} isFavorito={isFavorito} toggleFavorito={toggleFavorito} />)}</div>}
      </div><Footer />
    </div>
  );
}

const Favoritos = () => {
  const { token } = useParams();
  if (token) return <PastaCompartilhada token={token} />;
  return <MeusFavoritos />;
};

function MeusFavoritos() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const { favoritos, loading: favsLoading, isFavorito, toggleFavorito } = useFavoritos();
  const { estado, atualizar } = usePastas(user?.id);
  const [notice, setNotice] = useState(false);
  useEffect(() => { const on = () => setNotice(true); window.addEventListener('uhome:aviso-preco', on); return () => window.removeEventListener('uhome:aviso-preco', on); }, []);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [ativa, setAtiva] = useState<string>("todos");
  const [escolher, setEscolher] = useState<string | null>(params.get("escolher"));
  const [visitas, setVisitas] = useState<Set<string>>(new Set());
  const [agendar, setAgendar] = useState(false);
  const { data: produtosFoco = [] } = useProdutosFoco();
  const [focoSalvos] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("uh-foco-favoritos") ?? "[]"); } catch { return []; } });
  const empreendimentos = produtosFoco.filter(p => focoSalvos.includes(p.slug));

  useEffect(() => {
    if (favsLoading) return;
    setLoading(true);
    carregarImoveis(Array.from(favoritos)).then(r => { setImoveis(r); setLoading(false); });
  }, [favoritos, favsLoading]);

  const pastaAtiva = estado.pastas.find(p => p.id === ativa);
  const lista = useMemo(() => pastaAtiva ? imoveis.filter(m => pastaAtiva.itens.includes(m.id)) : imoveis, [imoveis, pastaAtiva]);

  const novaPasta = () => { const n = window.prompt("Nome da pasta", "Para visitar"); if (n) { const e = criarPasta(estado, n); atualizar(e); setAtiva(e.pastas[e.pastas.length - 1]?.id ?? "todos"); } };
  const renomear = () => { if (!pastaAtiva) return; const n = window.prompt("Novo nome", pastaAtiva.nome); if (n) atualizar(renomearPasta(estado, pastaAtiva.id, n)); };
  const apagar = () => { if (pastaAtiva && window.confirm(`Apagar a pasta "${pastaAtiva.nome}"? Os imóveis continuam nos favoritos.`)) { atualizar(apagarPasta(estado, pastaAtiva.id)); setAtiva("todos"); } };
  const compartilhar = async () => {
    const ids = lista.map(m => m.id); if (!ids.length) return;
    const { data, error } = await supabase.rpc("compartilhar_pasta", { p_nome: pastaAtiva?.nome ?? "Meus favoritos", p_imoveis: ids });
    if (error || !data) { toast.error("Não foi possível criar o link."); return; }
    const url = linkPasta(window.location.origin, data as string);
    try { await navigator.clipboard.writeText(url); toast.success("Link copiado"); } catch { /* sem área de transferência */ }
    window.open(`https://wa.me/?text=${encodeURIComponent(`Olha estes imóveis da Uhome: ${url}`)}`, "_blank", "noopener");
  };
  const fecharEscolha = () => { setEscolher(null); params.delete("escolher"); setParams(params, { replace: true }); };
  const selecionados = lista.filter(m => visitas.has(m.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 lg:pt-28">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">Meus favoritos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{`${favoritos.size} imóveis salvos`}{!user && ' · Sua lista está só neste aparelho'}</p>

        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Pastas">
          <button role="tab" aria-selected={ativa === "todos"} className={chip(ativa === "todos")} onClick={() => setAtiva("todos")}>Todos</button>
          {estado.pastas.map(p => <button key={p.id} role="tab" aria-selected={ativa === p.id} className={chip(ativa === p.id)} onClick={() => setAtiva(p.id)}>{p.nome} <span className="opacity-60">{p.itens.filter(id => favoritos.has(id)).length}</span></button>)}
          <button className={chip(false)} onClick={novaPasta}><FolderPlus className="h-5 w-5" /> Nova pasta</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {lista.length > 0 && <button className={chip(false)} onClick={compartilhar}><Share2 className="h-5 w-5" /> Compartilhar</button>}
          {selecionados.length > 0 && <button className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={() => setAgendar(true)}><CalendarDays className="h-5 w-5" /> Agendar {selecionados.length} {selecionados.length === 1 ? "visita" : "visitas"}</button>}
          {pastaAtiva && <><button className={chip(false)} onClick={renomear}><Pencil className="h-4 w-4" /> Renomear</button><button className={chip(false)} onClick={apagar}><Trash2 className="h-4 w-4" /> Apagar pasta</button></>}
        </div>

        {loading || favsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : lista.length === 0 && (pastaAtiva || empreendimentos.length === 0) ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-base font-semibold text-foreground">{pastaAtiva ? "Pasta vazia" : "Nenhum favorito ainda"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pastaAtiva ? "Em \"Todos\", use \"Pastas\" no imóvel para trazê-lo aqui." : "Toque no ♥ nos imóveis para salvar aqui."}</p>
            {!pastaAtiva && <Link to="/busca?finalidade=venda" className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Explorar imóveis</Link>}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((imovel, i) => (
              <div key={imovel.id} className="flex flex-col gap-2">
                <SearchPropertyCard imovel={imovel} index={i} isFavorito={isFavorito} toggleFavorito={toggleFavorito} />
                <input aria-label="Nota sobre o imóvel" maxLength={140} placeholder="Adicionar nota" defaultValue={estado.notas[imovel.id] ?? ""} onBlur={e => { if ((estado.notas[imovel.id] ?? "") !== e.target.value) atualizar(definirNota(estado, imovel.id, e.target.value)); }} className="min-h-[44px] rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground" />
                <div className="flex gap-2">
                  <label className="inline-flex min-h-[44px] flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-primary" checked={visitas.has(imovel.id)} onChange={() => setVisitas(v => { const n = new Set(v); n.has(imovel.id) ? n.delete(imovel.id) : n.add(imovel.id); return n; })} /> Visitar</label>
                  <button className={`${chip(false)} flex-1 justify-center`} onClick={() => setEscolher(imovel.id)}>Pastas</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {ativa === "todos" && empreendimentos.length > 0 && <section className="mt-10"><h2 className="text-xl font-bold">Empreendimentos salvos</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{empreendimentos.map(p => <ProdutoFocoCard key={p.id} p={p} />)}</div></section>}
      </div>
      <Footer />
      <PriceNotice open={notice} onClose={() => setNotice(false)} />

      <Dialog open={!!escolher} onOpenChange={o => !o && fecharEscolha()}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Escolher pasta</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-2">
            {estado.pastas.map(p => <label key={p.id} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border px-3 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-primary" checked={!!escolher && p.itens.includes(escolher)} onChange={() => escolher && atualizar(alternarNaPasta(estado, p.id, escolher))} /> {p.nome}</label>)}
            <button className={chip(false)} onClick={() => { const n = window.prompt("Nome da pasta", "Para visitar"); if (n && escolher) { const e = criarPasta(estado, n); atualizar(alternarNaPasta(e, e.pastas[e.pastas.length - 1].id, escolher)); } }}><FolderPlus className="h-5 w-5" /> Nova pasta</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={agendar} onOpenChange={setAgendar}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>Agendar visitas</DialogTitle></DialogHeader>
          {selecionados.map(m => <section key={m.id} className="border-b border-border pb-4 last:border-0"><h3 className="mb-2 text-sm font-bold">{m.titulo}</h3><AgendamentoVisita imovelId={m.id} imovelSlug={m.slug} imovelTitulo={m.titulo} imovelBairro={m.bairro} imovelPreco={m.preco} /></section>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Favoritos;
