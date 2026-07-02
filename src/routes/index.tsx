import { createFileRoute } from "@tanstack/react-router";
import { Play, Volume2, Maximize2, Share2, Clock, MessageCircle } from "lucide-react";
import heroWoman from "@/assets/hero-woman.jpg";
import eyebrowsCollage from "@/assets/eyebrows-collage.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function GoldText({ children }: { children: React.ReactNode }) {
  return <span className="text-gold">{children}</span>;
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

        <div className="mt-8 rounded-xl overflow-hidden relative aspect-video bg-black shadow-2xl ring-1 ring-white/5">
          <img src={heroWoman} alt="Jéssica Soares" className="w-full h-full object-cover" width={1024} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40" />
              <div className="text-left">
                <div className="font-semibold">Sobrancelhas Perfeitas</div>
                <div className="text-[10px] opacity-80">Jéssica Soares</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Volume2 size={16} />
              <span className="border border-white/50 rounded px-1 text-[9px]">CC</span>
            </div>
          </div>
          <button className="absolute inset-0 flex items-center justify-center" aria-label="Play">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
              <Play className="text-white ml-1" size={28} fill="white" />
            </div>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-2 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-white">
              <span>0:00 / 2:14</span>
              <div className="flex-1 h-0.5 bg-white/30 rounded">
                <div className="w-[5%] h-full bg-red-500 rounded" />
              </div>
              <Maximize2 size={12} />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex gap-3"><Share2 size={14} /><Clock size={14} /></div>
              <div className="text-[10px]">YouTube</div>
            </div>
          </div>
        </div>

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

        <div className="mt-8 rounded-2xl overflow-hidden ring-1 ring-gold/30">
          <img src={eyebrowsCollage} alt="Trabalhos de design de sobrancelha" width={1024} height={1024} loading="lazy" className="w-full" />
        </div>
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
