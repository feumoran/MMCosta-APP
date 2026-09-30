CREATE OR REPLACE FUNCTION public.sync_boletim_review_timestamps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
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
REVOKE ALL ON FUNCTION public.sync_boletim_review_timestamps() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_boletim_review_timestamps() TO service_role;