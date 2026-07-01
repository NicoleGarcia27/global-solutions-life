"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock } from "lucide-react";

type P = { id: number; empleado: string; area: string; fechaInicio: string; fechaFin: string; dias: number; nota: string; disponibles: number };
const fmt = (s: string) => new Date(`${s}T00:00:00.000Z`).toLocaleDateString("es-MX", { day: "numeric", month: "long", timeZone: "UTC" });

export default function SolicitudesPendientes({ solicitudes }: { solicitudes: P[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function decidir(id: number, estado: "aprobada" | "rechazada") {
    setBusy(id);
    const r = await fetch(`/api/vacaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setBusy(null);
    if (r.ok) router.refresh();
  }

  if (solicitudes.length === 0) return null;

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
      <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#b45309" }}>
        <Clock size={16} /> Solicitudes por aprobar ({solicitudes.length})
      </p>
      <div className="space-y-2">
        {solicitudes.map((s) => (
          <div key={s.id} className="bg-white rounded-lg border border-amber-100 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{s.empleado} <span className="text-gray-400 font-normal">· {s.area || "—"}</span></p>
              <p className="text-xs text-gray-500">
                {fmt(s.fechaInicio)} — {fmt(s.fechaFin)} · {s.dias} {s.dias === 1 ? "día" : "días"} · disponibles: {s.disponibles}
                {s.nota ? ` · ${s.nota}` : ""}
              </p>
            </div>
            <button onClick={() => decidir(s.id, "aprobada")} disabled={busy === s.id}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg disabled:opacity-40" style={{ backgroundColor: "#059669" }}>
              <Check size={13} /> Aprobar
            </button>
            <button onClick={() => decidir(s.id, "rechazada")} disabled={busy === s.id}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <X size={13} /> Rechazar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
