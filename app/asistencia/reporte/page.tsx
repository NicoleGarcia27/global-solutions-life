import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import ReporteControles from "./ReporteControles";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ desde?: string; hasta?: string }> };

export default async function ReporteAsistencia({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const sp = await searchParams;
  const hoy = new Date();
  const defDesde = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), 1)).toISOString().slice(0, 10);
  const defHasta = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth() + 1, 0)).toISOString().slice(0, 10);
  const desde = sp.desde ?? defDesde;
  const hasta = sp.hasta ?? defHasta;

  const empleados = await prisma.empleado.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
  const asis = await prisma.asistencia.findMany({
    where: { fecha: { gte: new Date(`${desde}T00:00:00.000Z`), lte: new Date(`${hasta}T00:00:00.000Z`) } },
  });

  const filas = empleados.map((e) => {
    const regs = asis.filter((a) => a.empleadoId === e.id);
    const c = { a_tiempo: 0, retardo: 0, falta: 0, justificado: 0 };
    regs.forEach((r) => { c[r.estado as keyof typeof c] = (c[r.estado as keyof typeof c] ?? 0) + 1; });
    const total = regs.length;
    const pct = total ? Math.round((c.a_tiempo / total) * 100) : null;
    return { id: e.id, nombre: e.nombre, area: e.area, ...c, total, pct };
  });

  const rango = `${new Date(`${desde}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })} — ${new Date(`${hasta}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`;
  const barColor = (p: number) => p >= 90 ? "#059669" : p >= 70 ? "#d97706" : "#dc2626";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <style>{`@media print { aside { display: none !important; } .no-print { display: none !important; } }`}</style>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={19} style={{ color: "#00b4d8" }} /> Reporte de asistencia
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{rango}</p>
        </div>
      </div>

      <div className="no-print"><ReporteControles desde={desde} hasta={hasta} /></div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Empleado</th>
              <th className="text-center px-3 py-3 font-medium">A tiempo</th>
              <th className="text-center px-3 py-3 font-medium">Retardos</th>
              <th className="text-center px-3 py-3 font-medium">Faltas</th>
              <th className="text-center px-3 py-3 font-medium">Justif.</th>
              <th className="text-center px-3 py-3 font-medium">% puntual</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{f.nombre}</p>
                  <p className="text-xs text-gray-400">{f.area || "—"}</p>
                </td>
                <td className="text-center px-3 py-3" style={{ color: "#059669" }}>{f.a_tiempo}</td>
                <td className="text-center px-3 py-3" style={{ color: "#d97706" }}>{f.retardo}</td>
                <td className="text-center px-3 py-3" style={{ color: "#dc2626" }}>{f.falta}</td>
                <td className="text-center px-3 py-3" style={{ color: "#2563eb" }}>{f.justificado}</td>
                <td className="text-center px-3 py-3 font-medium">{f.pct !== null ? `${f.pct}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filas.every((f) => f.total === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin registros de asistencia en este periodo.</p>
        )}
      </div>

      {/* Gráfica de puntualidad */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Puntualidad por empleado</h2>
        <div className="space-y-3">
          {filas.filter((f) => f.total > 0).map((f) => (
            <div key={f.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{f.nombre}</span>
                <span className="font-medium" style={{ color: barColor(f.pct ?? 0) }}>{f.pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${f.pct ?? 0}%`, backgroundColor: barColor(f.pct ?? 0) }} />
              </div>
            </div>
          ))}
          {filas.every((f) => f.total === 0) && <p className="text-sm text-gray-400">Aún no hay datos para graficar.</p>}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center no-print">Tip: usa &quot;Descargar / Imprimir PDF&quot; y elige &quot;Guardar como PDF&quot; en el navegador.</p>
    </div>
  );
}
