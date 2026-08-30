

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Search, Clock, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ItemGrid } from "@/components/ItemGrid";
import { CartSheet } from "@/components/CartSheet";
import { ShiftModal } from "@/components/ShiftModal";
import { EmptyState } from "@/components/EmptyState";
import { api, type ItemDTO, type CategoryDTO } from "@/lib/api";
import { useCart, cartTotal } from "@/lib/store";
import { formatRupiah } from "@/lib/format";

export default function KasirPage() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [cat, setCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState(false);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [showShiftModal, setShowShiftModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const add = useCart((s) => s.add);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const total = useCart((s) => cartTotal(s.lines));
  const shiftOpen = useCart((s) => s.shiftOpen);
  const shiftFloat = useCart((s) => s.shiftFloat);
  const openShift = useCart((s) => s.openShift);
  const closeShift = useCart((s) => s.closeShift);

  useEffect(() => {
    Promise.all([api.listItems(), api.listCategories()])
      .then(([data, c]) => {
        setItems(data);
        setCats(c);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Shortcut key: "/" to quickly focus product search bar on desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visible = items.filter((i) => {
    if (cat !== "all" && i.category_id !== cat) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return i.name.toLowerCase().includes(q) || String(i.price).includes(q);
    }
    return true;
  });

  const sorted = [...visible].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  const catIds = Array.from(
    new Set(items.map((i) => i.category_id).filter((c) => c !== "uncategorized"))
  );

  if (status === "loading") {
    return (
      <AppShell>
        <main className="flex-1 p-3">
          <p className="py-16 text-center text-sm text-brand-ink/60">Memuat katalog…</p>
        </main>
      </AppShell>
    );
  }

  if (status === "error") {
    return (
      <AppShell>
        <main className="flex-1 p-3">
          <EmptyState
            title="Gagal memuat katalog"
            hint="Pastikan backend gPOS (port 8080) menyala."
          />
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <main className="flex-1 min-w-0 p-3 pb-28 lg:pb-3">
          {/* Baris Atas: Kolom Cari Produk & Tombol Shift */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk…"
                className="w-full rounded-lg bg-surface-2 pl-9 pr-3 py-2 text-sm outline-none placeholder:text-brand-ink/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowShiftModal(true)}
              className={
                "press flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold " +
                (shiftOpen ? "bg-ok/10 text-ok" : "bg-surface-2 text-brand-ink/60 hover:bg-border")
              }
            >
              <Clock size={14} />
              <span>Shift: {shiftOpen ? "Buka" : "Tutup"}</span>
            </button>
          </div>

          {/* Tab Kategori (Smooth touch scrolling tanpa scrollbar kaku) */}
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto px-0.5 pb-1">
            <Tab active={cat === "all"} onClick={() => setCat("all")}>
              Semua
            </Tab>
            {catIds.map((id) => (
              <Tab key={id} active={cat === id} onClick={() => setCat(id)}>
                {cats.find((c) => c.id === id)?.name ?? id}
              </Tab>
            ))}
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              title={search ? "Item tidak ditemukan" : "Belum ada item"}
              hint={search ? "Coba kata kunci pencarian lain." : "Tambah di menu Item."}
            />
          ) : (
            <ItemGrid
              items={sorted}
              onPick={(it) =>
                add({
                  itemId: it.id,
                  name: it.name,
                  unit: it.unit,
                  unitPrice: it.price,
                })
              }
            />
          )}
        </main>

        <CartSheet open={sheet} onClose={() => setSheet(false)} />
      </div>

      {/* Sticky Bottom Cart Bar on mobile (Gaya aplikasi POS modern) */}
      {count > 0 && (
        <div className="fixed bottom-20 inset-x-3 z-30 lg:hidden">
          <button
            onClick={() => setSheet(true)}
            className="press elevate flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 font-semibold text-surface shadow-lg"
          >
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart size={18} />
              <span>{count} Item</span>
              <span className="opacity-60">·</span>
              <span className="tabular font-bold">{formatRupiah(total)}</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold">
              Buka Keranjang <ArrowRight size={14} />
            </span>
          </button>
        </div>
      )}

      {/* Modal Shift Kasir */}
      <ShiftModal
        isOpen={showShiftModal}
        shiftOpen={shiftOpen}
        shiftFloat={shiftFloat}
        onOpenShift={(float) => openShift(float)}
        onCloseShift={() => closeShift()}
        onClose={() => setShowShiftModal(false)}
      />
    </AppShell>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "press motion shrink-0 rounded-lg px-4 py-2 text-sm font-semibold " +
        (active ? "bg-brand text-surface" : "bg-surface-2 text-brand-ink hover:bg-border")
      }
    >
      {children}
    </button>
  );
}
