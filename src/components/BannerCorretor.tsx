import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getCorretorRef,
  getCorretorRefId,
  getCorretorRefNome,
} from "@/lib/session";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export function BannerCorretor() {
  const location = useLocation();
  const [dados, setDados] = useState<{
    nome: string;
    slug: string;
    foto: string | null;
  } | null>(null);
  const [fechado, setFechado] = useState(false);

  // Re-checar a cada navegação
  useEffect(() => {
    const slug = getCorretorRef();
    const nome = getCorretorRefNome();
    const id = getCorretorRefId();
    const foto = localStorage.getItem("corretor_ref_foto") || null;

    if (slug && nome && id) {
      setDados({ nome, slug, foto });
    } else {
      setDados(null);
    }
  }, [location.pathname]);

  if (!dados || fechado) return null;

  const primeiroNome = dados.nome.split(" ")[0];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá! Estou navegando no site da Uhome pelo link do corretor ${dados.nome}.`
  )}`;

  return (
    <div
      data-testid="banner-corretor"
      className="flex items-center justify-between gap-3 bg-primary/5 border-b border-primary/10 px-4 py-2 sm:px-6"
    >
      <div className="flex items-center gap-2 min-w-0">
        {dados.foto ? (
          <img
            src={dados.foto}
            alt={dados.nome}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-xs font-bold text-primary">
            {dados.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="truncate font-body text-xs text-muted-foreground">
          Você está sendo atendido por{" "}
          <span className="font-semibold text-foreground">{dados.nome}</span>
          {" "}· Corretor Uhome
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          💬 Falar com {primeiroNome}
        </a>
        <button
          onClick={() => setFechado(true)}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar banner"
        >
          ×
        </button>
      </div>
    </div>
  );
}
