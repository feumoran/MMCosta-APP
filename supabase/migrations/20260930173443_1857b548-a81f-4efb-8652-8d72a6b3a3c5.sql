ALTER TABLE public.boletins ADD COLUMN confirmado_em timestamptz;
UPDATE public.boletins SET confirmado_em = revisado_em WHERE confirmado_em IS NULL;
CREATE OR REPLACE FUNCTION public.sync_boletim_review_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.confirmado_em IS DISTINCT FROM OLD.confirmado_em THEN
    NEW.revisado_em := NEW.confirmado_em;
  ELSIF NEW.revisado_em IS DISTINCT FROM OLD.revisado_em THEN
    NEW.confirmado_em := NEW.revisado_em;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_boletim_review_timestamps
BEFORE UPDATE ON public.boletins
FOR EACH ROW EXECUTE FUNCTION public.sync_boletim_review_timestamps();