import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CompararPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const puestos = await prisma.puesto.findMany({
    include: {
      departamento: true,
      responsabilidades: { orderBy: { orden: "asc" } },
      usuario: { select: { nombre: true } },
    },
    orderBy: { nombre: "asc" },
  });

  // Agrupar por nombre de puesto
  const grupos: Record<string, typeof puestos> = {};
  for (const p of puestos) {
    const key = p.nombre.trim().toLowerCase();
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  }

  const gruposConVariantes = Object.entries(grupos).filter(([, lista]) => lista.length > 1);
  const gruposSolos = Object.entries(grupos).filter(([, lista]) => lista.length === 1);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Comparar puestos similares</h1>
        <p className="text-sm text-gray-400 mt-0.5">Empleados con el mismo puesto — compara sus tareas para depurar el descriptor oficial</p>
      </div>

      {puestos.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          Aún no hay formularios enviados para comparar.
        </div>
      )}

      {/* Puestos con múltiples personas */}
      {gruposConVariantes.map(([key, lista]) => (
        <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-blue-50">
            <h2 className="text-sm font-semibold text-blue-800">{lista[0].nombre}</h2>
            <p className="text-xs text-blue-600 mt-0.5">{lista.length} empleados con este puesto — compara sus tareas</p>
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-max divide-x divide-gray-100">
              {lista.map((p) => (
                <div key={p.id} className="flex-1 min-w-64 p-4">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-700">{p.usuario?.nombre ?? p.titular ?? "Sin nombre"}</p>
                    <p className="text-xs text-gray-400">{p.departamento?.nombre ?? "Sin área"}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {p.responsabilidades.length} tareas
                  </p>
                  <div className="space-y-1.5">
                    {p.responsabilidades.map((r, i) => (
                      <div key={r.id} className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1.5">
                        <span className="text-gray-400 mr-1">T{i + 1}.</span>
                        <span className="text-gray-700">{r.nombre}</span>
                        <span className="text-gray-400 ml-1">({r.recurrencia})</span>
                      </div>
                    ))}
                    {p.responsabilidades.length === 0 && (
                      <p className="text-xs text-gray-300 italic">Sin tareas registradas</p>
                    )}
                  </div>
                  {p.tareasNoCorresponden && (
                    <div className="mt-3 text-xs bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 text-yellow-700">
                      <strong>No le corresponde:</strong> {p.tareasNoCorresponden}
                    </div>
                  )}
                  <a href={`/puestos/${p.id}`} className="block mt-3 text-xs text-blue-600 hover:underline">Ver formulario completo →</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Puestos únicos */}
      {gruposSolos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Puestos con un solo titular ({gruposSolos.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium">Puesto</th>
                <th className="text-left px-4 py-2 font-medium">Empleado</th>
                <th className="text-left px-4 py-2 font-medium">Departamento</th>
                <th className="text-left px-4 py-2 font-medium">Tareas</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {gruposSolos.map(([, lista]) => {
                const p = lista[0];
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.usuario?.nombre ?? p.titular ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.departamento?.nombre ?? "Sin área"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.responsabilidades.length} tareas</td>
                    <td className="px-4 py-3"><a href={`/puestos/${p.id}`} className="text-xs text-blue-600 hover:underline">Ver →</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
