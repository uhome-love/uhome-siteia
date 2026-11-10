import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@/features/investir-studios/landing.css";
import markup from "@/features/investir-studios/markup.html?raw";
import { LP_DATA } from "@/features/investir-studios/data";
import { initLanding, type LeadQualificado } from "@/features/investir-studios/controller";
import { ORIGEM_COMPONENTE, contextoLead, tituloInteresse } from "@/features/investir-studios/lead";
import { submitLead } from "@/services/leads";
import { trackClickWhatsapp } from "@/lib/gtag";
import { montarContextoLia } from "@/lib/liaContext";
import { getCorretorRef } from "@/lib/session";
import { useCanonical } from "@/hooks/useCanonical";

const URL_PAGINA = "https://uhome.com.br/investir-studios";
const IMG = "/lp/investir-studios/img";
const HTML = { __html: markup };

function pushDataLayer(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, landing: "investir_studios", ...params });
}

async function registrarLead(l: LeadQualificado) {
  try {
    await submitLead({
      nome: l.nome,
      telefone: l.telefone,
      tipo_interesse: "investimento_studio",
      imovel_titulo: tituloInteresse(l),
      imovel_bairro: l.produto?.bairro,
      imovel_preco: l.produto?.preco,
      origem_componente: ORIGEM_COMPONENTE,
      contexto: contextoLead(l, montarContextoLia(window.location.pathname, getCorretorRef() || null)),
    });
    return true;
  } catch (err) {
    console.error("[investir-studios] Falha ao registrar o lead", err);
    return false;
  }
}

/**
 * Landing de campanha (Google Ads e Meta Ads): studios Cyrela para investir.
 * Página sem o menu do site, com formulário de qualificação que grava em public_leads
 * (com as respostas em `contexto`; o trigger leva ao CRM pelo sync-to-crm; sem link de corretor, cai na Fila do CEO)
 * e dispara generate_lead no dataLayer.
 */
export default function InvestirStudios() {
  const ref = useRef<HTMLDivElement>(null);
  useCanonical("/investir-studios");

  useEffect(() => {
    if (!ref.current) return;
    return initLanding(ref.current, {
      data: LP_DATA,
      onLead: registrarLead,
      onWhatsApp: (local) => trackClickWhatsapp({ origem_componente: `${ORIGEM_COMPONENTE}_${local}` }),
      track: pushDataLayer,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Studios Cyrela para investir em Porto Alegre | Uhome</title>
        <meta
          name="description"
          content="Quatro studios Cyrela em Porto Alegre a partir de R$ 302 mil. Você dá a entrada, a gestora cuida dos hóspedes e o aluguel ajuda a pagar a parcela. Condição de fim de ano até 30/11."
        />
        <meta name="theme-color" content="#16305C" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL_PAGINA} />
        <meta property="og:title" content="O studio que o hóspede ajuda a pagar | Uhome" />
        <meta
          property="og:description"
          content="Studios Cyrela em Porto Alegre a partir de R$ 302 mil, com gestão profissional e condição de fim de ano."
        />
        <meta property="og:image" content={`https://uhome.com.br${IMG}/og.jpg`} />
        <link
          rel="preload"
          as="image"
          href={`${IMG}/hero-1400.webp`}
          imageSrcSet={`${IMG}/hero-800.webp 800w, ${IMG}/hero-1400.webp 1163w`}
          imageSizes="(max-width: 1080px) 100vw, 680px"
          fetchPriority="high"
        />
      </Helmet>
      <div className="lpi" ref={ref} dangerouslySetInnerHTML={HTML} />
    </>
  );
}
