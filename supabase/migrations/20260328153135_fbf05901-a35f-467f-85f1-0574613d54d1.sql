-- Fix publicado_em to use the real jetimob registration date instead of sync date
UPDATE public.imoveis 
SET publicado_em = (jetimob_raw->>'data_cadastro')::timestamp with time zone
WHERE jetimob_raw IS NOT NULL 
  AND jetimob_raw->>'data_cadastro' IS NOT NULL;

-- Also update the sync function trigger to set publicado_em from jetimob data on future syncs
CREATE OR REPLACE FUNCTION public.sync_publicado_em()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.jetimob_raw IS NOT NULL 
     AND NEW.jetimob_raw->>'data_cadastro' IS NOT NULL
     AND (OLD.jetimob_raw IS NULL OR OLD.jetimob_raw->>'data_cadastro' IS DISTINCT FROM NEW.jetimob_raw->>'data_cadastro')
  THEN
    NEW.publicado_em := (NEW.jetimob_raw->>'data_cadastro')::timestamp with time zone;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE TRIGGER trg_sync_publicado_em
  BEFORE INSERT OR UPDATE ON public.imoveis
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_publicado_em();