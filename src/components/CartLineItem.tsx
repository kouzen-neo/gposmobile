import { formatRupiah } from "@/lib/format";
import { type OrderLine, lineTotal } from "@/lib/store";
import { Plus, Minus, Trash2 } from "lucide-react";

interface Props {
  line: OrderLine;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
}

export function CartLineItem({
  line: l,
  onInc,
  onDec,
  onRemove,
  onNoteChange,
}: Props) {
  return (
    <div className="elevate rounded-lg bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{l.name}</span>
        <span className="tabular text-sm font-bold text-brand">
          {formatRupiah(lineTotal(l))}
        </span>
      </div>
      <input
        value={l.note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Catatan (tanpa gula, parfum…)"
        className="mt-2 w-full rounded-md bg-surface px-2 py-1 text-xs outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onDec}
            aria-label="Kurang"
            className="press elevate flex h-9 w-9 items-center justify-center rounded-md bg-surface"
          >
            <Minus size={18} />
          </button>
          <span className="tabular w-10 text-center text-base font-bold">
            {l.qty}
          </span>
          <button
            onClick={onInc}
            aria-label="Tambah"
            className="press elevate flex h-9 w-9 items-center justify-center rounded-md bg-surface"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={onRemove}
            aria-label="Hapus"
            className="press ml-1 p-1 text-error"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <span className="tabular text-xs text-brand-ink/60">
          {l.qty} {l.unit} × {formatRupiah(l.unitPrice)}
        </span>
      </div>
    </div>
  );
}
