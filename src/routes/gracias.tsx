import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Mail, Ticket, Download, Home } from "lucide-react";

export const Route = createFileRoute("/gracias")({
  validateSearch: (s: Record<string, unknown>) => ({ order: (s.order as string) || "" }),
  head: () => ({ meta: [{ title: "¡Gracias por tu compra! | Fastickett.com" }] }),
  component: ThankYouPage,
});

type Order = {
  id: string;
  email: string;
  name: string;
  total: number;
  method: string;
  items: Array<{ id: string; eventName: string; zone: string; quantity: number; price: number; emoji: string; date: string; venue: string }>;
};

function ThankYouPage() {
  const { order: orderId } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ft_last_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-app text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link to="/" className="text-xl font-black">Fastickett<span className="text-pink">.com</span></Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-pink/20 border-2 border-pink flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-12 h-12 text-pink" />
          </div>
          <h1 className="text-4xl font-black mb-3">¡Pago confirmado!</h1>
          <p className="text-gray-400">Gracias{order?.name ? `, ${order.name.split(" ")[0]}` : ""}. Tu compra fue procesada con éxito.</p>
        </div>

        <div className="bg-card-purple border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="text-xs text-gray-400">Número de orden</div>
              <div className="font-black text-pink text-lg">{orderId || order?.id}</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Mail className="w-4 h-4" /> {order?.email || "tu correo"}
            </div>
          </div>

          <div className="py-4 space-y-3">
            {order?.items.map((i) => (
              <div key={i.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg gradient-pink-purple flex items-center justify-center text-2xl">{i.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{i.eventName}</div>
                  <div className="text-xs text-gray-400">{i.zone} · {i.date}</div>
                  <div className="text-xs text-gray-400">{i.venue}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">x{i.quantity}</div>
                  <div className="font-bold text-sm">${(i.price * i.quantity).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10 font-black">
            <span>Total pagado</span>
            <span className="text-pink">${order?.total.toLocaleString() || 0} MXN</span>
          </div>
        </div>

        <div className="bg-pink/10 border border-pink/30 rounded-xl p-5 mb-6 flex gap-3">
          <Ticket className="w-6 h-6 text-pink shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Tus boletos están en camino.</strong>
            <p className="text-gray-300 mt-1">Recibirás un correo con tus boletos digitales y código QR en los próximos minutos. Preséntalos en la entrada del evento.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => window.print()} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Descargar recibo
          </button>
          <Link to="/" className="flex-1 bg-pink hover:opacity-90 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
