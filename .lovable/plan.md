# Corrigir IPTU: anual vs mensal

## O problema (confirmado)

O Jetimob envia o campo `periodicidade_iptu` ("Anual" ou "Mensal") junto com `valor_iptu`, mas a sincronização ignora esse campo e o site sempre exibe "/mês".

No imóvel 1982-UH: `valor_iptu: 729`, `periodicidade_iptu: "Anual"` — o site mostra "IPTU: R$ 729/mês" (errado, são R$ 60,75/mês).

Na base atual: 12.491 imóveis com IPTU **anual**, 6.855 **mensal**, 12.997 sem informação.

## O que será feito

1. **Banco**: nova coluna `iptu_periodicidade` em `imoveis` (valores `mensal` / `anual`, nulo quando não informado).
2. **Sync Jetimob**: passa a gravar a periodicidade em cada atualização, para nunca mais perder a informação.
3. **Backfill**: preenche a coluna para todos os imóveis já sincronizados, lendo do dado bruto já guardado (`jetimob_raw`) — sem precisar esperar o próximo sync.
4. **Exibição correta em todo o site**:
   - Página do imóvel: "IPTU: R$ 729/ano (R$ 61/mês)" quando for anual; "/mês" quando for mensal.
   - Cards da busca, custo mensal total, simulador e análise de preço passam a usar sempre o **valor mensal equivalente** (anual ÷ 12), corrigindo os totais de custo mensal que hoje estão inflados.
5. **Filtro "IPTU máximo"**: passa a comparar valores mensais equivalentes, para não excluir imóveis injustamente.

## Detalhes técnicos

- Migração: `ALTER TABLE public.imoveis ADD COLUMN iptu_periodicidade text` + `UPDATE` de backfill a partir de `jetimob_raw->>'periodicidade_iptu'` (normalizado para minúsculas sem acento).
- `supabase/functions/sync-jetimob/index.ts`: `mapImovel` mapeia `j.periodicidade_iptu` → `iptu_periodicidade`.
- Novo helper em `src/lib/` (ex.: `iptu.ts`) com `iptuMensal(imovel)` e `formatIptu(imovel)`, usado por:
  - `src/pages/PropertyDetail.tsx` (linha ~552)
  - `src/components/SearchPropertyCard.tsx` (custo mensal e linha de encargos)
  - `src/hooks/useAnalisePreco.ts` (custo mensal total)
- `src/services/imoveis.ts`: coluna adicionada em `DETAIL_COLUMNS` e nas listas de busca; filtro `iptuMax` aplicado com `.or()` (mensal ≤ X **ou** anual ≤ X·12).
- Sem mudança de rota, layout ou estrutura — apenas dado e formatação.
