import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCanonical } from "@/hooks/useCanonical";

const secoes = [
  {
    titulo: "Jornada e atendimento no UhomeSales",
    texto: "Com análise permitida, registramos páginas, buscas e filtros, imóveis e fotos vistos, favoritos, rolagem, interação com a LIA e pedidos de contato. Os eventos têm código de visitante e sessão, nunca nome, telefone ou e-mail. Quando você fornece contato, o UhomeSales recebe sua jornada dos últimos 90 dias, de todas as sessões deste navegador, primeira e última origem, número de visitas, imóveis vistos e pedidos de visita ou informações. Novos eventos continuam ligados ao mesmo lead. Outro pedido com o mesmo telefone soma a jornada sem criar outro contato. Recusar análise não impede o envio dos dados e do pedido necessários ao atendimento, mas interrompe a jornada comportamental futura. Dados já enviados podem ser objeto dos seus direitos de acesso e exclusão.",
  },
  {
    titulo: "Medição de visitas pela Lovable",
    texto: "A medição da Lovable não usa cookies, não armazena nada no seu dispositivo, não conserva endereços IP e não identifica visitantes. Registra páginas visitadas, origem, país, navegador, sistema operacional, dispositivo, tempo de permanência, velocidade e erros. Na União Europeia e EEE, Reino Unido, Suíça, Canadá e locais não identificados, cliques aguardam a aceitação de análise; fora desses locais são medidos salvo recusa. Global Privacy Control impede cliques mesmo após aceitação. Visitas, tempo, velocidade e erros são registrados para todos os visitantes sem cookies e sem identificação. As escolhas ficam no navegador por até 12 meses. Dados detalhados ficam por 90 dias e resumos diários por um ano. A Lovable coleta esses dados para nós. Sua política de privacidade explica como os trata.",
  },
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
      "Seus dados podem ser compartilhados com corretores parceiros da Uhome Imóveis para atendimento ao seu interesse, e com prestadores de serviço tecnológicos necessários para operação da plataforma (hospedagem, analytics). Quando a publicidade é permitida, Google Analytics e Google Ads recebem eventos e identificadores de cliques de anúncios para medir campanhas. Se o Pixel da Meta estiver configurado, a Meta recebe os eventos publicitários permitidos. Não enviamos nome, telefone ou e-mail nesses eventos.",
  },
  {
    titulo: "4. Cookies",
    texto:
      "Com análise permitida, usamos o cookie primário uhs_vid por 13 meses, com cópia no localStorage, para unir as visitas deste navegador. Os cookies uhs_first e uhs_last guardam a primeira e a última origem: UTMs, referrer, página de entrada e, quando publicidade é permitida, gclid, gbraid, wbraid e fbclid. A primeira origem não é sobrescrita. Uma sessão muda após 30 minutos de inatividade. Recusar análise impede novos registros comportamentais e remove esses identificadores do navegador, sem impedir seu contato. Você pode mudar suas escolhas em Configurações de cookies; o sinal Global Privacy Control é respeitado. Login, favoritos e preferências necessários ao serviço podem usar armazenamento próprio.",
  },
  {
    titulo: "5. Seus direitos (LGPD)",
    texto:
      "Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato: lucas@uhome.imb.br",
  },
  {
    titulo: "6. Retenção de dados",
    texto:
      "Mantemos seus dados pelo tempo necessário para prestação dos serviços ou cumprimento de obrigações legais. A jornada enviada ao atendimento abrange os eventos dos últimos 90 dias; os registros de contato são mantidos pelo tempo necessário ao atendimento e às obrigações legais.",
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
                {s.titulo === "Medição de visitas pela Lovable" && <> <a href="https://lovable.dev/privacy" className="underline">Política de privacidade da Lovable</a>.</>}
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
