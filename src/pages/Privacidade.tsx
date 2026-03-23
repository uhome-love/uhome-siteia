import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";

const secoes = [
  {
    titulo: "1. Informações que coletamos",
    texto:
      "Coletamos informações que você nos fornece diretamente, como nome, telefone e e-mail ao preencher formulários de contato ou cadastro. Também coletamos automaticamente dados de navegação como páginas visitadas, imóveis visualizados e tempo de sessão para melhorar sua experiência.",
  },
  {
    titulo: "2. Como usamos suas informações",
    texto:
      "Usamos suas informações para conectar você com corretores especializados, enviar informações sobre imóveis de seu interesse, melhorar nossos serviços e cumprir obrigações legais. Não vendemos seus dados a terceiros.",
  },
  {
    titulo: "3. Compartilhamento de dados",
    texto:
      "Seus dados podem ser compartilhados com corretores parceiros da Uhome Imóveis para atendimento ao seu interesse, e com prestadores de serviço tecnológicos necessários para operação da plataforma (hospedagem, analytics). Nunca compartilhamos com terceiros para fins publicitários.",
  },
  {
    titulo: "4. Cookies",
    texto:
      "Utilizamos cookies para manter sua sessão ativa, salvar preferências de busca e imóveis favoritos, e mensurar o desempenho do site via Google Analytics. Você pode desabilitar cookies nas configurações do seu navegador.",
  },
  {
    titulo: "5. Seus direitos (LGPD)",
    texto:
      "Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato: lucas@uhome.imb.br",
  },
  {
    titulo: "6. Retenção de dados",
    texto:
      "Mantemos seus dados pelo tempo necessário para prestação dos serviços ou cumprimento de obrigações legais. Leads não convertidos são excluídos após 24 meses.",
  },
  {
    titulo: "7. Contato",
    texto:
      "Dúvidas sobre esta política: lucas@uhome.imb.br | Uhome Imóveis LTDA | Porto Alegre, RS | CRECI-RS 25682J",
  },
];

const Privacidade = () => {
  useCanonical("/politica-de-privacidade");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <h1 className="font-body text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="mt-10 space-y-8">
          {secoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="font-body text-base font-bold text-foreground">
                {s.titulo}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                {s.texto}
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacidade;
