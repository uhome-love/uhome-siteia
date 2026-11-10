import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MidiaFoco } from "@/lib/produtosFoco";

export function MaterialGallery({ fotos, index, onClose }: { fotos: MidiaFoco[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(false);
  const [failed, setFailed] = useState(false);
  const touch = useRef<number | null>(null);
  const f = fotos[i];
  const move = (delta: number) => { setI(x => (x + delta + fotos.length) % fotos.length); setZoom(false); setFailed(false); };
  if (!f) return null;
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-noir/95" />
      <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-[101] flex min-h-0 flex-col bg-noir text-noir-foreground outline-none" onKeyDown={e => {
        if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      }}>
        <div className="flex shrink-0 items-center justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0"><Dialog.Title className="font-heading text-base font-semibold">Fotos e materiais</Dialog.Title><p aria-live="polite" className="mt-1 truncate font-body text-sm text-noir-foreground/80">{i + 1} / {fotos.length}{f.legenda ? ` · ${f.legenda}` : ""}</p></div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="icon" aria-label={zoom ? "Reduzir imagem" : "Ampliar imagem"} onClick={() => setZoom(x => !x)} className="text-noir-foreground hover:bg-noir-foreground/10 hover:text-noir-foreground">{zoom ? <ZoomOut /> : <ZoomIn />}</Button>
            <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Fechar galeria" className="text-noir-foreground hover:bg-noir-foreground/10 hover:text-noir-foreground"><X /></Button></Dialog.Close>
          </div>
        </div>
        <div className="relative min-h-0 flex-1" onTouchStart={e => { touch.current = e.touches[0]?.clientX ?? null; }} onTouchEnd={e => {
          const end = e.changedTouches[0]?.clientX;
          if (!zoom && touch.current !== null && end !== undefined && Math.abs(end - touch.current) > 60) move(end < touch.current ? 1 : -1);
          touch.current = null;
        }}>
          <div className={`flex h-full w-full ${zoom ? "overflow-auto" : "items-center justify-center overflow-hidden"}`}>
            {failed ? <p className="m-auto px-8 text-center font-body text-sm">Não foi possível carregar este material. Veja a próxima imagem.</p> : <img key={f.url} src={f.url} alt={f.legenda ?? `Material ${i + 1}`} onError={() => setFailed(true)} className={zoom ? "m-auto h-auto w-[180%] max-w-none shrink-0 object-contain" : "h-full w-full object-contain px-2 pb-3 sm:px-16"} />}
          </div>
          {fotos.length > 1 && <>
            <Button variant="ghost" size="icon" aria-label="Foto anterior" onClick={() => move(-1)} className="absolute left-2 top-1/2 bg-noir/70 text-noir-foreground hover:bg-noir hover:text-noir-foreground"><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" aria-label="Próxima foto" onClick={() => move(1)} className="absolute right-2 top-1/2 bg-noir/70 text-noir-foreground hover:bg-noir hover:text-noir-foreground"><ChevronRight /></Button>
          </>}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}