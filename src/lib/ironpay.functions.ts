import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone_number: z.string().min(8),
  document: z.string().min(8),
});

const InputSchema = z.object({
  amount: z.number().int().positive(), // em centavos
  customer: CustomerSchema,
});

export type CreatePixResult =
  | {
      success: true;
      hash: string;
      qr_code: string; // base64 data URL
      pix_code: string; // copia e cola
      expires_at?: string;
    }
  | { success: false; error: string };

export const createIronpayPix = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const token = process.env.IRONPAY_API_TOKEN;
    const offerHash = process.env.IRONPAY_OFFER_HASH;
    if (!token || !offerHash) {
      return { success: false, error: "Integração IronPay não configurada." };
    }

    const body = {
      amount: data.amount,
      offer_hash: offerHash,
      payment_method: "pix",
      customer: data.customer,
      cart: [
        {
          product_hash: offerHash,
          title: "Curso Sobrancelhas Perfeitas - Oficial",
          cover: null,
          price: data.amount,
          quantity: 1,
          operation_type: 1,
          tangible: false,
        },
      ],
      expire_in_days: 1,
      transaction_origin: "api",
    };

    try {
      const url = `https://api.ironpayapp.com.br/api/public/v1/transactions?api_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as any;
      const root = json?.data ?? json;
      const pix = root?.pix ?? {};
      const pixCode: string | undefined = pix.pix_qr_code ?? pix.pix_code ?? root?.pix_code;
      const qrBase64: string | undefined = pix.qr_code_base64 ?? root?.qr_code_base64;
      const pixUrl: string | undefined = pix.pix_url ?? root?.pix_url;
      const hash: string = root?.hash ?? root?.transaction ?? "";

      if (!res.ok || !pixCode) {
        console.error("IronPay error", res.status, json);
        return { success: false, error: json?.message ?? `Erro IronPay (${res.status})` };
      }

      const qr = qrBase64
        ? (qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`)
        : (pixUrl ?? "");

      return {
        success: true,
        hash,
        qr_code: qr,
        pix_code: pixCode,
        expires_at: root?.expires_at,
      };
    } catch (err) {
      console.error("IronPay request failed", err);
      return { success: false, error: "Falha ao contatar a IronPay." };
    }
  });

export type CheckPixStatusResult =
  | { paid: false; status: string }
  | { paid: true; status: string; download_url: string | null };

export const checkIronpayPixStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ hash: z.string().min(3) }).parse(input))
  .handler(async ({ data }): Promise<CheckPixStatusResult> => {
    const token = process.env.IRONPAY_API_TOKEN;
    if (!token) return { paid: false, status: "not_configured" };

    let status = "unknown";
    try {
      const url = `https://api.ironpayapp.com.br/api/public/v1/transactions/${encodeURIComponent(data.hash)}?api_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const json = (await res.json()) as any;
      const root = json?.data ?? json;
      status = String(root?.payment_status ?? root?.status ?? "unknown");
    } catch (err) {
      console.error("IronPay status check failed", err);
      return { paid: false, status: "error" };
    }

    const paid = ["paid", "approved", "completed"].includes(status.toLowerCase());
    if (!paid) return { paid: false, status };

    // Gera link de download para o PDF do produto
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: settings } = await supabaseAdmin
        .from("site_settings")
        .select("product_file_path")
        .eq("singleton", true)
        .maybeSingle();
      const path = settings?.product_file_path;
      if (!path) return { paid: true, status, download_url: null };
      const { data: signed } = await supabaseAdmin.storage
        .from("produtos")
        .createSignedUrl(path, 60 * 60, { download: true });
      return { paid: true, status, download_url: signed?.signedUrl ?? null };
    } catch (err) {
      console.error("Erro ao gerar link de download", err);
      return { paid: true, status, download_url: null };
    }
  });
