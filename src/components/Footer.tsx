import { Link } from "react-router-dom";
import { UhomeLogo } from "@/components/UhomeLogo";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";

export function Footer() {
  const { prefixLink } = useCorretor();

  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <UhomeLogo variant="full" height={28} />
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
              Imóveis em Porto Alegre com curadoria especializada e tecnologia de ponta.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Imóveis</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to={prefixLink("/busca?finalidade=venda")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Comprar</Link></li>
              <li><Link to={prefixLink("/apartamentos-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Apartamentos</Link></li>
              <li><Link to={prefixLink("/casas-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Casas</Link></li>
              <li><Link to={prefixLink("/coberturas-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Coberturas</Link></li>
              <li><Link to={prefixLink("/bairros")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Bairros</Link></li>
              <li><Link to={prefixLink("/condominios")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Condomínios</Link></li>
              <li><Link to={prefixLink("/anunciar")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Anunciar imóvel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Uhome</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to={prefixLink("/busca?modo=ia")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Busca IA</Link></li>
              <li><Link to={prefixLink("/avaliar-imovel")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Avaliar imóvel</Link></li>
              <li><Link to={prefixLink("/faq")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Perguntas frequentes</Link></li>
              <li><Link to={prefixLink("/carreiras")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Trabalhe conosco</Link></li>
              <li><Link to={prefixLink("/blog")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Blog</Link></li>
              <li><Link to={prefixLink("/politica-de-privacidade")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Política de Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Contato</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li>
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="transition-colors hover:text-foreground">{WHATSAPP_DISPLAY}</a>
              </li>
              <li>
                <a href="mailto:lucas@uhome.imb.br" className="transition-colors hover:text-foreground">lucas@uhome.imb.br</a>
              </li>
              <li>Porto Alegre, RS</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Uhome Imóveis LTDA · CRECI-RS 25682J · Porto Alegre, RS
          </p>
          <Link to={prefixLink("/politica-de-privacidade")} className="font-body text-xs text-muted-foreground transition-colors hover:text-foreground">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
