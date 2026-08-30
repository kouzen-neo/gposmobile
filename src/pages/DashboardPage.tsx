

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { api, type OrderDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/store";
import { ArrowRight, ChevronRight, Banknote, QrCode, CreditCard } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function delta(now: number, prev: number) {
  if (prev <= 0) return null;
  return Math.round(((now - prev) / prev) * 100);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function payLabel(p: string) {
  return p === "qris" ? "QRIS" : p.charAt(0).toUpperCase() + p.slice(1);
}

function formatShort(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`;
  return String(v);
}

export default function DashboardPage() {
  const [data, setData] = useState<{
    omzet: number;
    count: number;
    omzet_yesterday: number;
    top_item: string;
    payments?: { tunai: number; qris: number; transfer: number };
  } | null>(null);
  const [trend, setTrend] = useState<{ hari: string; omzet: number }[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const shiftOpen = useCart((s) => s.shiftOpen);

  useEffect(() => {
    Promise.all([api.ordersToday(), api.dailyReport(), api.listOrders()])
      .then(([d, t, all]) => {
        setData(d);
        setTrend(t);
        const today = new Date().toLocaleDateString("en-CA");
        setOrders(all.filter((o) => o.created_at.slice(0, 10) === today).slice(0, 7));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const d = data ?? {
    omzet: 0,
    count: 0,
    omzet_yesterday: 0,
    top_item: "-",
    payments: { tunai: 0, qris: 0, transfer: 0 },
  };
  const pct = delta(d.omzet, d.omzet_yesterday);

  return (
    <AppShell>
      <main className="flex-1 p-3">
        <h1 className="mb-3 font-display text-xl font-bold">Dashboard</h1>
        {status === "error" ? (
          <p className="py-16 text-center text-sm text-brand-ink/60">
            Gagal memuat. Backend (port 8080) menyala?
          </p>
        ) : (
          <>
            {/* 4 Kartu Metrik Utama */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="elevate flex flex-col justify-between rounded-lg bg-surface-2 p-4">
                <div>
                  <p className="text-xs font-medium text-brand-ink/60">Omzet Hari Ini</p>
                  <p className="tabular mt-2 font-display text-2xl font-bold text-brand">
                    {status === "loading" ? "…" : formatRupiah(d.omzet)}
                  </p>
                  {pct !== null && (
                    <p className={"mt-1 text-xs font-medium " + (pct >= 0 ? "text-ok" : "text-error")}>
                      {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}% vs kemarin
                    </p>
                  )}
                </div>
                {/* Rekap Metode Pembayaran */}
                <div className="mt-3 border-t border-border/60 pt-2 text-[11px] space-y-1 text-brand-ink/70">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Banknote size={13} className="text-brand" /> Tunai</span>
                    <span className="tabular font-semibold text-brand-ink">{formatRupiah(d.payments?.tunai ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><QrCode size={13} className="text-accent" /> QRIS</span>
                    <span className="tabular font-semibold text-brand-ink">{formatRupiah(d.payments?.qris ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><CreditCard size={13} className="text-brand-ink/60" /> Transfer</span>
                    <span className="tabular font-semibold text-brand-ink">{formatRupiah(d.payments?.transfer ?? 0)}</span>
                  </div>
                </div>
              </div>

              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Total Order</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand-ink">
                  {status === "loading" ? "…" : d.count}
                </p>
              </div>

              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Item Terlaris</p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-ink">
                  {status === "loading" ? "…" : d.top_item}
                </p>
              </div>

              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Shift</p>
                <p className={"mt-2 font-display text-2xl font-bold " + (shiftOpen ? "text-ok" : "text-brand-ink/40")}>
                  {shiftOpen ? "Buka" : "Tutup"}
                </p>
              </div>
            </div>

            {/* Area Bawah: 2 Kolom (Transaksi Terbaru & Tren Omzet 7 Hari) */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Kolom Kiri: Transaksi Terakhir */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-brand-ink/60">Transaksi Hari Ini</p>
                  <Link
                    to="/laporan"
                    className="press flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    Lihat Semua di Laporan <ArrowRight size={13} />
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <p className="rounded-lg bg-surface-2 p-8 text-center text-sm text-brand-ink/40">
                    {status === "loading" ? "…" : "Belum ada transaksi hari ini."}
                  </p>
                ) : (
                  <div className="elevate overflow-hidden rounded-lg bg-surface-2">
                    {orders.map((o, i) => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrderId(o.id)}
                        className={
                          "press flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-surface " +
                          (i < orders.length - 1 ? "border-b border-border/60" : "")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <span className="tabular text-xs text-brand-ink/50">{fmtTime(o.created_at)}</span>
                          <span className="rounded bg-surface px-1.5 py-0.5 text-xs font-medium text-brand-ink/70">
                            {payLabel(o.payment)}
                          </span>
                          <span className="hidden text-xs text-brand-ink/40 sm:inline">#{o.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="tabular text-sm font-bold text-brand">{formatRupiah(o.total)}</span>
                          <ChevronRight size={14} className="text-brand-ink/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Tren Omzet 7 Hari Terakhir */}
              <div>
                <p className="mb-2 text-xs font-medium text-brand-ink/60">Tren Omzet (7 Hari Terakhir)</p>
                <div className="elevate rounded-lg bg-surface-2 p-4">
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={trend}>
                        <XAxis dataKey="hari" tick={{ fontSize: 12, fill: "#1f2a24" }} />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#1f2a24" }}
                          width={48}
                          tickFormatter={formatShort}
                        />
                        <Tooltip
                          formatter={(v) => [formatRupiah(Number(v)), "Omzet"]}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #dad2c4",
                            background: "#f7f4ee",
                          }}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="omzet" fill="#2f6b4f" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal Detail Order saat Transaksi Diklik */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </AppShell>
  );
}
