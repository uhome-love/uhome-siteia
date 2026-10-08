# Auditoria da sincronização Jetimob → Site

## O que a auditoria encontrou (verificado no banco agora)

- **A sync está rodando e completa**: as últimas 12 execuções (03/10 a 08/10) terminaram 100% — hoje às 06:00 processou 21.467 de 21.467 imóveis, sem erros. Agendamentos ativos: diária 06:00 + verificação a cada 3 min.
- **Os imóveis estão no banco**: 21.467 disponíveis, 257 novos nos últimos 7 dias, todos com foto.

Então o problema não é a sync quebrada — são 3 pontos que fazem o corretor achar que o imóvel "não entrou":

1. **Atraso de até 24 h**: a varredura completa só roda 1x por dia (06:00). Um imóvel cadastrado ou alterado no Jetimob às 09:00 só aparece no site no dia seguinte.
2. **1.129 imóveis disponíveis ficam escondidos da busca padrão** porque estão em cidades fora da lista fixa (Porto Alegre, Canoas, Cachoeirinha, Gravataí, Guaíba) — ex.: Litoral e Serra, que fazem parte da área de atuação.
3. **1.106 imóveis sem localização** (sem latitude/longitude) não aparecem no mapa da busca.
4. 33 imóveis sem foto ficam ocultos (regra correta, mantida).

### Caso da Larissa (85149-UH, Sarandi, Vivaz Ecoville)
- O imóvel **está no banco, disponível, com 10 fotos e localização**, atualizado hoje às 06:58. Endereço no site: `/imovel/apartamento-1-quarto-sarandi-85149-UH`.
- Ou seja, os dados chegaram. Suspeitas a confirmar no primeiro passo: (a) o botão **"Ver no site" do Jetimob** abre um endereço em formato diferente do nosso e cai em erro/página vazia; (b) a busca por código não encontra; (c) a foto principal falha ao carregar e o card some da lista.
- Vou abrir o site publicado com esse código pelos 3 caminhos e corrigir o que falhar — inclusive aceitar qualquer formato de link do Jetimob (ex.: só o código) e redirecionar para a página certa.

## O que vou fazer

### 1. Sync rápida de novidades (a cada 15 min)
- Novo modo "incremental": busca no Jetimob só os imóveis alterados desde a última execução e grava no site. Novos imóveis passam a aparecer em até ~15 minutos.
- A varredura completa das 06:00 continua igual (é ela que desativa os vendidos/retirados).
- Opcional: também rodar a desativação de forma rápida quando o Jetimob marcar o imóvel como vendido/inativo na incremental.

### 2. Liberar todas as cidades da área de atuação
- Trocar a lista fixa de 5 cidades por "todas as cidades com imóveis disponíveis" na busca, contagem e mapa, mantendo o filtro de cidade escolhido pelo usuário funcionando igual.

### 3. Localização dos imóveis sem coordenadas
- Na sync, quando o Jetimob não envia latitude/longitude, buscar pelo endereço/bairro (Mapbox) e salvar. Rodar uma vez para os 1.106 atuais.

### 4. Ferramenta de checagem para os corretores/admin
- Na tela de Sincronização: campo "Buscar código" (ex.: 20242-UH) que mostra se o imóvel está no site, quando foi atualizado e, se estiver oculto, o motivo (sem foto, sem localização, inativo, fora da busca). Botão "Puxar agora" para sincronizar só esse imóvel.
- Mostrar a última sync incremental e a última completa.

### 5. Validação final
- Testar com imóveis cadastrados hoje no Jetimob, conferir contagens antes/depois e reportar os números.

## Detalhes técnicos

- `sync-jetimob`: novo `mode: "incremental"` usando `data_atualizacao` (ordenação/filtro da API Jetimob) com marca d'água salva em `site_config` (`jetimob_last_incremental`); upsert por `jetimob_id`; lock separado do modo completo para não conflitar. Novo `mode: "single"` por código.
- Cron `sync-jetimob-incremental` `*/15 * * * *` via `net.http_post` (criado por SQL direto, não migração).
- Migração: alterar default `p_cidades` de `count_imoveis` e `get_map_pins` para NULL (sem restrição), e ajustar chamadas em `src/services/imoveis.ts`.
- Geocodificação com `VITE_MAPBOX_TOKEN` já existente, em lotes com limite por execução.
- UI em `src/pages/admin/AdminSync.tsx`. Sem mudanças estruturais nas páginas públicas além da remoção do filtro de cidade padrão.
