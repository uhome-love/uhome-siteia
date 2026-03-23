import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface FinancingSimulatorProps {
  propertyPrice: number;
}

export function FinancingSimulator({ propertyPrice }: FinancingSimulatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [years, setYears] = useState(30);
  const [annualRate, setAnnualRate] = useState(10.5);

  const simulation = useMemo(() => {
    const downPayment = propertyPrice * (downPaymentPercent / 100);
    const financedAmount = propertyPrice - downPayment;
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    // Price table (SAC system - most common in Brazil)
    const monthlyAmortization = financedAmount / totalMonths;
    const firstInstallment = monthlyAmortization + financedAmount * monthlyRate;
    const lastInstallment = monthlyAmortization + monthlyAmortization * monthlyRate;

    // Total paid
    const totalInterest = ((financedAmount * monthlyRate * (totalMonths + 1)) / 2);
    const totalPaid = financedAmount + totalInterest;

    return {
      downPayment,
      financedAmount,
      firstInstallment,
      lastInstallment,
      totalPaid,
      totalInterest,
      totalMonths,
    };
  }, [propertyPrice, downPaymentPercent, years, annualRate]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Simulador de Financiamento</h3>
          <p className="font-body text-xs text-muted-foreground">Sistema SAC — valores aproximados</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Down Payment */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-muted-foreground">Entrada</label>
            <span className="font-body text-sm font-semibold text-foreground">
              {downPaymentPercent}% — {formatCurrency(simulation.downPayment)}
            </span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={([v]) => setDownPaymentPercent(v)}
            min={10}
            max={80}
            step={5}
            className="mt-2"
          />
          <div className="mt-1 flex justify-between font-body text-[10px] text-muted-foreground">
            <span>10%</span>
            <span>80%</span>
          </div>
        </div>

        {/* Years */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-muted-foreground">Prazo</label>
            <span className="font-body text-sm font-semibold text-foreground">{years} anos</span>
          </div>
          <Slider
            value={[years]}
            onValueChange={([v]) => setYears(v)}
            min={5}
            max={35}
            step={5}
            className="mt-2"
          />
          <div className="mt-1 flex justify-between font-body text-[10px] text-muted-foreground">
            <span>5 anos</span>
            <span>35 anos</span>
          </div>
        </div>

        {/* Rate */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-body text-sm text-muted-foreground">Taxa anual</label>
            <span className="font-body text-sm font-semibold text-foreground">{annualRate.toFixed(1)}% a.a.</span>
          </div>
          <Slider
            value={[annualRate * 10]}
            onValueChange={([v]) => setAnnualRate(v / 10)}
            min={60}
            max={150}
            step={5}
            className="mt-2"
          />
          <div className="mt-1 flex justify-between font-body text-[10px] text-muted-foreground">
            <span>6%</span>
            <span>15%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: DollarSign, label: "1ª parcela", value: formatCurrency(simulation.firstInstallment), accent: true },
          { icon: TrendingUp, label: "Última parcela", value: formatCurrency(simulation.lastInstallment), accent: false },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div
            key={label}
            className={`rounded-xl p-3 ${accent ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"}`}
          >
            <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`mt-2 font-body text-lg font-bold ${accent ? "text-primary" : "text-foreground"}`}>
              {value}
            </p>
            <p className="font-body text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 font-body text-[10px] text-muted-foreground leading-relaxed">
        * Simulação aproximada pelo sistema SAC. Valores reais podem variar conforme banco, perfil de crédito e condições de mercado.
      </p>
    </div>
  );
}
