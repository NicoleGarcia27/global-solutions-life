import { prisma } from "@/lib/prisma";
import NuevoPuestoForm from "@/components/NuevoPuestoForm";

export const dynamic = "force-dynamic";

export default async function NuevoPuesto() {
  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Nuevo puesto</h1>
      <NuevoPuestoForm departamentos={departamentos} />
    </div>
  );
}
