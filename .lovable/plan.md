# Tela de carregamento com a marca Uhome

## O que acontece hoje
Enquanto o site carrega, aparece por um instante um texto simples sem estilo (título, parágrafos e links azuis sublinhados). Esse texto está lá para o Google, mas o visitante também vê. Ele ainda fala em "14.600 imóveis", um número desatualizado.

## Minha sugestão: tela de abertura da marca, rápida e leve
- **Fundo claro da Uhome**, com o **logo Uhome no centro**, um leve "respirar" (o logo cresce e diminui bem devagar) e uma **barra fina de progresso** em azul Uhome logo abaixo.
- **Sem a palavra "Carregando"**: só o logo e a barra, como fazem Airbnb e QuintoAndar.
- **Transição suave:** quando o site fica pronto, a tela some devagar e a página aparece, sem tranco.
- **Navegar entre páginas:** dentro do site não aparece tela cheia. Fica uma barra fina no topo, abaixo do menu, junto com os blocos cinza de prévia que já existem.
- **Instantâneo em conexão rápida:** se o site abrir em menos de 0,3 segundo, a tela nem aparece, para não piscar.
- **Google continua lendo o texto:** o conteúdo para o Google fica, mas escondido do visitante. Atualizo o número de imóveis para o real ("21.000+").
- **Funciona igual no computador e no celular**, e respeita quem pede menos animação no celular.

## Detalhes técnicos
- `index.html`: splash inline (CSS e SVG do logo embutidos, sem depender do JS nem de fontes) dentro de `#root`, para que o React substitua no `createRoot`. O texto de SEO passa para um bloco visualmente oculto (`sr-only`), sem `display:none`.
- Animação só com CSS (`@keyframes` de escala/opacidade e barra indeterminada), `animation-delay: 300ms` para não aparecer em cargas rápidas e `prefers-reduced-motion`.
- Fade-out: em `main.tsx`, marcar `document.documentElement.dataset.ready` após o primeiro render; o splash fica num overlay fixo fora do `#root`, recebe opacity 0 e é removido após 250ms.
- `PageFallback`: trocar o retângulo pulsante do topo por uma barra de progresso indeterminada fina sob o navbar; manter os skeletons de cards.
- Validar com Playwright usando rede lenta (throttling) no desktop e no mobile: splash visível, sem texto cru, transição sem salto de layout.
