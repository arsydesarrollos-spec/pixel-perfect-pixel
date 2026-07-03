import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { mockOrders } from "@/lib/mockDb";
import { BoletosList } from "@/components/BoletosList";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/cuenta/pasados")({
  head: () => ({ meta: [{ title: "Eventos pasados | Fastickett.com" }] }),
  component: PasadosTab,
});

function PasadosTab() {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const list = mockOrders
    .filter((o) => o.userEmail === user.email && o.isoDate < today)
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Eventos pasados</h2>
      <p className="text-sm text-gray-400 mb-6">Un archivo de los shows a los que ya asististe</p>
      {list.length === 0 ? (
        <EmptyState icon="📅" text="Aún no tienes historial de eventos pasados." linkLabel="Explorar eventos" />
      ) : (
        <BoletosList orders={list} />
      )}
    </div>
  );
}
