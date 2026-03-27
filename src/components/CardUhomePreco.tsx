import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Shield, MapPin, Building2, Sparkles } from "lucide-react";
import { useAnalisePreco, type ScoredComparable } from "@/hooks/useAnalisePreco";
import { formatPreco, type Imovel } from "@/services/imoveis";
import { formatMatchReason, conditionLabel } from "@/lib/similarityEngine";

export function CardUhomePreco({ imovel }: { imovel: Imovel }) {
  const analise = useAnalisePreco(imovel);
  const [expandido, setExpandido] = useState(false);

  if (analise === null) return null;

  const config = {
    abaixo: {
      label: "Preço abaixo do mercado",
      sublabel: `${Math.abs(analise.percentual)}% abaixo de imóveis similares`,
      Icon: TrendingDown,
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
      iconBg: "bg-green-600",
      needle: Math.max(5, 50 + analise.percentual * 0.5),
    },
    justo: {
      label: "Preço dentro do mercado",
      sublabel: "Alinhado com imóveis similares na região",
      Icon: Minus,
      badgeBg: "bg-primary/10",
      badgeText: "text-primary",
      iconBg: "bg-primary",
      needle: 50 + analise.percentual * 0.5,
    },
    acima: {
      label: "Preço acima do mercado",
      sublabel: `${Math.abs(analise.percentual)}% acima de imóveis similares`,
      Icon: TrendingUp,
      badgeBg: "bg-red-100",
      badgeText: "text-red-800",
      iconBg: "bg-red-600",
      needle: Math.min(95, 50 + analise.percentual * 0.5),
    },
  }[analise.status];

  const { Icon } = config;

  const confiancaConfig = {
    alta: { label: "Alta confiança", Icon: ShieldCheck, color: "text-green-700", bg: "bg-green-50" },
    media: { label: "Confiança moderada", Icon: Shield, color: "text-amber-700", bg: "bg-amber-50" },
    baixa: { label: "Poucos dados", Icon: ShieldAlert, color: "text-muted-foreground", bg: "bg-secondary" },
  }[analise.confianca];

  const estadoLabel = conditionLabel(analise.estadoImovel);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 font-body text-[11px] font-semibold text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Análise UhomePreço
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full ${confiancaConfig.bg} px-2.5 py-1 font-body text-[10px] font-semibold ${confiancaConfig.color}`}>
          <confiancaConfig.Icon className="h-3 w-3" />
          {confiancaConfig.label}
        </span>
      </div>

      {/* Title */}
      <p className="font-body text-sm font-bold text-foreground">{config.label}</p>
      <p className="mt-0.5 font-body text-xs text-muted-foreground">
        Baseado em {analise.totalSimilares} imóveis similares em {imovel.bairro}
        {estadoLabel && <span className="ml-1 text-primary">· {estadoLabel}</span>}
      </p>

      {/* Gauge bar */}
      <div className="relative mt-4 mb-1">
        <div className="flex h-2 overflow-hidden rounded-full">
          <div className="flex-1 bg-green-400" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-red-400" />
        </div>
        <div
          className="absolute -top-1 h-4 w-4 rounded-full border-2 border-foreground bg-background transition-all"
          style={{ left: `${config.needle}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="mb-4 flex justify-between font-body text-[10px] text-muted-foreground">
        <span>Abaixo</span>
        <span>Mercado</span>
        <span>Acima</span>
      </div>

      {/* Verdict */}
      <div className={`flex items-start gap-3 rounded-xl ${config.badgeBg} p-3 mb-4`}>
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg} text-white`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className={`font-body text-sm font-bold ${config.badgeText}`}>{config.label}</p>
          <p className={`font-body text-xs ${config.badgeText} opacity-80`}>{config.sublabel}</p>
        </div>
      </div>

      {/* Data rows */}
      <div className="font-body text-sm">
        <Row label="Preço anunciado" value={formatPreco(imovel.preco)} />
        <Row label="Estimativa de mercado" value={`${formatPreco(analise.minEstimado)} — ${formatPreco(analise.maxEstimado)}`} />
        <Row label="Preço/m² do imóvel" value={`R$ ${analise.precoM2Imovel.toLocaleString("pt-BR")}/m²`} border={!expandido} />

        {expandido && (
          <>
            <Row label="Média/m² similares" value={`R$ ${analise.precoM2Bairro.toLocaleString("pt-BR")}/m²`} />
            <Row label="Preço médio similar" value={formatPreco(analise.mediaPreco)} />
            {analise.custoTotalMensal && (
              <Row
                label="Custo mensal (cond. + IPTU)"
                value={`R$ ${analise.custoTotalMensal.toLocaleString("pt-BR")}`}
              />
            )}
            <Row label="Score mínimo" value="≥ 50%" border={false} />

            {/* Comparáveis top 5 */}
            {analise.comparaveis.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="font-body text-xs font-semibold text-foreground mb-2">
                  Imóveis mais similares comparados
                </p>
                <div className="space-y-2">
                  {analise.comparaveis.map((c, i) => (
                    <ComparableRow key={c.id || i} comp={c} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="mt-2 flex w-full items-center gap-1 font-body text-xs font-semibold text-primary transition-colors hover:text-primary/80 active:scale-[0.97]"
      >
        {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expandido ? "Ver menos" : "Ver análise completa"}
      </button>

      {/* CTA */}
      <Link
        to="/avaliar-imovel"
        className="mt-4 block text-center font-body text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Descubra o valor do seu imóvel →
      </Link>
    </div>
  );
}

function Row({ label, value, border = true }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${border ? "border-b border-border" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ComparableRow({ comp, rank }: { comp: ScoredComparable; rank: number }) {
  const similarityPct = Math.round(comp.score * 100);
  const estadoStr = conditionLabel(comp.estado);
  const distStr = comp.distanciaMetros != null
    ? comp.distanciaMetros < 1000
      ? `${Math.round(comp.distanciaMetros)}m`
      : `${(comp.distanciaMetros / 1000).toFixed(1)}km`
    : null;

  const foto = comp.foto_principal || "/placeholder.svg";
  const linkTo = comp.slug ? `/imovel/${comp.slug}` : null;

  const content = (
    <div className="flex gap-2.5 rounded-xl bg-secondary/60 p-2 transition-colors hover:bg-secondary">
      {/* Mini photo */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <img
          src={foto}
          alt={`Comparável ${rank}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground/70 font-body text-[9px] font-bold text-background">
          {rank}
        </span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-1">
          <span className="font-body text-xs font-semibold text-foreground leading-tight">
            {comp.area_total}m² · {comp.quartos}q · {comp.vagas}v
            {comp.andar != null && <span className="text-muted-foreground"> · {comp.andar}º</span>}
          </span>
          <span className="flex-shrink-0 font-body text-xs font-bold text-primary">
            {similarityPct}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-body text-[11px] font-semibold text-foreground">
            R$ {comp.precoM2.toLocaleString("pt-BR")}/m²
          </span>
          <span className="font-body text-[10px] text-muted-foreground">
            {formatPreco(comp.preco)}
          </span>
        </div>

        {/* Tags */}
        {(comp.matchReasons.length > 0 || distStr || estadoStr) && (
          <div className="flex flex-wrap gap-0.5">
            {comp.matchReasons.map((r) => (
              <span key={r} className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 font-body text-[9px] font-semibold text-primary">
                {r === "mesmo_edificio" && <Building2 className="h-2.5 w-2.5" />}
                {(r === "mesma_rua" || r === "muito_proximo") && <MapPin className="h-2.5 w-2.5" />}
                {formatMatchReason(r)}
              </span>
            ))}
            {distStr && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 font-body text-[9px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {distStr}
              </span>
            )}
            {estadoStr && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 font-body text-[9px] text-muted-foreground">
                {estadoStr}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block no-underline" target="_blank" rel="noopener">
        {content}
      </Link>
    );
  }

  return content;
}
