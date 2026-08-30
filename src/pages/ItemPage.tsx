

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TouchButton } from "@/components/TouchButton";
import { ItemForm } from "@/components/ItemForm";
import { ItemCatalogTable, type SortKey, type SortOrder } from "@/components/ItemCatalogTable";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Search } from "lucide-react";
import { api, type ItemDTO, type CategoryDTO } from "@/lib/api";

export default function ItemPage() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [editing, setEditing] = useState<ItemDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemDTO | null>(null);
  const [version, setVersion] = useState(0);

  // Sorting & Filtering
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    let active = true;
    Promise.all([api.listItems(), api.listCategories()])
      .then(([i, c]) => {
        if (!active) return;
        setItems(i);
        setCats(c);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [version]);

  async function handleTogglePin(item: ItemDTO) {
    await api.updateItem(item.id, {
      name: item.name,
      price: item.price,
      category_id: item.category_id,
      unit: item.unit,
      is_service: item.is_service,
      pinned: !item.pinned,
    });
    setVersion((v) => v + 1);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    await api.deleteItem(itemToDelete.id);
    setItemToDelete(null);
    setVersion((v) => v + 1);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder(key === "price" ? "desc" : "asc");
    }
  }

  // Filtered and sorted items
  const displayItems = useMemo(() => {
    const filtered = items.filter((i) => {
      if (selectedCat !== "all" && i.category_id !== selectedCat) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return i.name.toLowerCase().includes(q) || String(i.price).includes(q);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "id");
      } else if (sortKey === "category") {
        const catA = cats.find((c) => c.id === a.category_id)?.name ?? a.category_id;
        const catB = cats.find((c) => c.id === b.category_id)?.name ?? b.category_id;
        cmp = catA.localeCompare(catB, "id");
      } else if (sortKey === "unit") {
        cmp = a.unit.localeCompare(b.unit, "id");
      } else if (sortKey === "price") {
        cmp = a.price - b.price;
      } else if (sortKey === "pinned") {
        cmp = Number(b.pinned) - Number(a.pinned);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [items, cats, search, selectedCat, sortKey, sortOrder]);

  const pinnedCount = useMemo(() => items.filter((i) => i.pinned).length, [items]);

  if (status === "loading") {
    return (
      <AppShell>
        <main className="flex-1 p-3">
          <p className="py-16 text-center text-sm text-brand-ink/60">Memuat…</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="flex-1 p-3">
        {/* Header & Tombol Tambah */}
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Katalog Item</h1>
          <TouchButton
            variant="accent"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Item Baru
          </TouchButton>
        </div>

        {status === "error" ? (
          <EmptyState title="Gagal memuat" hint="Backend (port 8080) menyala?" />
        ) : (
          <>
            {/* 3 Kartu Ringkasan Katalog */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Total Produk</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand">
                  {items.length} Item
                </p>
              </div>
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Total Kategori</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-brand-ink">
                  {cats.length} Kategori
                </p>
              </div>
              <div className="elevate rounded-lg bg-surface-2 p-4">
                <p className="text-xs font-medium text-brand-ink/60">Item Unggulan (Pinned)</p>
                <p className="tabular mt-2 font-display text-2xl font-bold text-accent">
                  {pinnedCount} Produk
                </p>
              </div>
            </div>

            {/* Bilah Pencarian & Filter Kategori */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama / harga produk…"
                  className="w-full rounded-lg bg-surface-2 pl-9 pr-3 py-2 text-xs outline-none placeholder:text-brand-ink/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-brand-ink/60 font-medium hidden sm:inline">Kategori:</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-brand-ink outline-none"
                >
                  <option value="all">Semua Kategori ({items.length})</option>
                  {cats.map((c) => {
                    const count = items.filter((i) => i.category_id === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Tabel Katalog Item */}
            <ItemCatalogTable
              items={displayItems}
              cats={cats}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={(item) => {
                setEditing(item);
                setShowForm(true);
              }}
              onTogglePin={handleTogglePin}
              onRequestDelete={(item) => setItemToDelete(item)}
            />
          </>
        )}
      </main>

      {/* Modal Form Tambah/Edit Item */}
      {showForm && (
        <ItemForm
          cats={cats}
          initial={editing}
          onClose={() => setShowForm(false)}
          onCategoriesChange={(c) => setCats((prev) => [...prev, c])}
          onCategoryRemoved={(id) => setCats((prev) => prev.filter((c) => c.id !== id))}
          onSaved={() => {
            setShowForm(false);
            setVersion((v) => v + 1);
          }}
        />
      )}

      {/* Modal Konfirmasi Hapus Aman */}
      {itemToDelete && (
        <DeleteConfirmModal
          itemName={itemToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </AppShell>
  );
}
