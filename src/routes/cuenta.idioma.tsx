import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cuenta/idioma")({
  head: () => ({ meta: [{ title: "Idioma | Fastickett.com" }] }),
  component: IdiomaTab,
});

const OPTIONS = [
  { code: "es-MX", label: "Español (México)", flag: "🇲🇽" },
  { code: "es-ES", label: "Español (España)", flag: "🇪🇸" },
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
];

function IdiomaTab() {
  const [selected, setSelected] = useState("es-MX");

  const save = (code: string) => {
    setSelected(code);
    toast.success("Idioma actualizado");
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Idioma</h2>
      <p className="text-sm text-gray-400 mb-6">
        Elige el idioma en el que quieres ver Fastickett
      </p>

      <div className="bg-card-purple border border-white/10 rounded-2xl overflow-hidden max-w-lg">
        {OPTIONS.map((opt) => {
          const active = selected === opt.code;
          return (
            <button
              key={opt.code}
              onClick={() => save(opt.code)}
              className="flex items-center gap-3 w-full text-left px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition"
            >
              <span className="text-2xl">{opt.flag}</span>
              <span className="flex-1 text-sm font-semibold">{opt.label}</span>
              {active && (
                <span className="text-xs font-bold text-pink">✓ Activo</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
