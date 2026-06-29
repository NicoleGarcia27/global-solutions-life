import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Copy, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

// Normaliza para comparar: minúsculas, sin acentos, sin espacios dobles
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

export default async function CompararPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const tareas = await prisma.responsabilidad.findMany({
    where: { puestoId: { not: null } },
    include: { puesto: { include: { departamento: true, usuario: { select: { nombre: true } } } } },
  });

  // Agrupar por nombre normalizado
  const mapa = new Map<string, { display: string; items: { puestoId: number; puesto: string; persona: string; area: string }[] }>();
  for (const t of tareas) {
    if (!t.nombre.trim() || !t.puesto) continue;
    const key = norm(t.nombre);
    if (!key) continue;
    if (!mapa.has(key)) mapa.set(key, { display: t.nombre, items: [] });
    mapa.get(key)!.items.push({
      puestoId: t.puesto.id,
      puesto: t.puesto.nombre,
      persona: t.puesto.usuario?.nombre ?? t.puesto.titular ?? "—",
      area: t.puesto.departamento?.nombre ?? "Sin área",
    });
  }

  // Solo las que están en 2+ puestos distintos
  const repetidas = [...mapa.values()]
    .map((g) => ({ ...g, puestosDistintos: new Set(g.items.map((i) => i.puestoId)).size }))
    .filter((g) => g.puestosDistintos >= 2)
    .sort((a, b) => b.puestosDistintos - a.puestosDistintos);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Copy size={19} style={{ color: "#d97706" }} /> Tareas repetidas
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Tareas iguales que aparecen en varios puestos. Revisa si es intencional o si hay que dejarla en un solo puesto.
        </p>
      </div>

      {repetidas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle2 size={36} className="mx-auto text-emerald-300 mb-3" />
          <p className="text-gray-600 font-medium">No hay tareas duplicadas</p>
          <p className="text-gray-400 text-sm mt-1">Cada tarea registrada está en un solo puesto. Cuando una misma tarea aparezca en dos o más puestos, se mostrará aquí.</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
            <strong>{repetidas.length}</strong> {repetidas.length === 1 ? "tarea se repite" : "tareas se repiten"} en varios puestos.
          </div>

          {repetidas.map((g, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-amber-50/50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">&quot;{g.display}&quot;</h2>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  en {g.puestosDistintos} puestos
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {g.items.map((it, j) => (
                  <div key={j} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50">
                    <div>
                      <p className="text-sm text-gray-700">{it.puesto}</p>
                      <p className="text-xs text-gray-400">{it.persona} · {it.area}</p>
                    </div>
                    <Link href={`/puestos/${it.puestoId}`} className="text-xs text-blue-600 hover:underline shrink-0">
                      Ver puesto →
                    </Link>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
                <p className="text-[11px] text-gray-500">
                  Si solo debe hacerla una persona, entra a los demás puestos y elimina o reasigna la tarea repetida.
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
