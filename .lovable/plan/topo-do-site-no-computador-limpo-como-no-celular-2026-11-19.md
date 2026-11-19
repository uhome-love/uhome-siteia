# Topo do site no computador: limpo, como no celular

## Recomendação: tirar as abas e o "Falar com a Lia"
- **Imóveis / Lançamentos / Investir:** já saíram do celular, e a Home já tem a busca e os ícones 3D fazendo esse papel. No computador elas repetem esse caminho e ficam desalinhadas (presas à esquerda, longe do centro). O padrão Airbnb é logo à esquerda, busca no centro e conta à direita.
- **"Falar com a Lia":** a Lia já tem o botão redondo fixo no canto. Dois botões para a mesma coisa só competem.

## Como fica
```text
[Logo Uhome]        [ pílula de busca no centro (ao rolar / fora da Home) ]        [♡] [Conta] [≡]
```
- Na Home, sem rolar: só logo à esquerda e ações à direita. A pílula grande da Home já está logo abaixo.
- Ao rolar, ou em outras páginas: a pílula compacta aparece **centralizada** no topo, como já acontece hoje.
- Lançamentos e Investir continuam no menu (≡) e nos links do rodapé, então ninguém perde o caminho.

## Alternativa (caso prefira manter)
Deixar as 3 abas, só que centralizadas e sem o "Falar com a Lia". Não recomendo: elas voltariam a disputar espaço com a busca.

## Detalhes técnicos
- `Navbar.tsx`: remover o botão `uhs-desktop-lia` e o ramo das abas em `uhs-desktop-tabs`, que passa a renderizar só a `pilula-compacta` (ou nada na Home sem rolar); limpar os ícones sem uso.
- CSS: garantir que `uhs-desktop-tabs` fique centralizado de forma absoluta na barra (56px central, conforme o padrão da navbar).
- Conferir que `MenuSite` ainda tem Lançamentos e Investir; adicionar se faltarem.
- Validar em 1280 e 1440 px, na Home (topo e rolada) e na busca.
