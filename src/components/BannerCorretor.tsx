import { useState } from "react";
import { useCorretor } from "@/contexts/CorretorContext";

export function BannerCorretor() {
  const { corretor } = useCorretor();
  const [fechado, setFechado] = useState(false);

  if (!corretor || fechado) return null;

  const primeiroNome = corretor.nome.split(" ")[0];
  const telefone = corretor.telefone?.replace(/\D/g, "") || "";
  const whatsappUrl = telefone
    ? `https://wa.me/55${telefone}?text=${encodeURIComponent(`Olá ${corretor.nome}, vim pelo site Uhome e gostaria de informações sobre imóveis.`)}`
    : "#";

  return (
    <>
      {/* Spacer for fixed banner + navbar offset */}
      <div className="h-10" id="banner-corretor-spacer" />
      <div
        data-testid="banner-corretor"
        className="fixed top-0 left-0 right-0 z-[60] flex h-10 items-center justify-between gap-3 border-b border-primary/10 bg-card px-4 sm:px-6"
      >
        <div className="flex items-center gap-2 min-w-0">
          {corretor.foto_url ? (
            <img
              src={corretor.foto_url}
              alt={corretor.nome}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-xs font-bold text-primary">
              {corretor.nome.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="truncate font-body text-xs text-muted-foreground">
            Você está sendo atendido por{" "}
            <span className="font-semibold text-foreground">{corretor.nome}</span>
            {" "}· Corretor Uhome
            {corretor.creci && <span className="hidden sm:inline"> · CRECI {corretor.creci}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {telefone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              💬 Falar com {primeiroNome}
            </a>
          )}
          <button
            onClick={() => setFechado(true)}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Fechar banner"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}
