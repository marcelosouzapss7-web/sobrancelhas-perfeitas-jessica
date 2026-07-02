import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/video")({
  component: VideoAdmin,
});

function VideoAdmin() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("video_url").maybeSingle().then(({ data }) => {
      setUrl(data?.video_url ?? "");
    });
  }, []);

  const save = async () => {
    setLoading(true);
    const { data: existing } = await supabase.from("site_settings").select("id").maybeSingle();
    const { error } = existing
      ? await supabase.from("site_settings").update({ video_url: url, updated_at: new Date().toISOString() }).eq("id", existing.id)
      : await supabase.from("site_settings").insert({ video_url: url });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Vídeo salvo!");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-gold mb-2">Vídeo</h1>
      <p className="text-muted-foreground mb-6 text-sm">Cole aqui o link do vídeo que aparecerá na página inicial (YouTube, Vimeo, etc).</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="url">URL do vídeo</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button onClick={save} disabled={loading} className="bg-gold text-black hover:bg-gold/90">
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {url && (
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={toEmbed(url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    return url;
  } catch {
    return url;
  }
}
