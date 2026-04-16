---
name: filter-visibility-rules
description: Tipos de imóvel disponíveis no filtro e regras de visibilidade
type: feature
---
Tipos de imóvel suportados (campo `tipo` em `imoveis`):
- `apartamento`, `garden` (Apartamento Garden), `cobertura`, `casa`, `casa_condominio` (Casa em Condomínio), `sobrado`, `studio`, `loft`, `terreno`, `comercial`.

Mapeamento Jetimob → DB feito em `supabase/functions/sync-jetimob/index.ts` (`mapTipo`):
- subtipo "Apartamento Garden" → `garden`
- subtipo "Casa de Condomínio" → `casa_condominio` (DEVE checar `casa+condom` ANTES de `casa` genérico)
- subtipo "Cobertura" → `cobertura` (DEVE vir antes de `casa`)

Filtro "Diferenciais" segue oculto (dados não populados na Jetimob).

Títulos: `tituloLimpo` em `src/services/imoveis.ts` mapeia `garden` → "Apartamento Garden" e `casa_condominio` → "Casa em Condomínio".
