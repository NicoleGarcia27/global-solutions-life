import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PuestosPage() {
  const puestos = await prisma.puesto.findMany({
    include: { departamento: true, kpis: true, responsabilidades: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Puestos</h1>
        <Link
          href="/puestos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} /> Nuevo puesto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Puesto</th>
              <th className="text-left px-4 py-3 font-medium">Departamento</th>
              <th className="text-left px-4 py-3 font-medium">Titular</th>
              <th className="text-left px-4 py-3 font-medium">Responsabilidades</th>
              <th className="text-left px-4 py-3 font-medium">KPIs</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {puestos.map((p) => {
              const pctKpi = p.kpis.length
                ? Math.round((p.kpis.filter((k) => k.estado === "verde").length / p.kpis.length) * 100)
                : null;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/puestos/${p.id}`} className="font-medium text-gray-900 hover:text-emerald-600">
                      {p.nombre}
                    </Link>
                    <p className="text-xs text-gray-400">{p.codigo}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.departamento.nombre}</td>
                  <td className="px-4 py-3">
                    {p.titular ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
                          {p.titular.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-gray-700">{p.titular}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">Sin titular</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.responsabilidades.length}</td>
                  <td className="px-4 py-3">
                    {pctKpi !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pctKpi >= 90 ? "bg-emerald-500" : pctKpi >= 70 ? "bg-amber-400" : "bg-red-500"}`}
                            style={{ width: `${pctKpi}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${pctKpi >= 90 ? "text-emerald-600" : pctKpi >= 70 ? "text-amber-600" : "text-red-600"}`}>
                          {pctKpi}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">Sin KPIs</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                      p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {p.estado === "activo" ? "Activo" : p.estado === "en_proceso" ? "En proceso" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/puestos/${p.id}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                      <FileText size={12} /> Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
