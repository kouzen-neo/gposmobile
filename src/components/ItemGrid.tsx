import type { ItemDTO } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/store";

interface Props {
  items: ItemDTO[];
  onPick: (item: ItemDTO) => void;
}

// Responsive grid: 2 (sm) → 3 (md) → 4 (lg) → 5 (xl) columns.
// Borderless cards: bg-shift + soft elevation, not gray borders (DESIGN.md).
export function ItemGrid({ items, onPick }: Props) {
  const lines = useCart((s) => s.lines);

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const qty = lines.find((l) => l.itemId === item.id)?.qty ?? 0;
        return (
          <button
            key={item.id}
            onClick={() => onPick(item)}
            className="press elevate relative flex min-h-[76px] flex-col justify-between rounded-lg bg-surface-2 p-2.5 text-left hover:bg-surface"
          >
            {qty > 0 && (
              <span className="tabular absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-surface">
                {qty}
              </span>
            )}
            <span className="pr-5 text-xs font-semibold leading-snug sm:text-sm text-brand-ink">
              {item.name}
            </span>
            <span className="tabular mt-1.5 text-xs font-bold text-brand sm:text-sm">
              {formatRupiah(item.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
