import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useOfflineQueue } from "@/lib/store";
import { api } from "@/lib/api";
import { CloudUpload, WifiOff } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { queue, dequeue } = useOfflineQueue();
  const [syncing, setSyncing] = useState(false);

  const sync = async () => {
    if (queue.length === 0 || syncing) return;
    setSyncing(true);
    for (const item of [...queue]) {
      try {
        await api.createOrder(item.lines, item.payment, item.note);
        dequeue(item.id);
      } catch {
        break;
      }
    }
    setSyncing(false);
  };

  useEffect(() => {
    const onOnline = () => sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-1 min-w-0 overflow-x-hidden flex-col pt-10 pb-24 lg:pt-0 lg:pb-0">
        {queue.length > 0 && (
          <div className="flex items-center justify-between bg-surface-2 px-4 py-2 text-xs text-brand-ink border-b border-border">
            <div className="flex items-center gap-2">
              <WifiOff size={14} className="text-warn shrink-0" />
              <span>
                <strong>{queue.length}</strong> transaksi offline tersimpan di perangkat.
              </span>
            </div>
            <button
              onClick={sync}
              disabled={syncing}
              className="press flex items-center gap-1 font-semibold text-brand hover:underline disabled:opacity-50"
            >
              <CloudUpload size={14} />
              {syncing ? "Menyinkronkan…" : "Sinkronkan Sekarang"}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
