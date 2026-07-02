import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { mockBillingAddresses, type MockBillingAddress } from "@/lib/mockDb";

export const Route = createFileRoute("/cuenta/facturacion")({
  head: () => ({ meta: [{ title: "Facturación | FastTicket.com" }] }),
  component: FacturacionTab,
});

function FacturacionTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<MockBillingAddress[]>(() =>
    user ? mockBillingAddresses.filter((a) => a.userEmail === user.email) : [],
  );
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ address: "", city: "", country: "México", zip: "" });

  if (!user) return null;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.address.trim() || !draft.city.trim() || !draft.zip.trim()) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setAddresses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), userEmail: user.email, ...draft },
    ]);
    setDraft({ address: "", city: "", country: "México", zip: "" });
    setShowForm(false);
    toast.success("Dirección agregada");
  };

  const remove = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Dirección eliminada");
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Facturación</h2>
      <p className="text-sm text-gray-400 mb-6">
        Direcciones de facturación guardadas para tus compras
      </p>

      <div className="space-y-2 mb-4">
        {addresses.length === 0 && (
          <div className="text-sm text-gray-400 bg-card-purple border border-white/10 rounded-2xl p-6 text-center">
            No tienes direcciones guardadas.
          </div>
        )}
        {addresses.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 bg-card-purple border border-white/10 rounded-2xl p-4"
          >
            <div className="flex-1 text-sm">
              <div className="font-bold">{a.address}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {a.city}, {a.country} · CP {a.zip}
              </div>
            </div>
            <button
              onClick={() => remove(a.id)}
              className="p-2 text-gray-400 hover:text-red-400 transition"
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg border border-white/15 hover:border-pink hover:text-pink transition"
        >
          <Plus className="w-4 h-4" /> Agregar dirección
        </button>
      ) : (
        <form
          onSubmit={add}
          className="bg-card-purple border border-white/10 rounded-2xl p-6 max-w-xl space-y-4"
        >
          <F label="Dirección" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} />
          <div className="grid grid-cols-2 gap-4">
            <F label="Ciudad" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
            <F label="País" value={draft.country} onChange={(v) => setDraft({ ...draft, country: v })} />
          </div>
          <F label="Código postal" value={draft.zip} onChange={(v) => setDraft({ ...draft, zip: v })} />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-pink rounded-lg font-bold text-sm hover:opacity-90 transition">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-sm font-bold hover:border-white/30 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink text-sm"
      />
    </div>
  );
}
