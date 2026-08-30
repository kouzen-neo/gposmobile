

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { TouchButton } from "@/components/TouchButton";
import { formatRupiah } from "@/lib/format";
import { type OrderLine } from "@/lib/store";
import { Printer, RotateCcw, WifiOff, CheckCircle2 } from "lucide-react";

interface Props {
  orderId: string;
  lines: OrderLine[];
  total: number;
  payment: string;
  paid: number;
  change: number;
  offline?: boolean;
  onNewOrder: () => void;
}

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThermalReceipt({
  orderId,
  lines,
  total,
  payment,
  paid,
  change,
  offline,
  onNewOrder,
}: Props) {
  const mounted = useIsMounted();

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    const bridge = (window as unknown as { AndroidBridge?: { printReceipt: (html: string) => void } }).AndroidBridge;
    if (bridge && typeof bridge.printReceipt === "function") {
      const receiptEl = document.getElementById("thermal-receipt-print");
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Struk Kasir gPOS</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: monospace; font-size: 12px; line-height: 1.35; color: #000; background: #fff; width: 58mm; margin: 0 auto; padding: 3mm 2mm; }
            .border-b { border-bottom: 1px dashed #333; padding-bottom: 8px; margin-bottom: 8px; }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-sm { font-size: 13px; }
            .text-xs { font-size: 11px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[11px\\] { font-size: 11px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-1\\.5 > * + * { margin-top: 6px; }
            .space-y-0\\.5 > * + * { margin-top: 2px; }
            .tabular { font-variant-numeric: tabular-nums; }
            .pt-1 { padding-top: 4px; }
            .pb-2 { padding-bottom: 8px; }
            .mb-2 { margin-bottom: 8px; }
            .flex-1 { flex: 1 1 0%; }
            .pr-2 { padding-right: 8px; }
          </style>
        </head>
        <body>
          ${receiptEl ? receiptEl.innerHTML : ""}
        </body>
        </html>
      `;
      bridge.printReceipt(htmlContent);
    } else {
      window.print();
    }
  };

  const receiptBody = (
    <div>
      {/* Header Struk */}
      <div className="border-b border-dashed border-border/80 pb-2 mb-2 text-center">
        <p className="font-bold text-sm tracking-wide text-brand-ink">gPOS STORE</p>
        <p className="text-[11px] text-brand-ink/70">Jl. Bisnis Modern No. 8</p>
        <p className="text-[11px] text-brand-ink/70">{dateStr} · {timeStr}</p>
        <p className="text-[11px] font-mono text-brand-ink/60">#{orderId.slice(0, 10)}</p>
      </div>

      {/* Rincian Item */}
      <div className="space-y-1.5 border-b border-dashed border-border/80 pb-2 mb-2 text-xs">
        {lines.map((l, idx) => (
          <div key={idx} className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <p className="font-medium text-brand-ink">{l.name}</p>
              <p className="text-[10px] text-brand-ink/60">
                {l.qty} {l.unit} × {formatRupiah(l.unitPrice)}
              </p>
            </div>
            <span className="tabular font-semibold text-brand-ink">
              {formatRupiah(l.qty * l.unitPrice)}
            </span>
          </div>
        ))}
      </div>

      {/* Rincian Pembayaran */}
      <div className="space-y-1 border-b border-dashed border-border/80 pb-2 mb-2 text-xs">
        <div className="flex justify-between font-bold text-sm">
          <span>Total</span>
          <span className="tabular text-brand">{formatRupiah(total)}</span>
        </div>
        <div className="flex justify-between text-brand-ink/70">
          <span>Bayar ({payment.toUpperCase()})</span>
          <span className="tabular">
            {payment === "tunai" ? formatRupiah(paid) : formatRupiah(total)}
          </span>
        </div>
        {payment === "tunai" && (
          <div className="flex justify-between font-semibold text-ok">
            <span>Kembalian</span>
            <span className="tabular">{formatRupiah(change)}</span>
          </div>
        )}
      </div>

      {/* Footer Struk */}
      <div className="pt-1 text-center text-[10px] text-brand-ink/50 space-y-0.5">
        <p>Terima kasih atas kunjungan Anda</p>
        <p>gPOS — Kasir Modern</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-2 rounded-lg bg-surface-2 p-3 text-center">
      {/* Status Sukses */}
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ok">
        <CheckCircle2 size={16} />
        <span>Order {orderId.slice(0, 10)} {offline ? "(Offline)" : ""} tersimpan ✓</span>
      </div>

      {offline && (
        <p className="flex items-center justify-center gap-1 text-[11px] text-warn">
          <WifiOff size={13} /> Disimpan offline, akan disinkron saat online.
        </p>
      )}

      {/* Ringkasan Pembayaran & Kembalian */}
      <div className="py-1">
        {change > 0 ? (
          <div>
            <span className="text-xs text-brand-ink/60">Kembalian</span>
            <p className="tabular font-display text-2xl font-bold text-ok">
              {formatRupiah(change)}
            </p>
            <p className="tabular text-xs text-brand-ink/50">
              Total {formatRupiah(total)} · Bayar {formatRupiah(paid)}
            </p>
          </div>
        ) : (
          <div>
            <span className="text-xs text-brand-ink/60">Total Pembayaran</span>
            <p className="tabular font-display text-xl font-bold text-brand">
              {formatRupiah(total)}
            </p>
          </div>
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="flex gap-2 pt-1">
        <TouchButton
          variant="primary"
          onClick={handlePrint}
          className="flex-1 text-xs"
        >
          <Printer size={15} /> Cetak Struk
        </TouchButton>
        <TouchButton
          variant="ghost"
          onClick={onNewOrder}
          className="flex-1 text-xs"
        >
          <RotateCcw size={15} /> Order Baru
        </TouchButton>
      </div>

      {/* Portal Khusus Print Thermal (Hanya tercetak saat dialog printer dibuka) */}
      {mounted &&
        createPortal(
          <div id="thermal-receipt-print">{receiptBody}</div>,
          document.body
        )}
    </div>
  );
}
