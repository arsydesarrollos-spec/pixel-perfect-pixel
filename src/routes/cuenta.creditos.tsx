import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cuenta/creditos")({
  head: () => ({ meta: [{ title: "Créditos | Fastickett.com" }] }),
  component: CreditosTab,
});

type Movement = { date: string; label: string; amount: number };

const MOVEMENTS: Movement[] = [
  { date: "12 Oct 2025", label: "Reembolso · Cancelación evento", amount: 250 },
  { date: "03 Sep 2025", label: "Promoción bienvenida", amount: 100 },
  { date: "18 Ago 2025", label: "Uso en orden FT-XY12", amount: -100 },
];

function CreditosTab() {
  const { user } = useAuth();
  if (!user) return null;
  const balance = user.credits ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Créditos</h2>
      <p className="text-sm text-gray-400 mb-6">
        Tu saldo disponible para usar en próximas compras
      </p>

      <div className="gradient-pink-purple rounded-2xl p-6 mb-6 max-w-md">
        <div className="text-xs uppercase tracking-widest text-white/80">Saldo disponible</div>
        <div className="text-4xl font-black mt-1">
          ${balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}{" "}
          <span className="text-sm font-bold text-white/70">MXN</span>
        </div>
        <p className="text-xs text-white/80 mt-3">
          Los créditos se aplican automáticamente al pagar.
        </p>
      </div>

      <div className="bg-card-purple border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 text-sm font-bold">
          Movimientos recientes
        </div>
        {MOVEMENTS.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-b-0 text-sm"
          >
            <div>
              <div className="font-semibold">{m.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.date}</div>
            </div>
            <div
              className={`font-black ${m.amount >= 0 ? "text-emerald-400" : "text-red-300"}`}
            >
              {m.amount >= 0 ? "+" : "−"}${Math.abs(m.amount).toLocaleString("es-MX")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
