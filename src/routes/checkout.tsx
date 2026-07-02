import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { CreditCard, Timer, Tag, ChevronDown, Award, ShieldCheck, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { createIronpayPix } from "@/lib/ironpay.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Curso Sobrancelhas Perfeitas" },
      { name: "description", content: "Finalize sua inscrição no Curso Sobrancelhas Perfeitas. Pagamento seguro via cartão ou Pix." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Checkout — Curso Sobrancelhas Perfeitas" },
      { property: "og:description", content: "Finalize sua inscrição com segurança." },
    ],
  }),
  component: CheckoutPage,
});

function TopTimer() {
  const [t, setT] = useState({ h: 0, m: 8, s: 9 });
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setT((p) => {
        let { h, m, s } = p;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="w-full bg-red-700 text-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <span className="hidden sm:inline">Finalize sua compra e dê o primeiro passo agora</span>
        <span className="font-mono text-lg font-bold tracking-wider">
          {pad(t.h)} : {pad(t.m)} : {pad(t.s)}
        </span>
        <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> Últimas Vagas!!</span>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const [method, setMethod] = useState<"card" | "pix">("pix");
  const [couponOpen, setCouponOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [document_, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; pix_code: string } | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createPix = useServerFn(createIronpayPix);

  const handleGeneratePix = async () => {
    setPixError(null);
    if (!email || email !== emailConfirm) {
      setPixError("Confirme o mesmo e-mail nos dois campos.");
      return;
    }
    if (!name.trim() || name.trim().length < 3) {
      setPixError("Informe seu nome completo.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanDoc = document_.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setPixError("Informe um celular válido (DDD + número).");
      return;
    }
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      setPixError("Informe um CPF ou CNPJ válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await createPix({
        data: {
          amount: 9990, // R$ 99,90 em centavos
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone_number: cleanPhone,
            document: cleanDoc,
          },
        },
      });
      if (!res.success) {
        setPixError(res.error);
      } else {
        setPixData({ qr_code: res.qr_code, pix_code: res.pix_code });
      }
    } catch (e) {
      setPixError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async () => {
    if (!pixData) return;
    try {
      await navigator.clipboard.writeText(pixData.pix_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };


  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <TopTimer />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Card do produto */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-4">
          <div className="flex justify-end mb-2">
            <button className="text-xs text-neutral-600 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px] font-bold">BR</span>
              Alterar país <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3">
            <div className="w-20 h-24 rounded bg-gradient-to-b from-neutral-800 to-neutral-600 flex items-center justify-center text-white text-[9px] text-center font-serif px-1">
              SOBRANCELHAS<br/>PERFEITAS
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-sm leading-tight">Curso Sobrancelhas Perfeitas - Oficial</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Autor: Lejé Academy</p>
              <p className="font-bold text-red-700 text-lg mt-1">R$ 99,90</p>
              <p className="text-xs text-neutral-600">ou em 12 x de R$ 8,33 * no cartão</p>
              <p className="text-xs text-neutral-500 mt-1">Curso Sobrancelhas Perfeitas 2.0</p>
            </div>
          </div>
        </div>

        {/* Dados pessoais */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-4 space-y-3">
          <h3 className="font-bold text-base">Dados pessoais</h3>
          <div>
            <label className="text-xs text-neutral-600 block mb-1">Seu email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu email para receber a compra" className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label className="text-xs text-neutral-600 block mb-1">Confirme seu email</label>
            <input type="email" value={emailConfirm} onChange={(e) => setEmailConfirm(e.target.value)} placeholder="Digite novamente seu email" className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label className="text-xs text-neutral-600 block mb-1">Nome completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome completo" className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label className="text-xs text-neutral-600 block mb-1">CPF ou CNPJ</label>
            <input type="text" value={document_} onChange={(e) => setDocument(e.target.value)} placeholder="Somente números" className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500" />
          </div>
          <div>
            <label className="text-xs text-neutral-600 block mb-1">Celular</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 border border-neutral-300 rounded px-2 py-2 text-sm">
                <span className="text-[10px] font-bold bg-neutral-200 px-1 rounded">BR</span>
                +55 <ChevronDown className="w-3 h-3" />
              </div>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(DDD) 99999-9999" className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500" />
            </div>
          </div>

        </div>

        {/* Cupom */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-4">
          <h3 className="font-bold text-base mb-2">Cupom de desconto</h3>
          <button
            type="button"
            onClick={() => setCouponOpen((v) => !v)}
            className="w-full border border-neutral-300 rounded px-3 py-3 flex items-center justify-between text-sm text-neutral-600"
          >
            <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Tem um cupom de desconto?</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${couponOpen ? "rotate-180" : ""}`} />
          </button>
          {couponOpen && (
            <div className="mt-3 flex gap-2">
              <input type="text" placeholder="Digite seu cupom" className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm" />
              <button className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Aplicar</button>
            </div>
          )}
        </div>

        {/* Forma de pagamento */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-4 space-y-3">
          <h3 className="font-bold text-base">Escolha a forma de pagamento</h3>

          <button
            type="button"
            onClick={() => { setMethod("card"); setPixData(null); setPixError(null); }}
            className={`w-full border rounded px-3 py-3 flex items-center gap-3 text-sm transition ${method === "card" ? "border-neutral-900 border-2" : "border-neutral-300"}`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "card" ? "border-neutral-900" : "border-neutral-400"}`}>
              {method === "card" && <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />}
            </span>
            <CreditCard className="w-5 h-5 text-neutral-700" />
            <span>Cartão de crédito</span>
          </button>

          <button
            type="button"
            onClick={() => { setMethod("pix"); setPixError(null); }}
            className={`w-full border rounded px-3 py-3 flex items-center gap-3 text-sm transition ${method === "pix" ? "border-neutral-900 border-2" : "border-neutral-300"}`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "pix" ? "border-neutral-900" : "border-neutral-400"}`}>
              {method === "pix" && <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />}
            </span>
            <span className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-6 h-6"><path fill="#32BCAD" d="M9.6 22.4a4.6 4.6 0 0 1-3.26-1.35L2.8 17.5a2.12 2.12 0 0 1 0-3l3.54-3.55A4.6 4.6 0 0 1 9.6 9.6h.8l-4.66 4.66a2.12 2.12 0 0 0 0 3l4.66 4.66h-.8Zm12.8 0h.8l4.66-4.66a2.12 2.12 0 0 0 0-3L23.2 10.08V9.6a4.6 4.6 0 0 1 3.26 1.35l3.54 3.55a2.12 2.12 0 0 1 0 3l-3.54 3.55A4.6 4.6 0 0 1 22.4 22.4Zm-6.4-3.2a3 3 0 0 1-2.12-.88L10.5 15a.75.75 0 0 1 0-1.06L13.88 10.56a3 3 0 0 1 4.24 0L21.5 13.94a.75.75 0 0 1 0 1.06l-3.38 3.32a3 3 0 0 1-2.12.88Z"/></svg>
            </span>
            <span>Pix</span>
          </button>

          {method === "card" && (
            <div className="space-y-3 pt-2">
              <div className="rounded border border-yellow-300 bg-yellow-50 text-yellow-900 text-xs px-3 py-2">
                No momento aceitamos pagamento apenas via <strong>Pix</strong>. Selecione a opção Pix para concluir a compra.
              </div>
              <input disabled type="text" placeholder="Número do cartão" className="w-full border border-neutral-200 bg-neutral-100 rounded px-3 py-2 text-sm text-neutral-400" />
              <input disabled type="text" placeholder="Nome impresso no cartão" className="w-full border border-neutral-200 bg-neutral-100 rounded px-3 py-2 text-sm text-neutral-400" />
              <div className="grid grid-cols-2 gap-2">
                <input disabled type="text" placeholder="MM/AA" className="border border-neutral-200 bg-neutral-100 rounded px-3 py-2 text-sm text-neutral-400" />
                <input disabled type="text" placeholder="CVV" className="border border-neutral-200 bg-neutral-100 rounded px-3 py-2 text-sm text-neutral-400" />
              </div>
              <button disabled className="w-full bg-neutral-300 text-neutral-500 font-bold py-3 rounded cursor-not-allowed">
                Indisponível
              </button>
            </div>
          )}

          {method === "pix" && !pixData && (
            <>
              {pixError && (
                <div className="rounded border border-red-300 bg-red-50 text-red-700 text-xs px-3 py-2">{pixError}</div>
              )}
              <button
                onClick={handleGeneratePix}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition mt-2 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Gerando Pix..." : "Gerar Pix"}
              </button>
            </>
          )}

          {method === "pix" && pixData && (
            <div className="mt-3 p-4 border-2 border-dashed border-green-600 rounded text-center space-y-3">
              {pixData.qr_code?.startsWith("data:image") ? (
                <img src={pixData.qr_code} alt="QR Code Pix" className="w-52 h-52 mx-auto" />
              ) : (
                <div className="w-52 h-52 mx-auto bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">QR Code indisponível</div>
              )}
              <p className="text-xs text-neutral-600">Escaneie o QR Code com o app do seu banco ou copie o código abaixo</p>
              <div className="bg-neutral-100 border border-neutral-200 rounded px-2 py-2 text-[10px] break-all font-mono text-neutral-700">
                {pixData.pix_code}
              </div>
              <button onClick={copyPix} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded transition">
                <Copy className="w-4 h-4" />
                {copied ? "Copiado!" : "Copiar código Pix"}
              </button>
              <p className="text-[11px] text-neutral-500">Após o pagamento, seu acesso é liberado automaticamente por e-mail.</p>
            </div>
          )}


          <p className="text-center text-xs text-neutral-500 pt-1">Protegido por <span className="font-bold">🔥 hotmart</span></p>
        </div>

        {/* Detalhes da compra */}
        <div className="bg-white rounded-md shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Detalhes da compra</span>
          </div>
          <div className="mt-3 border border-neutral-200 rounded px-3 py-3 flex items-center justify-between text-sm">
            <span>Curso Sobrancelhas Perfeitas - Oficial</span>
            <span className="text-green-700 font-bold">R$ 99,90</span>
          </div>
        </div>

        {/* Bloco escuro com termos */}
        <div className="bg-neutral-900 text-neutral-200 rounded-md p-4 text-[11px] leading-relaxed space-y-2">
          <p className="underline"><a href="#">Tem dúvidas sobre o produto? Entre em contato com</a></p>
          <p className="underline"><a href="#">Não consegue finalizar esta compra? Acesse nossa Central de Ajuda</a></p>
          <p>Caso precise solicitar atendimento, o código abaixo deve ser informado:</p>
          <p className="font-mono text-white text-xs">CKTID-J4108478E22aakscp1-1783025602949-8647</p>
          <p>Suas informações foram preenchidas automaticamente? <a href="#" className="underline">Clique aqui para saber mais</a>.</p>
          <p>
            Ao clicar em 'Comprar agora', eu declaro que li e concordo (i) que a Lejé Academy está processando este pedido em nome de <strong>Lejé Academy</strong> e não possui responsabilidade pelo conteúdo e/ou faz controle prévio deste; (ii) com os <a href="#" className="underline">Termos de Uso</a>, <a href="#" className="underline">Política de Privacidade</a> e demais Políticas; e (iii) que sou maior de idade ou autorizado e acompanhado por um responsável legal. <a href="#" className="underline">Saiba mais sobre sua compra aqui</a>.
          </p>
          <p>© 2026 - Todos os direitos reservados</p>
          <p>2026-07-02T20:53:31.659Z <a href="#" className="underline">REF.</a></p>
        </div>

        {/* Selos de segurança */}
        <div className="space-y-2">
          <div className="bg-white border border-gold/60 rounded-md p-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-600" />
            <span className="text-sm italic text-neutral-700">Sua informação 100% segura</span>
          </div>
          <div className="bg-white border border-gold/60 rounded-md p-4 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-600" />
            <span className="text-sm italic text-neutral-700">Ambiente seguro e autenticado</span>
          </div>
          <div className="bg-white border border-gold/60 rounded-md p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-yellow-600" />
            <span className="text-sm italic text-neutral-700">100% revisado e aprovado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
