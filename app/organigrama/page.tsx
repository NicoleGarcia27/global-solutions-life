import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrganigramaPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const departamentos = await prisma.departamento.findMany({
    include: { puestos: { include: { kpis: true }, orderBy: { nombre: "asc" } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Organigrama</h1>

      <div className="flex flex-col items-center gap-2 py-4">
        <div className="bg-white border-2 rounded-xl px-8 py-3 text-center shadow-sm" style={{ borderColor: "#1a3a6b" }}>
          <p className="text-xs text-gray-400">Dirección General</p>
          <p className="text-sm font-semibold" style={{ color: "#1a3a6b" }}>Global Solutions Life</p>
        </div>
        <div className="w-px h-6 bg-gray-200" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {departamentos.map((dep) => (
          <div key={dep.id} className="bg-white rounded-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: "#eef2f8" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#1a3a6b" }}>{dep.nombre}</p>
            </div>
            <div className="p-3 space-y-2">
              {dep.puestos.length === 0 && (
                <p className="text-xs text-gray-400 py-2 text-center">Sin puestos</p>
              )}
              {dep.puestos.map((p) => {
                const pct = p.kpis.length
                  ? Math.round((p.kpis.filter((k) => k.estado === "verde").length / p.kpis.length) * 100)
                  : null;
                return (
                  <Link
                    key={p.id}
                    href={`/puestos/${p.id}`}
                    className="block p-3 rounded-lg border border-gray-100 transition-colors group hover:border-[#00b4d8] hover:bg-[#f0fbfd]"
                  >
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#0a7d99]">{p.nombre}</p>
                    {p.titular && <p className="text-xs text-gray-500 mt-0.5">{p.titular}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                        p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {p.estado === "activo" ? "Activo" : p.estado === "en_proceso" ? "En proceso" : "Pendiente"}
                      </span>
                      {pct !== null && (
                        <span className={`text-[10px] font-medium ${pct >= 90 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-red-600"}`}>
                          KPI {pct}%
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
