import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AsistenciaClient from "./AsistenciaClient";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ fecha?: string }> };

export default async function AsistenciaPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const { fecha } = await searchParams;
  const hoy = new Date().toISOString().slice(0, 10);
  const dia = fecha ?? hoy;

  const empleados = await prisma.empleado.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
  const registros = await prisma.asistencia.findMany({ where: { fecha: new Date(`${dia}T00:00:00.000Z`) } });
  const config = await prisma.config.findFirst();

  const mapa: Record<number, { estado: string; horaLlegada: string; horaSalida: string; ipLlegada: string; ipSalida: string; origen: string; verificado: boolean }> = {};
  for (const r of registros) mapa[r.empleadoId] = { estado: r.estado, horaLlegada: r.horaLlegada, horaSalida: r.horaSalida, ipLlegada: r.ipLlegada, ipSalida: r.ipSalida, origen: r.origen, verificado: r.verificado };

  return (
    <AsistenciaClient
      dia={dia}
      hoy={hoy}
      ipOficina={config?.ipOficina ?? ""}
      empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre, area: e.area, horaEntrada: e.horaEntrada, registro: mapa[e.id] ?? null }))}
    />
  );
}
