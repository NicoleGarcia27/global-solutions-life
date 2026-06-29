import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MejorasPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const puestos = await prisma.puesto.findMany({
    where: { problemasFrecuentes: { not: "" } },
    include: { departamento: true, usuario: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Agrupar por área
  const porArea: Record<string, { texto: string; persona: string; puesto: string; puestoId: number }[]> = {};
  for (const p of puestos) {
    const area = p.departamento?.nombre ?? "Sin área";
    if (!porArea[area]) porArea[area] = [];
    porArea[area].push({
      texto: p.problemasFrecuentes,
      persona: p.usuario?.nombre ?? p.titular ?? "—",
      puesto: p.nombre,
      puestoId: p.id,
    });
  }
  const areas = Object.entries(porArea).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Wrench size={19} style={{ color: "#2563eb" }} /> Problemas frecuentes / Mejoras
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Todo lo que los empleados reportaron como problema en su trabajo, agrupado por área. Útil para detectar qué procesos mejorar.
        </p>
      </div>

      {puestos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          Aún no hay problemas reportados. Aparecerán cuando los empleados llenen su formulario.
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800">
            <strong>{puestos.length}</strong> {puestos.length === 1 ? "problema reportado" : "problemas reportados"} en <strong>{areas.length}</strong> {areas.length === 1 ? "área" : "áreas"}.
          </div>

          {areas.map(([area, items]) => (
            <div key={area} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">{area}</h2>
                <span className="text-xs text-gray-400">{items.length} {items.length === 1 ? "reporte" : "reportes"}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((it, i) => (
                  <div key={i} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{it.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="font-medium text-gray-500">{it.persona}</span> · {it.puesto}
                      </p>
                    </div>
                    <Link href={`/puestos/${it.puestoId}`} className="text-xs text-blue-600 hover:underline shrink-0 mt-0.5">
                      Ver puesto →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
