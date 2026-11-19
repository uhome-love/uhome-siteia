# Home no celular: ícones, seção de Natal e tela que mexe para o lado

## 1. Faixa de ícones (print 1)
- Ícone e nome ficam centralizados na faixa, com o mesmo espaço em cima e embaixo, entre a linha de cima e a de baixo.
- Mantém a rolagem para o lado e o espaço que já existe abaixo da busca.

## 2. Seção de Natal (print 2)
- O título "Empreendimentos do Natal" está sendo empurrado para fora da tela pela imagem da chave, e o "Ver todos" fica por cima dele.
- Correção:
  - a chave fica pequena, ao lado do título;
  - o título quebra em duas linhas se precisar;
  - o "Ver todos" fica à direita, sem sobrepor.

## 3. Tela que desliza para o lado e corta na lateral (prints 3 e 4)
- Causa provável: o título do Natal, mais largo que a tela, deixa a página maior que o celular. O iPhone então permite arrastar para o lado e reduz o zoom ao rolar.
- Correção:
  - resolver o título (item 2);
  - travar a largura da página na largura da tela, para que nenhum elemento consiga causar isso de novo;
  - as faixas que deslizam de propósito (fotos, cards, ícones) continuam deslizando por dentro.

## Validação
- Testes em 360, 390, 430 e 440 px. Em cada largura confiro que:
  - a página não é mais larga que a tela;
  - a seção de Natal aparece inteira;
  - os ícones estão centralizados.
- Tiro fotos de cada largura para conferir.

## Detalhes técnicos
- `.home-categorias-trilho`: `align-items:center` e `padding-block` igual. Revisar o `padding-top` de 80 px para não sobrar espaço desigual.
- `HomeCampanhaBanner`:
  - a imagem da chave ganha `width`/`height` fixos e `flex-shrink-0`;
  - o `h2` ganha `min-w-0`;
  - o bloco do título fica em `flex-wrap`.
- `html, body { overflow-x: clip }` em `index.css` e no CSS inline de `index.html`, para valer antes do CSS assíncrono.
