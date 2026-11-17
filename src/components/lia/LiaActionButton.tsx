import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiaActionButton() {
  return <Button type="button" variant="outline" aria-label="Conversar com a Lia"
    className="h-auto shrink-0 px-4 py-3.5"
    onClick={() => window.dispatchEvent(new CustomEvent("uhome:abrir-lia"))}>
    <MessageCircle className="h-5 w-5" />
  </Button>;
}