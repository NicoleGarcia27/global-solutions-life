import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import AdminRevision from "./AdminRevision";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

function Campo({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </div>
  );
}

export default async function PuestoDetalle({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const puesto = await prisma.puesto.findUnique({
    where: { id: Number(id) },
    include: {
      departamento: true,
      responsabilidades: { orderBy: { orden: "asc" } },
      kpis: true,
      usuario: { select: { nombre: true, email: true } },
    },
  });

  if (!puesto) notFound();

  // Empleado solo puede ver su propio puesto
  if (!isAdmin && puesto.usuarioId !== Number(user?.id)) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/puestos" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{puesto.nombre}</h1>
          <p className="text-sm text-gray-400">{puesto.departamento.nombre} {puesto.usuario && `· Enviado por ${puesto.usuario.nombre}`}</p>
        </div>
        <Link
          href={`/puestos/${puesto.id}/imprimir`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <Printer size={13} /> Exportar PDF
        </Link>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          puesto.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
          puesto.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-500"
        }`}>
          {puesto.estado === "activo" ? "Revisado" : puesto.estado === "en_proceso" ? "En revisión" : "Pendiente"}
        </span>
      </div>

      {/* Panel admin de revisión */}
      {isAdmin && <AdminRevision puesto={puesto} />}

      {/* Identificación */}
      <Seccion title="Identificación">
        <div className="grid grid-cols-3 gap-4">
          <Campo label="Titular" value={puesto.titular} />
          <Campo label="Reporta a" value={puesto.reportaA} />
          <Campo label="Supervisa a" value={puesto.supervisaA} />
          <Campo label="Horario" value={puesto.horario} />
          <Campo label="Departamento" value={puesto.departamento.nombre} />
        </div>
        <Campo label="Objetivo del puesto" value={puesto.objetivo} />
      </Seccion>

      {/* Tareas y Actividades */}
      {puesto.responsabilidades.length > 0 && (
        <Seccion title={`Tareas y Actividades (${puesto.responsabilidades.length})`}>
          <div className="space-y-3">
            {puesto.responsabilidades.map((r, i) => (
              <div key={r.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="text-gray-400 mr-2">T{i + 1}.</span>{r.nombre}
                    </p>
                    {r.descripcion && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{r.descripcion}</p>}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 shrink-0">
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">{r.recurrencia}</span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">{r.tiempoHoras}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {/* Personal a cargo */}
      {puesto.tienePersonal && (
        <Seccion title="Personal a cargo">
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Número de personas a cargo" value={puesto.numPersonasACargo} />
            <Campo label="¿Cómo supervisa?" value={puesto.comoSupervisa} />
            <Campo label="¿Cómo audita el trabajo?" value={puesto.comoAudita} />
            <Campo label="¿Cómo evalúa el desempeño?" value={puesto.comoEvalua} />
          </div>
          <Campo label="Autoridad sobre el personal" value={puesto.autoridadSobre} />
        </Seccion>
      )}

      {/* Relaciones de trabajo */}
      {(puesto.internoConQuien || puesto.externoConQuien) && (
        <Seccion title="Relaciones de trabajo">
          <Campo label="Relaciones internas (dentro de la empresa)" value={puesto.internoConQuien} />
          <Campo label="Relaciones externas (clientes, proveedores, instituciones)" value={puesto.externoConQuien} />
        </Seccion>
      )}

      {/* Documentos y decisiones */}
      {(puesto.documentosQueGenera || puesto.decisionesIndependientes || puesto.decisionesConAutorizacion) && (
        <Seccion title="Documentos y decisiones">
          <Campo label="Documentos o reportes que genera" value={puesto.documentosQueGenera} />
          <Campo label="Decisiones que toma de forma independiente" value={puesto.decisionesIndependientes} />
          <Campo label="Decisiones que requieren autorización" value={puesto.decisionesConAutorizacion} />
        </Seccion>
      )}

      {/* Herramientas */}
      {puesto.herramientas && (
        <Seccion title="Herramientas de trabajo">
          <Campo label="Herramientas, sistemas y equipos" value={puesto.herramientas} />
        </Seccion>
      )}

      {/* Observaciones del empleado */}
      {(puesto.tareasNoCorresponden || puesto.tareasQueNadieHace || puesto.problemasFrecuentes || puesto.comoMideSuTrabajo) && (
        <Seccion title="Observaciones del empleado">
          <Campo label="Tareas que considera que no le corresponden" value={puesto.tareasNoCorresponden} />
          <Campo label="Tareas que nadie hace pero deberían hacerse" value={puesto.tareasQueNadieHace} />
          <Campo label="Problemas frecuentes en su trabajo" value={puesto.problemasFrecuentes} />
          <Campo label="¿Cómo mide que hizo bien su trabajo?" value={puesto.comoMideSuTrabajo} />
        </Seccion>
      )}
    </div>
  );
}
