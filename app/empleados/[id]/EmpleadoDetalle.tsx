"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, X, TrendingUp, Trash2, Plus } from "lucide-react";

type Empleado = {
  id: number; nombre: string; puesto: string; area: string; tipo: string; factura: boolean;
  sueldoActual: number; correo: string; telefono: string; notas: string; activo: boolean; fechaIngreso: string;
};
type Incremento = { id: number; fecha: string; sueldoNuevo: number; porcentaje: number; nota: string };

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

export default function EmpleadoDetalle({ empleado, incrementos, departamentos }: { empleado: Empleado; incrementos: Incremento[]; departamentos: string[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(empleado);
  const [incOpen, setIncOpen] = useState(false);
  const [inc, setInc] = useState({ sueldoNuevo: "", fecha: new Date().toISOString().slice(0, 10), nota: "" });

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
            </div>
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

      <div className="flex justify-end">
        <button onClick={eliminar} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600"><Trash2 size={13} /> Eliminar empleado</button>
      </div>
    </div>
  );
}
