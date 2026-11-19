# Página de Natal objetiva + revisão completa no celular

## 1. Página de Natal (padrão Airbnb)
- **Topo:** sai a faixa Imóveis / Lançamentos / Investir no celular. Ela sai também de todas as outras páginas, como já foi feito no computador. Fica só o logo, a busca e os filtros.
- **Cabeçalho curto:**
  - selo pequeno e título "Natal Chave de Ouro";
  - uma linha: "Condições especiais e presente na urna até 18/12";
  - contador "Faltam X dias".
- **Saem do cabeçalho:** o texto longo e os botões "Agendar visita" e "Receber informações", porque já estão na barra fixa embaixo.
- **Imóveis logo em seguida:**
  - filtros de cidade e preço em pílulas que deslizam para o lado;
  - lista de empreendimentos em cards grandes (foto, nome, bairro, "a partir de");
  - tocar no card abre a página do empreendimento.
- **Abaixo da lista, compacto:**
  - as 3 vantagens viram uma faixa pequena;
  - comparador, formulário de contato e perguntas frequentes ficam como estão, mais baixo na página.
- **Barra fixa embaixo:** fica "Agendar visita" e "Informações". O botão "Informações" passa a ficar legível, porque hoje está apagado.
- **Link do corretor:** continua igual, com o card do corretor e o WhatsApp.

## 2. Revisão ponta a ponta no celular (360, 390, 430) e no computador (1440)
- **Home:** busca, categorias, faixas deslizando, setas das fotos, bairros, Natal e "Ver todos".
- **Busca:**
  - título;
  - chips;
  - todos os filtros: onde, tipo (vários), preço (as duas bolinhas), quartos, área, etapa, comodidades;
  - contagem do botão igual ao resultado;
  - ordenar, "Mostrar mais", limpar.
- **Mapa:** abrir, mover, tocar no preço, card com salvar/fechar, gaveta e voltar à lista.
- **Página do imóvel:**
  - galeria por toque;
  - mapa;
  - "Agendar visita";
  - "Receber informações": abrir o formulário e conferir que ele aparece, sem enviar, conforme a regra de não criar leads de teste;
  - compartilhar, salvar, voltar.
- **Lançamentos (/em-foco) e páginas de produto:** cards, galeria, agendar.
- **Favoritos.**
- Em todas as páginas confiro:
  - nada sai da largura da tela;
  - nada fica escondido atrás das barras fixas;
  - botões com pelo menos 44 px;
  - links que abrem;
  - erros no console.
- Corrijo o que falhar e mostro as fotos de cada tela.

## 3. Teste de velocidade
- Uso os dados reais de visitantes (LCP, FCP, CLS, INP no celular) por página: Home, busca, imóvel, Natal.
- Faço também uma medição no laboratório do celular simulado, antes e depois das mudanças.
- Trago o resultado com o que estiver acima do limite do Google e o que dá para melhorar.

## Detalhes técnicos
- `Navbar` / CSS: esconder `.uhs-mobile-tabs` abaixo de 1024px em todas as rotas. As abas continuam no menu e na barra inferior `SiteBottomBar`.
- `CampanhaPage`:
  - o hero fica com o `py` reduzido, `h1` `text-3xl` no celular e os botões do hero visíveis só em `lg`;
  - filtros com `select` trocados por pílulas com `aria-pressed`;
  - a seção de vantagens vai para depois da lista;
  - `irContato` continua na barra.
- O botão "Informações" da barra ganha `text-natal-foreground border-natal-gold/40`, com tokens de contraste.
- A `ssr-render` da `/campanha/:slug` não muda. Se o molde da primeira tela da campanha usar o hero antigo, atualizo o molde na `site-dobra` para não haver troca visual.
- Velocidade: `web_vitals` via user-app-events (p75 por `url_path`, mínimo de 30 leituras) e Playwright com CPU 4x mais lenta e rede 4G.
