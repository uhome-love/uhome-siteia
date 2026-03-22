/**
 * Dev-only test utility for the corretor link system.
 * Run window.testCorretorFlow() in the browser console.
 */
export function setupCorretorFlowTest() {
  if (import.meta.env.PROD) return;

  (window as any).testCorretorFlow = async () => {
    console.group("🔗 Teste do Sistema de Links de Corretor");

    // 1. Verificar localStorage
    const slug =
      localStorage.getItem("uhome_corretor_ref") ||
      localStorage.getItem("corretor_ref_slug");
    const id = localStorage.getItem("corretor_ref_id");
    const nome = localStorage.getItem("corretor_ref_nome");
    const foto = localStorage.getItem("corretor_ref_foto");
    const ts = localStorage.getItem("corretor_ref_ts");

    console.log("📦 localStorage:");
    console.table({
      slug,
      id,
      nome,
      foto: foto ? foto.substring(0, 50) + "..." : null,
      ts,
      expirado: ts
        ? Date.now() - Number(ts) > 30 * 24 * 60 * 60 * 1000
          ? "⚠️ SIM"
          : "✅ NÃO"
        : "sem ts",
    });

    // 2. Verificar funções de session.ts
    const { getCorretorRef, getCorretorRefId, getCorretorRefNome } =
      await import("@/lib/session");

    console.log("\n🔧 Funções session.ts:");
    console.table({
      getCorretorRef: getCorretorRef(),
      getCorretorRefId: getCorretorRefId(),
      getCorretorRefNome: getCorretorRefNome(),
    });

    // 3. Verificar WhatsApp URL
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

    // 4. Verificar BannerCorretor
    const banner = document.querySelector('[data-testid="banner-corretor"]');
    console.log(
      "\n🏷️ Banner corretor:",
      banner ? "✅ Visível" : "❌ Não encontrado"
    );

    // 5. Verificar prefixLink no Context
    console.log("\n🌐 URL atual:", window.location.pathname);
    console.log(
      "Tem /c/:slug na URL:",
      window.location.pathname.startsWith("/c/") ? "✅ SIM" : "❌ NÃO"
    );

    // 6. Verificar links da Navbar
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
