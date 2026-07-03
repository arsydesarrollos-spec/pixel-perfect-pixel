import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { mockOrders } from "@/lib/mockDb";
import { BoletosList } from "@/components/BoletosList";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/cuenta/boletos")({
  head: () => ({ meta: [{ title: "Próximos eventos | Fastickett.com" }] }),
  component: ProximosTab,
});

function ProximosTab() {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const list = mockOrders
    .filter((o) => o.userEmail === user.email && o.isoDate >= today);

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Próximos eventos</h2>
      <p className="text-sm text-gray-400 mb-6">
        Boletos de eventos que aún no ocurren, con su QR de acceso
      </p>
      {list.length === 0 ? (
        <EmptyState icon="🎫" text="Aún no tienes boletos de próximos eventos." linkLabel="Explorar eventos" />
      ) : (
        <BoletosList orders={list} />
      )}
    </div>
  );
}
