import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cuenta/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones | FastTicket.com" }] }),
  component: NotifTab,
});

const ITEMS = [
  { key: "email_orders", label: "Confirmaciones por email", desc: "Recibe tu orden y boletos en tu correo" },
  { key: "email_promos", label: "Promociones y ofertas", desc: "Descuentos y preventas exclusivas" },
  { key: "sms_reminders", label: "Recordatorios por SMS", desc: "Aviso el día de tu evento" },
  { key: "push_news", label: "Notificaciones push", desc: "Nuevos eventos de tus artistas favoritos" },
];

function NotifTab() {
  const [state, setState] = useState<Record<string, boolean>>({
    email_orders: true,
    email_promos: false,
    sms_reminders: true,
    push_news: true,
  });

  const toggle = (k: string) => {
    setState((s) => ({ ...s, [k]: !s[k] }));
    toast.success("Preferencia actualizada");
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Notificaciones</h2>
      <p className="text-sm text-gray-400 mb-6">Elige cómo quieres que te contactemos</p>

      <div className="bg-card-purple border border-white/10 rounded-2xl overflow-hidden max-w-xl">
        {ITEMS.map((it) => {
          const on = state[it.key];
          return (
            <div
              key={it.key}
              className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0"
            >
              <div className="flex-1">
                <div className="font-bold text-sm">{it.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{it.desc}</div>
              </div>
              <button
                onClick={() => toggle(it.key)}
                className={`relative w-11 h-6 rounded-full transition ${
                  on ? "bg-pink" : "bg-white/15"
                }`}
                aria-pressed={on}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                    on ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
