# Melhorias visuais: Home, Natal Chave de Ouro e páginas de produto

## O que vi nos prints
- **Home:** a abertura está boa, mas o cartão de busca é alto e "pesado", o selo do Natal fica perdido embaixo do texto e a foto não tem movimento nenhum. O WhatsApp cobre parte da faixa de luzes.
- **Natal:** o título é forte, mas o contador mostra "40 dias / 0 horas" (parece quebrado), o lado direito fica vazio até o Homi, e há muito espaço sem conteúdo antes dos produtos.
- **Produto (Open Bosque):** o botão principal é azul Uhome enquanto a página é de campanha de Natal (cores misturadas); o cartão "Situação" corta o texto; o WhatsApp flutuante cobre o formulário; a foto principal fica parada e escura demais.

## 1. Base visual comum (vale para as 3 páginas)
- Animação de entrada suave nos blocos ao rolar (sobe 16px + aparece), uma vez só, desligada para quem prefere menos movimento.
- Imagens com carregamento progressivo (fundo desfocado → foto nítida), sem "pulos" de layout.
- Rolagem suave nas âncoras, carrosséis com encaixe (snap) e setas no desktop, arrastar no celular.
- Botões com micro-interação (leve elevação e brilho ao passar o mouse, pressão ao tocar).
- Transição suave entre páginas (já existe a base; aplicar na abertura de produto a partir dos cards, com a foto "crescendo").
- Espaçamentos e larguras únicos para todas as seções (mesma margem lateral do banner).

## 2. Home
- Abertura: foto com leve zoom lento (efeito "Ken Burns") e escurecimento melhor no lado do texto; cartão de busca mais compacto (quartos dentro de um seletor, botão menor).
- Selo do Natal vira um destaque elegante acima do título ("Natal Chave de Ouro · faltam 40 dias") com brilho dourado sutil.
- Números de confiança logo abaixo da abertura numa faixa fina: 21.400+ imóveis · nota 4,9 no Google · 25 corretores.
- Banner do Natal com luzes animadas piscando devagar e cards de produto com zoom leve na foto ao passar o mouse.
- Bairros e avaliações com o mesmo estilo de card (cantos, sombra, tipografia).

## 3. Natal Chave de Ouro
- Contador completo e vivo: dias, horas, minutos, segundos (some o "0 horas" estranho).
- Homi entra com animação (flutuando de leve) e o lado direito ganha o selo e partículas douradas discretas caindo como neve.
- Faixa "Como funciona a urna premiada" em 3 ícones curtos, logo depois da abertura.
- Filtros de produto (cidade, faixa de preço, entrega) fixos no topo ao rolar.
- Cards dos 10 produtos maiores, com preço, entrega e logo da construtora, e entrada em sequência.
- Barra fixa no celular com "Quero as condições de Natal".

## 4. Página de cada produto
- Cores da campanha enquanto o Natal estiver ativo: botão principal dourado, selo vermelho/dourado; fora do Natal volta ao azul Uhome automaticamente.
- Foto principal com leve movimento ao rolar (parallax) e galeria em tela cheia com deslizar e miniaturas.
- Cartões de informação (Tipo, Entrega, Bairro, Situação) sem cortes de texto, em grade que se ajusta.
- Menu de seções fixo ao rolar: Visão geral · Plantas · Lazer · Localização · Condições.
- Formulário fixo na lateral no desktop; no celular, barra fixa embaixo com WhatsApp e "Quero as condições". O WhatsApp flutuante deixa de cobrir o formulário.
- Mapa e bairro com pontos próximos (quando houver dados na ficha).
- Bloco "Outros produtos do Natal" no final.

## 5. Desempenho e qualidade
- Fotos em tamanho certo para cada tela, primeira foto com prioridade, demais só quando aparecem.
- Animações só com transformações leves (sem travar celular), meta de nota alta no teste de velocidade do Google.
- Acessibilidade: contraste do dourado sobre azul revisado, textos alternativos, foco visível no teclado.

## Validação
- Testar Home, Natal e 3 produtos no desktop e celular com capturas antes/depois, conferir velocidade e erros, e rodar os testes existentes.

## Detalhes técnicos
- Animações via um hook `useReveal` (IntersectionObserver) + classes CSS com tokens; nenhuma biblioteca pesada nova.
- Cores de campanha por tokens `--natal-*` já existentes, condicionadas a `useCampanhaDestaque`.
- Contador com `setInterval` de 1s, fuso America/Sao_Paulo, sem mudar a lógica de datas em `produtosFoco.ts`.
- `FloatingWhatsApp` oculto também no desktop das páginas de produto (substituído pelo formulário fixo).
