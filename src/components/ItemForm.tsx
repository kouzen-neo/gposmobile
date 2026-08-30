import { useState } from "react";
import { TouchButton } from "@/components/TouchButton";
import { Pencil, Trash2 } from "lucide-react";
import { api, type ItemDTO, type CategoryDTO } from "@/lib/api";

interface Props {
  cats: CategoryDTO[];
  initial: ItemDTO | null;
  onClose: () => void;
  onSaved: () => void;
  onCategoriesChange: (c: CategoryDTO) => void;
  onCategoryRemoved: (id: string) => void;
}

export function ItemForm({
  cats,
  initial,
  onClose,
  onSaved,
  onCategoriesChange,
  onCategoryRemoved,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? cats[0]?.id ?? "");
  const [unit, setUnit] = useState<"pcs" | "kg" | "service">(initial?.unit ?? "pcs");
  const [isService, setIsService] = useState(initial?.is_service ?? false);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [newCat, setNewCat] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  async function addCategory() {
    const label = newCat.trim();
    if (!label) return;
    const c = await api.createCategory(label);
    onCategoriesChange(c);
    setCategoryId(c.id);
    setNewCat("");
  }

  async function save() {
    const body = {
      name,
      price: Number(price) || 0,
      category_id: categoryId,
      unit,
      is_service: isService,
      pinned,
    };
    if (initial) await api.updateItem(initial.id, body);
    else await api.createItem(body);
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 font-display text-lg font-bold">
          {initial ? "Edit Item" : "Item Baru"}
        </h2>
        <label className="mb-2 block text-xs font-medium text-brand-ink/60">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md bg-surface-2 px-3 py-2"
        />
        <label className="mb-2 block text-xs font-medium text-brand-ink/60">Harga</label>
        <input
          value={price}
          inputMode="numeric"
          onChange={(e) => setPrice(e.target.value)}
          className="tabular mb-3 w-full rounded-md bg-surface-2 px-3 py-2"
        />
        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-brand-ink/60">Kategori</label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {cats.map((c) => (
                <div
                  key={c.id}
                  className={
                    "flex items-center gap-2 rounded-md px-2 py-1.5 " +
                    (categoryId === c.id ? "bg-surface-2" : "hover:bg-surface-2")
                  }
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={categoryId === c.id}
                    onChange={() => setCategoryId(c.id)}
                    className="accent-brand"
                  />
                  <span
                    className="flex-1 cursor-pointer text-sm"
                    onClick={() => setCategoryId(c.id)}
                  >
                    {c.name}
                  </span>
                  <button
                    type="button"
                    aria-label="Ubah nama kategori"
                    onClick={() => {
                      const n = prompt("Ubah nama kategori:", c.name);
                      if (n && n.trim() && n.trim() !== c.name) {
                        api.updateCategory(c.id, n.trim());
                        onCategoriesChange({ ...c, name: n.trim() });
                      }
                    }}
                    className="p-1 text-brand-ink/50 hover:text-brand"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus kategori"
                    disabled={c.id === "uncategorized"}
                    onClick={() => {
                      if (
                        confirm(
                          `Hapus kategori "${c.name}"? Item di dalamnya dipindah ke Tanpa Kategori.`
                        )
                      ) {
                        api.deleteCategory(c.id);
                        onCategoryRemoved(c.id);
                        if (categoryId === c.id) setCategoryId("uncategorized");
                      }
                    }}
                    className="p-1 text-brand-ink/50 hover:text-error disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowNewCat((v) => !v)}
              className="mt-2 text-xs text-brand hover:underline"
            >
              + Kategori Baru
            </button>
            {showNewCat && (
              <div className="mt-2 flex gap-2">
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="Nama kategori"
                  className="flex-1 rounded-md bg-surface-2 px-3 py-2"
                />
                <TouchButton variant="accent" onClick={addCategory}>
                  Tambah
                </TouchButton>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium text-brand-ink/60">Satuan</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "pcs" | "kg" | "service")}
              className="w-full rounded-md bg-surface-2 px-3 py-2"
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="service">service</option>
            </select>
          </div>
        </div>
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isService}
            onChange={(e) => setIsService(e.target.checked)}
          />
          Jasa (laundry)
        </label>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          Pin (tampil di atas)
        </label>
        <div className="flex gap-2">
          <TouchButton variant="ghost" className="flex-1" onClick={onClose}>
            Batal
          </TouchButton>
          <TouchButton variant="accent" className="flex-1" onClick={save}>
            Simpan
          </TouchButton>
        </div>
      </div>
    </div>
  );
}
