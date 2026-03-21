import { MessageCircle } from "lucide-react";

interface Props {
  onClickCTA: () => void;
}

export function SearchCTACard({ onClickCTA }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-6 text-center sm:flex-row sm:text-left">
      <div className="flex-1">
        <p className="font-body text-base font-bold text-foreground">
          Gostou de algum imóvel?
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Fale com um corretor agora e receba uma lista personalizada.
        </p>
      </div>
      <button
        onClick={onClickCTA}
        className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
      >
        <MessageCircle className="h-4 w-4" />
        Falar com corretor
      </button>
    </div>
  );
}
