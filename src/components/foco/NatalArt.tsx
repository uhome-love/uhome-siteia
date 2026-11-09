import luzes from "@/assets/natal/luzes_varal_faixa_larga.svg.asset.json";
import chave from "@/assets/natal/chave_de_ouro.svg.asset.json";
import selo from "@/assets/natal/selo_natal_chave_de_ouro.svg.asset.json";
import estrela from "@/assets/natal/estrela_dourada.svg.asset.json";
import urna from "@/assets/natal/urna_premiada.svg.asset.json";
import homi from "@/assets/natal/homi_noel.png.asset.json";
import presentes from "@/assets/natal/presentes_3d.png.asset.json";
import arvore from "@/assets/natal/arvore_3d.png.asset.json";
import sino from "@/assets/natal/sino_3d.png.asset.json";

export const NATAL_ART = {
  luzes: luzes.url,
  chave: chave.url,
  selo: selo.url,
  estrela: estrela.url,
  urna: urna.url,
  homi: homi.url,
  presentes: presentes.url,
  arvore: arvore.url,
  sino: sino.url,
};

/** Faixa de luzes oficial, decorativa. */
export function NatalLuzes({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none h-[30px] w-full bg-repeat-x bg-contain ${className}`}
      style={{ backgroundImage: `url(${NATAL_ART.luzes})`, backgroundPosition: "top left" }}
    />
  );
}

/** Fundo azul-noite com brilho radial (identidade oficial). */
export const natalBg = "bg-[radial-gradient(ellipse_at_top_right,hsl(var(--natal-glow)),hsl(var(--natal))_45%,hsl(var(--natal-deep)))]";

/** Texto em degradê dourado. */
export function Ouro({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--natal-gold-grad)" }}>
      {children}
    </span>
  );
}
