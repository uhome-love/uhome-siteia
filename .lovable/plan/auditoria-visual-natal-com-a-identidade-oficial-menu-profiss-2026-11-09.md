# Auditoria visual + Natal com a identidade oficial + menu profissional

## 1. Menu do topo (desktop e celular)
Hoje: "Ajuda" fica embaixo de "Anuncie seu imóvel", são 7 itens com estilos diferentes e há botões repetidos.

Novo menu, limpo e alinhado:
```text
[Logo]   Comprar   Busca IA   Natal Chave de Ouro*   Mais v        [Anunciar imóvel]  [Entrar]
```
- *Durante o Natal (até 18/12) aparece "Natal Chave de Ouro". Depois some sozinho e aparece "Uhome em Foco".
- "Mais" abre um menu com: Quanto vale meu imóvel, Bairros, Blog, Ajuda.
- À direita só 2 botões: "Anunciar imóvel" (contorno) e "Entrar" (cheio, azul da marca).
- Telas médias (notebook pequeno): os itens recolhem no "Mais" antes de encostar um no outro.
- Celular: logo + "Entrar" + botão de menu. O menu lateral fica organizado em grupos (Buscar, Natal, Para proprietários, Conta).

## 2. Abertura da Home
- Tirar o botão duplicado "Uhome em Foco". Durante o Natal fica um único botão, "Natal Chave de Ouro", no visual da campanha. Depois de 18/12 ele vira "Uhome em Foco".
- Tirar a aba "Anunciar imóvel" do quadro de busca (já fica no menu). O quadro fica só com Buscar imóveis e Busca IA.
- Conferir o espaçamento entre título, texto e botões.

## 3. Natal Chave de Ouro na identidade oficial do ZIP
Hoje as páginas estão em verde-escuro, que não é a identidade. Vamos trocar para o que vocês criaram:
- Azul-noite #0D1340 (fundo), dourado #D4AF37 com degradê dourado, vermelho #A8202A, creme #FAF5EA. Botões principais continuam no azul da marca #5271FF.
- Títulos e números grandes em Montserrat.
- Elementos oficiais: faixa de luzes no topo da campanha, chave de ouro, selo "Natal Chave de Ouro", estrela, urna premiada, Homi de Natal, presentes, árvore, sino e bolas em 3D, neve leve.
- Onde aplicar: banner da Home, página da campanha, páginas dos produtos durante o Natal e o Black Natal (23 a 29/11).

## 4. Uma página só para o Natal
- Durante o Natal, /em-foco, /lancamentos e /destaques levam direto para a página do Natal, e os produtos mostram o selo do Natal.
- Depois de 18/12, a página do Natal sai do ar e /em-foco volta como "Uhome em Foco" no visual normal da Uhome, nos outros meses.
- Tudo muda sozinho pela data, sem precisar mexer.

## 5. Auditoria visual página por página
Abrir no computador (1440, 1280, 1024) e no celular (390, 360) e corrigir textos sobrepostos, botões desalinhados, cortes e espaços:
Home, busca com mapa, página do imóvel, Natal, produto em campanha, link do corretor, Quanto vale meu imóvel, Anunciar, Entrar, favoritos, rodapé.
- Celular: botões de ação fixos sem cobrir o WhatsApp, área de toque confortável, nada saindo da tela.
- Entregar fotos de antes e depois de cada página.

## Detalhes técnicos
- Navbar.tsx reescrito com o dropdown "Mais" (shadcn DropdownMenu), recolhimento por breakpoint e Sheet no mobile; links da campanha via `isCampanhaAtiva` de produtosFoco.ts.
- Tokens `--natal-*` em index.css redefinidos para os valores do ZIP (HSL); fonte Montserrat como `font-natal` no tailwind.
- SVG/PNG do ZIP subidos como Lovable Assets.
- Redirecionamento de /em-foco para /campanha/natal-chave-de-ouro condicionado à data, mantendo também as versões /c/:corretor.
- HeroSection: remover aba Anunciar e botão duplicado.
- Validação com Playwright nos tamanhos citados, sem erros de console; testes existentes rodados.
