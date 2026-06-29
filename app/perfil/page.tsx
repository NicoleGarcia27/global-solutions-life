import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const puestos = await prisma.puesto.findMany({
    include: { departamento: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Perfil de puesto</h1>
      <p className="text-sm text-gray-500">Selecciona un puesto para ver o editar su perfil completo.</p>

      <div className="grid grid-cols-2 gap-3">
        {puestos.map((p) => (
          <Link
            key={p.id}
            href={`/puestos/${p.id}`}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#00b4d8] hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e6f8fc" }}>
                <FileText size={16} style={{ color: "#00b4d8" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.departamento?.nombre ?? "Sin área"} · {p.codigo}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                p.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                p.estado === "en_proceso" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-400"
              }`}>
                {p.estado === "activo" ? "Activo" : p.estado === "en_proceso" ? "En proceso" : "Pendiente"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
