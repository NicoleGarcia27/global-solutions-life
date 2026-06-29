"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, X, Users, Briefcase } from "lucide-react";

type Empleado = {
  id: number; nombre: string; puesto: string; area: string; tipo: string;
  factura: boolean; sueldoActual: number; fechaIngreso: string | null; activo: boolean;
};

function antiguedad(fecha: string | null) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const meses = Math.max(0, Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const a = Math.floor(meses / 12), m = meses % 12;
  if (a === 0) return `${m} ${m === 1 ? "mes" : "meses"}`;
  return `${a} ${a === 1 ? "año" : "años"}${m ? ` ${m}m` : ""}`;
}

const money = (n: number) => "$" + n.toLocaleString("es-MX");

export default function EmpleadosClient({ empleados, departamentos }: { empleados: Empleado[]; departamentos: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "", puesto: "", area: departamentos[0] ?? "", tipo: "empleado",
    factura: false, fechaIngreso: "", sueldoActual: "", correo: "", telefono: "",
  });

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })); }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setBusy(true); setError("");
    const res = await fetch("/api/empleados", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
    setOpen(false);
    setForm({ nombre: "", puesto: "", area: departamentos[0] ?? "", tipo: "empleado", factura: false, fechaIngreso: "", sueldoActual: "", correo: "", telefono: "" });
    if (data?.id) router.push(`/empleados/${data.id}`); else router.refresh();
  }

  const empleadosGSL = empleados.filter((e) => e.tipo === "empleado").length;
  const proveedores = empleados.filter((e) => e.tipo === "proveedor").length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Empleados</h1>
          <p className="text-sm text-gray-400 mt-0.5">{empleados.length} en total · {empleadosGSL} de GSL · {proveedores} proveedores</p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: "#1a3a6b" }}>
          <UserPlus size={15} /> Agregar empleado
        </button>
      </div>

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Aún no hay empleados registrados</p>
          <p className="text-gray-400 text-sm mt-1">Agrega tu primer empleado con el botón de arriba</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Empleado</th>
                <th className="text-left px-4 py-3 font-medium">Área</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Antigüedad</th>
                <th className="text-left px-4 py-3 font-medium">Sueldo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{e.nombre}</p>
                    {e.puesto && <p className="text-xs text-gray-400">{e.puesto}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.area || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.tipo === "empleado" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {e.tipo === "empleado" ? "Empleado GSL" : "Proveedor"}
                    </span>
                    {e.factura && <span className="ml-1 text-[10px] text-gray-400">factura</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{antiguedad(e.fechaIngreso)}</td>
                  <td className="px-4 py-3 text-gray-700">{e.sueldoActual ? money(e.sueldoActual) : "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/empleados/${e.id}`} className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Ver ficha →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Briefcase size={18} style={{ color: "#1a3a6b" }} /> Nuevo empleado</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={crear} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nombre completo <span className="text-red-400">*</span></label>
                <input type="text" required autoFocus className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Puesto</label>
                  <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.puesto} onChange={(e) => set("puesto", e.target.value)} placeholder="ej. Ejecutiva de Ventas" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Área</label>
                  <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.area} onChange={(e) => set("area", e.target.value)}>
                    <option value="">—</option>
                    {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Tipo</label>
                  <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                    <option value="empleado">Empleado de GSL</option>
                    <option value="proveedor">Proveedor externo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Fecha de ingreso</label>
                  <input type="date" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.fechaIngreso} onChange={(e) => set("fechaIngreso", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Sueldo actual (mensual)</label>
                  <input type="number" min={0} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.sueldoActual} onChange={(e) => set("sueldoActual", e.target.value)} placeholder="18500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.factura} onChange={(e) => set("factura", e.target.checked)} className="w-4 h-4" />
                    ¿Emite factura?
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Correo</label>
                  <input type="email" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.correo} onChange={(e) => set("correo", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Teléfono</label>
                  <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
                </div>
              </div>
              {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={busy || !form.nombre.trim()} className="flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 font-medium" style={{ backgroundColor: "#1a3a6b" }}>{busy ? "Guardando..." : "Guardar empleado"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
