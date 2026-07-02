import { useState } from "react";
import type { MockOrder } from "@/lib/mockDb";
import { TicketModal } from "@/components/TicketModal";

export function BoletosList({ orders }: { orders: MockOrder[] }) {
  const [openOrder, setOpenOrder] = useState<MockOrder | null>(null);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex gap-3.5 bg-card-purple border border-white/10 rounded-2xl p-3.5 mb-2.5 items-center"
        >
          <div className="w-14 h-14 rounded-xl gradient-pink-purple flex items-center justify-center text-2xl shrink-0">
            {o.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate">{o.eventName}</h4>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1.5">
              <span>{o.date}</span>
              <span>{o.venue}</span>
              <span>{o.zone}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setOpenOrder(o);
              setOpenIndex(0);
            }}
            className="px-3.5 py-2 text-xs rounded-lg border border-white/15 hover:border-pink hover:text-pink transition whitespace-nowrap"
          >
            Ver boleto
          </button>
        </div>
      ))}
      {openOrder && (
        <TicketModal
          order={openOrder}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenOrder(null)}
        />
      )}
    </>
  );
}
