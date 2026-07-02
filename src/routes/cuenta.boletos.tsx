import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, MapPin, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { mockOrders, type MockOrder } from "@/lib/mockDb";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/cuenta/boletos")({
  head: () => ({ meta: [{ title: "Mis boletos | FastTicket.com" }] }),
  component: BoletosTab,
});

function qrCells(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 36; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(h % 100 < 55);
  }
  return cells;
}

function BoletosTab() {
  const { user } = useAuth();
  const [openOrder, setOpenOrder] = useState<MockOrder | null>(null);
  if (!user) return null;

  const orders = mockOrders.filter((o) => o.userEmail === user.email);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = orders.filter((o) => o.isoDate >= today);
  const past = orders.filter((o) => o.isoDate < today);

  if (orders.length === 0) {
    return (
      <EmptyState icon="🎫" text="Aún no tienes boletos." linkLabel="Explorar eventos" />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-black mb-1">Mis boletos</h2>
      <p className="text-sm text-gray-400 mb-6">Boletos que has comprado, con su QR de acceso</p>

      {upcoming.length > 0 && (
        <>
          <SectionLabel>Próximos eventos</SectionLabel>
          {upcoming.map((o) => (
            <TicketCard key={o.id} order={o} onOpen={() => setOpenOrder(o)} />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <SectionLabel>Eventos pasados</SectionLabel>
          {past.map((o) => (
            <TicketCard key={o.id} order={o} onOpen={() => setOpenOrder(o)} />
          ))}
        </>
      )}

      {openOrder && <TicketModal order={openOrder} onClose={() => setOpenOrder(null)} />}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-6 mb-2 first:mt-0">{children}</div>;
}

function TicketCard({ order, onOpen }: { order: MockOrder; onOpen: () => void }) {
  return (
    <div className="flex gap-3.5 bg-card-purple border border-white/10 rounded-xl p-3.5 mb-2.5 items-center">
      <div className="w-14 h-14 rounded-xl gradient-pink-purple flex items-center justify-center text-2xl shrink-0">{order.emoji}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm truncate">{order.eventName}</h4>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {order.date}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.venue}</span>
          <span>{order.zone}</span>
        </div>
      </div>
      <button onClick={onOpen} className="px-3.5 py-2 text-xs rounded-lg border border-white/15 hover:border-pink hover:text-pink transition whitespace-nowrap">
        Ver boleto
      </button>
    </div>
  );
}

function TicketModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const cells = qrCells(order.tickets[0].code);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-card-purple border border-white/10 rounded-2xl p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <div className="text-3xl">{order.emoji}</div>
        <h2 className="font-black text-lg mt-2">{order.eventName}</h2>
        <p className="text-xs text-gray-400 mb-4">{order.date} · {order.venue}</p>

        <div className="grid grid-cols-6 gap-0.5 w-32 h-32 bg-white p-2.5 rounded-lg mx-auto mb-4">
          {cells.map((on, i) => (
            <div key={i} className={on ? "bg-black" : "bg-transparent"} />
          ))}
        </div>

        <p className="text-xs text-gray-400">Código: <b className="text-white">{order.tickets[0].code}</b></p>
        <p className="text-xs text-gray-400 mb-4">Orden {order.id} · {order.zone} · {order.quantity} boleto(s)</p>

        <button
          onClick={() => toast("Descarga próximamente")}
          className="w-full py-3 bg-pink rounded-lg font-bold text-sm hover:opacity-90 transition"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}

