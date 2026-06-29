"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, X, TrendingUp, Trash2, Plus, Palmtree, Scale, CalendarClock, CalendarCheck } from "lucide-react";
import { vacacionesPorLey, ventanaVacaciones } from "@/lib/vacaciones";

type Empleado = {
  id: number; nombre: string; puesto: string; area: string; tipo: string; factura: boolean;
  sueldoActual: number; correo: string; telefono: string; notas: string; activo: boolean; fechaIngreso: string;
  diasVacaciones: number; diasExtra: number; horaEntrada: string;
};
type AsistenciaMes = { a_tiempo: number; retardo: number; falta: number; justificado: number };
type Incremento = { id: number; fecha: string; sueldoNuevo: number; porcentaje: number; nota: string };
type Vacacion = { id: number; fechaInicio: string; fechaFin: string; dias: number; estado: string; nota: string };

const money = (n: number) => "$" + (n || 0).toLocaleString("es-MX");
const TIPOS: Record<string, { label: string; cls: string }> = {
  empleado: { label: "Empleado GSL", cls: "bg-blue-100 text-blue-700" },
  proveedor: { label: "Factura a GSL", cls: "bg-purple-100 text-purple-700" },
  sky: { label: "Factura a SKY SEGUROS", cls: "bg-amber-100 text-amber-700" },
};
function antiguedad(fecha: string) {
  if (!fecha) return "—";
  const meses = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const a = Math.floor(meses / 12), m = meses % 12;
  if (a === 0) return `${m} ${m === 1 ? "mes" : "meses"}`;
  return `${a} ${a === 1 ? "año" : "años"}${m ? ` ${m} m` : ""}`;
}
const fmtFecha = (iso: string) => iso ? new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function EmpleadoDetalle({ empleado, incrementos, vacaciones, asistenciaMes, departamentos }: { empleado: Empleado; incrementos: Incremento[]; vacaciones: Vacacion[]; asistenciaMes: AsistenciaMes; departamentos: string[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(empleado);
  const [incOpen, setIncOpen] = useState(false);
  const [inc, setInc] = useState({ sueldoNuevo: "", fecha: new Date().toISOString().slice(0, 10), nota: "" });
  const [vacOpen, setVacOpen] = useState(false);
  const [vac, setVac] = useState({ fechaInicio: "", fechaFin: "", dias: "", nota: "", estado: "aprobada" });

  const anioActual = new Date().getFullYear();
  const tomados = vacaciones.filter((v) => new Date(v.fechaInicio).getFullYear() === anioActual).reduce((s, v) => s + v.dias, 0);
  const ley = vacacionesPorLey(empleado.fechaIngreso);
  const corresponden = ley.dias + (empleado.diasExtra || 0);
  const disponibles = corresponden - tomados;
  const ventana = ventanaVacaciones(empleado.fechaIngreso);
  const fmtMes = (d: Date | null) => d ? d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "";
  const totalAsis = asistenciaMes.a_tiempo + asistenciaMes.retardo + asistenciaMes.falta + asistenciaMes.justificado;
  const pctPuntual = totalAsis ? Math.round((asistenciaMes.a_tiempo / totalAsis) * 100) : null;
  const mesNombre = new Date().toLocaleDateString("es-MX", { month: "long" });

  async function registrarVacacion() {
    if (!vac.fechaInicio || !vac.fechaFin) return;
    setBusy(true);
    await fetch(`/api/empleados/${empleado.id}/vacacion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vac) });
    setBusy(false); setVacOpen(false); setVac({ fechaInicio: "", fechaFin: "", dias: "", nota: "", estado: "aprobada" }); router.refresh();
  }
  async function eliminarVacacion(vid: number) {
    if (!confirm("¿Eliminar este periodo de vacaciones?")) return;
    await fetch(`/api/vacaciones/${vid}`, { method: "DELETE" });
    router.refresh();
  }

  function set(k: string, v: string | boolean) { setF((p) => ({ ...p, [k]: v })); }

  async function guardar() {
    setBusy(true);
    await fetch(`/api/empleados/${empleado.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false); setEdit(false); router.refresh();
  }
  async function eliminar() {
    if (!confirm("¿Eliminar este empleado y todo su historial? No se puede deshacer.")) return;
    await fetch(`/api/empleados/${empleado.id}`, { method: "DELETE" });
    router.push("/empleados");
  }
  async function registrarIncremento() {
    if (!inc.sueldoNuevo) return;
    setBusy(true);
    await fetch(`/api/empleados/${empleado.id}/incremento`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inc) });
    setBusy(false); setIncOpen(false); setInc({ sueldoNuevo: "", fecha: new Date().toISOString().slice(0, 10), nota: "" }); router.refresh();
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00b4d8]";
  const Dato = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm mt-0.5" style={{ color: ok ? "#3b6d11" : "#1f2937" }}>{value}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/empleados" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={18} /></Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: "#e6f8fc", color: "#0a7d99" }}>
            {empleado.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{empleado.nombre}</h1>
            <p className="text-sm text-gray-400">{[empleado.puesto, empleado.area].filter(Boolean).join(" · ") || "Sin puesto"}</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${(TIPOS[empleado.tipo] ?? TIPOS.empleado).cls}`}>
          {(TIPOS[empleado.tipo] ?? TIPOS.empleado).label}
        </span>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Datos laborales</h2>
          {!edit && <button onClick={() => { setF(empleado); setEdit(true); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#00b4d8]"><Pencil size={13} /> Editar</button>}
        </div>

        {edit ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Nombre</label><input className={`mt-1 ${inp}`} value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500">Puesto</label><input className={`mt-1 ${inp}`} value={f.puesto} onChange={(e) => set("puesto", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500">Área</label>
                <select className={`mt-1 ${inp}`} value={f.area} onChange={(e) => set("area", e.target.value)}><option value="">—</option>{departamentos.map((d) => <option key={d}>{d}</option>)}</select>
              </div>
              <div><label className="text-xs text-gray-500">Tipo</label>
                <select className={`mt-1 ${inp}`} value={f.tipo} onChange={(e) => set("tipo", e.target.value)}><option value="empleado">Empleado de GSL</option><option value="proveedor">Factura a GSL</option><option value="sky">Factura a SKY SEGUROS</option></select>
              </div>
              <div><label className="text-xs text-gray-500">Fecha de ingreso</label><input type="date" className={`mt-1 ${inp}`} value={f.fechaIngreso} onChange={(e) => set("fechaIngreso", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500">Sueldo actual</label><input type="number" className={`mt-1 ${inp}`} value={f.sueldoActual} onChange={(e) => set("sueldoActual", e.target.value as any)} /></div>
              <div><label className="text-xs text-gray-500">Correo</label><input className={`mt-1 ${inp}`} value={f.correo} onChange={(e) => set("correo", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500">Teléfono</label><input className={`mt-1 ${inp}`} value={f.telefono} onChange={(e) => set("telefono", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500">Días extra de cortesía 🎁</label><input type="number" min={0} className={`mt-1 ${inp}`} value={f.diasExtra} onChange={(e) => set("diasExtra", e.target.value as any)} placeholder="0" /></div>
              <div><label className="text-xs text-gray-500">Hora de entrada</label><input type="time" className={`mt-1 ${inp}`} value={f.horaEntrada} onChange={(e) => set("horaEntrada", e.target.value)} /></div>
            </div>
            <p className="text-xs text-gray-400">Los días de ley se calculan solos por la fecha de ingreso (Art. 76 LFT). Los "días extra" son los que tú le regalas por buena onda.</p>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={f.factura} onChange={(e) => set("factura", e.target.checked)} className="w-4 h-4" /> ¿Emite factura?</label>
            <div><label className="text-xs text-gray-500">Notas</label><textarea rows={2} className={`mt-1 ${inp} resize-none`} value={f.notas} onChange={(e) => set("notas", e.target.value)} /></div>
            <div className="flex gap-2">
              <button onClick={guardar} disabled={busy} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}><Check size={13} /> Guardar</button>
              <button onClick={() => setEdit(false)} className="flex items-center gap-1.5 px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg"><X size={13} /> Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <Dato label="Fecha de ingreso" value={fmtFecha(empleado.fechaIngreso)} />
            <Dato label="Antigüedad" value={antiguedad(empleado.fechaIngreso)} />
            <Dato label="Sueldo actual" value={empleado.sueldoActual ? money(empleado.sueldoActual) : "—"} />
            <Dato label="¿Factura?" value={empleado.factura ? "Sí, emite factura" : "No · nómina"} />
            <Dato label="Correo" value={empleado.correo || "—"} />
            <Dato label="Teléfono" value={empleado.telefono || "—"} />
            {empleado.notas && <div className="col-span-3 bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Notas</p><p className="text-sm mt-0.5 text-gray-700 whitespace-pre-wrap">{empleado.notas}</p></div>}
          </div>
        )}
      </div>

      {/* Historial de sueldo */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><TrendingUp size={15} style={{ color: "#00b4d8" }} /> Historial de sueldo e incrementos</h2>
          {!incOpen && <button onClick={() => setIncOpen(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1a3a6b" }}><Plus size={13} /> Registrar incremento</button>}
        </div>

        {incOpen && (
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Nuevo sueldo</label><input type="number" className={`mt-1 ${inp} bg-white`} value={inc.sueldoNuevo} onChange={(e) => setInc({ ...inc, sueldoNuevo: e.target.value })} placeholder="20000" autoFocus /></div>
              <div><label className="text-xs text-gray-500">Fecha</label><input type="date" className={`mt-1 ${inp} bg-white`} value={inc.fecha} onChange={(e) => setInc({ ...inc, fecha: e.target.value })} /></div>
            </div>
            <div><label className="text-xs text-gray-500">Nota (opcional)</label><input className={`mt-1 ${inp} bg-white`} value={inc.nota} onChange={(e) => setInc({ ...inc, nota: e.target.value })} placeholder="ej. Ajuste anual, promoción..." /></div>
            <div className="flex gap-2">
              <button onClick={registrarIncremento} disabled={busy || !inc.sueldoNuevo} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: "#1a3a6b" }}><Check size={13} /> Guardar incremento</button>
              <button onClick={() => setIncOpen(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg">Cancelar</button>
            </div>
          </div>
        )}

        {incrementos.length === 0 ? (
          <p className="text-sm text-gray-400">Sin incrementos registrados. El sueldo actual es {empleado.sueldoActual ? money(empleado.sueldoActual) : "—"}.</p>
        ) : (
          <div className="space-y-2">
            {incrementos.map((i) => (
              <div key={i.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{money(i.sueldoNuevo)}</p>
                  {i.nota && <p className="text-xs text-gray-400">{i.nota}</p>}
                </div>
                <div className="text-right">
                  {i.porcentaje > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ecfdf5", color: "#3b6d11" }}>+{i.porcentaje}%</span>}
                  <p className="text-xs text-gray-400 mt-0.5">{fmtFecha(i.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vacaciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Palmtree size={15} style={{ color: "#00b4d8" }} /> Vacaciones {anioActual}</h2>
          {!vacOpen && <button onClick={() => setVacOpen(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1a3a6b" }}><Plus size={13} /> Registrar vacaciones</button>}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-800">{corresponden}</p><p className="text-xs text-gray-400">le corresponden</p></div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#fffbeb" }}><p className="text-2xl font-bold" style={{ color: "#d97706" }}>{tomados}</p><p className="text-xs" style={{ color: "#d97706" }}>tomados</p></div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: disponibles < 0 ? "#fef2f2" : "#ecfdf5" }}><p className="text-2xl font-bold" style={{ color: disponibles < 0 ? "#dc2626" : "#059669" }}>{disponibles}</p><p className="text-xs" style={{ color: disponibles < 0 ? "#dc2626" : "#059669" }}>disponibles</p></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#eef2f8", color: "#1a3a6b" }}>
            <Scale size={13} className="mt-0.5 shrink-0" />
            {!ley.tieneFecha
              ? <span>Captura la <strong>fecha de ingreso</strong> (en Editar) para calcular sus días según la ley.</span>
              : ley.anios < 1
                ? <span>Aún no cumple su primer año. Tendrá derecho a <strong>12 días</strong> al cumplir el <strong>{fmtMes(ley.cumplePrimerAnio)}</strong> (Art. 76 LFT).</span>
                : <span><strong>{ley.dias} días</strong> de ley por <strong>{ley.anios} {ley.anios === 1 ? "año" : "años"}</strong> de antigüedad{empleado.diasExtra > 0 && <> + <strong>{empleado.diasExtra}</strong> de cortesía = <strong>{corresponden} días</strong></>} (Art. 76 LFT).</span>}
          </div>
          {ventana && (
            <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "#fffbeb", color: "#92660a" }}>
              <CalendarClock size={13} className="mt-0.5 shrink-0" />
              {ventana.activadas
                ? <span>Vacaciones <strong>activas</strong> desde el {fmtMes(ventana.fecha)}. Por ley deben otorgarse antes del <strong>{fmtMes(ventana.limite)}</strong> (Art. 81 LFT).</span>
                : <span>Sus vacaciones <strong>se activan</strong> el <strong>{fmtMes(ventana.fecha)}</strong> y deben otorgarse antes del {fmtMes(ventana.limite)} (Art. 81 LFT).</span>}
            </div>
          )}
        </div>

        {vacOpen && (
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 mb-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Del</label><input type="date" className={`mt-1 ${inp} bg-white`} value={vac.fechaInicio} onChange={(e) => setVac({ ...vac, fechaInicio: e.target.value })} /></div>
              <div><label className="text-xs text-gray-500">Al</label><input type="date" className={`mt-1 ${inp} bg-white`} value={vac.fechaFin} onChange={(e) => setVac({ ...vac, fechaFin: e.target.value })} /></div>
              <div><label className="text-xs text-gray-500">Días que cuentan</label><input type="number" min={1} className={`mt-1 ${inp} bg-white`} value={vac.dias} onChange={(e) => setVac({ ...vac, dias: e.target.value })} placeholder="ej. 5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Tipo</label>
                <select className={`mt-1 ${inp} bg-white`} value={vac.estado} onChange={(e) => setVac({ ...vac, estado: e.target.value })}>
                  <option value="aprobada">Normal (de su periodo)</option>
                  <option value="adelantada">Adelantada / a cuenta 🎁</option>
                  <option value="solicitada">Solo solicitada (pendiente)</option>
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Nota (opcional)</label><input className={`mt-1 ${inp} bg-white`} value={vac.nota} onChange={(e) => setVac({ ...vac, nota: e.target.value })} placeholder="ej. Vacaciones de verano" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={registrarVacacion} disabled={busy || !vac.fechaInicio || !vac.fechaFin} className="flex items-center gap-1.5 px-4 py-2 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: "#1a3a6b" }}><Check size={13} /> Guardar</button>
              <button onClick={() => setVacOpen(false)} className="px-4 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg">Cancelar</button>
            </div>
          </div>
        )}

        {vacaciones.length === 0 ? (
          <p className="text-sm text-gray-400">Sin vacaciones registradas.</p>
        ) : (
          <div className="space-y-2">
            {vacaciones.map((v) => (
              <div key={v.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-sm text-gray-800 flex items-center gap-2">
                    {fmtFecha(v.fechaInicio)} — {fmtFecha(v.fechaFin)}
                    {v.estado === "adelantada" && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#fef3c7", color: "#92660a" }}>adelantada</span>}
                    {v.estado === "solicitada" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">solicitada</span>}
                  </p>
                  {v.nota && <p className="text-xs text-gray-400">{v.nota}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-600">{v.dias} {v.dias === 1 ? "día" : "días"}</span>
                  <button onClick={() => eliminarVacacion(v.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Puntualidad del mes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><CalendarCheck size={15} style={{ color: "#00b4d8" }} /> Puntualidad de {mesNombre}</h2>
          <Link href={`/asistencia`} className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Registrar asistencia →</Link>
        </div>
        {totalAsis === 0 ? (
          <p className="text-sm text-gray-400">Sin registros este mes. Regístrala en la sección Asistencia.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold" style={{ color: (pctPuntual ?? 0) >= 90 ? "#059669" : (pctPuntual ?? 0) >= 70 ? "#d97706" : "#dc2626" }}>{pctPuntual}%</div>
              <div className="text-xs text-gray-500">a tiempo<br />de {totalAsis} {totalAsis === 1 ? "día registrado" : "días registrados"}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#ecfdf5" }}><p className="text-lg font-bold" style={{ color: "#059669" }}>{asistenciaMes.a_tiempo}</p><p className="text-[10px]" style={{ color: "#059669" }}>a tiempo</p></div>
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#fffbeb" }}><p className="text-lg font-bold" style={{ color: "#d97706" }}>{asistenciaMes.retardo}</p><p className="text-[10px]" style={{ color: "#d97706" }}>retardos</p></div>
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#fef2f2" }}><p className="text-lg font-bold" style={{ color: "#dc2626" }}>{asistenciaMes.falta}</p><p className="text-[10px]" style={{ color: "#dc2626" }}>faltas</p></div>
              <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#eff6ff" }}><p className="text-lg font-bold" style={{ color: "#2563eb" }}>{asistenciaMes.justificado}</p><p className="text-[10px]" style={{ color: "#2563eb" }}>justific.</p></div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={eliminar} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"><Trash2 size={13} /> Eliminar empleado</button>
      </div>
    </div>
  );
}
