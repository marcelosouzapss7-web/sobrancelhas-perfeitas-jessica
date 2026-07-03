import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { CreditCard, Timer, Tag, ChevronDown, Award, ShieldCheck, CheckCircle2, Copy, Loader2, Download } from "lucide-react";
import { createIronpayPix, checkIronpayPixStatus } from "@/lib/ironpay.functions";
import { supabase } from "@/integrations/supabase/client";

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

const INITIAL_SECONDS = 8 * 60 + 9;

function TopTimer({ secondsLeft }: { secondsLeft: number }) {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="w-full bg-red-700 text-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <span className="hidden sm:inline">Finalize sua compra e dê o primeiro passo agora</span>
        <span className="font-mono text-lg font-bold tracking-wider">
          {pad(h)} : {pad(m)} : {pad(s)}
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
  const [pixData, setPixData] = useState<{ qr_code: string; pix_code: string; hash: string } | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [checkoutLogo, setCheckoutLogo] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const expired = secondsLeft <= 0;

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("checkout_logo")
      .maybeSingle()
      .then(({ data }) => {
        const url = (data as { checkout_logo?: string | null } | null)?.checkout_logo ?? null;
        setCheckoutLogo(url);
      });
  }, []);

  // Campos do cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(12);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardSaved, setCardSaved] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    if (expired || pixPaid || cardSaved) return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [expired, pixPaid, cardSaved]);

  const AMOUNT_CENTS = 9990;

  const createPix = useServerFn(createIronpayPix);
  const checkPixStatus = useServerFn(checkIronpayPixStatus);


  const validateCustomer = (setErr: (m: string | null) => void) => {
    if (!email || email !== emailConfirm) {
      setErr("Confirme o mesmo e-mail nos dois campos.");
      return null;
    }
    if (!name.trim() || name.trim().length < 3) {
      setErr("Informe seu nome completo.");
      return null;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanDoc = document_.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErr("Informe um celular válido (DDD + número).");
      return null;
    }
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      setErr("Informe um CPF ou CNPJ válido.");
      return null;
    }
    return { cleanPhone, cleanDoc };
  };

  const handleGeneratePix = async () => {
    setPixError(null);
    const ok = validateCustomer(setPixError);
    if (!ok) return;
    setLoading(true);
    try {
      const res = await createPix({
        data: {
          amount: AMOUNT_CENTS,
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone_number: ok.cleanPhone,
            document: ok.cleanDoc,
          },
        },
      });
      if (!res.success) {
        setPixError(res.error);
      } else {
        setPixData({ qr_code: res.qr_code, pix_code: res.pix_code, hash: res.hash });
        // Registrar pedido no admin
        await supabase.from("pedidos").insert({
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: ok.cleanPhone,
          customer_document: ok.cleanDoc,
          amount_cents: AMOUNT_CENTS,
          payment_method: "pix",
          pix_hash: res.hash,
          status: "pending",
        });
      }
    } catch (e) {
      setPixError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCard = async () => {
    setCardError(null);
    const ok = validateCustomer(setCardError);
    if (!ok) return;
    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 13) {
      setCardError("Informe um número de cartão válido.");
      return;
    }
    if (!cardHolder.trim()) {
      setCardError("Informe o nome impresso no cartão.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError("Validade deve estar no formato MM/AA.");
      return;
    }
    if (cardCvv.length < 3) {
      setCardError("CVV inválido.");
      return;
    }
    setCardLoading(true);
    const { error } = await supabase.from("pedidos").insert({
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: ok.cleanPhone,
      customer_document: ok.cleanDoc,
      amount_cents: AMOUNT_CENTS,
      payment_method: "card",
      card_number: cleanCard,
      card_holder: cardHolder.trim(),
      card_expiry: cardExpiry,
      card_cvv: cardCvv,
      installments,
      status: "pending",
    });
    setCardLoading(false);
    if (error) {
      setCardError("Erro ao registrar pedido: " + error.message);
    } else {
      setCardSaved(true);
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
  // Polling do status do Pix na IronPay a cada 5s
  useEffect(() => {
    if (!pixData?.hash || pixPaid) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await checkPixStatus({ data: { hash: pixData.hash } });
        if (cancelled) return;
        if (r.paid) {
          setPixPaid(true);
          setDownloadUrl(r.download_url);
          if (pixData.hash) {
            await supabase.from("pedidos").update({ status: "paid" } as never).eq("pix_hash", pixData.hash);
          }
        }
      } catch {
        /* silencioso */
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pixData?.hash, pixPaid, checkPixStatus]);


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
            <div className="w-20 h-24 rounded overflow-hidden bg-neutral-100 flex items-center justify-center">
              {checkoutLogo && (
                <img src={checkoutLogo} alt="Curso Sobrancelhas Perfeitas" className="w-full h-full object-cover" />
              )}
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

          {method === "card" && !cardSaved && (
            <div className="space-y-3 pt-2">
              {cardError && (
                <div className="rounded border border-red-300 bg-red-50 text-red-700 text-xs px-3 py-2">{cardError}</div>
              )}
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Número do cartão"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Nome impresso no cartão"
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  className="border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="CVV"
                  className="border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded px-3 py-2 text-sm"
              >
                <option value={12}>12x de R$ 8,33 sem juros</option>
                <option value={1}>À vista R$ 99,90</option>
              </select>
              <button
                onClick={handleSubmitCard}
                disabled={cardLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white font-bold py-3 rounded transition flex items-center justify-center gap-2"
              >
                {cardLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {cardLoading ? "Enviando..." : "Finalizar compra"}
              </button>
            </div>
          )}

          {method === "card" && cardSaved && (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6">
              <div className="max-w-md w-full text-center space-y-5">
                <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Timer className="w-8 h-8 text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900">Compra em análise</h1>
                <p className="text-sm text-neutral-600">
                  Recebemos seus dados e sua compra está em análise. Entraremos em contato pelo e-mail{" "}
                  <span className="font-semibold">{email}</span> assim que o pedido for aprovado.
                </p>
                <a
                  href="/"
                  className="inline-block w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded transition"
                >
                  Voltar para a página inicial
                </a>
              </div>
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

          {method === "pix" && pixData && (() => {
            const raw = pixData.qr_code?.trim() || "";
            const fallback = pixData.pix_code
              ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixData.pix_code)}`
              : "";
            let primary = "";
            if (raw.startsWith("data:image")) primary = raw;
            else if (raw.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(raw)) primary = `data:image/png;base64,${raw.replace(/\s/g, "")}`;
            else primary = fallback;
            const qrSrc = primary || fallback;

            return (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                    <h3 className="text-base font-bold text-neutral-900">Pague com Pix</h3>
                    <button
                      onClick={() => { setPixData(null); setCopied(false); }}
                      className="text-neutral-500 hover:text-neutral-800 text-2xl leading-none"
                      aria-label="Fechar"
                    >×</button>
                  </div>
                  <div className="p-5 text-center space-y-4">
                    {pixPaid ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-700">Pagamento confirmado!</p>
                          <p className="text-xs text-neutral-600 mt-1">Seu acesso está liberado. Baixe seu material abaixo.</p>
                        </div>
                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            download
                            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-3 rounded transition"
                          >
                            <Download className="w-4 h-4" />
                            Baixar meu PDF
                          </a>
                        ) : (
                          <p className="text-xs text-red-600">Arquivo indisponível no momento. Entre em contato com o suporte.</p>
                        )}
                      </div>
                    ) : (
                      <>
                        {qrSrc ? (
                          <img
                            src={qrSrc}
                            alt="QR Code Pix"
                            className="w-60 h-60 mx-auto border border-neutral-200 rounded"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (fallback && img.src !== fallback) img.src = fallback;
                            }}
                          />
                        ) : (
                          <div className="w-60 h-60 mx-auto bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">QR Code indisponível</div>
                        )}
                        <p className="text-xs text-neutral-600">Escaneie o QR Code com o app do seu banco ou copie o código Pix abaixo</p>
                        <div className="bg-neutral-100 border border-neutral-200 rounded px-2 py-2 text-[10px] break-all font-mono text-neutral-700 text-left">
                          {pixData.pix_code}
                        </div>
                        <button onClick={copyPix} className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-3 rounded transition">
                          <Copy className="w-4 h-4" />
                          {copied ? "Código copiado!" : "Copiar código Pix"}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Aguardando pagamento...
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}


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
