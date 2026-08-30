

import { useState } from "react";
import { TouchButton } from "@/components/TouchButton";
import { formatRupiah } from "@/lib/format";
import { X, Clock, Banknote } from "lucide-react";

interface Props {
  isOpen: boolean;
  shiftOpen: boolean;
  shiftFloat: number;
  onOpenShift: (float: number) => void;
  onCloseShift: () => void;
  onClose: () => void;
}

export function ShiftModal({
  isOpen,
  shiftOpen,
  shiftFloat,
  onOpenShift,
  onCloseShift,
  onClose,
}: Props) {
  const [floatStr, setFloatStr] = useState("100000");

  if (!isOpen) return null;

  const floatNum = Number(floatStr.replace(/\D/g, "")) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-brand" />
            <h2 className="font-display text-lg font-bold">
              {shiftOpen ? "Tutup Shift Kasir" : "Buka Shift Kasir"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="press p-1 text-brand-ink/60 hover:text-brand-ink"
          >
            <X size={20} />
          </button>
        </div>

        {shiftOpen ? (
          <div className="space-y-4">
            <div className="rounded-md bg-surface-2 p-3 text-xs">
              <p className="text-brand-ink/60">Status Shift:</p>
              <p className="font-bold text-ok text-sm mt-0.5">Shift Aktif (Buka)</p>
              <p className="mt-2 text-brand-ink/60">Modal Awal Kasir:</p>
              <p className="tabular font-bold text-brand text-sm mt-0.5">
                {formatRupiah(shiftFloat)}
              </p>
            </div>
            <p className="text-xs text-brand-ink/70">
              Menutup shift akan mengakhiri sesi kasir saat ini.
            </p>
            <div className="flex gap-2">
              <TouchButton variant="ghost" className="flex-1" onClick={onClose}>
                Batal
              </TouchButton>
              <TouchButton
                variant="accent"
                className="flex-1"
                onClick={() => {
                  onCloseShift();
                  onClose();
                }}
              >
                Tutup Shift
              </TouchButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-ink/60">
                Modal Awal (Kas di Laci / Float)
              </label>
              <input
                inputMode="numeric"
                value={floatStr}
                onChange={(e) => setFloatStr(e.target.value)}
                placeholder="0"
                className="tabular w-full rounded-md bg-surface-2 px-3 py-2 text-base font-bold outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[50000, 100000, 200000, 500000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => setFloatStr(String(nominal))}
                    className="press rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-brand-ink/80 hover:bg-border"
                  >
                    {formatRupiah(nominal)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <TouchButton variant="ghost" className="flex-1" onClick={onClose}>
                Batal
              </TouchButton>
              <TouchButton
                variant="accent"
                className="flex-1"
                onClick={() => {
                  onOpenShift(floatNum);
                  onClose();
                }}
              >
                <Banknote size={16} /> Buka Shift
              </TouchButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
