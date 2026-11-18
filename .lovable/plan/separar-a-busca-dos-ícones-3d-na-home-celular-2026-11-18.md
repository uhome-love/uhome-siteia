# Separar a busca dos ícones 3D na Home (celular)

## Problema
No celular, a barra "Onde vai ser seu novo lar?" encosta na linha do topo, e a sombra dela cai em cima da fileira de ícones 3D (Novidades, Apartamentos garden...). Isso acontece porque o topo não tem espaço embaixo da barra e os ícones começam colados nela.

## O que vou mudar
- Deixar um respiro de 12 px embaixo da barra de busca, dentro do topo, para que a linha do topo fique abaixo da barra e da sombra.
- Descer a fileira de ícones na mesma medida, para nada ficar escondido atrás do topo.
- A tela pronta que aparece antes do site carregar recebe a mesma medida, para a página não pular ao abrir.
- Conferir em 360, 390 e 430 px que a barra, a linha e os ícones aparecem separados, sem nada sobreposto.

## Detalhes técnicos
- `index.css`: `.uhs-mobile-header` com `padding-bottom:12px` no celular, fora da busca compacta, que mantém a própria medida.
- `.home-categorias` com `padding-top` de 68 para 80 px.
- Ajustar o mesmo valor no molde da primeira dobra da Home, se ele tiver o espaçamento fixo.
