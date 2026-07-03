import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/logo")({
  component: LogoAdmin,
});

async function load(): Promise<{ id?: string; checkout_logo: string | null }> {
  const { data } = await supabase
    .from("site_settings")
    .select("id, checkout_logo")
    .maybeSingle();
  return { id: data?.id, checkout_logo: (data as { checkout_logo?: string | null } | null)?.checkout_logo ?? null };
}

function LogoAdmin() {
  const [logo, setLogo] = useState<string | null>(null);
  const [rowId, setRowId] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load().then((d) => {
      setRowId(d.id);
      setLogo(d.checkout_logo);
    });
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `checkout-logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("banners").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("banners")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      const url = signed.signedUrl;

      const payload = { checkout_logo: url, updated_at: new Date().toISOString() };
      const { error: dbErr } = rowId
        ? await supabase.from("site_settings").update(payload as never).eq("id", rowId)
        : await supabase.from("site_settings").insert(payload as never);
      if (dbErr) throw dbErr;

      setLogo(url);
      toast.success("Logo do checkout atualizado!");
      if (!rowId) {
        const fresh = await load();
        setRowId(fresh.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Logo Checkout</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Envie a imagem que aparece no card do produto na página de checkout.
      </p>

      <div className="border border-gold/30 rounded-xl p-4 bg-card">
        <div className="aspect-square w-48 rounded-lg overflow-hidden bg-black/40 mb-4 flex items-center justify-center mx-auto">
          {logo ? (
            <img src={logo} alt="Logo checkout" className="w-full h-full object-cover" />
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
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <Button asChild variant="outline" className="w-full cursor-pointer" disabled={uploading}>
            <span>
              <Upload size={16} className="mr-2" />
              {uploading ? "Enviando..." : "Enviar imagem"}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
