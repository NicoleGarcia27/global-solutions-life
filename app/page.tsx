import { prisma } from "@/lib/prisma";
import { seedIfEmpty } from "@/lib/seed";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await seedIfEmpty();

  const [puestos, kpis, departamentos, totalResp] = await Promise.all([
    prisma.puesto.findMany({ include: { departamento: true, kpis: true } }),
    prisma.kpi.findMany(),
    prisma.departamento.findMany({ include: { puestos: { include: { kpis: true } } } }),
    prisma.responsabilidad.count(),
  ]);

  const totalPuestos = puestos.length;
  const puestosActivos = puestos.filter((p) => p.estado === "activo").length;
  const kpisVerdes = kpis.filter((k) => k.estado === "verde").length;
  const kpisTotales = kpis.length;
  const kpisRiesgo = kpis.filter((k) => k.estado === "amarillo" || k.estado === "rojo").length;

  const alertas = [
    ...kpis.filter((k) => k.estado === "rojo").slice(0, 3).map((k) => ({ tipo: "rojo", msg: `KPI fuera de meta — ${k.area}: ${k.metrica}` })),
    ...kpis.filter((k) => k.estado === "amarillo").slice(0, 2).map((k) => ({ tipo: "amarillo", msg: `KPI en riesgo — ${k.area}: ${k.metrica}` })),
    ...puestos.filter((p) => p.estado === "pendiente").slice(0, 2).map((p) => ({ tipo: "amarillo", msg: `Perfil incompleto — ${p.nombre}` })),
  ].slice(0, 5);

  const depStats = departamentos.map((d) => {
    const dKpis = d.puestos.flatMap((p) => p.kpis);
    const verde = dKpis.filter((k) => k.estado === "verde").length;
    const pct = dKpis.length ? Math.round((verde / dKpis.length) * 100) : 0;
    return { nombre: d.nombre, pct, total: dKpis.length };
  }).filter((d) => d.total > 0);

  const stats = [
    { label: "Puestos activos", value: `${puestosActivos} / ${totalPuestos}`, sub: "documentados", icon: Users, chip: "#1a3a6b", chipBg: "#eaf0f8" },
    { label: "KPIs en verde", value: kpisTotales ? `${Math.round((kpisVerdes / kpisTotales) * 100)}%` : "—", sub: `${kpisVerdes} de ${kpisTotales}`, icon: CheckCircle2, chip: "#059669", chipBg: "#ecfdf5" },
    { label: "KPIs en riesgo", value: String(kpisRiesgo), sub: "requieren atención", icon: AlertTriangle, chip: "#d97706", chipBg: "#fffbeb" },
    { label: "Procesos mapeados", value: String(totalResp), sub: "en FRP", icon: TrendingUp, chip: "#00b4d8", chipBg: "#e6f8fc" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Encabezado con banda institucional */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between text-white relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, #14305a 0%, #1a3a6b 60%, #1e4a86 100%)" }}
      >
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,180,216,0.18), transparent 70%)" }} />
        <div className="relative">
          <h1 className="text-2xl font-bold">Panel de control</h1>
          <p className="text-sm text-white/70 mt-0.5">
            Global Solutions Life · {new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/puestos"
          className="relative flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors"
          style={{ backgroundColor: "#00b4d8", color: "#fff" }}
        >
          Ver puestos →
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.chipBg }}>
                <c.icon size={20} style={{ color: c.chip }} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 leading-none">{c.value}</p>
                <p className="text-xs text-gray-500 mt-1">{c.label}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">KPIs por departamento</h2>
          {depStats.length === 0 && <p className="text-sm text-gray-400">Sin datos aún</p>}
          <div className="space-y-3">
            {depStats.map((d) => (
              <div key={d.nombre}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate max-w-[160px]">{d.nombre}</span>
                  <span className={`font-medium ${d.pct >= 90 ? "text-emerald-600" : d.pct >= 70 ? "text-amber-600" : "text-red-600"}`}>
                    {d.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${d.pct >= 90 ? "bg-emerald-500" : d.pct >= 70 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Alertas</h2>
          {alertas.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 size={16} /> Todo en orden
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border-l-2 text-xs ${
                    a.tipo === "rojo"
                      ? "bg-red-50 border-red-400 text-red-800"
                      : "bg-amber-50 border-amber-400 text-amber-800"
                  }`}
                >
                  {a.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Puestos</h2>
          <Link href="/puestos" className="text-xs hover:underline" style={{ color: "#00b4d8" }}>Ver todos →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-4 py-2 font-medium">Puesto</th>
              <th className="text-left px-4 py-2 font-medium">Departamento</th>
              <th className="text-left px-4 py-2 font-medium">Titular</th>
              <th className="text-left px-4 py-2 font-medium">KPIs</th>
              <th className="text-left px-4 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {puestos.slice(0, 5).map((p) => {
              const pctKpi = p.kpis.length
                ? Math.round((p.kpis.filter((k) => k.estado === "verde").length / p.kpis.length) * 100)
                : null;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/puestos/${p.id}`} className="font-medium text-gray-900 hover:text-[#00b4d8]">
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.departamento?.nombre ?? "Sin área"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.titular || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    {pctKpi !== null ? (
                      <span className={`text-xs font-medium ${pctKpi >= 90 ? "text-emerald-600" : pctKpi >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {pctKpi}% ({p.kpis.length})
                      </span>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
