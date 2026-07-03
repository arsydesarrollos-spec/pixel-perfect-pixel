import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { mockFavorites } from "@/lib/mockDb";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/cuenta/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | Fastickett.com" }] }),
  component: FavoritosTab,
});

function FavoritosTab() {
  const { user } = useAuth();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  if (!user) return null;

  const favs = mockFavorites.filter((f) => f.userEmail === user.email && !removed.has(f.id));

  if (favs.length === 0) {
    return <EmptyState icon="❤️" text="Aún no tienes eventos guardados." linkLabel="Explorar eventos" />;
  }

  return (
    <div>
      <h2 className="text-xl font-black mb-1">Favoritos</h2>
      <p className="text-sm text-gray-400 mb-6">Eventos que has guardado</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {favs.map((f) => (
          <div key={f.id} className="relative bg-card-purple border border-white/10 rounded-2xl p-4">
            <button
              onClick={() => {
                setRemoved((prev) => new Set(prev).add(f.id));
                toast.success("Eliminado de favoritos");
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-pink"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
            <div className="text-3xl mb-2.5">{f.emoji}</div>
            <h4 className="font-bold text-sm mb-1">{f.artist}</h4>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5"><Calendar className="w-3 h-3" /> {f.date}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {f.venue}</p>
            <div className="text-pink font-bold text-sm mt-2">Desde ${f.price.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
