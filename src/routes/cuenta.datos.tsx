import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cuenta/datos")({
  head: () => ({ meta: [{ title: "Datos personales | FastTicket.com" }] }),
  component: DatosTab,
});

function DatosTab() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone, address, location });
    toast.success("Cambios guardados");
  };

  const deleteAccount = () => {
    logout();
    toast.success("Cuenta eliminada");
    navigate({ to: "/" });
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">Datos personales</h2>
      <p className="text-sm text-gray-400 mb-6">Edita tu información de contacto</p>

      <form onSubmit={save} className="bg-card-purple border border-white/10 rounded-2xl p-6 max-w-xl space-y-4">
        <Field label="Nombre completo" value={name} onChange={setName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Teléfono" value={phone} onChange={setPhone} type="tel" />
        <Field label="Dirección" value={address} onChange={setAddress} placeholder="Calle, número, colonia" />
        <Field label="Ciudad / País" value={location} onChange={setLocation} placeholder="CDMX, México" />
        <button type="submit" className="w-full py-3 bg-pink rounded-lg font-bold text-sm hover:opacity-90 transition">
          Guardar cambios
        </button>
      </form>

      <div className="mt-8 max-w-xl bg-red-500/5 border border-red-500/25 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-red-300">Eliminar cuenta</h3>
            <p className="text-xs text-gray-400 mt-1">
              Esta acción es permanente. Perderás el acceso a tus boletos, créditos e historial.
            </p>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition"
              >
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 transition"
                >
                  Sí, eliminar definitivamente
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-white/15 hover:border-white/30 transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white outline-none focus:border-pink text-sm"
      />
    </div>
  );
}
