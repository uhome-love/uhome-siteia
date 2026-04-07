

## Auditoria Completa de UX e Qualidade do Site Uhome

### Resumo da Analise

Revisei a home, busca, detalhe do imovel, navbar, footer e todos os componentes de captura de lead. O site ja esta bem estruturado com lazy loading, code splitting e design responsivo. Abaixo estao os problemas encontrados e as correcoes propostas, organizadas por prioridade.

---

### PROBLEMAS CRITICOS (Impacto direto em conversao)

**1. Acessibilidade: botoes sem aria-label**
- Botoes de compartilhar, favoritar, fechar lightbox, e navegacao de fotos no PropertyDetail nao tem `aria-label`
- Botoes de aba no HeroSection nao tem `aria-label`
- Impacto: leitores de tela nao conseguem identificar acoes

**2. Navegacao por teclado deficiente**
- Lightbox de fotos (PropertyDetail) nao captura teclas Escape/setas para fechar/navegar
- Dropdown de bairros no Hero nao suporta navegacao por setas (up/down)
- Focus trap ausente em modais (lightbox, ExitIntentModal)

**3. Hero card: toggle de 3 abas nao cabe no mobile**
- Com viewport 440px, os 3 botoes "Buscar imoveis", "Busca IA", "Anunciar imovel" podem quebrar ou ficar apertados
- Correcao: reduzir texto no mobile ou usar scroll horizontal

---

### PROBLEMAS DE UX (Visitante sai sem tomar acao)

**4. Home: ordem das secoes nao e otima**
- Ordem atual: Empreendimentos > Bairros > Imoveis > SEO Links > FAQ > PorQueUhome
- O "PorQueUhome" (proposta de valor) aparece por ultimo, depois do FAQ. Deveria aparecer antes para gerar confianca antes dos CTAs
- Correcao: mover PorQueUhome para logo apos os imoveis em destaque

**5. Footer: bloco SEO pesado demais**
- 3 colunas de texto denso no topo do footer. Visitante nao le. Ocupa espaco visual sem beneficio UX
- Correcao: colapsar em accordion ou reduzir tamanho do texto

**6. PropertyDetail: sidebar de lead some no mobile**
- A LeadSidebar, AgendamentoVisita e CardUhomePreco ficam empilhados abaixo de todo o conteudo no mobile. O usuario precisa rolar muito para ve-los
- O botao sticky mobile (WhatsApp) ja mitiga isso, mas a opcao de agendar visita fica enterrada
- Correcao: adicionar botao secundario "Agendar visita" no sticky bar mobile, ou um mini-CTA flutuante

**7. Pagina de busca: sem feedback quando 0 resultados na IA**
- Quando a busca IA retorna zero, o usuario ve a lista vazia sem explicacao clara
- Correcao: mensagem amigavel "Nenhum imovel encontrado para essa busca. Tente termos diferentes."

---

### PROBLEMAS DE PERFORMANCE

**8. Framer Motion em secoes below-fold**
- FeaturedNeighborhoods, FeaturedProperties, EmpreendimentosDestaque, HomeFaqSection, PorQueUhome usam `motion.div` com `whileInView`
- Cada um importa framer-motion, adicionando ao bundle
- Correcao: substituir por CSS `@keyframes` + `IntersectionObserver` nativo (como ja feito no Hero)

**9. FeaturedProperties e EmpreendimentosDestaque usam useEffect + setState sem React Query**
- Nao tem cache, toda navegacao de volta refaz a query
- Correcao: migrar para useQuery com staleTime generoso

**10. Imagens no FeaturedNeighborhoods/Properties sem lazy loading explicito**
- Cards de bairros e imoveis carregam imagens eager por padrao
- Correcao: adicionar `loading="lazy"` nas imagens below-fold

---

### PROBLEMAS DE RESPONSIVIDADE

**11. Hero card width no tablet (768-1024px)**
- No tablet, o card Hero tem `max-w-md` (~448px) mas fica pequeno demais com o layout `lg:flex-row`
- O breakpoint `lg` (1024px) faz com que entre 768-1023px o layout fique vertical com o card centralizado sem ocupar largura util
- Correcao: ajustar `max-w-md` para `max-w-lg` ou `sm:max-w-md md:max-w-lg`

**12. Navbar: links do menu mobile faltam link para "Bairros" e "Condominios"**
- Desktop tem apenas "Comprar", "Busca IA", "Quanto vale meu imovel?", "Ajuda"
- Mobile tem "Bairros" e "Condominios" extras, mas desktop nao
- Isso e intencional mas pode confundir: usuario desktop nao ve como chegar em bairros facilmente

**13. SeoLinksSection: 4 colunas ficam espremidas no tablet**
- Grid `sm:grid-cols-2 lg:grid-cols-4` pula de 2 para 4 sem estagio intermediario
- Correcao: adicionar `md:grid-cols-3`

---

### PROBLEMAS MENORES

**14. Link "Descobrir o valor do meu imovel" no Hero (aba anunciar) nao usa prefixLink**
- Linha 483: `<Link to="/avaliar-imovel"` hardcoded sem `prefixLink()`, quebra em rotas de corretor `/c/:slug`
- Correcao: `<Link to={prefixLink("/avaliar-imovel")}`

**15. Breadcrumbs no PropertyDetail: links sem prefixLink**
- Linhas 467-469: `<Link to="/busca">` e `<Link to={\`/busca?bairro=...\`}>` hardcoded
- Correcao: usar `prefixLink()`

**16. PropertyDetail: funcao inline complexa para extrair codigo**
- Linha 464: IIFE `(() => { const parts = ... })()` dentro do JSX. Dificil de ler e manter
- Correcao: extrair para funcao `extractPropertyCode(slug)`

**17. ExitIntentModal: timer de 60s e muito longo para mobile**
- Mobile nao tem evento `mouseleave` (mouse saindo da janela), entao o exit intent nunca dispara no mobile
- Correcao: adicionar trigger por scroll-up rapido ou inatividade no mobile

---

### PLANO DE IMPLEMENTACAO

Organizei em 3 fases por prioridade:

**Fase 1 — Correcoes rapidas (sem risco de quebra)**
1. Adicionar `aria-label` em todos os botoes interativos sem texto visivel
2. Corrigir links sem `prefixLink()` (Hero anunciar + PropertyDetail breadcrumbs)
3. Adicionar `loading="lazy"` em imagens below-fold
4. Extrair funcao `extractPropertyCode()` do JSX inline
5. Adicionar keyboard handling no lightbox (Escape, setas)
6. Ajustar Hero toggle para nao quebrar no mobile (texto menor ou scroll)

**Fase 2 — Melhorias de UX**
7. Reordenar secoes da home: mover PorQueUhome antes do FAQ
8. Adicionar mensagem de "nenhum resultado" na busca IA
9. Adicionar grid intermediario (`md:grid-cols-3`) no SeoLinksSection
10. Melhorar responsividade do Hero card no tablet

**Fase 3 — Performance**
11. Migrar FeaturedProperties e EmpreendimentosDestaque para useQuery
12. Substituir Framer Motion por CSS animations nas secoes below-fold (reducao de bundle)

### Arquivos modificados
- `src/components/HeroSection.tsx` (aria-labels, mobile toggle, prefixLink)
- `src/pages/PropertyDetail.tsx` (aria-labels, keyboard, prefixLink, extract function)
- `src/pages/Index.tsx` (reordenar secoes)
- `src/components/SeoLinksSection.tsx` (grid responsivo)
- `src/components/FeaturedProperties.tsx` (lazy images, useQuery)
- `src/components/FeaturedNeighborhoods.tsx` (lazy images)
- `src/components/EmpreendimentosDestaque.tsx` (useQuery)
- `src/pages/Search.tsx` (mensagem zero resultados IA)

