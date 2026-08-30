import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Unit = "pcs" | "kg" | "service";

export interface OrderLine {
  itemId: string;
  name: string;
  unit: Unit;
  qty: number;
  unitPrice: number;
  note: string;
}

export interface OfflineOrder {
  id: string;
  lines: {
    item_id: string;
    name: string;
    unit: string;
    qty: number;
    unit_price: number;
    note?: string;
  }[];
  payment: string;
  note?: string;
  createdAt: string;
}

interface CartState {
  lines: OrderLine[];
  shiftOpen: boolean;
  shiftFloat: number;
  add: (item: { itemId: string; name: string; unit: Unit; unitPrice: number }) => void;
  inc: (itemId: string) => void;
  dec: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNote: (itemId: string, note: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  openShift: (float?: number) => void;
  closeShift: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      shiftOpen: false,
      shiftFloat: 0,
      add: (item) =>
        set((s) => {
          const found = s.lines.find((l) => l.itemId === item.itemId);
          if (found) {
            return {
              lines: s.lines.map((l) =>
                l.itemId === item.itemId ? { ...l, qty: l.qty + 1 } : l
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                itemId: item.itemId,
                name: item.name,
                unit: item.unit,
                qty: 1,
                unitPrice: item.unitPrice,
                note: "",
              },
            ],
          };
        }),
      inc: (itemId) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l
          ),
        })),
      dec: (itemId) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l
            )
            .filter((l) => l.qty > 0),
        })),
      setQty: (itemId, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.itemId === itemId ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        })),
      setNote: (itemId, note) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.itemId === itemId ? { ...l, note } : l
          ),
        })),
      remove: (itemId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.itemId !== itemId) })),
      clear: () => set({ lines: [] }),
      openShift: (float = 0) => set({ shiftOpen: true, shiftFloat: float }),
      closeShift: () => set({ shiftOpen: false, shiftFloat: 0 }),
    }),
    { name: "gpos-cart" }
  )
);

interface OfflineQueueState {
  queue: OfflineOrder[];
  enqueue: (order: OfflineOrder) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      enqueue: (order) => set((s) => ({ queue: [...s.queue, order] })),
      dequeue: (id) => set((s) => ({ queue: s.queue.filter((o) => o.id !== id) })),
      clearQueue: () => set({ queue: [] }),
    }),
    { name: "gpos-offline-queue" }
  )
);

export function lineTotal(l: OrderLine): number {
  return l.qty * l.unitPrice;
}

export function cartTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}
