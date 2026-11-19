# Home: uma única porta de entrada, sem fileiras concorrendo

## Problema
Na tela inicial do celular aparecem três coisas parecidas, uma embaixo da outra: a busca, os ícones 3D e a fileira "Comece por aqui". Elas disputam a atenção, e os atalhos repetem o que os ícones e a busca já fazem.

## Estratégia: cada coisa tem um papel só
```text
Busca em pílula  -> "onde"  (cidades, bairros, buscas recentes)
Ícones 3D        -> "o quê" (tipo de imóvel e momento: na planta, garden, studios...)
Abaixo           -> retomar (continue de onde parou) e descobrir (novos no site)
```

1. **Tirar a fileira "Comece por aqui"** da Home.
2. **Levar os atalhos para onde fazem sentido, sem perder nada:**
   - Porto Alegre, Canoas e Xangri-lá viram sugestões rápidas no passo "Onde" da busca (que abre ao tocar na pílula), junto das buscas recentes.
   - "Na planta" entra como ícone 3D, se ainda não existir nessa fileira.
   - "Até R$ 500 mil" vira uma sugestão rápida no passo "Valor".
3. **A pílula da busca ganha uma segunda linha:** quem já buscou antes vê "Última: Canoas · até R$ 800 mil" e retoma com um toque. Quem nunca buscou vê "Cidade, bairro ou código". Com isso, o link solto "Sua última busca" sai da página.
4. **Medição:** os toques nas sugestões e nos ícones continuam sendo contados, para compararmos com o período dos atalhos.

## Resultado esperado
A primeira tela fica com busca, ícones 3D e logo depois "Continue de onde parou": mais limpa, como no Airbnb, e com o mesmo atalho rápido para quem quer ir direto.

## Detalhes técnicos
- `HomeVitrine.tsx`: remover o bloco `home-atalhos` e o link `home-ultima-busca`; segunda linha na pílula usando `buscasRecentes`.
- `BuscaEtapas.tsx`: chips de sugestão de cidade no passo "Onde" e "Até R$ 500 mil" no passo "Valor", reaproveitando `ATALHOS_HOME` (movido para um módulo compartilhado) e o evento `categoria_tocada`.
- A fileira de categorias recebe "Na planta" (`fase=em_construcao`) se ainda não estiver nela.
- Conferir em 360, 390 e 430 px, e sem mudança no desktop além da pílula.
