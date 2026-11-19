# Raio-X Airbnb: o que ainda falta fazer

O documento foi escrito sem acesso ao site (ele usou uma cópia do CRM). Conferi o site atual: boa parte dos "gaps" já está pronta, como preço em pílula no mapa, busca ao mover ligada, histograma de preço, contagem ao vivo no botão, gaveta de 3 posições, busca em etapas no celular, fotos 1+4 e botão fixo de agendar. O plano abaixo cobre só o que ainda falta e respeita as regras do projeto.

## Fica de fora, por regra já combinada
- Nota do Google, número de corretores e "N pessoas viram": proibidos na vitrine.
- Parcela estimada e simulação: o simulador foi tirado por falta de uso.
- Cloudflare e liberação de robôs de IA: isso fica fora do site, e eu não tenho acesso.

## 1. Títulos com erro (confirmado no banco)
- Imóveis aparecem como "Casa_condominio 3 quartos — Centro". Esses títulos passam a mostrar "Casa em condomínio" na página, no card, na aba do navegador, na prévia do WhatsApp e no Google.
- Corrijo na origem (na sincronização e nos imóveis já salvos), para não precisar remendar em cada tela.

## 2. Mapa com pontos de referência
- Hoje os pontos de referência ficam escondidos. Volto a mostrar só os úteis para quem compra imóvel: escolas, mercados, parques, hospitais e transporte, em tom discreto como no Airbnb. Restaurantes e lojas continuam ocultos.

## 3. Pino acompanha o card
- Ao passar o mouse num card, o preço no mapa fica escuro e cresce um pouco, com animação suave (hoje ele só muda de cor).

## 4. Acabamento de movimento
- Uma curva única de animação no site inteiro (painéis, gaveta, mini card).
- Cards, botões e pílulas afundam levemente ao toque, como no Airbnb.
- Respeita o "reduzir movimento" do celular.

## 5. Card do imóvel
- Linha de chips curtos quando houver o dado: "Pronto para morar", "Na planta", "Aceita financiamento", "Com vaga".
- O preço continua em destaque. Condomínio e IPTU aparecem só na página do imóvel.

## 6. Página do imóvel no computador
- Faixa de atalhos no topo (Fotos, Detalhes, Localização) que mostra o preço e o botão "Agendar visita" quando o cartão lateral sai da tela.

## 7. Revisão final
- Teste em 360, 390, 430 e 1440 px: busca, mapa, filtros, página do imóvel e Home.
- Velocidade medida antes e depois: no celular a carga principal da página (LCP) deve ficar abaixo de 2,5 s e o pulo de layout (CLS) abaixo de 0,05.

## Detalhes técnicos
- Títulos: migration para atualizar `imoveis.titulo` (substituir `Casa_condominio` por `Casa em condomínio` e tratar outros tipos com `_`), mais ajuste no montador de título do `jetimob-sync`. Também uma proteção na exibição (`rotuloTipo`) e um teste.
- Mapa (`src/components/SearchMap.tsx`): no `style.load`, manter visíveis só as camadas `poi-label` filtradas por classe (education, grocery, park, medical) e `transit-label`, com opacidade menor. As outras continuam ocultas.
- Pino: `icon-size` com transição pelo estado de hover (`feature-state`) e `icon-size-transition` em 200 ms.
- Tokens `--ease-padrao: cubic-bezier(.2,0,0,1)` e `--dur-curta: 200ms` no `index.css`, `:active{transform:scale(.97)}` em cards e pílulas, e bloco `prefers-reduced-motion`.
- Chips do card: derivados de `fase`, `vagas` e `aceita_financiamento` (se a coluna existir; senão fica fora).
- Barra de âncoras: IntersectionObserver no cartão lateral do `PropertyDetail`.
