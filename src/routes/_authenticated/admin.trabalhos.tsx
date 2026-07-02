import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/trabalhos")({
  component: TrabalhosAdmin,
});

type Item = {
  id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
};

async function loadAll(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("trabalhos")
    .select("id, image_url, storage_path, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Item[];
}

function TrabalhosAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);

  const refresh = () => loadAll().then(setItems).catch((e) => toast.error(e.message));
  useEffect(() => { refresh(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `trab-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("references").upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("references").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;

      const { error: dbErr } = await supabase.from("trabalhos").insert({
        image_url: signed.signedUrl,
        storage_path: path,
        sort_order: items.length,
      });
      if (dbErr) throw dbErr;
      toast.success("Imagem adicionada!");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (r: Item) => {
    if (!confirm("Remover esta imagem?")) return;
    try {
      if (r.storage_path) await supabase.storage.from("references").remove([r.storage_path]);
      const { error } = await supabase.from("trabalhos").delete().eq("id", r.id);
      if (error) throw error;
      toast.success("Removida");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover");
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Mais Imagens</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Envie fotos dos seus trabalhos. Aparecerão no site logo abaixo da seção "Está pronta para fazer trabalhos incríveis como esses?".
      </p>

      <div className="border border-gold/30 rounded-xl p-5 bg-card mb-8">
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gold/40 hover:bg-white/5">
          <input
            type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <Upload size={16} /> {uploading ? "Enviando..." : "Enviar imagem"}
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((r) => (
          <div key={r.id} className="border border-gold/30 rounded-xl overflow-hidden bg-card">
            <div className="aspect-[3/4] bg-black/40">
              <img src={r.image_url} alt="Trabalho" className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex items-center justify-end">
              <Button size="sm" variant="ghost" onClick={() => handleDelete(r)}>
                <Trash2 size={16} className="text-red-400" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Nenhuma imagem ainda.</p>
        )}
      </div>
    </div>
  );
}
