"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

type OrderSnapshot = { id: string; status: string };

type Props = {
  orderId: string | null;
  onPaid: (order: OrderSnapshot) => void;
  enabled?: boolean;
};

export function useOrderRealtime({ orderId, onPaid, enabled = true }: Props) {
  const onPaidRef = useRef(onPaid);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    if (!enabled || !orderId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown> | null;
          if (newRow?.status === "paid") {
            onPaidRef.current({ id: String(newRow.id), status: "paid" });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(() => {
        // Channel may already be removed
      });
    };
  }, [orderId, enabled]);
}
