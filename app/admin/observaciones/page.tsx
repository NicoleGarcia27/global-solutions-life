import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, UserX, Wrench, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ObservacionesPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const puestos = await prisma.puesto.findMany({
    include: { departamento: true, usuario: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  });

  const item = (p: typeof puestos[number], texto: string) => ({
    texto,
    puestoId: p.id,
    puesto: p.nombre,
    persona: p.usuario?.nombre ?? p.titular ?? "—",
    area: p.departamento?.nombre ?? "Sin área",
  });

  const noCorresponden = puestos.filter((p) => p.tareasNoCorresponden?.trim()).map((p) => item(p, p.tareasNoCorresponden));
  const nadieHace = puestos.filter((p) => p.tareasQueNadieHace?.trim()).map((p) => item(p, p.tareasQueNadieHace));
  const problemas = puestos.filter((p) => p.problemasFrecuentes?.trim()).map((p) => item(p, p.problemasFrecuentes));
  const indicadores = puestos.filter((p) => p.comoMideSuTrabajo?.trim()).map((p) => item(p, p.comoMideSuTrabajo));

  const bloques = [
    {
      titulo: "Tareas que NO les corresponden",
      desc: "Lo que los empleados creen que no es de su puesto — candidatas a reasignar a otra persona.",
      icon: UserX, color: "#dc2626", bg: "#fef2f2", border: "#fecaca",
      items: noCorresponden,
    },
    {
      titulo: "Tareas que nadie hace",
      desc: "Huecos detectados — candidatas a crear un puesto/vacante nuevo o asignar a alguien.",
      icon: AlertTriangle, color: "#d97706", bg: "#fffbeb", border: "#fde68a",
      items: nadieHace,
    },
    {
      titulo: "Problemas frecuentes",
      desc: "Obstáculos recurrentes que mencionan los empleados.",
      icon: Wrench, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
      items: problemas,
    },
    {
      titulo: "Indicadores propios (cómo miden su trabajo)",
      desc: "Útil para definir los KPIs de cada puesto.",
      icon: Target, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0",
      items: indicadores,
    },
  ];

  const totalObs = noCorresponden.length + nadieHace.length + problemas.length + indicadores.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Análisis de observaciones</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Todo lo que los empleados reportaron, desglosado por tipo y área. Desde aquí decides qué reasignar o qué puesto nuevo crear.
        </p>
      </div>

      {totalObs === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          Aún no hay observaciones. Aparecerán cuando los empleados llenen su formulario.
        </div>
      ) : (
        bloques.map((b) => (
          <div key={b.titulo} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ backgroundColor: b.bg }}>
              <b.icon size={16} style={{ color: b.color }} />
              <div>
                <h2 className="text-sm font-semibold" style={{ color: b.color }}>{b.titulo} ({b.items.length})</h2>
                <p className="text-xs text-gray-400">{b.desc}</p>
              </div>
            </div>
            {b.items.length === 0 ? (
              <p className="px-5 py-4 text-xs text-gray-300">Sin registros en esta categoría.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {b.items.map((it, i) => (
                  <div key={i} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{it.texto}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <span className="font-medium text-gray-500">{it.persona}</span> · {it.puesto} · {it.area}
                      </p>
                    </div>
                    <Link href={`/puestos/${it.puestoId}`} className="text-xs text-blue-600 hover:underline shrink-0 mt-0.5">
                      Ir al puesto →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
