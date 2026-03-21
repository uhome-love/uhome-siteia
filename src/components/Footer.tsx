import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="container-uhome">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold text-gradient-gold">Uhome</span>
            <p className="mt-3 max-w-xs font-body text-sm text-muted-foreground">
              Imóveis de alto padrão em Porto Alegre com curadoria especializada e tecnologia de ponta.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Imóveis</h4>
            <ul className="mt-3 space-y-2">
              {["Comprar", "Lançamentos", "Comercial"].map((l) => (
                <li key={l}>
                  <Link to="/busca" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Uhome</h4>
            <ul className="mt-3 space-y-2">
              {["Sobre nós", "Equipe", "Blog", "Carreiras"].map((l) => (
                <li key={l}>
                  <Link to="/" className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-foreground">Contato</h4>
            <ul className="mt-3 space-y-2 font-body text-sm text-muted-foreground">
              <li>(51) 99999-9999</li>
              <li>contato@uhome.com.br</li>
              <li>Porto Alegre, RS</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Uhome Imóveis. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-muted-foreground">CRECI-RS 00000-J</p>
        </div>
      </div>
    </footer>
  );
}
