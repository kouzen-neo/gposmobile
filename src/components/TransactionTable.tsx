import type { OrderDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { ChevronRight } from "lucide-react";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function payBadge(p: string) {
  const norm = p.toLowerCase();
  if (norm === "tunai") return "bg-brand/10 text-brand";
  if (norm === "qris") return "bg-accent/10 text-accent";
  return "bg-brand-ink/10 text-brand-ink/70";
}

interface Props {
  orders: OrderDTO[];
  onSelectOrder: (id: string) => void;
}

export function TransactionTable({ orders, onSelectOrder }: Props) {
  return (
    <div className="elevate overflow-hidden rounded-lg bg-surface-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/80 text-xs text-brand-ink/60">
            <tr>
              <th className="py-2.5 pl-4 pr-3">Waktu</th>
              <th className="py-2.5 pr-3">ID Order</th>
              <th className="py-2.5 pr-3">Metode</th>
              <th className="py-2.5 pr-3">Status</th>
              <th className="py-2.5 pr-4 text-right">Total</th>
              <th className="py-2.5 pr-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-brand-ink/40">
                  Tidak ada transaksi yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              orders.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => onSelectOrder(o.id)}
                  className={
                    "press cursor-pointer hover:bg-surface " +
                    (i < orders.length - 1 ? "border-b border-border/50" : "")
                  }
                >
                  <td className="py-2.5 pl-4 pr-3 text-xs">
                    <span className="font-medium text-brand-ink">{fmtDate(o.created_at)}</span>
                    <span className="tabular ml-1.5 text-brand-ink/50">{fmtTime(o.created_at)}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-brand-ink/70">
                    #{o.id.slice(0, 8)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={
                        "rounded px-2 py-0.5 text-[11px] font-semibold uppercase " +
                        payBadge(o.payment)
                      }
                    >
                      {o.payment}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded bg-ok/10 px-2 py-0.5 text-[11px] font-semibold text-ok capitalize">
                      {o.status}
                    </span>
                  </td>
                  <td className="tabular py-2.5 pr-4 text-right font-bold text-brand">
                    {formatRupiah(o.total)}
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand hover:underline">
                      Detail <ChevronRight size={13} />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
