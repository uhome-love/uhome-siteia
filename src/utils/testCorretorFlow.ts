/**
 * Dev-only test utility for the corretor link system.
 * Run window.testCorretorFlow() in the browser console.
 */
export function setupCorretorFlowTest() {
  if (import.meta.env.PROD) return;

  (window as any).testCorretorFlow = async () => {
    console.group("🔗 Teste do Sistema de Links de Corretor");

    // 1. Verificar funções de session.ts
    const { getCorretorRef, getCorretorRefId } =
      await import("@/lib/session");

    console.log("🔧 Funções session.ts:");
    console.table({
      getCorretorRef: getCorretorRef(),
      getCorretorRefId: getCorretorRefId(),
    });

    // 2. Verificar WhatsApp URL
    const { buildWhatsAppUrl } = await import("@/lib/whatsapp");
    const url = buildWhatsAppUrl();
    const urlImovel = buildWhatsAppUrl(undefined, {
      titulo: "Apartamento Teste",
      bairro: "Moinhos de Vento",
      slug: "apto-teste",
    });
    console.log("\n📱 WhatsApp URLs:");
    console.log("Simples:", decodeURIComponent(url));
    console.log("Com imóvel:", decodeURIComponent(urlImovel));

    // 3. Verificar BannerCorretor
    const banner = document.querySelector('[data-testid="banner-corretor"]');
    console.log(
      "\n🏷️ Banner corretor:",
      banner ? "✅ Visível" : "❌ Não encontrado"
    );

    // 4. Verificar prefixLink no Context
    console.log("\n🌐 URL atual:", window.location.pathname);
    console.log(
      "Tem /c/:slug na URL:",
      window.location.pathname.startsWith("/c/") ? "✅ SIM" : "❌ NÃO"
    );

    // 5. Verificar links da Navbar
    const navLinks = document.querySelectorAll("nav a[href]");
    const corretorLinks = Array.from(navLinks).filter((a) =>
      (a as HTMLAnchorElement).getAttribute("href")?.startsWith("/c/")
    );
    console.log(
      `\n🔗 Links da Navbar com /c/: ${corretorLinks.length}/${navLinks.length}`
    );

    console.groupEnd();
  };

  console.log("✅ testCorretorFlow() disponível no console");
}
