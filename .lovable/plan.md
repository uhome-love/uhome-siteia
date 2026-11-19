# Ícones e busca fora do ar — situação e próximos passos

## O que aconteceu
A sua captura é das 16:40. Nessa hora o banco estava sobrecarregado e a busca dava erro. Por isso os ícones 3D sumiram da Home: eles dependem dessa busca.

## O que já está corrigido (vale para o site oficial)
- A busca do banco voltou: agora responde entre 0,5 e 1,2 segundo (antes passava de 3 segundos e caía).
- Medi agora há pouco, três vezes seguidas: todas responderam normal.

## O que falta
1. Publicar a versão atual: ela faz a Home tentar de novo sozinha se a busca falhar (o site publicado hoje desiste na primeira falha e fica sem ícones até recarregar).
2. Depois de publicar, conferir na prévia, celular e computador: os 16 ícones aparecem, cada clique abre a busca com imóveis, sem a mensagem "Não foi possível carregar".
3. Se ainda houver falha, olhar as consultas lentas do banco e corrigir a próxima.

## O que não consigo testar
O site oficial bloqueia robôs (proteção da Cloudflare), então não consigo abri-lo daqui. Peço que você recarregue a página para confirmar.
