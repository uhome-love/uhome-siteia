---
name: IPTU mensal vs anual
description: Jetimob envia periodicidade_iptu (Anual/Mensal); site armazena em imoveis.iptu_periodicidade e sempre normaliza para valor mensal nos cálculos
type: feature
---
- Coluna `imoveis.iptu_periodicidade` ('mensal' | 'anual' | null), preenchida pelo sync a partir de `periodicidade_iptu` do Jetimob.
- Helper `src/lib/iptu.ts`: `iptuMensal()` (anual ÷ 12), `formatIptu()` ("R$ 729/ano (R$ 61/mês)"), `formatIptuCurto()`.
- Nunca exibir IPTU como "/mês" sem checar a periodicidade. Custo mensal total (cards, análise de preço) usa sempre o mensal equivalente.
- Filtro "IPTU máximo" compara mensal equivalente (anual ≤ X·12).
