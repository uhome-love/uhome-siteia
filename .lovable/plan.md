# Página do imóvel no padrão Airbnb e busca no topo em todo o site

## Comparação (Uhome hoje x Airbnb)
| Ponto | Uhome hoje | Airbnb |
|---|---|---|
| Topo | Mostra "Imóveis · Lançamentos · Investir" (a busca só aparece ao rolar) | Busca em pílula sempre no topo |
| Largura | Página ocupa a tela toda, fotos gigantes | Conteúdo centralizado, cerca de 1120 px |
| Título | Abaixo das fotos, depois de "Voltar" e do caminho de páginas | Acima das fotos, com Compartilhar e Salvar ao lado |
| Fotos | Botão "Ver todas" solto abaixo da grade | Botão "Mostrar todas as fotos" sobre a grade, no canto |
| Navegação | Nenhuma | Ao rolar, faixa fixa com Fotos · Comodidades · Localização, e à direita o preço e o botão principal |
| Destaques | Selos soltos ("Venda", "1 pessoa viu hoje") | 3 destaques com ícone e texto curto |
| Cartão lateral | Preço e botão, sem moldura | Cartão com sombra, fixo ao rolar |
| Semelhantes | Lista sem setas | Fileira com contador "1/2" e setas |
| Rodapé | Faixa "Imóveis à venda… Saiba mais" solta e links muito espaçados | Caminho de páginas e colunas compactas |

## 1. Busca no topo em todo o site
- No computador, a pílula curta (Qualquer lugar · Qualquer tipo · Qualquer valor + lupa) substitui "Imóveis · Lançamentos · Investir" em todas as páginas, inclusive na do imóvel.
- Nas páginas de busca, a pílula abre os Filtros. Nas outras páginas, abre a busca em tela cheia.
- Na Home, a pílula grande continua no meio da página. Ao rolar, a pílula curta aparece no topo.
- Imóveis, Lançamentos e Investir continuam no menu ☰ e na faixa de abas do celular.

## 2. Página do imóvel
- Conteúdo centralizado com largura máxima de 1120 px.
- Título, bairro e cidade acima das fotos, com os botões Compartilhar e Salvar (coração com o painel de pastas) à direita.
- Grade 1+4 com cantos de 12 px, botão "Mostrar todas as fotos" sobre a grade e escurecimento leve ao passar o mouse em cada foto.
- **Faixa fixa ao rolar**, depois das fotos: Fotos · Detalhes · Comodidades · Localização. À direita, o preço e o botão "Agendar visita" quando o cartão lateral sai da tela.
- Logo abaixo do título, uma linha cinza com "3 quartos · 2 banheiros · 1 vaga · 83 m²".
- **3 destaques com ícone**, montados a partir dos dados do imóvel: por exemplo "Pronto para morar", "Aceita pet" e "Vista panorâmica". Só aparece o que for verdadeiro.
- Descrição com "Mostrar mais", comodidades em duas colunas com ícone e "Mostrar todas as N comodidades".
- **Cartão lateral fixo** com sombra: preço, condomínio e IPTU quando existirem, "Agendar visita" em azul, "Receber informações" e o corretor.
- **Imóveis semelhantes** em fileira com setas e contador, usando o mesmo card da busca, com fotos que passam.
- **Rodapé enxuto:** caminho de páginas (Uhome › Porto Alegre › Lami) e colunas compactas. A faixa solta "Saiba mais" sai.
- No celular: fotos de ponta a ponta com contador "1/5", título e destaques abaixo, e barra fixa inferior com o preço e "Agendar visita" (já existe; só ajusto o visual).

## 3. Testes e validação
- Celular (390 px) e computador (1440 px): print do antes e do depois, lado a lado com o Airbnb.
- Busca no topo em todas as páginas: abre o painel certo e leva aos resultados.
- Página do imóvel: faixa fixa, botões das seções levando ao ponto certo, cartão lateral fixo, galeria completa, coração com o painel de pastas, Compartilhar e setas dos semelhantes.
- Agendar visita aberto até o formulário, sem enviar lead de teste.
- Medição: foto principal em até 2,5 s, tela sem pular (CLS abaixo de 0,1).

## Detalhes técnicos
- `Navbar.tsx`: a condição `(rolou || isCatalog)` passa a ser `!isHome || rolou`. O clique abre os Filtros (`uhome:abrir-filtros`) no catálogo ou `PainelBusca` nas demais páginas.
- `PropertyDetail.tsx` e componentes de detalhe: container `max-w-[1120px]`; novo `DetalheNavFixa` com IntersectionObserver na galeria e no cartão lateral; `DestaquesImovel` derivado de `fase`/`comodidades`; o cartão em `LeadSidebar` ganha `sticky top-[96px]` e sombra.
- Os semelhantes reutilizam `CatalogCard` dentro de `FaixaRolavel`. Ajuste do rodapé em `Footer.tsx`.
- Agendamento e CRM ficam inalterados. A site-dobra só muda se o molde do imóvel depender do topo; o Worker não é tocado.
