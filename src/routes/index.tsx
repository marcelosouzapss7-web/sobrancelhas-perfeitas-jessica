import { createFileRoute } from "@tanstack/react-router";
import { Play, MessageCircle, CheckCircle2 } from "lucide-react";
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
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {banners.map((url, i) => (
        <div key={i} className="rounded-2xl overflow-hidden ring-1 ring-gold/30 aspect-[3/4] sm:aspect-[3/5] bg-black/40">
          <img src={url} alt={`Banner ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

type Ref = { id: string; image_url: string; username: string | null; subtitle: string | null };

function ReferenciasGallery() {
  const [items, setItems] = useState<Ref[]>([]);

  useEffect(() => {
    supabase
      .from("referencias")
      .select("id, image_url, username, subtitle")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as Ref[]));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      {items.map((r) => (
        <article key={r.id} className="rounded-2xl overflow-hidden bg-white text-black shadow-xl ring-1 ring-gold/20">
          <header className="flex items-center gap-3 px-3 py-2 border-b border-black/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src={r.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold truncate">{r.username ?? ""}</p>
              {r.subtitle && <p className="text-[11px] text-black/60 truncate">{r.subtitle}</p>}
            </div>
          </header>
          <div className="aspect-square bg-black/5">
            <img src={r.image_url} alt={r.username ?? "Aluna"} loading="lazy" className="w-full h-full object-cover" />
          </div>
        </article>
      ))}
    </div>
  );
}

type Av = { id: string; image_url: string };

function AvaliacoesGallery() {
  const [items, setItems] = useState<Av[]>([]);

  useEffect(() => {
    supabase
      .from("avaliacoes")
      .select("id, image_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as Av[]));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      {items.map((a) => (
        <div key={a.id} className="rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-gold/20">
          <img src={a.image_url} alt="Avaliação" loading="lazy" className="w-full h-auto object-contain" />
        </div>
      ))}
    </div>
  );
}

type Trab = { id: string; image_url: string };

function TrabalhosGallery() {
  const [items, setItems] = useState<Trab[]>([]);

  useEffect(() => {
    supabase
      .from("trabalhos")
      .select("id, image_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => setItems((data ?? []) as Trab[]));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-8 space-y-5">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl overflow-hidden ring-1 ring-gold/30 bg-black/40">
          <img src={t.image_url} alt="Trabalho" loading="lazy" className="w-full h-auto object-cover" />
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
        <ReferenciasGallery />
        <AvaliacoesGallery />
        <div className="flex justify-center mt-8">
          <GoldButton>Sim, quero começar agora!</GoldButton>
        </div>
      </section>

      <section className="px-5 py-10 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2xl uppercase tracking-wide">
          Veja o que você vai <GoldText>aprender!</GoldText>
        </h2>
        <Divider />
        <ul className="mt-6 space-y-3 text-left">
          {[
            "Anatomia da Pele",
            "Anatomia do Pelo",
            "Tipos de Rosto",
            "Tipos de Olhos",
            "Tipos de Pinça",
            "Conduta do Profissional",
            "Como age a Henna e a Tintura",
            "Durabilidade da Henna e Tintura",
            "Treino de Design",
            "Treino de Aplicação de Henna",
            "Epilação Egípcia Facial",
            "Como Escolher o Tom Ideal de Henna",
            "Oxidação de Henna",
            "Design Masculino",
            "Teste de Alergia",
            "Ficha de Anamnese",
            "Aplicação de Tintura Masculina",
            "Cuidados pós Henna e Tintura",
            "Biossegurança",
            "Como Encontrar o Ponto Inicial",
            "Como Encontrar o Ponto Alto",
            "Como Encontrar o Ponto Final",
            "Espessura Ideal de Sobrancelha",
            "Mapeamento com Linha",
            "Marcação à Mão Livre",
            "Design em Sobrancelhas Retas",
            "Design Sobrancelhas Falhadas",
            "Design em Sobrancelhas Finas",
            "Design em Adolescente",
            "Protocolo Henna + Tintura",
            "Como Cortar Sobrancelhas Onduladas",
            "Técnica da Epilação com linha",
            "Design Feminino com Linha e Pinça",
            "Henna Ombré",
            "Preparação e Aplicação Henna SourCil",
            "Preparação e Aplicação Henna Menela",
            "Preparação e Aplicação La Benig",
            "Aplicação de Tintura Urbanique",
            "Tintura Refectocil em Pelos Grisalhos",
            "Alinhamento Perfeito",
            "Correção com Lápis",
            "Treino de Marcação no Papel",
            "Treino de Henna",
            "Fornecedores",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 border-l-4 border-gold bg-card/60 rounded-md px-4 py-3 text-sm"
            >
              <CheckCircle2 size={18} className="text-gold shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-serif text-xl tracking-wide">E MUITO MAIS...</p>

        <div className="flex justify-center mt-6">
          <GoldButton>Sim, quero começar agora!</GoldButton>
        </div>
      </section>

      <section className="px-5 py-10 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-xl uppercase tracking-wide leading-snug">
          Está pronta para fazer trabalhos <GoldText>incríveis como esses?</GoldText>
        </h2>
        <Divider />
        <TrabalhosGallery />
      </section>

      <section className="px-5 py-10 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-xl uppercase tracking-wide leading-snug">
          Adquira hoje e receba <GoldText>05 bônus especiais!</GoldText>
        </h2>
        <Divider />

        <div className="mt-8 space-y-6">
          {[
            {
              n: "01",
              title: "SUPORTE DIRETO COM A PROFESSORA ONLINE",
              desc: "Você terá acesso direto comigo para ter suporte e tirar suas dúvidas.",
              price: "Custa R$ 997,00",
            },
            {
              n: "02",
              title: "EPILAÇÃO EGÍPCIA",
              desc: "Aprenda a fazer de forma profissional a técnica de epilação com a linha.",
              price: "Custa R$ 147,00",
            },
            {
              n: "03",
              title: "DESCOLORAÇÃO E COLORAÇÃO EM RUIVAS",
              desc: "Técnica de como colorir e descolorir perfeitamente.",
              price: "Custa R$ 37,00",
            },
            {
              n: "04",
              title: "CORREÇÃO COM LÁPIS DERMATOGRÁFICO",
              desc: "Como corrigir corretamente sobrancelhas com falhas pontuais.",
              price: "Custa R$ 27,00",
            },
            {
              n: "05",
              title: "COMO FAZER A FOTOGRAFIA PERFEITA",
              desc: "Aprenda a fazer de forma profissional Fotografias Perfeitas para a Divulgação de seus Trabalhos.",
              price: "Custa R$ 37,00",
            },
          ].map((b) => (
            <div
              key={b.n}
              className="rounded-2xl bg-card/60 border border-gold/20 p-6 text-left"
            >
              <div className="flex justify-center -mt-10 mb-5">
                <div className="px-8 py-2 rounded-full border border-gold bg-black">
                  <span className="font-serif text-gold text-lg">Bônus {b.n}</span>
                </div>
              </div>
              <h3 className="font-serif text-gold text-lg uppercase tracking-wide mb-3">
                {b.title}
              </h3>
              <p className="text-sm text-foreground/85 leading-relaxed mb-4">{b.desc}</p>
              <p className="text-sm line-through text-red-500">{b.price}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
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
