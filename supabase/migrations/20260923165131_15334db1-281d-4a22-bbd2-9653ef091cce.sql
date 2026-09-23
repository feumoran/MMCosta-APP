DROP POLICY IF EXISTS "importacoes_read" ON public.importacoes;
CREATE POLICY "importacoes_read" ON public.importacoes
FOR SELECT TO authenticated
USING (tipo = 'medicao' OR public.can_manage());

DROP POLICY IF EXISTS profiles_read ON public.profiles;
CREATE POLICY profiles_read ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.profile_names(_ids uuid[])
RETURNS TABLE(id uuid, nome text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.nome
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND auth.uid() IS NOT NULL
$$;
REVOKE ALL ON FUNCTION public.profile_names(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_names(uuid[]) TO authenticated, service_role;

DROP POLICY IF EXISTS "documentos_storage_read" ON storage.objects;
CREATE POLICY "documentos_storage_read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'escritorio') OR
    public.has_role(auth.uid(),'engenharia') OR
    public.has_role(auth.uid(),'leitura')
  )
);

DROP POLICY IF EXISTS "documentos_storage_insert" ON storage.objects;
CREATE POLICY "documentos_storage_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'escritorio') OR
    public.has_role(auth.uid(),'engenharia')
  )
);

DROP POLICY IF EXISTS "documentos_storage_delete" ON storage.objects;
CREATE POLICY "documentos_storage_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'escritorio')
  )
);