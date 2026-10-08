CREATE OR REPLACE FUNCTION public.keep_existing_coords()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.latitude IS NULL AND OLD.latitude IS NOT NULL THEN NEW.latitude := OLD.latitude; END IF;
  IF NEW.longitude IS NULL AND OLD.longitude IS NOT NULL THEN NEW.longitude := OLD.longitude; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_keep_existing_coords BEFORE UPDATE ON public.imoveis
FOR EACH ROW EXECUTE FUNCTION public.keep_existing_coords();