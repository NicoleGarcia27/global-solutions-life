import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmt(h: number) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h >= 160) return `${Math.round(h / 160)} mes`;
  return `${h} h`;
}

const nivelCls: Record<string, string> = {
  Alto: "bg-red-100 text-red-700",
  Medio: "bg-amber-100 text-amber-700",
  Bajo: "bg-blue-100 text-blue-700",
};

export default async function FrpPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const puestos = await prisma.puesto.findMany({
    include: {
      departamento: true,
      responsabilidades: { orderBy: { orden: "asc" } },
    },
    orderBy: { nombre: "asc" },
  });

  const totalResp = puestos.reduce((a, p) => a + p.responsabilidades.length, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">FRP — Formato de Responsabilidades y Procesos</h1>
          <p className="text-sm text-gray-500">{totalResp} responsabilidades en {puestos.length} puestos</p>
        </div>
      </div>

      {puestos.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <Link href={`/puestos/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-[#00b4d8]">
                {p.nombre}
              </Link>
              <span className="text-xs text-gray-400 ml-2">{p.departamento?.nombre ?? "Sin área"}</span>
              {p.titular && <span className="text-xs text-gray-400 ml-2">· {p.titular}</span>}
            </div>
            <span className="text-xs text-gray-400">{p.responsabilidades.length} responsabilidades</span>
          </div>

          {p.responsabilidades.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-400">Sin responsabilidades registradas</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-50 bg-gray-50">
                  <th className="text-left px-5 py-2 font-medium w-8">#</th>
                  <th className="text-left px-5 py-2 font-medium">Responsabilidad</th>
                  <th className="text-left px-5 py-2 font-medium w-28">Tiempo</th>
                  <th className="text-left px-5 py-2 font-medium w-28">Recurrencia</th>
                  <th className="text-left px-5 py-2 font-medium w-20">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {p.responsabilidades.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-xs text-gray-400">R{i + 1}</td>
                    <td className="px-5 py-2.5 text-gray-700">{r.nombre}</td>
                    <td className="px-5 py-2.5 text-xs text-gray-600">{fmt(r.tiempoHoras)}</td>
                    <td className="px-5 py-2.5 text-xs text-gray-600">{r.recurrencia}</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${nivelCls[r.nivel] ?? "bg-gray-100 text-gray-500"}`}>
                        {r.nivel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
