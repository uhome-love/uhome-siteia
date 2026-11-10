import { Link } from "react-router-dom";
import { MapPin, MessageCircle, Phone, Building2, Sparkles } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/services/whatsappTracker";
import { formatPreco, mensagemProduto, type ProdutoFoco } from "@/lib/produtosFoco";
import { Button } from "@/components/ui/button";

/** Abre o WhatsApp do corretor (link personalizado) ou da Uhome. */
export function useWhatsAppProduto() {
  const { corretor, slug, isDirectAccess } = useCorretor();
  return (p: Pick<ProdutoFoco, "nome" | "bairro" | "slug">) => {
    const tel = isDirectAccess ? corretor?.telefone?.replace(/\D/g, "") : "";
    const numero = tel ? (tel.startsWith("55") ? tel : `55${tel}`) : WHATSAPP_NUMBER;
    const msg = mensagemProduto(p, isDirectAccess ? slug : null, isDirectAccess ? corretor?.nome : undefined);
    trackWhatsAppClick({ imovel_slug: `em-foco/${p.slug}`, imovel_titulo: p.nome, origem_pagina: window.location.pathname });
    return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  };
}

export function ProdutoFocoCard({ p, selo, campanha, contato = false }: { p: ProdutoFoco; selo?: string; campanha?: "natal" | "black"; contato?: boolean }) {
  const { prefixLink } = useCorretor();
  const wa = useWhatsAppProduto();
  const preco = formatPreco(p.preco_a_partir);
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-lg">
    <Link
      to={prefixLink(`/em-foco/${p.slug}`)}
      className="group flex min-w-0 flex-1 flex-col focus-visible:outline focus-visible:outline-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.capa_url && (
          <img
            src={p.capa_url}
            alt={`${p.nome} em ${p.bairro ?? ""}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {selo && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wide shadow ${
              campanha === "black" ? "bg-noir text-noir-foreground" : campanha === "natal" ? "bg-natal-red text-natal-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {selo}
          </span>
        )}
        {(p.status_obra || p.entrega) && (
          <span className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {p.status_obra && <span className="rounded-full bg-background/90 px-3 py-1 font-body text-[11px] font-semibold text-foreground backdrop-blur">{p.status_obra}</span>}
            {p.entrega && !/pronto/i.test(p.status_obra ?? "") && (
              <span className="rounded-full bg-foreground/80 px-3 py-1 font-body text-[11px] font-semibold text-background backdrop-blur">Entrega {p.entrega}</span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.incorporadora}</p>
        <h3 className="font-heading text-lg font-bold text-foreground">{p.nome}</h3>
        <p className="flex items-start gap-1 font-body text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {[p.bairro, p.cidade].filter(Boolean).join(", ")}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          {preco ? (
            <div>
              <p className="font-body text-[11px] text-muted-foreground">a partir de</p>
              <p className="font-heading text-xl font-bold text-foreground">{preco}</p>
            </div>
          ) : <span />}
          <span className="font-body text-sm font-semibold text-primary group-hover:underline">Ver produto →</span>
        </div>
      </div>
    </Link>
    {contato && <div className="px-5 pb-5"><Button asChild variant="secondary" className="w-full"><a href={wa(p)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Consultar condições</a></Button></div>}
    </div>
  );
}

/** Cartão do corretor (versão personalizada, sem formulário). */
export function CorretorContatoCard({ produto }: { produto: ProdutoFoco }) {
  const { corretor } = useCorretor();
  const wa = useWhatsAppProduto();
  if (!corretor) return null;
  const tel = corretor.telefone?.replace(/\D/g, "");
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seu corretor Uhome</p>
      <div className="mt-4 flex items-center gap-4">
        {corretor.foto_url ? (
          <img src={corretor.foto_url} alt={corretor.nome} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
            {corretor.nome.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-heading text-lg font-bold text-foreground">{corretor.nome}</p>
          {corretor.creci && <p className="font-body text-sm text-muted-foreground">CRECI {corretor.creci}</p>}
        </div>
      </div>
      <a
        href={wa(produto)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-body text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" /> Falar com {corretor.nome.split(" ")[0]} no WhatsApp
      </a>
      {tel && (
        <a
          href={`tel:+55${tel}`}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-body text-sm font-semibold text-foreground"
        >
          <Phone className="h-4 w-4" /> Ligar
        </a>
      )}
    </div>
  );
}

export function FocoEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <Building2 className="h-10 w-10 text-muted-foreground" />
      <p className="font-body text-muted-foreground">Nenhum produto em foco no momento.</p>
    </div>
  );
}

export function FocoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
      <Sparkles className="h-3.5 w-3.5" /> Uhome em Foco
    </span>
  );
}
