

import { useEffect, useState } from "react";
import { X, Receipt } from "lucide-react";
import { api, type OrderDetailDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

interface Props {
  orderId: string;
  onClose: () => void;
}

function fmtFullTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function OrderDetailModal({ orderId, onClose }: Props) {
  const [detail, setDetail] = useState<OrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getOrder(orderId)
      .then((data) => {
        if (active) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-surface p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-brand" />
            <h2 className="font-display text-lg font-bold">Rincian Order</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="press p-1 text-brand-ink/60 hover:text-brand-ink"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-brand-ink/60">Memuat rincian…</p>
        ) : !detail ? (
          <p className="py-8 text-center text-sm text-error">Gagal memuat rincian order.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-brand-ink/70">
              <span className="font-mono font-medium">#{detail.id}</span>
              <span>{fmtFullTime(detail.created_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-semibold uppercase text-brand">
                {detail.payment}
              </span>
              <span className="rounded bg-ok/10 px-2 py-0.5 text-xs font-semibold text-ok capitalize">
                {detail.status}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-md bg-surface-2 p-3 space-y-2">
              {detail.lines.length === 0 ? (
                <p className="text-xs text-brand-ink/50">Tidak ada rincian item.</p>
              ) : (
                detail.lines.map((l) => (
                  <div key={l.id} className="flex items-start justify-between text-xs">
                    <div>
                      <p className="font-semibold text-brand-ink">{l.name}</p>
                      <p className="tabular text-brand-ink/60">
                        {l.qty} {l.unit} × {formatRupiah(l.unit_price)}
                      </p>
                      {l.note && (
                        <p className="italic text-brand-ink/50">Catatan: {l.note}</p>
                      )}
                    </div>
                    <span className="tabular font-bold text-brand">
                      {formatRupiah(l.qty * l.unit_price)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold">Total Pembayaran</span>
              <span className="tabular font-display text-xl font-bold text-brand">
                {formatRupiah(detail.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
