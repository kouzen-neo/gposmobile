import { TouchButton } from "@/components/TouchButton";
import { AlertTriangle } from "lucide-react";

interface Props {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ itemName, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 text-error mb-2">
          <AlertTriangle size={20} className="shrink-0" />
          <h3 className="font-display text-base font-bold">Hapus Produk?</h3>
        </div>
        <p className="text-xs text-brand-ink/70 leading-relaxed mb-4">
          Apakah Anda yakin ingin menghapus <strong className="text-brand-ink">&ldquo;{itemName}&rdquo;</strong>? Produk ini akan dihapus dari katalog dan tidak akan muncul lagi di layar kasir.
        </p>
        <div className="flex gap-2">
          <TouchButton variant="ghost" className="flex-1 text-xs" onClick={onCancel}>
            Batal
          </TouchButton>
          <TouchButton
            variant="accent"
            className="flex-1 text-xs bg-error text-surface hover:opacity-90"
            onClick={onConfirm}
          >
            Hapus Produk
          </TouchButton>
        </div>
      </div>
    </div>
  );
}
