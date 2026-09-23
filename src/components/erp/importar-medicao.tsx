import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileSpreadsheet, LoaderCircle, RotateCcw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { brl, dateBR } from "@/lib/erp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = Database["public"]["Enums"]["categoria_perfuracao"];
type Field = "obra" | "data" | "servico" | "quantidade" | "unidade" | "valorUnitario" | "valorTotal";
type Mapping = Record<Field, number | null>;
type RawCell = string | number | boolean | Date | null | undefined;
type PreviewRow = {
  key: string;
  obraTexto: string;
  obraId: string;
  match: "auto" | "revisar";
  data: string;
  servicoTexto: string;
  servicoId: string | null;
  categoria: Category | null;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  valorInformado: number | null;
};
type PdfExtraction = {
  total_declarado: number | null;
  linhas: Array<{
    obra_texto: string | null;
    data: string | null;
    servico: string;
    categoria_perfuracao: Category | null;
    quantidade: number;
    unidade: string;
    valor_unitario: number | null;
    valor_total: number | null;
  }>;
};

const fields: Array<{ key: Field; label: string }> = [
  { key: "obra", label: "Obra / centro de custo" },
  { key: "data", label: "Data" },
  { key: "servico", label: "Serviço" },
  { key: "quantidade", label: "Quantidade" },
  { key: "unidade", label: "Unidade" },
  { key: "valorUnitario", label: "Valor unitário" },
  { key: "valorTotal", label: "Valor total" },
];

const synonyms: Record<Field, string[]> = {
  obra: ["obra", "centro de custo", "centro custo", "cc obra", "contrato", "cliente"],
  data: ["data", "competencia", "medicao em"],
  servico: ["servico", "descricao", "item", "atividade"],
  quantidade: ["quantidade atual", "qtd atual", "medicao atual", "atual", "quantidade", "qtd"],
  unidade: ["unidade", "unid", "und"],
  valorUnitario: ["valor unitario", "preco unitario", "preco", "vl unit"],
  valorTotal: ["valor atual", "total atual", "valor total", "total", "valor"],
};

const emptyMapping: Mapping = {
  obra: null,
  data: null,
  servico: null,
  quantidade: null,
  unidade: null,
  valorUnitario: null,
  valorTotal: null,
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const numberValue = (value: RawCell) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value ?? "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!text) return 0;
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isoDate = (value: RawCell) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
  return `${year}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
};

const detectHeader = (rows: RawCell[][]) => {
  let best = { index: 0, score: -1 };
  rows.slice(0, 30).forEach((row, index) => {
    const score = row.reduce<number>((sum, cell) => {
      const text = normalize(String(cell ?? ""));
      return sum + (Object.values(synonyms).some((list) => list.some((word) => text.includes(word))) ? 1 : 0);
    }, 0);
    if (score > best.score) best = { index, score };
  });
  return best.index;
};

const detectMapping = (headers: string[]): Mapping => {
  const mapping = { ...emptyMapping };
  fields.forEach(({ key }) => {
    const candidates = headers
      .map((header, index) => ({ index, text: normalize(header) }))
      .filter(({ text }) => synonyms[key].some((word) => text === word || text.includes(word)));
    const preferred = candidates.find(({ text }) => text.includes("atual")) ?? candidates[0];
    mapping[key] = preferred?.index ?? null;
  });
  return mapping;
};

const categoryFrom = (service: string): Category | null => {
  const text = normalize(service);
  if (text.includes("rocha alterada")) return "rocha_alterada";
  if (/(^| )rocha( |$)/.test(text)) return "rocha";
  if (/(^| )solo( |$)/.test(text)) return "solo";
  return null;
};

export function MeasurementImport({ obraId, embedded = false }: { obraId: string; embedded?: boolean }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [path, setPath] = useState("");
  const [importId, setImportId] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawCell[][]>([]);
  const [mapping, setMapping] = useState<Mapping>(emptyMapping);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [declaredTotal, setDeclaredTotal] = useState<number | null>(null);
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["measurement-imports"],
    queryFn: async () => {
      const [userResult, rolesResult, worksResult, centersResult, aliasesResult, servicesResult, importsResult, measurementsResult] =
        await Promise.all([
          supabase.auth.getUser(),
          supabase.from("user_roles").select("role"),
          supabase.from("obras").select("id,nome,numero_contrato,cliente_id,clientes(nome)").order("nome"),
          supabase.from("centros_custo").select("id,nome,obra_id").eq("ativo", true),
          supabase.from("cc_aliases").select("centro_custo_id,texto_normalizado"),
          supabase.from("servicos").select("id,nome,unidade,eh_perfuracao,palavras_chave").eq("ativo", true),
          supabase.from("importacoes").select("*").eq("tipo", "medicao").order("created_at", { ascending: false }),
          supabase.from("medicoes").select("id,obra_id,numero,status,valor_total,importacao_id,created_at,created_by,medicao_itens(*)").eq("origem", "planilha_importada").order("created_at", { ascending: false }),
        ]);
      const firstError = [worksResult.error, centersResult.error, aliasesResult.error, servicesResult.error, importsResult.error, measurementsResult.error].find(Boolean);
      if (firstError) throw firstError;
      return {
        user: userResult.data.user,
        role: rolesResult.data?.[0]?.role ?? "leitura",
        works: worksResult.data ?? [],
        centers: centersResult.data ?? [],
        aliases: aliasesResult.data ?? [],
        services: servicesResult.data ?? [],
        imports: importsResult.data ?? [],
        measurements: measurementsResult.data ?? [],
      };
    },
  });

  const matchWork = (text: string) => {
    if (!data || !text) return "";
    const source = normalize(text);
    const alias = data.aliases.find((item) => item.texto_normalizado === source);
    if (alias) return data.centers.find((center) => center.id === alias.centro_custo_id)?.obra_id ?? "";
    let best = { id: "", score: 0 };
    data.works.forEach((work) => {
      const client = Array.isArray(work.clientes) ? work.clientes[0] : work.clientes;
      const words = normalize(`${work.nome} ${work.numero_contrato ?? ""} ${client?.nome ?? ""}`)
        .split(" ")
        .filter((word) => word.length > 3);
      const score = words.filter((word) => source.includes(word)).length;
      if (score > best.score) best = { id: work.id, score };
    });
    return best.score >= 1 ? best.id : "";
  };

  const matchService = (text: string) => {
    if (!data || !text) return null;
    const source = normalize(text);
    const exact = data.services.find((service) => normalize(service.nome) === source);
    if (exact) return exact.id;
    const matched = data.services.find((service) => {
      const words = [service.nome, ...(service.palavras_chave ?? [])].flatMap((word) => normalize(word).split(" "));
      return words.filter((word) => word.length > 3 && source.includes(word)).length >= 1;
    });
    return matched?.id ?? null;
  };

  const fromRaw = (nextMapping: Mapping, sourceRows = rawRows) => {
    const get = (row: RawCell[], field: Field) => {
      const index = nextMapping[field];
      return index === null ? "" : row[index];
    };
    const preview = sourceRows
      .filter((row) => row.some((cell) => String(cell ?? "").trim()))
      .map((row) => {
        const obraTexto = String(get(row, "obra") ?? "").trim();
        const servicoTexto = String(get(row, "servico") ?? "").trim();
        const obra = matchWork(obraTexto);
        const quantity = numberValue(get(row, "quantidade"));
        const unitPrice = numberValue(get(row, "valorUnitario"));
        const mappedTotal = numberValue(get(row, "valorTotal"));
        return {
          key: crypto.randomUUID(),
          obraTexto,
          obraId: obra,
          match: obra ? ("auto" as const) : ("revisar" as const),
          data: isoDate(get(row, "data")),
          servicoTexto,
          servicoId: matchService(servicoTexto),
          categoria: categoryFrom(servicoTexto),
          quantidade: quantity,
          unidade: String(get(row, "unidade") ?? "").trim(),
          valorUnitario: unitPrice || (quantity > 0 ? mappedTotal / quantity : 0),
          valorTotal: mappedTotal || quantity * unitPrice,
          valorInformado: mappedTotal || null,
        };
      })
      .filter((row) => row.servicoTexto || row.quantidade || row.valorTotal);
    setRows(preview);
  };

  const uploadImport = async (selected: File) => {
    const activeUser = data?.user;
    if (!activeUser) throw new Error("Sua sessão expirou.");
    const storagePath = `${activeUser.id}/${crypto.randomUUID()}-${selected.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("importacoes").upload(storagePath, selected, {
      contentType: selected.type || "application/octet-stream",
    });
    if (uploadError) throw uploadError;
    const { data: imported, error: insertError } = await supabase
      .from("importacoes")
      .insert({
        tipo: "medicao",
        arquivo_path: storagePath,
        arquivo_nome: selected.name,
        arquivo_tipo: selected.type || "application/octet-stream",
        status: "processando",
        created_by: activeUser.id,
      })
      .select("id")
      .single();
    if (insertError) {
      await supabase.storage.from("importacoes").remove([storagePath]);
      throw insertError;
    }
    setPath(storagePath);
    setImportId(imported.id);
    return { storagePath, id: imported.id };
  };

  const choose = async (selected: File) => {
    setFile(selected);
    setRows([]);
    setHeaders([]);
    setRawRows([]);
    setDeclaredTotal(null);
    setMessage("");
    let uploadedId = "";
    try {
      const uploaded = await uploadImport(selected);
      uploadedId = uploaded.id;
      if (!/\.pdf$/i.test(selected.name)) {
        const workbook = XLSX.read(await selected.arrayBuffer(), { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
        if (!sheet) throw new Error("A planilha não possui uma aba legível.");
        const matrix = XLSX.utils.sheet_to_json<RawCell[]>(sheet, { header: 1, defval: "", raw: true });
        const headerIndex = detectHeader(matrix);
        const foundHeaders = (matrix[headerIndex] ?? []).map((cell, index) => String(cell ?? "").trim() || `Coluna ${index + 1}`);
        const sourceRows = matrix.slice(headerIndex + 1);
        const detected = detectMapping(foundHeaders);
        setHeaders(foundHeaders);
        setRawRows(sourceRows);
        setMapping(detected);
        fromRaw(detected, sourceRows);
      }
    } catch (caught) {
      if (uploadedId) await supabase.from("importacoes").update({ status: "erro" }).eq("id", uploadedId);
      toast.error(caught instanceof Error ? caught.message : "Não foi possível abrir o arquivo.");
      setPath("");
      setImportId("");
    }
  };

  const readPdf = async () => {
    if (!file || !path || !importId) return;
    setReading(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const textParts: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const positioned = content.items
          .filter((item): item is typeof item & { str: string; transform: number[] } => "str" in item && "transform" in item)
          .map((item) => ({ text: item.str.trim(), x: item.transform[4] ?? 0, y: item.transform[5] ?? 0 }))
          .filter((item) => item.text)
          .sort((a, b) => Math.abs(b.y - a.y) > 2 ? b.y - a.y : a.x - b.x);
        const lines: Array<{ y: number; cells: Array<{ x: number; text: string }> }> = [];
        positioned.forEach((item) => {
          const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2);
          if (line) line.cells.push({ x: item.x, text: item.text });
          else lines.push({ y: item.y, cells: [{ x: item.x, text: item.text }] });
        });
        textParts.push(lines.map((line) => line.cells.sort((a, b) => a.x - b.x).map((cell) => cell.text).join(" | ")).join("\n"));
      }
      const extractedText = textParts.join("\n").trim();
      const pages: string[] = [];
      if (extractedText.length < 100) {
        for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 30); pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) continue;
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          pages.push(canvas.toDataURL("image/jpeg", 0.82));
        }
      }
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch("/api/ler-planilha-medicao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          arquivoPath: path,
          nomeArquivo: file.name,
          texto: extractedText.length >= 100 ? extractedText : null,
          paginas: pages,
        }),
      });
      const payload = (await response.json()) as { extracao?: PdfExtraction; error?: string };
      if (!response.ok || !payload.extracao) throw new Error(payload.error ?? "Não foi possível ler o PDF.");
      setDeclaredTotal(payload.extracao.total_declarado);
      setRows(
        payload.extracao.linhas.map((line) => {
          const obraTexto = line.obra_texto ?? "";
          const matchedWork = matchWork(obraTexto);
          const unitPrice = line.valor_unitario ?? (line.valor_total && line.quantidade ? line.valor_total / line.quantidade : 0);
          return {
            key: crypto.randomUUID(),
            obraTexto,
            obraId: matchedWork,
            match: matchedWork ? "auto" : "revisar",
            data: isoDate(line.data),
            servicoTexto: line.servico,
            servicoId: matchService(line.servico),
            categoria: line.categoria_perfuracao,
            quantidade: line.quantidade,
            unidade: line.unidade,
            valorUnitario: unitPrice,
            valorTotal: line.valor_total ?? line.quantidade * unitPrice,
            valorInformado: line.valor_total,
          };
        }),
      );
      toast.success("PDF lido. Confira todas as obras antes de distribuir.");
    } catch (caught) {
      await supabase.from("importacoes").update({ status: "erro" }).eq("id", importId);
      toast.error(caught instanceof Error ? caught.message : "Não foi possível ler o PDF.");
    } finally {
      setReading(false);
    }
  };

  const updateRow = (key: string, changes: Partial<PreviewRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  };

  const activeRows = rows.filter((row) => row.obraId !== "ignore");
  const involvedWorks = [...new Set(activeRows.map((row) => row.obraId).filter(Boolean))];
  const total = activeRows.reduce((sum, row) => sum + row.valorTotal, 0);
  const signature = (row: PreviewRow) => [row.obraId, row.data, normalize(row.servicoTexto), row.categoria ?? "", row.quantidade.toFixed(3), row.unidade, row.valorTotal.toFixed(2)].join("|");
  const priorSignatures = new Set<string>();
  for (const item of data?.imports ?? []) {
    if (item.status !== "concluida" || !item.resumo || typeof item.resumo !== "object" || Array.isArray(item.resumo)) continue;
    const savedRows = (item.resumo as Record<string, unknown>)["linhas"];
    if (!Array.isArray(savedRows)) continue;
    savedRows.forEach((saved) => {
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
      const value = saved as Record<string, unknown>;
      priorSignatures.add([value["obra_id"], value["data"], normalize(String(value["servico"] ?? "")), value["categoria_perfuracao"] ?? "", Number(value["quantidade"] ?? 0).toFixed(3), value["unidade"], Number(value["valor_total"] ?? 0).toFixed(2)].join("|"));
    });
  }
  const currentCounts = new Map<string, number>();
  activeRows.forEach((row) => currentCounts.set(signature(row), (currentCounts.get(signature(row)) ?? 0) + 1));
  const rowProblems = (row: PreviewRow) => {
    const service = data?.services.find((item) => item.id === row.servicoId);
    const problems: string[] = [];
    if (!row.obraId) problems.push("obra obrigatória");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.data) || Number.isNaN(Date.parse(`${row.data}T12:00:00`))) problems.push("data inválida");
    if (!row.servicoTexto.trim()) problems.push("serviço obrigatório");
    if (row.quantidade <= 0 || !Number.isFinite(row.quantidade)) problems.push("quantidade inválida");
    if (!row.unidade.trim()) problems.push("unidade obrigatória");
    if (row.valorUnitario < 0 || row.valorTotal < 0 || !Number.isFinite(row.valorTotal)) problems.push("valor inválido");
    if (row.valorInformado !== null && Math.abs(row.quantidade * row.valorUnitario - row.valorInformado) > 0.02) problems.push("total diferente de quantidade × valor unitário");
    if (service?.eh_perfuracao && !row.categoria) problems.push("categoria de perfuração obrigatória");
    if ((currentCounts.get(signature(row)) ?? 0) > 1 || priorSignatures.has(signature(row))) problems.push("linha duplicada");
    return problems;
  };
  const invalidRows = activeRows.filter((row) => rowProblems(row).length > 0);

  const distribute = useMutation({
    mutationFn: async () => {
      const activeUser = data?.user;
      if (!activeUser || !file || !path || !importId) throw new Error("Arquivo ou sessão indisponível.");
      if (!activeRows.length) throw new Error("Nenhuma linha está pronta para distribuir.");
      if (invalidRows.length) throw new Error("Revise as linhas destacadas antes de distribuir.");

      const createdMeasurements: string[] = [];
      try {
        for (const workId of involvedWorks) {
          const workRows = activeRows.filter((row) => row.obraId === workId);
          const dates = workRows.map((row) => row.data).sort();
          const { data: number, error: numberError } = await supabase.rpc("proximo_numero_medicao", { _obra: workId });
          if (numberError || !number) throw numberError ?? new Error("Não foi possível numerar a medição.");
          const { data: previous, error: previousError } = await supabase
            .from("medicoes")
            .select("valor_total")
            .eq("obra_id", workId)
            .neq("status", "cancelada")
            .lt("numero", number);
          if (previousError) throw previousError;
          const previousTotal = (previous ?? []).reduce((sum, measurement) => sum + measurement.valor_total, 0);
          const workTotal = workRows.reduce((sum, row) => sum + row.valorTotal, 0);
          const { data: measurement, error: measurementError } = await supabase
            .from("medicoes")
            .insert({
              obra_id: workId,
              numero: number,
              data_inicio: dates[0] ?? null,
              data_fim: dates.at(-1) ?? null,
              origem: "planilha_importada",
              status: "emitida",
              valor_total: workTotal,
              acumulado_anterior: previousTotal,
              importacao_id: importId,
              observacoes: `Importada de ${file.name}`,
              created_by: activeUser.id,
            })
            .select("id")
            .single();
          if (measurementError) throw measurementError;
          createdMeasurements.push(measurement.id);
          const { error: itemError } = await supabase.from("medicao_itens").insert(
            workRows.map((row) => ({
              medicao_id: measurement.id,
              servico_id: row.servicoId,
              descricao: row.servicoTexto,
              categoria_perfuracao: row.categoria,
              quantidade: row.quantidade,
              unidade: row.unidade,
              preco_encontrado: row.valorUnitario,
              valor_total: row.valorTotal,
              created_by: activeUser.id,
            })),
          );
          if (itemError) throw itemError;
        }

        const aliases = activeRows.filter((row) => row.match === "revisar" && row.obraTexto.trim());
        for (const row of aliases) {
          const center = data.centers.find((item) => item.obra_id === row.obraId);
          if (!center) continue;
          const { error: aliasError } = await supabase.from("cc_aliases").upsert(
            {
              centro_custo_id: center.id,
              texto_normalizado: normalize(row.obraTexto),
              created_by: activeUser.id,
            },
            { onConflict: "texto_normalizado" },
          );
          if (aliasError) throw aliasError;
        }

        const summary = {
          total_declarado: declaredTotal,
          usuario: activeUser.email ?? "Usuário",
          linhas_distribuidas: activeRows.length,
          obras: involvedWorks.map((id) => data.works.find((work) => work.id === id)?.nome ?? id),
          medicoes: createdMeasurements,
          linhas: activeRows.map((row) => ({
            obra_texto: row.obraTexto,
            obra_id: row.obraId,
            data: row.data,
            servico: row.servicoTexto,
            categoria_perfuracao: row.categoria,
            quantidade: row.quantidade,
            unidade: row.unidade,
            valor_unitario: row.valorUnitario,
            valor_total: row.valorTotal,
          })),
        };
        const { error: updateError } = await supabase
          .from("importacoes")
          .update({
            status: "concluida",
            linhas_total: activeRows.length,
            valor_total: total,
            entidades_envolvidas: involvedWorks,
            resumo: summary as unknown as Json,
          })
          .eq("id", importId);
        if (updateError) throw updateError;
        return { lines: activeRows.length, works: involvedWorks.length };
      } catch (caught) {
        for (const measurementId of createdMeasurements) {
          await supabase.from("medicao_itens").delete().eq("medicao_id", measurementId);
          await supabase.from("medicoes").delete().eq("id", measurementId);
        }
        await supabase.from("importacoes").update({ status: "erro" }).eq("id", importId);
        throw caught;
      }
    },
    onSuccess: ({ lines, works }) => {
      setMessage(`${lines} linhas distribuídas em ${works} obras.`);
      setRows([]);
      setHeaders([]);
      setRawRows([]);
      setFile(null);
      setPath("");
      setImportId("");
      setDeclaredTotal(null);
      queryClient.invalidateQueries({ queryKey: ["measurement-imports"] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["obra"] });
      toast.success(`${lines} linhas distribuídas em ${works} obras.`);
    },
    onError: (caught) => toast.error(caught.message),
  });

  const discard = async () => {
    if (importId) await supabase.from("importacoes").update({ status: "descartada" }).eq("id", importId);
    setRows([]);
    setHeaders([]);
    setRawRows([]);
    setFile(null);
    setPath("");
    setImportId("");
    setDeclaredTotal(null);
    setMessage("");
    queryClient.invalidateQueries({ queryKey: ["measurement-imports"] });
  };

  const download = async (storagePath: string, name: string) => {
    const { data: signed, error: signedError } = await supabase.storage.from("importacoes").createSignedUrl(storagePath, 300);
    if (signedError || !signed) {
      toast.error("Não foi possível baixar o arquivo original.");
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = signed.signedUrl;
    anchor.download = name;
    anchor.click();
  };

  const history = useMemo(() => data?.imports ?? [], [data]);

  const undo = useMutation({
    mutationFn: async (id: string) => {
      const { data: count, error: undoError } = await supabase.rpc("desfazer_importacao_medicao", { _importacao: id });
      if (undoError) throw undoError;
      return count;
    },
    onSuccess: (count) => {
      toast.success(`${count ?? 0} medição(ões) desta importação foram canceladas.`);
      setDetail(null);
      queryClient.invalidateQueries({ queryKey: ["measurement-imports"] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["obra"] });
    },
    onError: (caught) => toast.error(caught.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando importações…</p>;
  if (error || !data) return <p className="text-sm text-destructive">Não foi possível carregar as importações.</p>;
  if (data.role !== "admin" && data.role !== "escritorio") {
    return <p className="py-20 text-center text-muted-foreground">Seu perfil não pode importar medições.</p>;
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-bold uppercase text-primary">Medição recebida do cliente</p>
        <h2 className={`font-display font-bold ${embedded ? "text-2xl" : "text-3xl"}`}>Importar planilha de medição</h2>
        <p className="mt-2 text-sm text-muted-foreground">Use o arquivo do cliente para conferir quantidades e valores com a medição da MMcosta. Cada linha pode ser distribuída para uma obra diferente.</p>
      </header>

      <section className="border-t-2 border-primary bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-xl font-bold">Novo arquivo</h2>
        <input
          ref={fileInput}
          className="hidden"
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) void choose(selected);
            event.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload /> {file ? "Trocar arquivo" : "Escolher arquivo"}
          </Button>
          {file && <span className="text-sm">{file.name}</span>}
          {file && /\.pdf$/i.test(file.name) && (
            <Button onClick={() => void readPdf()} disabled={reading}>
              {reading ? <LoaderCircle className="animate-spin" /> : <FileSpreadsheet />}
              {reading ? "Lendo PDF…" : "Ler PDF"}
            </Button>
          )}
        </div>

        {headers.length > 0 && (
          <div className="mt-7 border-t pt-6">
            <h3 className="font-display text-lg font-bold">Confirme as colunas identificadas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Em planilhas com Anterior, Atual e Acumulado, use a coluna Atual.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {fields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Select
                    value={mapping[key] === null ? "none" : String(mapping[key])}
                    onValueChange={(value) => {
                      const next = { ...mapping, [key]: value === "none" ? null : Number(value) };
                      setMapping(next);
                      fromRaw(next);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não mapear</SelectItem>
                      {headers.map((header, index) => <SelectItem key={`${header}-${index}`} value={String(index)}>{header}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold">Confira a obra de cada linha antes de distribuir</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1080px] text-sm">
                <thead className="border-y bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
                  <tr><th className="p-3">Obra</th><th>Data</th><th>Serviço</th><th>Categoria</th><th>Qtd.</th><th>Unid.</th><th className="text-right">Valor</th><th /></tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const service = data.services.find((item) => item.id === row.servicoId);
                    const problems = row.obraId === "ignore" ? [] : rowProblems(row);
                    const invalid = problems.length > 0;
                    return (
                      <tr key={row.key} className={`border-b align-top ${invalid ? "bg-warning/10" : ""}`}>
                        <td className="p-3">
                          <Select
                            value={row.obraId || "none"}
                            onValueChange={(value) => updateRow(row.key, { obraId: value, match: value && value !== "none" && value !== "ignore" ? "revisar" : row.match })}
                          >
                            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Não identificada</SelectItem>
                              <SelectItem value="ignore">Ignorar linha</SelectItem>
                              {data.works.map((work) => <SelectItem key={work.id} value={work.id}>{work.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <p className={`mt-1 text-xs ${row.match === "auto" ? "text-good" : "text-warning"}`}>{row.match} · {row.obraTexto || "sem texto original"}</p>
                        </td>
                        <td><Input type="date" className="w-36 font-mono" value={row.data} onChange={(event) => updateRow(row.key, { data: event.target.value })} /></td>
                        <td>
                          <Input className="w-64" value={row.servicoTexto} onChange={(event) => updateRow(row.key, { servicoTexto: event.target.value, servicoId: matchService(event.target.value), categoria: categoryFrom(event.target.value) })} />
                          <p className="mt-1 text-xs text-muted-foreground">{service ? `Catálogo: ${service.nome}` : "Serviço sem correspondência no catálogo"}</p>
                          {problems.length > 0 && <p className="mt-1 text-xs text-warning">{problems.join(" · ")}</p>}
                        </td>
                        <td>
                          {(service?.eh_perfuracao || row.categoria) ? (
                            <Select value={row.categoria ?? "none"} onValueChange={(value) => updateRow(row.key, { categoria: value === "none" ? null : value as Category })}>
                              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="none">Selecione</SelectItem><SelectItem value="solo">Solo</SelectItem><SelectItem value="rocha_alterada">Rocha alterada</SelectItem><SelectItem value="rocha">Rocha</SelectItem></SelectContent>
                            </Select>
                          ) : "—"}
                        </td>
                        <td><Input className="w-24 font-mono" inputMode="decimal" value={String(row.quantidade).replace(".", ",")} onChange={(event) => { const quantity = numberValue(event.target.value); const nextTotal = quantity * row.valorUnitario; updateRow(row.key, { quantidade: quantity, valorTotal: nextTotal, valorInformado: nextTotal }); }} /></td>
                        <td><Input className="w-24" value={row.unidade} onChange={(event) => updateRow(row.key, { unidade: event.target.value })} /></td>
                        <td className="text-right">
                          <Input className="w-32 font-mono text-right" inputMode="decimal" value={String(row.valorTotal).replace(".", ",")} onChange={(event) => { const value = numberValue(event.target.value); updateRow(row.key, { valorTotal: value, valorUnitario: row.quantidade ? value / row.quantidade : 0, valorInformado: value }); }} />
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{brl.format(row.valorUnitario)} / {row.unidade || "un."}</p>
                        </td>
                        <td><Button variant="ghost" size="icon" aria-label="Remover linha" onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}><Trash2 /></Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
              <p className="mr-auto text-sm font-semibold">
                <span className="font-mono">{activeRows.length}</span> linhas · <span className="font-mono">{brl.format(total)}</span> · <span className="font-mono">{involvedWorks.length}</span> obras envolvidas
                {declaredTotal !== null && <> · declarado <span className="font-mono">{brl.format(declaredTotal)}</span></>}
              </p>
              <Button variant="outline" onClick={() => void discard()}>Descartar</Button>
              <Button disabled={distribute.isPending || invalidRows.length > 0} onClick={() => distribute.mutate()}>
                {distribute.isPending && <LoaderCircle className="animate-spin" />} Distribuir lançamentos
              </Button>
            </div>
            {invalidRows.length > 0 && <p className="mt-2 text-sm text-warning">{invalidRows.length} linha(s) precisam de revisão antes de distribuir.</p>}
          </div>
        )}
        {message && <p className="mt-4 bg-good/10 p-3 text-sm font-medium text-good">{message}</p>}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Histórico de importações</h2>
        <p className="mt-1 text-sm text-muted-foreground">Arquivos de todas as obras.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-y bg-muted/50 text-left text-[11px] uppercase text-muted-foreground">
              <tr><th className="p-3">Data</th><th>Arquivo</th><th>Usuário</th><th>Linhas</th><th className="text-right">Total</th><th>Obras / medições</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const entities = Array.isArray(item.entidades_envolvidas) ? item.entidades_envolvidas : [];
                const summary = item.resumo && typeof item.resumo === "object" && !Array.isArray(item.resumo) ? item.resumo as Record<string, unknown> : {};
                const workNames = Array.isArray(summary["obras"]) ? summary["obras"].map(String) : entities.map((id) => data.works.find((work) => work.id === id)?.nome ?? String(id));
                const linked = data.measurements.filter((measurement) => measurement.importacao_id === item.id);
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 font-mono">{dateBR(item.created_at)}</td>
                    <td>{item.arquivo_nome}</td>
                    <td>{String(summary["usuario"] ?? (item.created_by === data.user?.id ? data.user.email ?? "Usuário" : "Usuário"))}</td>
                    <td className="font-mono">{item.linhas_total}</td>
                    <td className="text-right font-mono font-semibold">{brl.format(item.valor_total)}</td>
                    <td className="max-w-xs"><span className="block truncate">{workNames.length ? workNames.join(", ") : "—"}</span><span className="text-xs text-muted-foreground">{linked.map((measurement) => `${data.works.find((work) => work.id === measurement.obra_id)?.nome ?? "Obra"} · medição ${measurement.numero} · ${measurement.status}`).join("; ") || "Sem medição vinculada"}</span></td>
                    <td><span className="bg-muted px-2 py-1 text-xs font-semibold">{item.status}</span></td>
                    <td><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Ver detalhe" onClick={() => setDetail({ ...summary, id: item.id, arquivo: item.arquivo_nome, status: item.status, medicoes: linked })}><Eye /></Button><Button variant="ghost" size="icon" aria-label="Baixar original" onClick={() => void download(item.arquivo_path, item.arquivo_nome)}><Download /></Button>{item.status === "concluida" && <Button variant="ghost" size="icon" aria-label="Desfazer importação" disabled={undo.isPending} onClick={() => confirm("Desfazer esta importação? Somente as medições geradas por este arquivo serão canceladas.") && undo.mutate(item.id)}><RotateCcw /></Button>}</div></td>
                  </tr>
                );
              })}
              {history.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Nenhuma importação de medição registrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>Detalhe da importação</DialogTitle><DialogDescription>{String(detail?.["arquivo"] ?? "Arquivo importado")} · {String(detail?.["status"] ?? "")}</DialogDescription></DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-y bg-muted/50 text-left text-[11px] uppercase text-muted-foreground"><tr><th className="p-3">Obra</th><th>Data</th><th>Serviço</th><th>Qtd.</th><th>Unid.</th><th className="text-right">Valor</th></tr></thead>
              <tbody>{Array.isArray(detail?.["linhas"]) && (detail["linhas"] as Array<Record<string, unknown>>).map((line, index) => <tr key={index} className="border-b"><td className="p-3">{String(line["obra_texto"] ?? "—")}</td><td className="font-mono">{dateBR(String(line["data"] ?? ""))}</td><td>{String(line["servico"] ?? "—")}</td><td className="font-mono">{Number(line["quantidade"] ?? 0).toLocaleString("pt-BR")}</td><td>{String(line["unidade"] ?? "—")}</td><td className="text-right font-mono">{brl.format(Number(line["valor_total"] ?? 0))}</td></tr>)}</tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}