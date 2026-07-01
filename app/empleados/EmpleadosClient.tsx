"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, X, Users, Briefcase, ChevronRight, UserCheck } from "lucide-react";

type Empleado = {
  id: number; nombre: string; puesto: string; area: string; tipo: string;
  factura: boolean; sueldoActual: number; fechaIngreso: string | null; activo: boolean;
  usuarioId: number | null;
};
type UsuarioOpt = { id: number; nombre: string; email: string };

function antiguedad(fecha: string | null) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const meses = Math.max(0, Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const a = Math.floor(meses / 12), m = meses % 12;
  if (a === 0) return `${m} ${m === 1 ? "mes" : "meses"}`;
  return `${a} ${a === 1 ? "año" : "años"}${m ? ` ${m}m` : ""}`;
}

const money = (n: number) => "$" + n.toLocaleString("es-MX");
const iniciales = (nombre: string) => nombre.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const TIPOS: Record<string, { label: string; cls: string }> = {
  empleado: { label: "Empleado GSL", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  proveedor: { label: "Factura a GSL", cls: "bg-purple-50 text-purple-700 border-purple-100" },
  sky: { label: "Factura a SKY", cls: "bg-amber-50 text-amber-700 border-amber-100" },
};

function VincularCuenta({ empleadoId, usuarioId, usuarios, ocupados }: { empleadoId: number; usuarioId: number | null; usuarios: UsuarioOpt[]; ocupados: Set<number> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const vinculado = usuarioId != null;

  async function cambiar(val: string) {
    setSaving(true); setErr("");
    const res = await fetch(`/api/empleados/${empleadoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: val ? Number(val) : null }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error ?? "No se pudo vincular"); return; }
    router.refresh();
  }

  return (
    <div className="w-[168px]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: vinculado ? "#10b981" : "#f59e0b" }} title={vinculado ? "Cuenta vinculada" : "Sin cuenta"} />
        <select
          value={vinculado ? String(usuarioId) : ""}
          disabled={saving}
          onChange={(e) => cambiar(e.target.value)}
          className={`flex-1 min-w-0 truncate text-xs bg-white border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00b4d8] ${vinculado ? "border-gray-200 text-gray-700" : "border-amber-200 text-amber-700"}`}
        >
          <option value="">Sin cuenta — vincular…</option>
          {usuarios.map((u) => {
            const ocupadoPorOtro = ocupados.has(u.id) && u.id !== usuarioId;
            return (
              <option key={u.id} value={String(u.id)} disabled={ocupadoPorOtro}>
                {u.nombre}{ocupadoPorOtro ? " (ya vinculado)" : ""}
              </option>
            );
          })}
        </select>
      </div>
      {err && <p className="text-[10px] text-red-500 mt-1">{err}</p>}
    </div>
  );
}

export default function EmpleadosClient({ empleados, departamentos, usuarios }: { empleados: Empleado[]; departamentos: string[]; usuarios: UsuarioOpt[] }) {
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
  const facturanGSL = empleados.filter((e) => e.tipo === "proveedor").length;
  const conCuenta = empleados.filter((e) => e.usuarioId != null).length;
  const ocupados = new Set(empleados.filter((e) => e.usuarioId != null).map((e) => e.usuarioId as number));

  const stats = [
    { n: empleados.length, label: "En total", color: "#1a3a6b" },
    { n: empleadosGSL, label: "Nómina GSL", color: "#2563eb" },
    { n: facturanGSL, label: "Factura a GSL", color: "#7c3aed" },
    { n: conCuenta, label: "Con acceso", color: "#0a7d99" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#eef2f8" }}>
            <Users size={22} style={{ color: "#1a3a6b" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Empleados</h1>
            <p className="text-sm text-gray-400 mt-0.5">Directorio de personal, percepciones y accesos</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm flex-shrink-0 transition-opacity hover:opacity-90" style={{ backgroundColor: "#1a3a6b" }}>
          <UserPlus size={16} /> Agregar empleado
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
            <p className="text-2xl font-bold leading-none" style={{ color: s.color }}>{s.n}</p>
            <p className="text-xs text-gray-500 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Aún no hay empleados registrados</p>
          <p className="text-gray-400 text-sm mt-1">Agrega tu primer empleado con el botón de arriba</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ backgroundColor: "#f8fafc" }}>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400">Empleado</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400">Tipo</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400 whitespace-nowrap">Antigüedad</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400">Sueldo</th>
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400">Cuenta de acceso</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((e) => {
                  const tipo = TIPOS[e.tipo] ?? TIPOS.empleado;
                  return (
                    <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: "#e6f8fc", color: "#0a7d99" }}>
                            {iniciales(e.nombre)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{e.nombre}</p>
                            {(e.puesto || e.area) && <p className="text-xs text-gray-400 truncate">{[e.puesto, e.area].filter(Boolean).join(" · ")}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${tipo.cls}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {tipo.label}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">{antiguedad(e.fechaIngreso)}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium whitespace-nowrap">{e.sueldoActual ? money(e.sueldoActual) : "—"}</td>
                      <td className="px-4 py-3.5">
                        <VincularCuenta empleadoId={e.id} usuarioId={e.usuarioId} usuarios={usuarios} ocupados={ocupados} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/empleados/${e.id}`} className="inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 transition-colors hover:border-[#00b4d8] hover:text-[#00b4d8]">
                          Ver ficha <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {empleados.length > 0 && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <UserCheck size={13} /> La cuenta de acceso permite al empleado checar asistencia y solicitar sus vacaciones. El punto verde indica que ya está vinculada.
        </p>
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
                    <option value="proveedor">Factura a GSL</option>
                    <option value="sky">Factura a SKY SEGUROS</option>
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
