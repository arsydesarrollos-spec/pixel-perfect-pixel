import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { mockOrders, type MockOrder } from "@/lib/mockDb";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/cuenta/historial")({
  head: () => ({ meta: [{ title: "Historial | Fastickett.com" }] }),
  component: HistorialTab,
});

function HistorialTab() {
  const { user } = useAuth();
  const [openOrder, setOpenOrder] = useState<MockOrder | null>(null);
  if (!user) return null;

  const orders = mockOrders.filter((o) => o.userEmail === user.email);

  if (orders.length === 0) {
    return <EmptyState icon="🧾" text="Aún no tienes órdenes." linkLabel="Explorar eventos" />;
  }

  return (
    <div>
      <h2 className="text-xl font-black mb-1">Historial</h2>
      <p className="text-sm text-gray-400 mb-6">Tus órdenes pasadas con recibo descargable</p>

      <div className="hidden md:grid grid-cols-[1.4fr_.8fr_.6fr_.8fr_.9fr] gap-2.5 px-4 mb-2 text-[11px] uppercase tracking-wide text-gray-500">
        <span>Orden</span><span>Fecha</span><span>Boletos</span><span>Total</span><span>Estado</span>
      </div>

      {orders.map((o) => (
        <div key={o.id} className="grid md:grid-cols-[1.4fr_.8fr_.6fr_.8fr_.9fr] gap-2.5 bg-card-purple border border-white/10 rounded-xl px-4 py-3.5 mb-2 text-sm items-center">
          <div>{o.id}</div>
          <div>{o.date}</div>
          <div>{o.quantity}</div>
          <div>${o.total.toLocaleString()}</div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 w-fit">{o.status}</span>
            <button onClick={() => setOpenOrder(o)} className="text-xs px-3 py-1.5 rounded-lg border border-white/15 hover:border-pink hover:text-pink transition">
              Ver recibo
            </button>
          </div>
        </div>
      ))}

      {openOrder && <ReceiptModal order={openOrder} onClose={() => setOpenOrder(null)} />}
    </div>
  );
}

function ReceiptModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const subtotal = order.unitPrice * order.quantity;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-card-purple border border-white/10 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-black mb-1">Recibo</h2>
        <p className="text-xs text-gray-400 mb-4">Orden {order.id} · {order.eventName}</p>

        <ReceiptLine label={`${order.zone} × ${order.quantity}`} value={subtotal} />
        <ReceiptLine label="Cargo por servicio (12%)" value={order.service} />
        <ReceiptLine label="Impuestos (16%)" value={order.tax} />
        <ReceiptLine label="Total" value={order.total} isTotal />
      </div>
    </div>
  );
}

function ReceiptLine({ label, value, isTotal }: { label: string; value: number; isTotal?: boolean }) {
  return (
    <div className={`flex justify-between text-sm py-2 ${isTotal ? "pt-3 font-black text-white text-base" : "border-b border-white/10 text-gray-400"}`}>
      <span>{label}</span>
      <span className={isTotal ? "" : "text-white"}>${value.toLocaleString()}</span>
    </div>
  );
}
