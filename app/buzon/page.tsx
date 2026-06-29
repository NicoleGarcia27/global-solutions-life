import { prisma } from "@/lib/prisma";
import BuzonForm from "./BuzonForm";

export const dynamic = "force-dynamic";

export default async function BuzonPage() {
  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });
  return <BuzonForm departamentos={departamentos.map((d) => d.nombre)} />;
}
