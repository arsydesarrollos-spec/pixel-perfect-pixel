import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreditCard, Plus } from "lucide-react";

export const Route = createFileRoute("/cuenta/pagos")({
  head: () => ({ meta: [{ title: "Métodos de pago | Fastickett.com" }] }),
  component: PagosTab,
});

function PagosTab() {
  return (
    <div>
      <h2 className="text-xl font-black mb-1">Métodos de pago</h2>
      <p className="text-sm text-gray-400 mb-6">Tarjetas guardadas para pagos más rápidos</p>

      <div className="bg-card-purple border border-white/10 rounded-2xl p-5 max-w-md">
        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-3 text-sm">
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-pink" /> Visa •••• 4821</span>
          <span className="text-gray-400 text-xs">Vence 08/28</span>
        </div>
        <button
          onClick={() => toast("Agregar método de pago próximamente")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs rounded-lg border border-white/15 hover:border-pink hover:text-pink transition"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar método de pago
        </button>
      </div>
    </div>
  );
}
