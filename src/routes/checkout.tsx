import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronLeft, Lock, CreditCard, ShieldCheck } from "lucide-react";
import { useCart, fees } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout | FastTicket.com" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const f = fees(cart.subtotal);

  const [form, setForm] = useState({
    email: "", name: "", phone: "",
    card: "", expiry: "", cvc: "", holder: "",
    method: "card" as "card" | "oxxo" | "paypal",
  });
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && cart.items.length === 0) {
      navigate({ to: "/carrito" });
    }
  }, [hydrated, cart.items.length, navigate]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) {
      toast.error("Completa tus datos personales");
      return;
    }
    if (form.method === "card" && (form.card.replace(/\s/g, "").length < 16 || form.expiry.length < 5 || form.cvc.length < 3)) {
      toast.error("Datos de tarjeta inválidos");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const orderId = "FT-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      sessionStorage.setItem("ft_last_order", JSON.stringify({
        id: orderId, items: cart.items, total: f.total, email: form.email, name: form.name, method: form.method,
      }));
      cart.clear();
      navigate({ to: "/gracias", search: { order: orderId } as never });
    }, 1500);
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-app text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/carrito" className="flex items-center gap-2 text-sm hover:text-pink"><ChevronLeft className="w-4 h-4" /> Volver al carrito</Link>
        <Link to="/" className="text-xl font-black">FastTicket<span className="text-pink">.com</span></Link>
        <div className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" /> Pago seguro</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-8">Checkout</h1>

        <form onSubmit={submit} className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Contact */}
            <section className="bg-card-purple border border-white/10 rounded-xl p-5">
              <h2 className="font-bold mb-4">1. Datos personales</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} type="email" className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none sm:col-span-2" />
                <input placeholder="Nombre completo" value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none" />
                <input placeholder="Teléfono" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none" />
              </div>
            </section>

            {/* Method */}
            <section className="bg-card-purple border border-white/10 rounded-xl p-5">
              <h2 className="font-bold mb-4">2. Método de pago</h2>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { id: "card", label: "Tarjeta", icon: "💳" },
                  { id: "oxxo", label: "OXXO", icon: "🏪" },
                  { id: "paypal", label: "PayPal", icon: "🅿️" },
                ].map((m) => (
                  <button key={m.id} type="button" onClick={() => set("method", m.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${form.method === m.id ? "border-pink bg-pink/10 text-pink" : "border-white/10 bg-app hover:border-pink/50"}`}>
                    <div className="text-2xl mb-1">{m.icon}</div>{m.label}
                  </button>
                ))}
              </div>

              {form.method === "card" && (
                <div className="space-y-3">
                  <div className="relative">
                    <input placeholder="1234 5678 9012 3456" value={form.card} onChange={(e) => set("card", formatCard(e.target.value))} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 pl-11 text-sm outline-none w-full" />
                    <CreditCard className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
                  </div>
                  <input placeholder="Nombre del titular" value={form.holder} onChange={(e) => set("holder", e.target.value)} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM/AA" value={form.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value))} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none" />
                    <input placeholder="CVC" value={form.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))} className="bg-app border border-white/10 focus:border-pink rounded-lg px-4 py-3 text-sm outline-none" />
                  </div>
                </div>
              )}
              {form.method === "oxxo" && (
                <p className="text-sm text-gray-400 bg-app rounded-lg p-4 border border-white/10">Generaremos una referencia OXXO de pago. Tienes 24 horas para pagar en cualquier tienda.</p>
              )}
              {form.method === "paypal" && (
                <p className="text-sm text-gray-400 bg-app rounded-lg p-4 border border-white/10">Serás redirigido a PayPal para completar el pago de forma segura.</p>
              )}
            </section>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-pink" /> Transacción protegida con encriptación SSL de 256 bits
            </div>
          </div>

          {/* Summary */}
          <aside className="bg-card-purple border border-white/10 rounded-xl p-5 h-fit md:sticky md:top-4">
            <h3 className="font-bold mb-4">Tu pedido</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-auto">
              {cart.items.map((i) => (
                <div key={i.id} className="flex gap-3 text-xs">
                  <div className="w-10 h-10 rounded gradient-pink-purple flex items-center justify-center text-xl shrink-0">{i.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{i.eventName}</div>
                    <div className="text-gray-400">{i.zone} · x{i.quantity}</div>
                  </div>
                  <div className="font-bold whitespace-nowrap">${(i.price * i.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-white/10 pt-3">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>${cart.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span>${f.service.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">IVA</span><span>${f.tax.toLocaleString()}</span></div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10"><span>Total</span><span className="text-pink">${f.total.toLocaleString()} MXN</span></div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-5 bg-pink hover:opacity-90 disabled:opacity-50 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
              {loading ? "Procesando..." : (<><Lock className="w-4 h-4" /> Pagar ${f.total.toLocaleString()}</>)}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
