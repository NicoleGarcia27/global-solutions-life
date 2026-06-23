import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsuariosAdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const usuarios = await prisma.usuario.findMany({
    include: { departamento: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Usuarios registrados</h1>
      <p className="text-gray-500 text-sm mb-6">Todas las personas que han creado cuenta en el sistema.</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Correo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Área</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.departamento?.nombre ?? <span className="text-gray-400 italic">Sin área</span>}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.role === "admin" ? "Administradora" : "Usuario"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("es-MX")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && (
          <p className="text-center text-gray-400 py-8">No hay usuarios registrados aún.</p>
        )}
      </div>
    </div>
  );
}
