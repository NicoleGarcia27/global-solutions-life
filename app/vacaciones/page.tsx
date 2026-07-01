import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Palmtree } from "lucide-react";
import { vacacionesPorLey } from "@/lib/vacaciones";
import SolicitudesPendientes from "./SolicitudesPendientes";

export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });

export default async function VacacionesPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const anio = new Date().getFullYear();
  const hoy = new Date();
  const empleados = await prisma.empleado.findMany({
    where: { activo: true },
    include: { vacaciones: { orderBy: { fechaInicio: "desc" } } },
    orderBy: { nombre: "asc" },
  });

  const filas = empleados.map((e) => {
    const delAnio = e.vacaciones.filter((v) => new Date(v.fechaInicio).getFullYear() === anio);
    const tomados = delAnio.filter((v) => v.estado === "aprobada" || v.estado === "tomada").reduce((s, v) => s + v.dias, 0);
    const enVacaciones = e.vacaciones.find((v) => (v.estado === "aprobada" || v.estado === "tomada") && new Date(v.fechaInicio) <= hoy && new Date(v.fechaFin) >= hoy);
    const corresponden = vacacionesPorLey(e.fechaIngreso).dias + (e.diasExtra || 0);
    return { id: e.id, nombre: e.nombre, area: e.area, corresponden, tomados, disponibles: corresponden - tomados, enVacaciones };
  });

  const dispPorEmpleado = new Map(filas.map((f) => [f.id, f.disponibles]));
  const pendientes = empleados.flatMap((e) =>
    e.vacaciones.filter((v) => v.estado === "solicitada").map((v) => ({
      id: v.id,
      empleado: e.nombre,
      area: e.area,
      fechaInicio: v.fechaInicio.toISOString().slice(0, 10),
      fechaFin: v.fechaFin.toISOString().slice(0, 10),
      dias: v.dias,
      nota: v.nota,
      disponibles: dispPorEmpleado.get(e.id) ?? 0,
    }))
  ).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));

  const ahoraEnVacaciones = filas.filter((f) => f.enVacaciones);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Palmtree size={19} style={{ color: "#00b4d8" }} /> Vacaciones {anio}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Días que corresponden, tomados y disponibles por empleado.</p>
      </div>

      <SolicitudesPendientes solicitudes={pendientes} />

      {ahoraEnVacaciones.length > 0 && (
        <div className="rounded-xl border p-4" style={{ backgroundColor: "#f0fbfd", borderColor: "#9bdcec" }}>
          <p className="text-sm font-medium mb-2" style={{ color: "#0a7d99" }}>Ahora mismo de vacaciones ({ahoraEnVacaciones.length})</p>
          <div className="flex flex-wrap gap-2">
            {ahoraEnVacaciones.map((f) => (
              <span key={f.id} className="text-xs bg-white border rounded-lg px-3 py-1.5" style={{ borderColor: "#9bdcec", color: "#0a7d99" }}>
                {f.nombre} · regresa {f.enVacaciones && fmt(new Date(new Date(f.enVacaciones.fechaFin).getTime() + 86400000))}
              </span>
            ))}
          </div>
        </div>
      )}

      {empleados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          No hay empleados registrados. Agrégalos en la sección Empleados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Empleado</th>
                <th className="text-left px-4 py-3 font-medium">Área</th>
                <th className="text-center px-4 py-3 font-medium">Le corresponden</th>
                <th className="text-center px-4 py-3 font-medium">Tomados</th>
                <th className="text-center px-4 py-3 font-medium">Disponibles</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {f.nombre}
                    {f.enVacaciones && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#e6f8fc", color: "#0a7d99" }}>de vacaciones</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{f.area || "—"}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{f.corresponden}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{f.tomados}</td>
                  <td className="px-4 py-3 text-center font-medium" style={{ color: f.disponibles < 0 ? "#dc2626" : "#059669" }}>{f.disponibles}</td>
                  <td className="px-4 py-3"><Link href={`/empleados/${f.id}`} className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Ver ficha →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
