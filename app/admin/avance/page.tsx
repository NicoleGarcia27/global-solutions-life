import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AvancePage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const usuarios = await prisma.usuario.findMany({
    where: { role: "usuario" },
    include: {
      departamento: true,
      puestos: { select: { id: true, nombre: true, estado: true, createdAt: true, responsabilidades: { select: { id: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const llenaron = usuarios.filter((u) => u.puestos.length > 0);
  const noLlenaron = usuarios.filter((u) => u.puestos.length === 0);
  const revisados = llenaron.filter((u) => u.puestos.some((p) => p.estado === "activo"));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Panel de avance</h1>
        <p className="text-sm text-gray-400 mt-0.5">Seguimiento de qué empleados han llenado su formulario</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-800">{usuarios.length}</p>
          <p className="text-sm text-gray-500 mt-1">Empleados registrados</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{llenaron.length}</p>
          <p className="text-sm text-emerald-600 mt-1">Formularios enviados</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-5 text-center">
          <p className="text-3xl font-bold text-red-500">{noLlenaron.length}</p>
          <p className="text-sm text-red-500 mt-1">Pendientes de llenar</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Progreso general</span>
          <span className="text-gray-500">{llenaron.length} de {usuarios.length} empleados</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: usuarios.length ? `${Math.round((llenaron.length / usuarios.length) * 100)}%` : "0%" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{revisados.length} revisados</span>
          <span>{usuarios.length ? Math.round((llenaron.length / usuarios.length) * 100) : 0}% completado</span>
        </div>
      </div>

      {/* Pendientes */}
      {noLlenaron.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-red-50">
            <AlertCircle size={14} className="text-red-500" />
            <h2 className="text-sm font-semibold text-red-700">Aún no han llenado su formulario ({noLlenaron.length})</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium">Empleado</th>
                <th className="text-left px-4 py-2 font-medium">Correo</th>
                <th className="hidden md:table-cell text-left px-4 py-2 font-medium">Área</th>
                <th className="hidden md:table-cell text-left px-4 py-2 font-medium">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {noLlenaron.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-500 break-all">{u.email}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-gray-400 text-xs">{u.departamento?.nombre ?? "Sin área"}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Completados */}
      {llenaron.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-emerald-50">
            <CheckCircle size={14} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-emerald-700">Han enviado su formulario ({llenaron.length})</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium">Empleado</th>
                <th className="hidden md:table-cell text-left px-4 py-2 font-medium">Puesto declarado</th>
                <th className="text-left px-4 py-2 font-medium">Tareas</th>
                <th className="text-left px-4 py-2 font-medium">Estado</th>
                <th className="hidden md:table-cell text-left px-4 py-2 font-medium">Enviado</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {llenaron.map((u) =>
                u.puestos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{u.nombre}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-600">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.responsabilidades.length} tareas</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                        p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {p.estado === "activo" ? <><CheckCircle size={10} /> Revisado</> :
                         p.estado === "en_proceso" ? <><Clock size={10} /> En revisión</> :
                         "Pendiente"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString("es-MX")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/puestos/${p.id}`} className="text-xs text-blue-600 hover:underline">Revisar →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {usuarios.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          Aún no hay empleados registrados en el sistema.
        </div>
      )}
    </div>
  );
}
