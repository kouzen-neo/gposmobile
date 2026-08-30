

import { useState } from "react";
import { useCart, useOfflineQueue, cartTotal } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { TouchButton } from "@/components/TouchButton";
import { ThermalReceipt } from "@/components/ThermalReceipt";
import { CartLineItem } from "@/components/CartLineItem";
import { X, Receipt, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PAYMENTS = [
  { id: "tunai", label: "Tunai" },
  { id: "qris", label: "QRIS" },
  { id: "transfer", label: "Transfer" },
];

export function CartSheet({ open, onClose }: Props) {
  const { lines, inc, dec, remove, setNote, clear } = useCart();
  const enqueueOffline = useOfflineQueue((s) => s.enqueue);
  const total = cartTotal(lines);
  const [payment, setPayment] = useState("tunai");
  const [paid, setPaid] = useState("");
  const [done, setDone] = useState<{ id: string; change: number; offline?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [clearPending, setClearPending] = useState(false);

  const paidNum = Number(paid.replace(/\D/g, "")) || 0;
  const change = payment === "tunai" ? Math.max(0, paidNum - total) : 0;

  const panel = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="font-display text-lg font-bold">Keranjang ({lines.length})</h2>
        <button
          onClick={onClose}
          aria-label="Tutup keranjang"
          className="press p-1 text-brand-ink/60 lg:hidden"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {lines.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-ink/60">
            Keranjang kosong. Ketuk item di kiri.
          </p>
        ) : (
          lines.map((l) => (
            <CartLineItem
              key={l.itemId}
              line={l}
              onInc={() => inc(l.itemId)}
              onDec={() => dec(l.itemId)}
              onRemove={() => remove(l.itemId)}
              onNoteChange={(note) => setNote(l.itemId, note)}
            />
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        {done ? (
          <ThermalReceipt
            orderId={done.id}
            lines={lines}
            total={total}
            payment={payment}
            paid={paidNum}
            change={done.change}
            offline={done.offline}
            onNewOrder={() => {
              setDone(null);
              setPaid("");
              clear();
              onClose();
            }}
          />
        ) : (
          <>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-brand-ink/60">Total</span>
              <span className="tabular font-display text-2xl font-bold text-brand">
                {formatRupiah(total)}
              </span>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-1">
              {PAYMENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={`press rounded py-1.5 text-xs font-semibold ${
                    payment === p.id ? "bg-brand text-surface" : "text-brand-ink/70"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {payment === "tunai" && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-brand-ink/60">
                  Uang Diterima
                </label>
                <input
                  inputMode="numeric"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder="0"
                  className="tabular w-full rounded-md bg-surface-2 px-3 py-2 outline-none"
                />

                {/* Tombol Uang Cepat (Quick Cash) */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaid(String(total))}
                    className="press rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-brand hover:bg-surface-2 border border-border"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setPaid(String(nominal))}
                      className="press rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-brand-ink/80 hover:bg-surface-2 border border-border"
                    >
                      {formatRupiah(nominal)}
                    </button>
                  ))}
                </div>

                {paidNum > 0 && (
                  <p className="tabular mt-1.5 text-xs text-brand-ink/60">
                    Kembalian: <span className="font-bold text-ok">{formatRupiah(change)}</span>
                  </p>
                )}
              </div>
            )}

            {errMsg && (
              <div className="mb-3 flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-xs text-error">
                <AlertCircle size={14} className="shrink-0" />
                {errMsg}
              </div>
            )}

            <TouchButton
              variant="accent"
              className="w-full"
              disabled={lines.length === 0 || busy}
              onClick={async () => {
                setErrMsg(null);
                setBusy(true);
                const orderLines = lines.map((l) => ({
                  item_id: l.itemId,
                  name: l.name,
                  unit: l.unit,
                  qty: l.qty,
                  unit_price: l.unitPrice,
                  note: l.note,
                }));

                try {
                  const res = await api.createOrder(orderLines, payment, "");
                  setDone({ id: res.id, change, offline: false });
                } catch {
                  const offlineId = "offline-" + Date.now();
                  enqueueOffline({
                    id: offlineId,
                    lines: orderLines,
                    payment,
                    note: "",
                    createdAt: new Date().toISOString(),
                  });
                  setDone({ id: offlineId, change, offline: true });
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Receipt size={18} /> Bayar
            </TouchButton>

            {lines.length > 0 && (
              clearPending ? (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="text-xs text-brand-ink/60">Kosongkan keranjang?</span>
                  <button
                    onClick={() => { clear(); setClearPending(false); }}
                    className="text-xs font-semibold text-error"
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => setClearPending(false)}
                    className="text-xs text-brand-ink/50"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setClearPending(true)}
                  className="mt-2 w-full text-center text-xs text-brand-ink/50 hover:text-error"
                >
                  Kosongkan keranjang
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[340px] shrink-0 border-l border-border lg:block">
        {panel}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="motion absolute inset-0 bg-surface">
            {panel}
          </div>
        </div>
      )}
    </>
  );
}
