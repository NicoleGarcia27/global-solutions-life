import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KpisPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const puestos = await prisma.puesto.findMany({
    include: { kpis: true, departamento: true },
    orderBy: { nombre: "asc" },
  });

  const todosKpis = puestos.flatMap((p) => p.kpis.map((k) => ({ ...k, puestoNombre: p.nombre })));
  const verde = todosKpis.filter((k) => k.estado === "verde").length;
  const amarillo = todosKpis.filter((k) => k.estado === "amarillo").length;
  const rojo = todosKpis.filter((k) => k.estado === "rojo").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">KPIs — Vista global</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total KPIs", value: todosKpis.length, cls: "text-gray-900" },
          { label: "En verde", value: verde, cls: "text-emerald-600" },
          { label: "En amarillo", value: amarillo, cls: "text-amber-600" },
          { label: "En rojo", value: rojo, cls: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {puestos.map((p) => {
        if (p.kpis.length === 0) return null;
        const pct = Math.round((p.kpis.filter((k) => k.estado === "verde").length / p.kpis.length) * 100);
        return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <Link href={`/puestos/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-[#00b4d8]">
                  {p.nombre}
                </Link>
                <span className="text-xs text-gray-400 ml-2">{p.departamento?.nombre ?? "Sin área"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-400" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${pct >= 90 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {p.kpis.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-xs text-gray-500 w-40">{k.area}</td>
                    <td className="px-5 py-2.5 text-gray-700">{k.metrica}</td>
                    <td className="px-5 py-2.5 text-xs text-gray-600 w-24">Meta: {k.meta} {k.unidad}</td>
                    <td className="px-5 py-2.5 text-xs w-24">
                      {k.actual ? `${k.actual} ${k.unidad}` : <span className="text-gray-300">Sin dato</span>}
                    </td>
                    <td className="px-5 py-2.5 w-28">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        k.estado === "verde" ? "bg-emerald-100 text-emerald-700" :
                        k.estado === "amarillo" ? "bg-amber-100 text-amber-700" :
                        k.estado === "rojo" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          k.estado === "verde" ? "bg-emerald-500" :
                          k.estado === "amarillo" ? "bg-amber-400" :
                          k.estado === "rojo" ? "bg-red-500" : "bg-gray-300"
                        }`} />
                        {k.estado === "verde" ? "Verde" : k.estado === "amarillo" ? "Amarillo" : k.estado === "rojo" ? "Rojo" : "Sin dato"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-gray-400 w-24">{k.frecuencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
