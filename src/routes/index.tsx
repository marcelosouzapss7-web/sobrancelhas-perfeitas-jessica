import { createFileRoute } from "@tanstack/react-router";
import { Play, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/")({
  component: Index,
});

function toEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

function VideoPlayer() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("video_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setVideoUrl(data?.video_url ?? null);
        setLoaded(true);
      });
  }, []);


  const embed = videoUrl ? toEmbed(videoUrl) : null;

  return (
    <div className="mt-8 rounded-xl overflow-hidden relative aspect-video bg-black shadow-2xl ring-1 ring-white/5">
      {embed ? (
        <iframe
          src={embed}
          title="Vídeo"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
          {loaded ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={28} className="ml-1" />
              </div>
              <span>Vídeo em breve</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function GoldText({ children }: { children: React.ReactNode }) {
  return <span className="text-gold">{children}</span>;
}
function BannerGallery() {
  const [banners, setBanners] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("banner_1, banner_2, banner_3")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const list = [data?.banner_1, data?.banner_2, data?.banner_3].filter(
          (u): u is string => !!u,
        );
        setBanners(list);
      });
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {banners.map((url, i) => (
        <div key={i} className="rounded-2xl overflow-hidden ring-1 ring-gold/30 aspect-square bg-black/40">
          <img src={url} alt={`Banner ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}


function Divider() {
  return (
    <div className="flex justify-center my-8">
      <svg width="180" height="20" viewBox="0 0 180 20" fill="none">
        <path d="M10 10 L70 10" stroke="var(--gold)" strokeWidth="1" />
        <path d="M110 10 L170 10" stroke="var(--gold)" strokeWidth="1" />
        <path d="M75 10 Q90 2 105 10 Q90 18 75 10" stroke="var(--gold)" strokeWidth="1" fill="none" />
        <circle cx="90" cy="10" r="1.5" fill="var(--gold)" />
      </svg>
    </div>
  );
}

function ProVoceCard({ text }: { text: string }) {
  return (
    <div className="border border-gold/40 rounded-2xl p-6 bg-black/30 backdrop-blur-sm">
      <h3 className="font-serif text-2xl text-gold mb-4 italic">Pra Você...</h3>
      <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}

function GoldButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="relative group">
      <div className="absolute inset-0 bg-gradient-to-b from-gold-light to-gold rounded-full blur-md opacity-70" />
      <div className="relative bg-gradient-to-b from-gold-light via-gold to-yellow-700 text-black font-semibold px-10 py-4 rounded-full border border-yellow-200 shadow-xl">
        {children}
      </div>
    </button>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <section className="px-5 pt-10 pb-8 max-w-2xl mx-auto text-center">
        <h1 className="font-serif text-2xl sm:text-3xl leading-tight uppercase tracking-wide">
          Método <GoldText>Único e Simples</GoldText> que eu uso pra fazer{" "}
          <GoldText>Sobrancelhas Impecáveis</GoldText> e com isso ter a agenda lotada.
        </h1>
        <p className="mt-6 text-sm text-foreground/80 leading-relaxed">
          Descubra o Método Exclusivo que já ajudou mais de 80.000 mil mulheres a
          transformar sua vida com Design de Sobrancelhas.
        </p>

        <VideoPlayer />

        <div className="mt-10 space-y-1">
          <p className="text-sm text-foreground/70">de R$ 447,00 Por Apenas</p>
          <p className="font-serif text-2xl text-gold">12X DE</p>
          <p className="font-serif text-6xl text-gold font-semibold tracking-tight">R$ 15,20</p>
          <p className="text-sm text-foreground/70">Ou R$ 147,00 á vista</p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoldButton>Sim, quero começar agora!</GoldButton>
        </div>

        <Divider />
      </section>

      <section className="px-5 py-8 max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl text-center uppercase tracking-wide">
          Pra <GoldText>Quem</GoldText> É O Curso?
        </h2>
        <div className="mt-8 space-y-6">
          <ProVoceCard text="Mulheres que buscam uma renda extra para poder deixar o emprego atual e ser sua própria patroa trabalhando na estética." />
          <ProVoceCard text="Que procura o passo a passo prático e sem enrolação para ter resultados em Design de Sobrancelha." />
          <ProVoceCard text="Que quer aprender a fazer Sobrancelhas Impecáveis, e assim ter a agenda Cheia, adquirindo independência financeira." />
        </div>
      </section>

      <section className="px-5 py-10 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-xl uppercase tracking-wide leading-snug">
          O curso Sobrancelhas Perfeitas <GoldText>não é</GoldText> simplesmente um curso qualquer!
        </h2>
        <Divider />
        <p className="font-semibold">
          Se Você quer mudar de vida e se tornar uma especialista em design de sobrancelha...
        </p>
        <div className="mt-6 space-y-4 text-sm text-foreground/85 leading-relaxed text-left">
          <p>
            Meu Curso Design de Sobrancelha é o ponto de partida perfeito para você. Com aulas
            práticas e teóricas, você aprenderá todas as técnicas essenciais para criar
            Sobrancelhas Perfeitas, realçando a beleza natural de cada cliente.
          </p>
          <p>
            Não importa se você está começando do zero, nosso curso é projetado para atender a
            todos os níveis de habilidade. Com flexibilidade total, você pode estudar no seu
            próprio ritmo e conciliar os estudos com sua rotina atual.
          </p>
        </div>

        <BannerGallery />

      </section>

      <section className="px-5 py-10 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl uppercase tracking-wide">
          Alunas estão tendo <GoldText>a vida transformada!</GoldText>
        </h2>
        <Divider />
        <div className="flex justify-center mt-4">
          <GoldButton>Sim, quero começar agora!</GoldButton>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-foreground/50">
        © {new Date().getFullYear()} Sobrancelhas Perfeitas
      </footer>

      <a
        href="#"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-2xl hover:scale-105 transition"
      >
        <MessageCircle className="text-white" size={26} fill="white" />
      </a>
    </div>
  );
}
