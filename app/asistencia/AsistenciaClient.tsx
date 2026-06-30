"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, BarChart3, MapPin, Check } from "lucide-react";

type Reg = { estado: string; horaLlegada: string; horaSalida: string; comidaInicio: string; comidaFin: string; ipLlegada: string; ipSalida: string; origen: string; verificado: boolean };

function difMin(a: string, b: string): number | null {
  if (!a || !b) return null;
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return (bh * 60 + bm) - (ah * 60 + am);
}
type Emp = { id: number; nombre: string; area: string; horaEntrada: string; registro: Reg | null };

const ESTADOS = [
  { val: "a_tiempo", label: "A tiempo", color: "#059669", bg: "#ecfdf5" },
  { val: "retardo", label: "Retardo", color: "#d97706", bg: "#fffbeb" },
  { val: "falta", label: "Falta", color: "#dc2626", bg: "#fef2f2" },
  { val: "justificado", label: "Justificado", color: "#2563eb", bg: "#eff6ff" },
];

export default function AsistenciaClient({ dia, hoy, ipOficina, minutosComida, empleados }: { dia: string; hoy: string; ipOficina: string; minutosComida: number; empleados: Emp[] }) {
  const router = useRouter();
  const [ipOf, setIpOf] = useState(ipOficina);
  const [minCom, setMinCom] = useState(String(minutosComida));
  const [ipMsg, setIpMsg] = useState("");

  async function guardarConfig() {
    await fetch("/api/config-ip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipOficina: ipOf, minutosComida: Number(minCom) || 0 }) });
    setIpMsg("Guardado"); setTimeout(() => setIpMsg(""), 2000);
  }
  const vacio: Reg = { estado: "", horaLlegada: "", horaSalida: "", comidaInicio: "", comidaFin: "", ipLlegada: "", ipSalida: "", origen: "admin", verificado: false };
  const [rows, setRows] = useState<Record<number, Reg>>(() => {
    const o: Record<number, Reg> = {};
    empleados.forEach((e) => { o[e.id] = e.registro ?? { ...vacio }; });
    return o;
  });
  const [guardando, setGuardando] = useState<number | null>(null);

  async function guardar(empId: number, patch: Partial<Reg>) {
    const nuevo = { ...rows[empId], ...patch, verificado: true }; // RH actúa = verificado
    if (!nuevo.estado) nuevo.estado = "a_tiempo";
    setRows((s) => ({ ...s, [empId]: nuevo }));
    setGuardando(empId);
    await fetch("/api/asistencia", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empleadoId: empId, fecha: dia, ...nuevo }),
    });
    setGuardando(null);
  }

  const fechaLinda = new Date(`${dia}T00:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const marcados = empleados.filter((e) => rows[e.id]?.estado).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarCheck size={19} style={{ color: "#00b4d8" }} /> Asistencia
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{fechaLinda}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/asistencia/reporte" className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <BarChart3 size={13} /> Reporte y descargas
          </Link>
          <input
            type="date" value={dia} max={hoy}
            onChange={(e) => router.push(`/asistencia?fecha=${e.target.value}`)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">{marcados} de {empleados.length} empleados registrados este día. Marca el estado o deja que ellos chequen desde su cuenta.</p>

      {/* Configuración: IP de oficina + minutos de comida */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 flex-wrap">
        <MapPin size={14} className="text-gray-400" />
        <label className="flex items-center gap-1.5 text-xs text-gray-500">IP de oficina:
          <input value={ipOf} onChange={(e) => setIpOf(e.target.value)} placeholder="ej. 187.190.x.x" className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#00b4d8] w-36" />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500">Comida permitida (min):
          <input type="number" min={0} value={minCom} onChange={(e) => setMinCom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#00b4d8] w-16" />
        </label>
        <button onClick={guardarConfig} className="px-3 py-1 text-xs text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>Guardar</button>
        {ipMsg && <span className="text-xs text-emerald-600">{ipMsg}</span>}
      </div>

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          No hay empleados activos. Agrégalos en la sección Empleados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {empleados.map((e) => {
            const r = rows[e.id];
            return (
              <div key={e.id} className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{e.nombre}</p>
                    <p className="text-xs text-gray-400">{e.area || "—"} · entra {e.horaEntrada}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {ESTADOS.map((s) => {
                      const activo = r?.estado === s.val;
                      return (
                        <button key={s.val} onClick={() => guardar(e.id, { estado: s.val })} disabled={guardando === e.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                          style={activo ? { backgroundColor: s.color, color: "#fff", borderColor: s.color } : { backgroundColor: s.bg, color: s.color, borderColor: "transparent" }}>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {r?.estado && r.estado !== "falta" && (
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <label className="flex items-center gap-1.5">Llegó:
                        <input type="time" value={r.horaLlegada} onChange={(ev) => guardar(e.id, { horaLlegada: ev.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]" />
                      </label>
                      <label className="flex items-center gap-1.5">Salió:
                        <input type="time" value={r.horaSalida} onChange={(ev) => guardar(e.id, { horaSalida: ev.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]" />
                      </label>
                      {r.origen === "empleado" && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#e6f8fc", color: "#0a7d99" }}>auto-registro</span>}
                      {r.verificado
                        ? <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#ecfdf5", color: "#059669" }}><Check size={10} /> Verificado por RH</span>
                        : (
                          <>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>Por verificar</span>
                            <button onClick={() => guardar(e.id, {})} disabled={guardando === e.id} className="text-[11px] px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: "#059669" }}>✓ Verificar</button>
                          </>
                        )}
                    </div>
                    {(r.comidaInicio || r.comidaFin) && (() => {
                      const dur = difMin(r.comidaInicio, r.comidaFin);
                      const excedida = dur !== null && dur > minutosComida;
                      return (
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span>🍽️ Comida: {r.comidaInicio || "—"} → {r.comidaFin || "—"}</span>
                          {dur !== null && (
                            <span className="font-medium" style={{ color: excedida ? "#dc2626" : "#059669" }}>
                              {dur} min{excedida ? ` · se pasó ${dur - minutosComida}` : ""}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {(r.ipLlegada || r.ipSalida) && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <MapPin size={11} />
                        <span>IP: {r.ipLlegada || r.ipSalida}</span>
                        {ipOf && (r.ipLlegada || r.ipSalida) === ipOf
                          ? <span className="flex items-center gap-0.5" style={{ color: "#059669" }}><Check size={10} /> en oficina</span>
                          : ipOf ? <span style={{ color: "#d97706" }}>fuera de oficina</span> : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
