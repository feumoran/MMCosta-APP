CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION private.has_role(uuid,public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid,public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF EXISTS(SELECT 1 FROM public.user_roles) THEN RETURN false; END IF;
  INSERT INTO public.user_roles(user_id,role,created_by) VALUES(auth.uid(),'admin',auth.uid()) ON CONFLICT DO NOTHING;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION private.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.claim_first_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, private
AS $$ SELECT private.has_role(_user_id,_role) $$;
CREATE OR REPLACE FUNCTION public.can_manage()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, private
AS $$ SELECT private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'escritorio') $$;
CREATE OR REPLACE FUNCTION public.can_field()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, private
AS $$ SELECT public.can_manage() OR private.has_role(auth.uid(),'engenharia') $$;
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path = public, private
AS $$ SELECT private.claim_first_admin() $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role), public.can_manage(), public.can_field(), public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role), public.can_manage(), public.can_field(), public.claim_first_admin() TO authenticated;