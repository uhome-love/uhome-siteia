/** Número do WhatsApp da Uhome — lido de env var ou fallback padrão */
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "5551992597097";

/** Número formatado para exibição */
export const WHATSAPP_DISPLAY = WHATSAPP_NUMBER.replace(
  /^55(\d{2})(\d{5})(\d{4})$/,
  "($1) $2-$3"
);

/** Gera link wa.me com mensagem pré-preenchida */
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
