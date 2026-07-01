"use client";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex items-center justify-center h-full p-10">
      <div className="text-center max-w-sm">
        <p className="text-gray-800 font-semibold">Algo no cargó bien</p>
        <p className="text-sm text-gray-500 mt-1">Vuelve a intentarlo. Si el problema sigue, cierra sesión y vuelve a entrar.</p>
        <button onClick={reset} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    </div>
  );
}
