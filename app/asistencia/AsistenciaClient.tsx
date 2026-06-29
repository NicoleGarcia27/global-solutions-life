"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, BarChart3, MapPin, Check } from "lucide-react";

type Reg = { estado: string; horaLlegada: string; horaSalida: string; ipLlegada: string; ipSalida: string; origen: string };
type Emp = { id: number; nombre: string; area: string; horaEntrada: string; registro: Reg | null };

const ESTADOS = [
  { val: "a_tiempo", label: "A tiempo", color: "#059669", bg: "#ecfdf5" },
  { val: "retardo", label: "Retardo", color: "#d97706", bg: "#fffbeb" },
  { val: "falta", label: "Falta", color: "#dc2626", bg: "#fef2f2" },
  { val: "justificado", label: "Justificado", color: "#2563eb", bg: "#eff6ff" },
];

export default function AsistenciaClient({ dia, hoy, ipOficina, empleados }: { dia: string; hoy: string; ipOficina: string; empleados: Emp[] }) {
  const router = useRouter();
  const [ipOf, setIpOf] = useState(ipOficina);
  const [ipMsg, setIpMsg] = useState("");

  async function guardarIp() {
    await fetch("/api/config-ip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ipOficina: ipOf }) });
    setIpMsg("Guardada"); setTimeout(() => setIpMsg(""), 2000);
  }
  const [rows, setRows] = useState<Record<number, Reg>>(() => {
    const o: Record<number, Reg> = {};
    empleados.forEach((e) => { o[e.id] = e.registro ?? { estado: "", horaLlegada: "", horaSalida: "" }; });
    return o;
  });
  const [guardando, setGuardando] = useState<number | null>(null);

  async function guardar(empId: number, patch: Partial<Reg>) {
    const nuevo = { ...rows[empId], ...patch };
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

      {/* IP de oficina */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2 flex-wrap">
        <MapPin size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">IP de la oficina (para verificar checadas):</span>
        <input value={ipOf} onChange={(e) => setIpOf(e.target.value)} placeholder="ej. 187.190.x.x" className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#00b4d8] w-40" />
        <button onClick={guardarIp} className="px-3 py-1 text-xs text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>Guardar</button>
        {ipMsg && <span className="text-xs text-emerald-600">{ipMsg}</span>}
        <span className="text-[11px] text-gray-400">Pídele a un empleado que cheque en la oficina y copia aquí la IP que aparezca.</span>
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
                    </div>
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
