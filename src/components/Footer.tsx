import { Link } from "react-router-dom";
import { UhomeLogo } from "@/components/UhomeLogo";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { useCorretor } from "@/contexts/CorretorContext";

// Footer uses content-auto for below-fold performance

export function Footer() {
  const { prefixLink } = useCorretor();

  return (
    <footer className="border-t border-border bg-background">
      {/* SEO Content Block — rich text for search engines */}
      <div className="border-b border-border bg-secondary/20 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-body text-sm font-bold text-foreground mb-4">
            Imóveis à Venda em Porto Alegre | Uhome Imóveis
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 font-body text-xs leading-relaxed text-muted-foreground space-y-3">
            <p>
              A <strong>Uhome</strong> é uma <strong>imobiliária digital em Porto Alegre</strong> especializada na venda de{" "}
              <Link to={prefixLink("/apartamentos-porto-alegre")} className="text-primary hover:underline">apartamentos</Link>,{" "}
              <Link to={prefixLink("/casas-porto-alegre")} className="text-primary hover:underline">casas</Link>,{" "}
              <Link to={prefixLink("/coberturas-porto-alegre")} className="text-primary hover:underline">coberturas</Link> e{" "}
              <Link to={prefixLink("/studios-porto-alegre")} className="text-primary hover:underline">studios</Link>.
              Com mais de 14.600 imóveis disponíveis e tecnologia de busca inteligente por IA, ajudamos você a encontrar o imóvel perfeito nos melhores bairros da capital gaúcha.
            </p>
            <p>
              Encontre <strong>apartamentos à venda</strong> nos bairros mais valorizados:{" "}
              <Link to={prefixLink("/apartamentos-moinhos-de-vento")} className="text-primary hover:underline">Moinhos de Vento</Link>,{" "}
              <Link to={prefixLink("/apartamentos-petropolis")} className="text-primary hover:underline">Petrópolis</Link>,{" "}
              <Link to={prefixLink("/apartamentos-bela-vista")} className="text-primary hover:underline">Bela Vista</Link>,{" "}
              <Link to={prefixLink("/apartamentos-tres-figueiras")} className="text-primary hover:underline">Três Figueiras</Link>,{" "}
              <Link to={prefixLink("/apartamentos-auxiliadora")} className="text-primary hover:underline">Auxiliadora</Link>,{" "}
              <Link to={prefixLink("/apartamentos-montserrat")} className="text-primary hover:underline">Mont'Serrat</Link> e{" "}
              <Link to={prefixLink("/apartamentos-boa-vista")} className="text-primary hover:underline">Boa Vista</Link>.
              Cada bairro oferece perfil único de moradia — compare preços e infraestrutura na nossa{" "}
              <Link to={prefixLink("/bairros")} className="text-primary hover:underline">página de bairros</Link>.
            </p>
            <p>
              Filtre por faixa de preço:{" "}
              <Link to={prefixLink("/apartamentos-ate-300-mil-porto-alegre")} className="text-primary hover:underline">até R$ 300 mil</Link>,{" "}
              <Link to={prefixLink("/apartamentos-ate-500-mil-porto-alegre")} className="text-primary hover:underline">até R$ 500 mil</Link>,{" "}
              <Link to={prefixLink("/apartamentos-ate-800-mil-porto-alegre")} className="text-primary hover:underline">até R$ 800 mil</Link> ou{" "}
              <Link to={prefixLink("/imoveis-de-luxo-porto-alegre")} className="text-primary hover:underline">imóveis de luxo</Link>.
              Busque por dormitórios:{" "}
              <Link to={prefixLink("/apartamentos-2-quartos-porto-alegre")} className="text-primary hover:underline">2 quartos</Link>,{" "}
              <Link to={prefixLink("/apartamentos-3-quartos-porto-alegre")} className="text-primary hover:underline">3 quartos</Link> ou{" "}
              <Link to={prefixLink("/casas-4-quartos-porto-alegre")} className="text-primary hover:underline">casas 4 quartos</Link>.
              Confira também nossos{" "}
              <Link to={prefixLink("/condominios")} className="text-primary hover:underline">condomínios em Porto Alegre</Link> e{" "}
              <Link to={prefixLink("/lancamentos-porto-alegre")} className="text-primary hover:underline">lançamentos imobiliários</Link>.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
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
            <nav aria-label="Imóveis">
              <h3 className="font-body text-sm font-semibold text-foreground">Imóveis</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to={prefixLink("/busca?finalidade=venda")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Comprar</Link></li>
                <li><Link to={prefixLink("/apartamentos-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Apartamentos</Link></li>
                <li><Link to={prefixLink("/casas-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Casas</Link></li>
                <li><Link to={prefixLink("/coberturas-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Coberturas</Link></li>
                <li><Link to={prefixLink("/apartamentos-ate-500-mil-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Até R$ 500 mil</Link></li>
                <li><Link to={prefixLink("/imoveis-de-luxo-porto-alegre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Imóveis de luxo</Link></li>
                <li><Link to={prefixLink("/bairros")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Bairros</Link></li>
                <li><Link to={prefixLink("/condominios")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Condomínios</Link></li>
                <li><Link to={prefixLink("/anunciar")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Anunciar imóvel</Link></li>
              </ul>
            </nav>

            <nav aria-label="Uhome">
              <h3 className="font-body text-sm font-semibold text-foreground">Uhome</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to={prefixLink("/busca?modo=ia")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Busca IA</Link></li>
                <li><Link to={prefixLink("/avaliar-imovel")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Avaliar imóvel</Link></li>
                <li><Link to={prefixLink("/faq")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Perguntas frequentes</Link></li>
                <li><Link to={prefixLink("/carreiras")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Trabalhe conosco</Link></li>
                <li><Link to={prefixLink("/blog")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Blog</Link></li>
                <li><Link to={prefixLink("/sobre")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Sobre a Uhome</Link></li>
                <li><Link to={prefixLink("/guia-bairros")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Guia de Bairros</Link></li>
                <li><Link to={prefixLink("/politica-de-privacidade")} className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground">Política de Privacidade</Link></li>
              </ul>
            </nav>

            <div>
              <h3 className="font-body text-sm font-semibold text-foreground">Contato</h3>
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
      </div>
    </footer>
  );
}
