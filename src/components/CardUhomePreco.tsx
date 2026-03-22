import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useAnalisePreco } from "@/hooks/useAnalisePreco";
import { formatPreco, type Imovel } from "@/services/imoveis";

export function CardUhomePreco({ imovel }: { imovel: Imovel }) {
  const analise = useAnalisePreco(imovel);
  const [expandido, setExpandido] = useState(false);

  if (analise === null) return null;

  const config = {
    abaixo: {
      label: "Preço abaixo do mercado",
      sublabel: `${Math.abs(analise.percentual)}% abaixo do preço médio do bairro`,
      Icon: TrendingDown,
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
      iconBg: "bg-green-600",
      needle: 16,
    },
    justo: {
      label: "Preço dentro do mercado",
      sublabel: "Alinhado com o valor médio do bairro",
      Icon: Minus,
      badgeBg: "bg-primary/10",
      badgeText: "text-primary",
      iconBg: "bg-primary",
      needle: 50,
    },
    acima: {
      label: "Preço acima do mercado",
      sublabel: `${Math.abs(analise.percentual)}% acima do preço médio do bairro`,
      Icon: TrendingUp,
      badgeBg: "bg-red-100",
      badgeText: "text-red-800",
      iconBg: "bg-red-600",
      needle: 84,
    },
  }[analise.status];

  const { Icon } = config;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Badge */}
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 font-body text-[11px] font-semibold text-muted-foreground">
        ◎ Análise UhomePreço
      </span>

      {/* Title */}
      <p className="font-body text-sm font-bold text-foreground">{config.label}</p>
      <p className="mt-0.5 font-body text-xs text-muted-foreground">
        Baseado em {analise.totalSimilares} imóveis similares em {imovel.bairro}
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
            <Row label="Média/m² no bairro" value={`R$ ${analise.precoM2Bairro.toLocaleString("pt-BR")}/m²`} />
            <Row label="Preço médio similar" value={formatPreco(analise.mediaPreco)} border={false} />
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
