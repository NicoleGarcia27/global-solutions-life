import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PuestosPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    // Admin: ve todos los puestos enviados por empleados
    const puestos = await prisma.puesto.findMany({
      include: {
        departamento: true,
        responsabilidades: true,
        kpis: true,
        usuario: { select: { nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Puestos enviados</h1>
            <p className="text-sm text-gray-400 mt-0.5">{puestos.length} formulario{puestos.length !== 1 ? "s" : ""} recibido{puestos.length !== 1 ? "s" : ""} de empleados</p>
          </div>
        </div>

        {puestos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <ClipboardList size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Ningún empleado ha llenado su formulario aún</p>
            <p className="text-gray-400 text-sm mt-1">Cuando los empleados envíen su información, aparecerá aquí</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Puesto</th>
                  <th className="text-left px-4 py-3 font-medium">Empleado</th>
                  <th className="text-left px-4 py-3 font-medium">Departamento</th>
                  <th className="text-left px-4 py-3 font-medium">Tareas</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Enviado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {puestos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.nombre}</p>
                      {p.titular && <p className="text-xs text-gray-400">{p.titular}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs">{p.usuario?.nombre ?? "—"}</p>
                      <p className="text-gray-400 text-xs">{p.usuario?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.departamento.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.responsabilidades.length} tareas</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                        p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {p.estado === "activo" ? "Revisado" : p.estado === "en_proceso" ? "En revisión" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/puestos/${p.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <FileText size={12} /> Revisar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Empleado: ve solo su propio formulario
  const misPuestos = await prisma.puesto.findMany({
    where: { usuarioId: Number(user?.id) },
    include: { departamento: true, responsabilidades: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mi información de puesto</h1>
          <p className="text-sm text-gray-400 mt-0.5">Aquí aparece el formulario que llenaste</p>
        </div>
        {misPuestos.length === 0 && (
          <Link
            href="/puestos/nuevo"
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg"
            style={{ backgroundColor: "#1a3a6b" }}
          >
            <Plus size={16} /> Llenar mi formulario
          </Link>
        )}
      </div>

      {misPuestos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-600 font-medium">Aún no has llenado tu formulario</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Describe tu puesto, tus tareas y actividades para que el área de RH pueda analizarlas</p>
          <Link
            href="/puestos/nuevo"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm rounded-lg font-medium"
            style={{ backgroundColor: "#1a3a6b" }}
          >
            <Plus size={15} /> Llenar mi formulario ahora
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {misPuestos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{p.nombre}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{p.departamento.nombre}</p>
                  {p.objetivo && <p className="text-sm text-gray-600 mt-2">{p.objetivo}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                    p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {p.estado === "activo" ? "Revisado" : p.estado === "en_proceso" ? "En revisión" : "Pendiente de revisión"}
                  </span>
                  <Link href={`/puestos/${p.id}`} className="text-xs text-blue-600 hover:underline">
                    Ver detalle →
                  </Link>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                <span><strong className="text-gray-700">{p.responsabilidades.length}</strong> tareas registradas</span>
                <span>Enviado el <strong className="text-gray-700">{new Date(p.createdAt).toLocaleDateString("es-MX")}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
