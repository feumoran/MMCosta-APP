REVOKE ALL ON FUNCTION public.sync_obra_status_from_avanco() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_obra_status_from_avanco() FROM anon;
REVOKE ALL ON FUNCTION public.sync_obra_status_from_avanco() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_obra_status_from_avanco() TO service_role;