import { getCorretorRef } from "./session";
import { getImovelUrl } from "@/utils/shareUrl";

/** Número do WhatsApp da Uhome — lido de env var ou fallback padrão */
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "5551992597097";

/** Número formatado para exibição */
export const WHATSAPP_DISPLAY = WHATSAPP_NUMBER.replace(
  /^55(\d{2})(\d{5})(\d{4})$/,
  "($1) $2-$3"
);

/** Gera link wa.me com mensagem pré-preenchida (legado) */
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Gera URL do WhatsApp incluindo referência do corretor quando disponível.
 * Usar esta função em vez de whatsappLink() para novos componentes.
 */
export function buildWhatsAppUrl(
  mensagem?: string,
  imovel?: { titulo?: string; bairro?: string; slug?: string }
): string {
  const corretorNome = localStorage.getItem("corretor_ref_nome");

  let msg = "";

  if (imovel?.titulo) {
    msg = `Olá! Tenho interesse no imóvel: ${imovel.titulo}`;
    if (imovel.bairro) msg += ` em ${imovel.bairro}`;
    msg += ".";
    if (imovel.slug) {
      msg += `\nLink: ${getShareUrl(imovel.slug)}`;
    }
  } else {
    msg =
      mensagem ??
      "Olá! Vim pelo site da Uhome e gostaria de saber mais sobre os imóveis disponíveis.";
  }

  // Incluir referência do corretor na mensagem
  const ref = getCorretorRef();
  if (ref && corretorNome) {
    msg += `\n\n_Atendimento: ${corretorNome}_`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/**
 * Gera URL do WhatsApp direto para o corretor ativo.
 * Se não houver telefone do corretor, fallback para Uhome.
 */
export function buildCorretorWhatsAppUrl(
  corretorNome: string,
  corretorTelefone: string | null,
  imovel?: { titulo?: string; bairro?: string; slug?: string }
): string {
  const tel = corretorTelefone?.replace(/\D/g, "") || "";
  const numero = tel ? `55${tel}` : WHATSAPP_NUMBER;

  let msg = "";
  if (imovel?.titulo) {
    msg = `Olá ${corretorNome}, vi o imóvel ${imovel.titulo}`;
    if (imovel.bairro) msg += ` em ${imovel.bairro}`;
    msg += ` no site Uhome e tenho interesse. Pode me ajudar?`;
    if (imovel.slug) {
      msg += `\nLink: ${getShareUrl(imovel.slug)}`;
    }
  } else {
    msg = `Olá ${corretorNome}, vim pelo site Uhome e gostaria de informações sobre imóveis.`;
  }

  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}
