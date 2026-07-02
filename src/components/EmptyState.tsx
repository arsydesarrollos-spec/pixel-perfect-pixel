import { Link } from "@tanstack/react-router";

export function EmptyState({ icon, text, linkLabel }: { icon: string; text: string; linkLabel: string }) {
  return (
    <div className="text-center py-16 bg-card-purple rounded-2xl border border-white/10">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-gray-400 mb-4 text-sm">{text}</p>
      <Link to="/" className="text-pink text-sm font-bold hover:underline">{linkLabel}</Link>
    </div>
  );
}
