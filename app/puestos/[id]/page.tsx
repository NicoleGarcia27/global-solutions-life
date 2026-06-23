import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KpiTable from "@/components/KpiTable";
import FrpTable from "@/components/FrpTable";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PuestoDetalle({ params }: Props) {
  const { id } = await params;
  const puesto = await prisma.puesto.findUnique({
    where: { id: Number(id) },
    include: { departamento: true, responsabilidades: { orderBy: { orden: "asc" } }, kpis: true },
  });

  if (!puesto) notFound();

  const competencias = puesto.competencias ? puesto.competencias.split(",") : [];
  const kpisVerdes = puesto.kpis.filter((k) => k.estado === "verde").length;
  const pctKpi = puesto.kpis.length ? Math.round((kpisVerdes / puesto.kpis.length) * 100) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/puestos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{puesto.nombre}</h1>
          <p className="text-sm text-gray-500">{puesto.codigo} · {puesto.departamento.nombre}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          puesto.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
          puesto.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
          "bg-gray-100 text-gray-500"
        }`}>
          {puesto.estado === "activo" ? "Activo" : puesto.estado === "en_proceso" ? "En proceso" : "Pendiente"}
        </span>
      </div>

      {/* Datos generales */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Datos generales</h2>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          {[
            { label: "Titular", value: puesto.titular || "—" },
            { label: "Reporta a", value: puesto.reportaA || "—" },
            { label: "Supervisa a", value: puesto.supervisaA || "—" },
            { label: "Horario", value: puesto.horario },
            { label: "Escolaridad", value: puesto.escolaridad },
            { label: "Experiencia", value: puesto.experiencia || "—" },
            { label: "Edad requerida", value: `${puesto.edadMin}–${puesto.edadMax} años` },
            { label: "Tiempo de adaptación", value: puesto.tiempoAdaptacion },
            { label: "Periodicidad de medición", value: puesto.periodicidad },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-400">{f.label}</p>
              <p className="text-gray-800 mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Objetivo del puesto</p>
          <p className="text-sm text-gray-700 leading-relaxed">{puesto.objetivo || "—"}</p>
        </div>
      </div>

      {/* Competencias */}
      {competencias.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Competencias laborales</h2>
          <div className="flex flex-wrap gap-2">
            {competencias.map((c) => (
              <span key={c} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                {c.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-700">KPIs — Indicadores de desempeño</h2>
            {pctKpi !== null && (
              <p className="text-xs text-gray-400 mt-0.5">Cumplimiento: {pctKpi}% ({kpisVerdes}/{puesto.kpis.length})</p>
            )}
          </div>
        </div>
        <KpiTable kpis={puesto.kpis} puestoId={puesto.id} />
      </div>

      {/* FRP */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">FRP — Formato de Responsabilidades y Procesos</h2>
          <p className="text-xs text-gray-400 mt-0.5">{puesto.responsabilidades.length} responsabilidades documentadas</p>
        </div>
        <FrpTable responsabilidades={puesto.responsabilidades} puestoId={puesto.id} />
      </div>

      {/* Formación y herramientas */}
      {(puesto.formacion || puesto.herramientas) && (
        <div className="grid grid-cols-2 gap-4">
          {puesto.formacion && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Formación requerida</h2>
              <p className="text-sm text-gray-600">{puesto.formacion}</p>
            </div>
          )}
          {puesto.herramientas && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Herramientas de trabajo</h2>
              <p className="text-sm text-gray-600">{puesto.herramientas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
