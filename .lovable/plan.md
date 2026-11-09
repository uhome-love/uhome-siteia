# Ajustes visuais: menu, alinhamento, logos e auditoria completa

## 1. Menu do topo mais organizado
Hoje "Comprar", "Busca IA", "Natal" e "Mais" ficam soltos e o Natal parece um botão perdido. Novo formato, com menus de opções:
```text
[Logo]   Comprar v   Natal Chave de Ouro   Proprietários v   Ajuda        [Entrar]
```
- **Comprar v** abre um painel: Buscar imóveis, Busca com IA, Bairros, Condomínios, Imóveis em Porto Alegre.
- **Natal Chave de Ouro** vira um link discreto, com a chave dourada e um pontinho dourado, sem o botão azul-escuro pesado. Depois de 18/12 vira "Uhome em Foco".
- **Proprietários v**: Anunciar imóvel e Quanto vale meu imóvel?.
- **Ajuda** abre a página de ajuda. O Blog vai para o rodapé.
- À direita fica só "Entrar". Some o "Anunciar imóvel" repetido, que já está no menu Proprietários.
- No celular o menu lateral segue esses mesmos grupos.

## 2. Alinhamento dos "Empreendimentos do Natal"
- Os cards vão começar na mesma margem do banner e do título, sem encostar na borda da tela.
- Setas de avançar e voltar no computador. No celular continua deslizando com o dedo, com o próximo card aparecendo pela metade.

## 3. Logo da construtora nas páginas dos produtos
- Os logos são brancos e hoje ficam sobre um fundo cinza claro, por isso some.
- Correção: o logo fica sem fundo, direto sobre a foto escura, com uma leve sombra para ler bem. Vale para todos os produtos.

## 4. Auditoria visual completa, página por página
Abrir tudo no computador e no celular e corrigir o que estiver desalinhado, apertado, cortado ou com estilo diferente:
- Página inicial: espaços entre as seções, títulos, cards de bairros, perguntas frequentes e rodapé.
- Busca com mapa: filtros, cards, barra de baixo no celular.
- Página do imóvel: galeria, preço, botões, ficha.
- Natal e páginas dos produtos: hierarquia, margens, plantas, mapa, ficha técnica, barra fixa no celular.
- Quanto vale meu imóvel, Anunciar, Entrar, Favoritos, Ajuda, Blog.
- Padronização: mesma margem lateral em todas as seções, botões com o mesmo formato e altura, títulos no mesmo tamanho, cards com o mesmo canto e sombra.
- Celular: o aviso "Precisa de ajuda?" deixa de cobrir botões e textos.

## 5. Sugestões de melhoria (incluídas, se aprovar)
- **Menu fixo que encolhe** ao rolar a página, com fundo levemente translúcido.
- **"Buscados recentemente"** na página inicial para quem já visitou o site.
- **Selo de entrega** nos cards dos produtos (ex.: "Entrega dez/2028").
- **Botão "Comparar"** para até 3 empreendimentos do Natal lado a lado.
- **Rodapé reorganizado** em 4 colunas: Comprar, Proprietários, Uhome, Contato.

## Detalhes técnicos
- Navbar: NavigationMenu do shadcn para os painéis "Comprar" e "Proprietários"; Sheet no mobile com os mesmos grupos.
- Carrossel: o container usa a mesma `max-w-7xl` e o mesmo padding do banner; scroll-padding e setas com refs.
- Logo: tirar `bg-noir-foreground/90 p-1` e aplicar `drop-shadow`, com altura máxima de 40px.
- FloatingWhatsApp: o aviso só aparece depois de rolar a página e nunca sobre os botões fixos.
- Validação com Playwright em 1440, 1024, 390 e 360 px, sem erros de console. Atualizar o teste do menu.
