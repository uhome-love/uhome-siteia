import { Link } from "react-router-dom";
import { UhomeLogo } from "@/components/UhomeLogo";

export function Footer() {
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
              <li><Link to="/busca?finalidade=venda" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Comprar</Link></li>
              <li><Link to="/busca" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Todos os imóveis</Link></li>
              <li><Link to="/anunciar" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Anunciar imóvel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Uhome</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/busca?modo=ia" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Busca IA</Link></li>
              <li><Link to="/carreiras" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Trabalhe conosco</Link></li>
              <li><Link to="/" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Sobre nós</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Contato</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li>
                <a href="tel:+555199999999" className="transition-colors hover:text-foreground">(51) 99999-9999</a>
              </li>
              <li>
                <a href="mailto:contato@uhome.com.br" className="transition-colors hover:text-foreground">contato@uhome.com.br</a>
              </li>
              <li>Porto Alegre, RS</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Uhome Imóveis. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-muted-foreground">CRECI-RS</p>
        </div>
      </div>
    </footer>
  );
}
