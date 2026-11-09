# Home: só corretores ativos, fotos novas e blocos mais compactos

## 1. Só corretores que estão na empresa
- A lista de corretores da Home passa a usar o ZIP como referência de quem está ativo hoje (31 nomes).
- Quem não estiver no ZIP sai da vitrine da Home e do contador "corretores especialistas" (o número passa a ser o real).
- Não apago ninguém do cadastro: o corretor só deixa de aparecer, para não quebrar links antigos e histórico de leads.
- Arquivos que serão ignorados por não terem nome identificável ou serem de outro setor: "Captura de Tela 2026-10-27…", "f3ec0d92-….png" e "Carol RH" (RH, não corretora). Se algum deles for corretor, me diga o nome.
- Quando há duas fotos da mesma pessoa (Paula Medeiros, Larissa Barbosa), uso a mais recente (.jpg).

## 2. Fotos atualizadas
- Cada foto é recortada em quadrado no rosto, reduzida e otimizada (as originais têm 2–5 MB) e enviada ao site.
- O perfil de cada corretor recebe a foto nova; isso também melhora o cartão dele nos links personalizados (/c/nome).
- O caso da foto em branco some, já que todos passam a usar a foto nova.
- Nomes curtos ("Junior", "Billy", "Flavio"…) são casados com o cadastro pelo primeiro nome; os que tiverem dúvida eu listo para você confirmar antes de publicar.

## 3. Remover blocos
- Tirar "Vistos recentemente" e "Como funciona" da Home.
- Os números (imóveis, nota Google, corretores) que estavam no "Como funciona" ficam numa faixa enxuta junto das avaliações, para não perder a prova social.

## 4. Espaços entre blocos
- Padronizar o respiro vertical entre seções (hoje há seções com espaço dobrado, como na sua captura): cerca de 48px no celular e 64–72px no computador, sem fundos alternados criando faixas vazias.

## 5. Validação ponta a ponta
- Abrir a Home no computador e no celular, conferir: só corretores ativos, fotos novas carregando, botão "Falar com…" abrindo o WhatsApp certo, blocos removidos, espaçamento uniforme, nada vazando para os lados.
- Abrir alguns links /c/nome para ver a foto nova no cartão.
- Rodar os testes existentes.

## Detalhes técnicos
- Fotos: processar com PIL (crop central/rosto, 600x600 WebP), subir via lovable-assets, gravar `foto_url` em `profiles` por nome.
- Ativos: marcar `ativo=false` nos perfis com `slug_ref` fora da lista; `useCorretoresVitrine` já filtra `ativo` + foto. Observação: o sync do CRM (`upsert_corretor_from_crm`) não altera `ativo` nem sobrescreve foto com nulo, mas pode sobrescrever `foto_url` se o CRM enviar outra — vou checar isso.
- Remover `PorQueUhome` e `HomeVistosRecentemente` de `Index.tsx`; ajustar paddings `py-*` das seções da Home.
