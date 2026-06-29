"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";

type Emp = { id: number; nombre: string; area: string; horaEntrada: string; registro: { estado: string; horaLlegada: string } | null };

const ESTADOS = [
  { val: "a_tiempo", label: "A tiempo", color: "#059669", bg: "#ecfdf5" },
  { val: "retardo", label: "Retardo", color: "#d97706", bg: "#fffbeb" },
  { val: "falta", label: "Falta", color: "#dc2626", bg: "#fef2f2" },
  { val: "justificado", label: "Justificado", color: "#2563eb", bg: "#eff6ff" },
];

export default function AsistenciaClient({ dia, hoy, empleados }: { dia: string; hoy: string; empleados: Emp[] }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Record<number, string>>(() => {
    const o: Record<number, string> = {};
    empleados.forEach((e) => { if (e.registro) o[e.id] = e.registro.estado; });
    return o;
  });
  const [guardando, setGuardando] = useState<number | null>(null);

  async function marcar(empId: number, val: string) {
    setEstado((s) => ({ ...s, [empId]: val }));
    setGuardando(empId);
    await fetch("/api/asistencia", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: empId, fecha: dia, estado: val }),
    });
    setGuardando(null);
  }

  const fechaLinda = new Date(`${dia}T00:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const marcados = empleados.filter((e) => estado[e.id]).length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarCheck size={19} style={{ color: "#00b4d8" }} /> Asistencia
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{fechaLinda}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date" value={dia} max={hoy}
            onChange={(e) => router.push(`/asistencia?fecha=${e.target.value}`)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">{marcados} de {empleados.length} empleados registrados este día. Toca un estado para guardar.</p>

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          No hay empleados activos. Agrégalos en la sección Empleados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {empleados.map((e) => (
            <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{e.nombre}</p>
                <p className="text-xs text-gray-400">{e.area || "—"} · entra {e.horaEntrada}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ESTADOS.map((s) => {
                  const activo = estado[e.id] === s.val;
                  return (
                    <button
                      key={s.val}
                      onClick={() => marcar(e.id, s.val)}
                      disabled={guardando === e.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                      style={activo
                        ? { backgroundColor: s.color, color: "#fff", borderColor: s.color }
                        : { backgroundColor: s.bg, color: s.color, borderColor: "transparent" }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
