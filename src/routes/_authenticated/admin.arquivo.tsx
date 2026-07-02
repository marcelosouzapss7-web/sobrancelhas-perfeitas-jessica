import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/arquivo")({
  component: ArquivoAdmin,
});

function ArquivoAdmin() {
  const [rowId, setRowId] = useState<string | undefined>();
  const [filePath, setFilePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("id, product_file_path")
      .maybeSingle();
    setRowId(data?.id);
    setFilePath((data as any)?.product_file_path ?? null);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Envie um arquivo PDF.");
      return;
    }
    setUploading(true);
    try {
      const path = `produto-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("produtos").upload(path, file, {
        upsert: true,
        contentType: "application/pdf",
      });
      if (upErr) throw upErr;

      // Remove arquivo antigo, se existir
      if (filePath && filePath !== path) {
        await supabase.storage.from("produtos").remove([filePath]);
      }

      const payload = { product_file_path: path, updated_at: new Date().toISOString() };
      const { error: dbErr } = rowId
        ? await supabase.from("site_settings").update(payload as never).eq("id", rowId)
        : await supabase.from("site_settings").insert(payload as never);
      if (dbErr) throw dbErr;

      setFilePath(path);
      toast.success("Arquivo PDF atualizado!");
      if (!rowId) await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!filePath) return;
    if (!confirm("Remover o arquivo PDF do produto?")) return;
    setRemoving(true);
    try {
      await supabase.storage.from("produtos").remove([filePath]);
      if (rowId) {
        await supabase.from("site_settings").update({ product_file_path: null } as never).eq("id", rowId);
      }
      setFilePath(null);
      toast.success("Arquivo removido.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover");
    } finally {
      setRemoving(false);
    }
  };

  const handlePreview = async () => {
    if (!filePath) return;
    const { data, error } = await supabase.storage.from("produtos").createSignedUrl(filePath, 60 * 5);
    if (error || !data) {
      toast.error("Não foi possível abrir o arquivo.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Arquivo do Produto</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Envie o PDF que será liberado para download automaticamente após o pagamento via Pix ser confirmado pela IronPay.
      </p>

      <div className="border border-gold/30 rounded-xl p-6 bg-card space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-gold" />
          <div className="flex-1">
            {filePath ? (
              <>
                <p className="font-medium">Arquivo enviado</p>
                <p className="text-xs text-muted-foreground break-all">{filePath}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <label>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button asChild variant="outline" className="cursor-pointer" disabled={uploading}>
              <span>
                <Upload size={16} className="mr-2" />
                {uploading ? "Enviando..." : filePath ? "Trocar arquivo" : "Enviar PDF"}
              </span>
            </Button>
          </label>

          {filePath && (
            <>
              <Button variant="outline" onClick={handlePreview}>
                <FileText size={16} className="mr-2" /> Visualizar
              </Button>
              <Button variant="destructive" onClick={handleRemove} disabled={removing}>
                <Trash2 size={16} className="mr-2" /> {removing ? "Removendo..." : "Remover"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
