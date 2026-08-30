import type { ItemDTO, CategoryDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Pencil, Trash2, Pin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortKey = "name" | "category" | "unit" | "price" | "pinned";
export type SortOrder = "asc" | "desc";

interface Props {
  items: ItemDTO[];
  cats: CategoryDTO[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  onEdit: (item: ItemDTO) => void;
  onTogglePin: (item: ItemDTO) => void;
  onRequestDelete: (item: ItemDTO) => void;
}

export function ItemCatalogTable({
  items,
  cats,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onTogglePin,
  onRequestDelete,
}: Props) {
  const renderSortHeader = (key: SortKey, label: string) => {
    const active = sortKey === key;
    return (
      <th className="py-2.5 pr-4">
        <button
          type="button"
          onClick={() => onSort(key)}
          className="press inline-flex items-center gap-1.5 font-semibold text-brand-ink/70 hover:text-brand"
        >
          <span>{label}</span>
          {active ? (
            sortOrder === "asc" ? (
              <ArrowUp size={14} className="text-brand" />
            ) : (
              <ArrowDown size={14} className="text-brand" />
            )
          ) : (
            <ArrowUpDown size={14} className="opacity-30 hover:opacity-80" />
          )}
        </button>
      </th>
    );
  };

  return (
    <div className="elevate overflow-hidden rounded-lg bg-surface-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/80 text-xs text-brand-ink/60">
            <tr>
              <th className="py-2.5 pl-4 pr-2 w-10 text-center">Pin</th>
              {renderSortHeader("name", "Nama")}
              {renderSortHeader("category", "Kategori")}
              {renderSortHeader("unit", "Satuan")}
              {renderSortHeader("price", "Harga")}
              <th className="py-2.5 pr-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-brand-ink/40">
                  Tidak ada item yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              items.map((i, idx) => {
                const cat = cats.find((c) => c.id === i.category_id);
                return (
                  <tr
                    key={i.id}
                    className={
                      "hover:bg-surface " +
                      (idx < items.length - 1 ? "border-b border-border/50" : "")
                    }
                  >
                    <td className="py-2.5 pl-4 pr-2 text-center">
                      <button
                        type="button"
                        aria-label={i.pinned ? "Lepas pin" : "Pin item terlaris"}
                        title={i.pinned ? "Lepas pin produk" : "Pin produk ke baris terdepan kasir"}
                        onClick={() => onTogglePin(i)}
                        className={
                          "press p-1.5 rounded-md " +
                          (i.pinned
                            ? "bg-accent/15 text-accent"
                            : "text-brand-ink/30 hover:text-accent hover:bg-surface-2")
                        }
                      >
                        <Pin size={15} className={i.pinned ? "fill-accent" : ""} />
                      </button>
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-brand-ink">
                      <div className="flex items-center gap-2">
                        <span>{i.name}</span>
                        {i.is_service && (
                          <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                            Jasa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink/80">{cat?.name ?? i.category_id}</td>
                    <td className="py-2.5 pr-4 uppercase text-xs text-brand-ink/60 font-mono">
                      {i.unit}
                    </td>
                    <td className="tabular py-2.5 pr-4 font-semibold text-brand">
                      {formatRupiah(i.price)}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Edit item"
                          title="Edit produk"
                          className="press p-1.5 text-brand-ink/50 hover:text-brand"
                          onClick={() => onEdit(i)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus item"
                          title="Hapus produk"
                          className="press p-1.5 text-brand-ink/50 hover:text-error"
                          onClick={() => onRequestDelete(i)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
