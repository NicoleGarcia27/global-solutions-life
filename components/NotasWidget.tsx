"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StickyNote, Plus, X } from "lucide-react";

type Nota = { id: number; texto: string; color: string };

const COLORES: Record<string, { bg: string; border: string; text: string }> = {
  amarillo: { bg: "#fef9c3", border: "#fde68a", text: "#854d0e" },
  azul: { bg: "#e0f2fe", border: "#bae6fd", text: "#075985" },
  verde: { bg: "#dcfce7", border: "#bbf7d0", text: "#166534" },
  rosa: { bg: "#fce7f3", border: "#fbcfe8", text: "#9d174d" },
};

export default function NotasWidget({ notas }: { notas: Nota[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [color, setColor] = useState("amarillo");
  const [busy, setBusy] = useState(false);

  async function agregar() {
    if (!texto.trim()) return;
    setBusy(true);
    await fetch("/api/notas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto, color }) });
    setTexto(""); setBusy(false); router.refresh();
  }
  async function eliminar(id: number) {
    await fetch(`/api/notas/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-base font-semibold flex items-center gap-2 mb-3" style={{ color: "#1a3a6b" }}>
        <StickyNote size={18} style={{ color: "#d97706" }} /> Notas rápidas
      </h2>

      {/* Agregar */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="flex gap-1.5 shrink-0">
          {Object.entries(COLORES).map(([k, c]) => (
            <button key={k} onClick={() => setColor(k)} aria-label={k} className="w-5 h-5 rounded-full border-2 transition" style={{ backgroundColor: c.bg, borderColor: color === k ? c.text : "transparent" }} />
          ))}
        </div>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") agregar(); }}
          placeholder="Escribe una nota…"
          className="flex-1 min-w-[150px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
        />
        <button onClick={agregar} disabled={busy || !texto.trim()} className="flex items-center gap-1.5 px-3 py-2 text-xs text-white rounded-lg disabled:opacity-50 shrink-0" style={{ backgroundColor: "#1a3a6b" }}>
          <Plus size={13} /> Anotar
        </button>
      </div>

      {/* Notas */}
      {notas.length === 0 ? (
        <p className="text-sm text-gray-400">Aún no hay notas. Anota algo rápido y se queda fijo aquí.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {notas.map((n) => {
            const c = COLORES[n.color] ?? COLORES.amarillo;
            return (
              <div key={n.id} className="relative rounded-lg p-3 text-sm w-44 group" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                <button onClick={() => eliminar(n.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 rounded-full p-0.5 hover:bg-black/10" aria-label="Eliminar nota">
                  <X size={13} />
                </button>
                <p className="whitespace-pre-wrap break-words pr-3 leading-snug">{n.texto}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
