// Artes oficiais "Natal Chave de Ouro" (peças aprovadas, com texto). Exibidas só com a campanha de Natal vigente.
import { cn } from "@/lib/utils";
import geral_1080x1350 from "@/assets/natal-pecas/pecas-natal-geral-1080x1350.webp.asset.json";
import geral_1200x628 from "@/assets/natal-pecas/pecas-natal-geral-1200x628.webp.asset.json";
import golden_lake_1080x1350 from "@/assets/natal-pecas/pecas-natal-golden-lake-1080x1350.webp.asset.json";
import golden_lake_1200x628 from "@/assets/natal-pecas/pecas-natal-golden-lake-1200x628.webp.asset.json";
import casa_tua_canoas_1080x1350 from "@/assets/natal-pecas/pecas-natal-casa-tua-canoas-1080x1350.webp.asset.json";
import casa_tua_canoas_1200x628 from "@/assets/natal-pecas/pecas-natal-casa-tua-canoas-1200x628.webp.asset.json";
import open_arvoredo_1080x1350 from "@/assets/natal-pecas/pecas-natal-open-arvoredo-1080x1350.webp.asset.json";
import open_arvoredo_1200x628 from "@/assets/natal-pecas/pecas-natal-open-arvoredo-1200x628.webp.asset.json";
import orygem_1080x1350 from "@/assets/natal-pecas/pecas-natal-orygem-1080x1350.webp.asset.json";
import orygem_1200x628 from "@/assets/natal-pecas/pecas-natal-orygem-1200x628.webp.asset.json";
import skyglass_1080x1350 from "@/assets/natal-pecas/pecas-natal-skyglass-1080x1350.webp.asset.json";
import skyglass_1200x628 from "@/assets/natal-pecas/pecas-natal-skyglass-1200x628.webp.asset.json";
import open_bosque_1080x1350 from "@/assets/natal-pecas/pecas-natal-open-bosque-1080x1350.webp.asset.json";
import open_bosque_1200x628 from "@/assets/natal-pecas/pecas-natal-open-bosque-1200x628.webp.asset.json";
import black_1080x1350 from "@/assets/natal-pecas/black-pecas-natal-geral-1080x1350.webp.asset.json";
import black_1200x628 from "@/assets/natal-pecas/black-pecas-natal-geral-1200x628.webp.asset.json";

type Peca = { retrato: string; largo: string };

export const PECAS_PRODUTO: Record<string, Peca> = {
  "open-bosque": { retrato: open_bosque_1080x1350.url, largo: open_bosque_1200x628.url },
  "open-arvoredo": { retrato: open_arvoredo_1080x1350.url, largo: open_arvoredo_1200x628.url },
  "orygem": { retrato: orygem_1080x1350.url, largo: orygem_1200x628.url },
  "skyglass-parque-moinhos": { retrato: skyglass_1080x1350.url, largo: skyglass_1200x628.url },
  "golden-lake": { retrato: golden_lake_1080x1350.url, largo: golden_lake_1200x628.url },
  "casa-tua-canoas": { retrato: casa_tua_canoas_1080x1350.url, largo: casa_tua_canoas_1200x628.url },
};
export const PECA_GERAL: Peca = { retrato: geral_1080x1350.url, largo: geral_1200x628.url };
export const PECA_BLACK: Peca = { retrato: black_1080x1350.url, largo: black_1200x628.url };

/** Banner clicável: retrato no celular, horizontal no computador. */
export function PecaNatal({ peca, alt, onClick, className }: { peca: Peca; alt: string; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={alt} className={cn("block w-full overflow-hidden rounded-2xl shadow-lg transition-transform active:scale-[0.99]", className)}>
      <picture>
        <source media="(min-width: 768px)" srcSet={peca.largo} width={1200} height={628} />
        <img src={peca.retrato} alt={alt} width={1080} height={1350} loading="lazy" decoding="async" className="h-auto w-full" />
      </picture>
    </button>
  );
}
