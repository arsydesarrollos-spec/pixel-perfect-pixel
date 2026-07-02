import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Plus, Minus, ChevronLeft, ShoppingBag, Calendar, MapPin } from "lucide-react";
import { useCart, fees } from "@/lib/cart";

export const Route = createFileRoute("/carrito")({
  head: () => ({ meta: [{ title: "Carrito | FastTicket.com" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const f = fees(cart.subtotal);

  return (
    <div className="min-h-screen bg-app text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm hover:text-pink"><ChevronLeft className="w-4 h-4" /> Seguir comprando</Link>
        <Link to="/" className="text-xl font-black">FastTicket<span className="text-pink">.com</span></Link>
        <div className="w-32" />
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><ShoppingBag className="w-7 h-7 text-pink" /> Tu carrito</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20 bg-card-purple rounded-2xl border border-white/10">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-gray-400 mb-6">Tu carrito está vacío</p>
            <Link to="/" className="bg-pink px-6 py-3 rounded-xl font-bold hover:opacity-90">Explorar eventos</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-card-purple border border-white/10 rounded-xl p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-lg gradient-pink-purple flex items-center justify-center text-4xl shrink-0">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{item.eventName}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.zone}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.venue}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => cart.updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => cart.updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-pink/30 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-pink">${(item.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => cart.remove(item.id)} className="text-gray-400 hover:text-pink"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-card-purple border border-white/10 rounded-xl p-5 h-fit sticky top-4">
              <h3 className="font-bold mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>${cart.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Cargo por servicio</span><span>${f.service.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">IVA</span><span>${f.tax.toLocaleString()}</span></div>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex justify-between font-black text-lg"><span>Total</span><span className="text-pink">${f.total.toLocaleString()}</span></div>
                <div className="text-[10px] text-gray-500 text-right">MXN</div>
              </div>
              <Link to="/checkout" className="block text-center mt-5 bg-pink hover:opacity-90 py-3 rounded-xl font-bold">Proceder al pago</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
