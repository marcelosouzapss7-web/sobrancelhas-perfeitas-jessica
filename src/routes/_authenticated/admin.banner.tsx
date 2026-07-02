import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banner")({
  component: BannerAdmin,
});

type SlotKey = "banner_1" | "banner_2" | "banner_3";
const SLOTS: { key: SlotKey; label: string }[] = [
  { key: "banner_1", label: "Imagem 1" },
  { key: "banner_2", label: "Imagem 2" },
  { key: "banner_3", label: "Imagem 3" },
];

function load(): Promise<Record<SlotKey, string | null> & { id?: string }> {
  return supabase
    .from("site_settings")
    .select("id, banner_1, banner_2, banner_3")
    .maybeSingle()
    .then(({ data }) => ({
      id: data?.id,
      banner_1: data?.banner_1 ?? null,
      banner_2: data?.banner_2 ?? null,
      banner_3: data?.banner_3 ?? null,
    }));
}

function BannerAdmin() {
  const [state, setState] = useState<Record<SlotKey, string | null>>({
    banner_1: null,
    banner_2: null,
    banner_3: null,
  });
  const [rowId, setRowId] = useState<string | undefined>();
  const [uploadingSlot, setUploadingSlot] = useState<SlotKey | null>(null);

  useEffect(() => {
    load().then((data) => {
      setRowId(data.id);
      setState({ banner_1: data.banner_1, banner_2: data.banner_2, banner_3: data.banner_3 });
    });
  }, []);

  const handleUpload = async (slot: SlotKey, file: File) => {
    setUploadingSlot(slot);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slot}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("banners").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      // Gera signed URL de longa duração (1 ano)
      const { data: signed, error: signErr } = await supabase.storage
        .from("banners")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      const url = signed.signedUrl;

      const payload = { [slot]: url, updated_at: new Date().toISOString() };
      const { error: dbErr } = rowId
        ? await supabase.from("site_settings").update(payload).eq("id", rowId)
        : await supabase.from("site_settings").insert(payload);
      if (dbErr) throw dbErr;

      setState((s) => ({ ...s, [slot]: url }));
      toast.success(`${slot} atualizado!`);
      if (!rowId) {
        const fresh = await load();
        setRowId(fresh.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Banner</h1>
      <p className="text-muted-foreground mb-6 text-sm">Envie as 3 imagens do banner que aparecerão na página inicial.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SLOTS.map((slot) => (
          <div key={slot.key} className="border border-gold/30 rounded-xl p-4 bg-card">
            <p className="font-medium mb-3">{slot.label}</p>
            <div className="aspect-square rounded-lg overflow-hidden bg-black/40 mb-3 flex items-center justify-center">
              {state[slot.key] ? (
                <img src={state[slot.key]!} alt={slot.label} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">Sem imagem</span>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(slot.key, f);
                  e.target.value = "";
                }}
              />
              <Button asChild variant="outline" className="w-full cursor-pointer" disabled={uploadingSlot === slot.key}>
                <span>
                  <Upload size={16} className="mr-2" />
                  {uploadingSlot === slot.key ? "Enviando..." : "Enviar imagem"}
                </span>
              </Button>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
