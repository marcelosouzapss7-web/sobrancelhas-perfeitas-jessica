import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/referencias")({
  component: ReferenciasAdmin,
});

type Ref = {
  id: string;
  image_url: string;
  storage_path: string | null;
  username: string | null;
  subtitle: string | null;
  sort_order: number;
};

async function loadAll(): Promise<Ref[]> {
  const { data, error } = await supabase
    .from("referencias")
    .select("id, image_url, storage_path, username, subtitle, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Ref[];
}

function ReferenciasAdmin() {
  const [items, setItems] = useState<Ref[]>([]);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const refresh = () => loadAll().then(setItems).catch((e) => toast.error(e.message));
  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!file) { toast.error("Selecione uma imagem"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `ref-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("references").upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("references").createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;

      const { error: dbErr } = await supabase.from("referencias").insert({
        image_url: signed.signedUrl,
        storage_path: path,
        username: username || null,
        subtitle: subtitle || null,
        sort_order: items.length,
      });
      if (dbErr) throw dbErr;

      toast.success("Referência adicionada!");
      setUsername(""); setSubtitle(""); setFile(null);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao adicionar");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (r: Ref) => {
    if (!confirm("Remover esta referência?")) return;
    try {
      if (r.storage_path) {
        await supabase.storage.from("references").remove([r.storage_path]);
      }
      const { error } = await supabase.from("referencias").delete().eq("id", r.id);
      if (error) throw error;
      toast.success("Removida");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover");
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Referências</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Adicione fotos das suas alunas. Elas aparecerão na seção "Alunas estão tendo a vida transformada" no site.
      </p>

      <div className="border border-gold/30 rounded-xl p-5 bg-card mb-8 space-y-4">
        <h2 className="font-medium">Nova referência</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Usuário (ex: studioruth.s)</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="usuario.instagram" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Legenda (opcional)</label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Cidade, Estado" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file" accept="image/*" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gold/40 hover:bg-white/5">
              <Upload size={16} /> {file ? file.name : "Escolher imagem"}
            </span>
          </label>
          <Button onClick={handleAdd} disabled={uploading || !file}>
            {uploading ? "Enviando..." : "Adicionar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((r) => (
          <div key={r.id} className="border border-gold/30 rounded-xl overflow-hidden bg-card">
            <div className="aspect-[3/4] bg-black/40">
              <img src={r.image_url} alt={r.username ?? "Referência"} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.username ?? "—"}</p>
                {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(r)}>
                <Trash2 size={16} className="text-red-400" />
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">Nenhuma referência ainda.</p>
        )}
      </div>
    </div>
  );
}
