import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cuenta/redes")({
  head: () => ({ meta: [{ title: "Redes sociales | Fastickett.com" }] }),
  component: RedesTab,
});

const NETS = [
  { name: "Instagram", user: "@fastickett", url: "https://instagram.com", emoji: "📸", bg: "from-pink-500 to-purple-600" },
  { name: "TikTok", user: "@fastickett", url: "https://tiktok.com", emoji: "🎵", bg: "from-slate-800 to-black" },
  { name: "X / Twitter", user: "@fastickett", url: "https://x.com", emoji: "𝕏", bg: "from-slate-700 to-slate-900" },
  { name: "Facebook", user: "Fastickett", url: "https://facebook.com", emoji: "👥", bg: "from-blue-500 to-blue-700" },
];

function RedesTab() {
  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Síguenos en redes</h2>
      <p className="text-sm text-gray-400 mb-6">
        Entérate primero de preventas, sorteos y nuevos eventos
      </p>

      <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
        {NETS.map((n) => (
          <a
            key={n.name}
            href={n.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-card-purple border border-white/10 rounded-2xl p-4 hover:border-pink transition"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${n.bg} flex items-center justify-center text-xl`}
            >
              {n.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{n.name}</div>
              <div className="text-xs text-gray-400 truncate">{n.user}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
