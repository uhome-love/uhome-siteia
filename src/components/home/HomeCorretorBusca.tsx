import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Calculator, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { submitLead } from "@/services/leads";
import { formatPhone } from "@/lib/phoneMask";
import { useCorretor } from "@/contexts/CorretorContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** "Não achou? Um corretor busca para você" — lead entra pela tabela de leads; o CRM recebe pelos gatilhos do banco. */
export function HomeCorretorBusca() {
  const { prefixLink } = useCorretor();
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 2 || tel.replace(/\D/g, "").length < 10) {
      toast.error("Preencha seu nome e um WhatsApp válido.");
      return;
    }
    setEstado("enviando");
    try {
      await submitLead({
        nome: nome.trim(),
        telefone: tel.trim(),
        tipo_interesse: busca.trim() ? `Busca personalizada: ${busca.trim().slice(0, 400)}` : "Busca personalizada",
        origem_componente: "home_corretor_busca",
        origem_pagina: window.location.pathname,
      });
      setEstado("ok");
    } catch {
      setEstado("idle");
      toast.error("Não foi possível enviar agora. Tente pelo WhatsApp.");
    }
  };

  return (
    <section id="corretor-busca" className="scroll-mt-20 section-y">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserSearch className="h-6 w-6" /></span>
          <h2 className="mt-5 text-h2 text-foreground">
            Não achou? Um corretor busca para você
          </h2>
          <p className="mt-3 max-w-md font-body text-base text-muted-foreground">
            Conte o que procura e um especialista Uhome te chama no WhatsApp com opções selecionadas, inclusive imóveis que ainda não estão no site.
          </p>
          <Link to={prefixLink("/avaliar-imovel")} className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary">
            <Calculator className="h-4 w-4" /> Vai vender o seu para comprar? Descubra quanto ele vale
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {estado === "ok" ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-6 w-6" /></span>
              <p className="mt-4 font-body text-lg font-bold text-foreground">Recebemos, {nome.split(" ")[0]}!</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">Um corretor vai te chamar no WhatsApp em breve.</p>
            </div>
          ) : (
            <form onSubmit={enviar} className="grid gap-3">
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" aria-label="Seu nome" className="h-12 rounded-xl text-base" />
              <Input value={tel} onChange={(e) => setTel(formatPhone(e.target.value))} placeholder="WhatsApp com DDD" inputMode="tel" aria-label="WhatsApp" className="h-12 rounded-xl text-base" />
              <Textarea value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: 3 quartos no Petrópolis, até R$ 900 mil, com vaga" aria-label="O que você procura" className="min-h-[96px] rounded-xl text-base" />
              <button disabled={estado === "enviando"} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-body text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                {estado === "enviando" && <Loader2 className="h-4 w-4 animate-spin" />} Quero que um corretor busque para mim
              </button>
              <p className="text-center font-body text-[11px] text-muted-foreground">Sem custo. Seus dados ficam só com a Uhome.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
