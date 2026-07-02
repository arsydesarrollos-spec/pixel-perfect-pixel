import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cuenta/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp | FastTicket.com" }] }),
  component: WhatsAppTab,
});

function WhatsAppTab() {
  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Ayuda por WhatsApp</h2>
      <p className="text-sm text-gray-400 mb-6">
        Nuestro equipo te responde de lunes a domingo, 9am a 9pm.
      </p>

      <div className="bg-card-purple border border-white/10 rounded-2xl p-6 max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center text-3xl mb-4">
          💬
        </div>
        <div className="font-bold text-lg">+52 662 234 8169</div>
        <p className="text-xs text-gray-400 mt-2">Tiempo promedio de respuesta: 5 min</p>
        <a
          href="https://wa.me/526622348169"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold text-sm transition"
        >
          Abrir WhatsApp
        </a>
      </div>
    </div>
  );
}
