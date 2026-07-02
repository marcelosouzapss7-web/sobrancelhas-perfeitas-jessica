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
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          hash: string;
          qr_code: string;
          pix_code: string;
          expires_at?: string;
        };
      };
      if (!res.ok || !json?.data?.pix_code) {
        console.error("IronPay error", res.status, json);
        return { success: false, error: json?.message ?? `Erro IronPay (${res.status})` };
      }
      return {
        success: true,
        hash: json.data.hash,
        qr_code: json.data.qr_code,
        pix_code: json.data.pix_code,
        expires_at: json.data.expires_at,
      };
    } catch (err) {
      console.error("IronPay request failed", err);
      return { success: false, error: "Falha ao contatar a IronPay." };
    }
  });
