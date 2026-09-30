ALTER FUNCTION public.aprovar_compra(uuid) SECURITY INVOKER;
ALTER FUNCTION public.rejeitar_compra(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.marcar_compra_paga(uuid, date, numeric) SECURITY INVOKER;