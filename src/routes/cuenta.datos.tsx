import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cuenta/datos")({
  head: () => ({ meta: [{ title: "Datos personales | FastTicket.com" }] }),
  component: DatosTab,
});

function DatosTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: this only updates local component state for the demo. Once a real
    // backend exists, this should call an update-profile endpoint and let
    // useAuth() re-read the refreshed session.
    toast.success("Cambios guardados");
  };

  return (
    <div>
      <h2 className="text-xl font-black mb-1">Datos personales</h2>
      <p className="text-sm text-gray-400 mb-6">Edita tu información de contacto</p>

      <form onSubmit={save} className="bg-card-purple border border-white/10 rounded-2xl p-6 max-w-md space-y-4">
        <Field label="Nombre completo" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Teléfono" value={phone} onChange={setPhone} type="tel" />
        <button type="submit" className="w-full py-3 bg-pink rounded-lg font-bold text-sm hover:opacity-90 transition">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink text-sm"
      />
    </div>
  );
}
