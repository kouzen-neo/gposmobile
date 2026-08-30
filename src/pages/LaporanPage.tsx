import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { TransactionTable } from "@/components/TransactionTable";
import { TouchButton } from "@/components/TouchButton";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { api, type OrderDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { useCart, useOfflineQueue } from "@/lib/store";
import { Download, Search, Trash2, AlertTriangle } from "lucide-react";

function formatShort(v: number) {
  if (v >= 1_000_000) {
    const s = (v / 1_000_000).toFixed(1).replace(".0", "");
    return `${s}jt`;
  }
  if (v >= 1_000) return `${Math.round(v / 1_000)}rb`;
  return String(v);
}

export default function LaporanPage() {
  const [chartData, setChartData] = useState<{ hari: string; omzet: number }[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Filters
  const [period, setPeriod] = useState<"today" | "7days" | "all">("7days");
  const [payment, setPayment] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    Promise.all([api.dailyReport(), api.listOrders()])
      .then(([rows, list]) => {
        setChartData(rows.map((r) => ({ hari: r.hari, omzet: r.omzet })));
        setOrders(list);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA");
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-CA");

    return orders.filter((o) => {
      const orderDate = o.created_at.slice(0, 10);
      if (period === "today" && orderDate !== todayStr) return false;
      if (period === "7days" && orderDate < sevenDaysAgo) return false;
      if (payment !== "all" && o.payment.toLowerCase() !== payment) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchId = o.id.toLowerCase().includes(q);
        const matchNote = o.note.toLowerCase().includes(q);
        if (!matchId && !matchNote) return false;
      }
      return true;
    });
  }, [orders, period, payment, search]);

  const totalOmzet = useMemo(() => filteredOrders.reduce((s, o) => s + o.total, 0), [filteredOrders]);
  const totalCount = filteredOrders.length;
  const aov = totalCount > 0 ? Math.round(totalOmzet / totalCount) : 0;

  function handleExportCSV() {
    const headers = ["ID Order", "Tanggal", "Jam", "Metode Bayar", "Status", "Total Rp", "Catatan"];
    const rows = filteredOrders.map((o) => {
      const d = new Date(o.created_at);
      const ds = d.toLocaleDateString("id-ID");
      const ts = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      return [`"${o.id}"`, `"${ds}"`, `"${ts}"`, `"${o.payment}"`, `"${o.status}"`, o.total, `"${(o.note || "").replace(/"/g, '""')}"`].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleResetData() {
    setResetting(true);
    try {
      await api.resetAllData();
      useCart.getState().clear();
      useOfflineQueue.getState().clearQueue();
      const [rows, list] = await Promise.all([api.dailyReport(), api.listOrders()]);
      setChartData(rows.map((r) => ({ hari: r.hari, omzet: r.omzet })));
      setOrders(list);
    } catch {
      // ignore
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  }

  return (
    <AppShell>
      <main className="flex-1 p-3">
        {/* Header & Export Button */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Laporan Penjualan</h1>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredOrders.length === 0}
            className="press flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-border disabled:opacity-50"
          >
            <Download size={14} className="text-brand" />
            <span>Export CSV</span>
          </button>
        </div>

        {status === "loading" ? (
          <p className="py-16 text-center text-sm text-brand-ink/60">Memuat laporan…</p>
        ) : status === "error" ? (
          <p className="py-16 text-center text-sm text-error">Gagal memuat data laporan.</p>
        ) : (
          <>
            {/* 3 Kartu Ringkasan Finansial */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Total Omzet Periode</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand">
                  {formatRupiah(totalOmzet)}
                </p>
              </div>
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Total Transaksi</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand-ink">
                  {totalCount}
                </p>
              </div>
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Rata-rata Transaksi (AOV)</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand-ink">
                  {formatRupiah(aov)}
                </p>
              </div>
            </div>

            {/* Grafik Tren 7 Hari */}
            <div className="elevate mt-3 rounded-lg bg-surface-2 p-4">
              <h2 className="mb-3 text-xs font-semibold text-brand-ink/70">
                Omzet per Hari (7 Hari Terakhir)
              </h2>
              <div className="chart-wrap h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="hari" tickLine={false} axisLine={{ stroke: "#dad2c4" }} tick={{ fontSize: 11, fill: "#1f2a24" }} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={formatShort} tick={{ fontSize: 10, fill: "#1f2a24", opacity: 0.6 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(47, 107, 79, 0.08)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as { hari: string; omzet: number };
                        return (
                          <div className="rounded-lg bg-surface p-2 shadow-md border border-border text-xs">
                            <p className="font-semibold text-brand-ink">{p.hari}</p>
                            <p className="tabular font-bold text-brand mt-0.5">
                              Omzet: {formatRupiah(p.omzet)}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="omzet" fill="#2f6b4f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filter Periode & Metode Pembayaran */}
            <div className="mt-4 mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Periode */}
                <div className="flex rounded-md bg-surface-2 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPeriod("today")}
                    className={
                      "press rounded px-2.5 py-1 text-xs font-semibold " +
                      (period === "today" ? "bg-brand text-surface" : "text-brand-ink/70")
                    }
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("7days")}
                    className={
                      "press rounded px-2.5 py-1 text-xs font-semibold " +
                      (period === "7days" ? "bg-brand text-surface" : "text-brand-ink/70")
                    }
                  >
                    7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("all")}
                    className={
                      "press rounded px-2.5 py-1 text-xs font-semibold " +
                      (period === "all" ? "bg-brand text-surface" : "text-brand-ink/70")
                    }
                  >
                    Semua
                  </button>
                </div>

                {/* Filter Metode Bayar */}
                <div className="flex rounded-md bg-surface-2 p-0.5">
                  {["all", "tunai", "qris", "transfer"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayment(m)}
                      className={
                        "press rounded px-2.5 py-1 text-xs font-semibold uppercase " +
                        (payment === m ? "bg-brand text-surface" : "text-brand-ink/70")
                      }
                    >
                      {m === "all" ? "Semua Bayar" : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pencarian */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari ID order / catatan…"
                  className="w-full rounded-md bg-surface-2 pl-8 pr-3 py-1.5 text-xs outline-none placeholder:text-brand-ink/40"
                />
              </div>
            </div>

            {/* Tabel Riwayat Transaksi */}
            <TransactionTable
              orders={filteredOrders}
              onSelectOrder={(id) => setSelectedOrderId(id)}
            />

            {/* Tombol Kecil Reset Data di Kanan Bawah */}
            <div className="mt-6 flex justify-end pb-4">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                title="Reset Database"
                aria-label="Reset Semua Data"
                className="press inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium text-brand-ink/30 hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20"
              >
                <Trash2 size={12} />
                <span>Reset Database</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modal Detail Order saat baris diklik */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* Modal Konfirmasi Reset Data */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !resetting && setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-surface p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-error mb-2">
              <AlertTriangle size={20} className="shrink-0" />
              <h3 className="font-display text-base font-bold">Reset Semua Data?</h3>
            </div>
            <p className="text-xs text-brand-ink/70 leading-relaxed mb-4">
              Apakah Anda yakin ingin mengosongkan database? Tindakan ini akan menghapus seluruh data riwayat pesanan transaksi, produk katalog, dan kategori. Data yang dihapus tidak dapat dipulihkan.
            </p>
            <div className="flex gap-2">
              <TouchButton
                variant="ghost"
                className="flex-1 text-xs"
                disabled={resetting}
                onClick={() => setShowResetConfirm(false)}
              >
                Batal
              </TouchButton>
              <TouchButton
                variant="accent"
                className="flex-1 text-xs bg-error text-surface hover:opacity-90"
                disabled={resetting}
                onClick={handleResetData}
              >
                {resetting ? "Mereset…" : "Hapus Semua Data"}
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
