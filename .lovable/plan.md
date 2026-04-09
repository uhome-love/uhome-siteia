

## Fix: Map Pins and Count Broken — Function Overloading Conflict

### Problem

The `get_map_pins` RPC returns HTTP 300 with error `PGRST203: Could not choose the best candidate function`. This is because the migration used `CREATE OR REPLACE FUNCTION` which created a **second overloaded version** of `get_map_pins` (with `p_fase`), while the **old version** (without `p_fase`) still exists. PostgREST cannot disambiguate between them.

Same issue likely affects `count_imoveis` — it shows "0 imóveis" because the count query also fails.

### Fix — Single Migration

Drop the old function signatures (without `p_fase`), then re-create with the new signatures that include `p_fase`:

```sql
-- Drop old overloads that conflict
DROP FUNCTION IF EXISTS public.get_map_pins(
  numeric, numeric, numeric, numeric, 
  text, text, text[], 
  numeric, numeric, integer, integer, integer, 
  numeric, numeric, text, text[], integer
);

DROP FUNCTION IF EXISTS public.count_imoveis(
  text, text[], text, text[], 
  numeric, numeric, integer, integer, integer, 
  numeric, numeric, text, text, text[], 
  numeric, numeric, numeric, numeric
);
```

### Files Changed

1. **New migration SQL** — drops old function overloads (the new versions with `p_fase` already exist and will remain)

No frontend changes needed — the frontend already sends `p_fase` correctly.

