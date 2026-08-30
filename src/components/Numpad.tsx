import { CornerUpLeft } from "lucide-react";
import { TouchButton } from "./TouchButton";

interface Props {
  onDigit: (d: string) => void;
  onClear: () => void;
  onBack: () => void;
}

// On-screen numeric keypad for touch devices (DESIGN.md: big targets, not phone keyboard).
export function Numpad({ onDigit, onClear, onBack }: Props) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "."];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <TouchButton key={k} variant="outline" onClick={() => onDigit(k)}>
          {k}
        </TouchButton>
      ))}
      <TouchButton variant="ghost" onClick={onBack} aria-label="Hapus satu">
        <CornerUpLeft size={18} />
      </TouchButton>
      <TouchButton variant="ghost" onClick={onClear} aria-label="Bersihkan">
        C
      </TouchButton>
    </div>
  );
}
