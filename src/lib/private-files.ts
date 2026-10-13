import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PrivateBucket = "documentos" | "compras" | "boletins" | "comprovantes" | "importacoes";

// Authenticated Storage GET rechecks current RLS on every fetch. Never issue
// transferable signed URLs; a blob URL only refers to bytes already downloaded.
export async function fetchPrivateFile(bucket: PrivateBucket, path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) throw new Error("Não foi possível abrir o arquivo. Verifique seu acesso e tente novamente.");
  return data;
}

export function saveFileBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // Give the browser time to start saving before releasing the local bytes.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function usePrivateFiles() {
  const urls = useRef(new Set<string>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      urls.current.forEach(url => URL.revokeObjectURL(url));
      urls.current.clear();
    };
  }, []);
  return {
    preview: async (bucket: PrivateBucket, path: string) => {
      const blob = await fetchPrivateFile(bucket, path);
      if (!mounted.current) throw new Error("A visualização foi encerrada.");
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      return url;
    },
    download: async (bucket: PrivateBucket, path: string, name: string) => {
      const blob = await fetchPrivateFile(bucket, path);
      if (mounted.current) saveFileBlob(blob, name);
    },
  };
}