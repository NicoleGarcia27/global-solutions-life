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

  const [empleados, registros, config] = await Promise.all([
    prisma.empleado.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.asistencia.findMany({ where: { fecha: new Date(`${dia}T00:00:00.000Z`) } }),
    prisma.config.findFirst(),
  ]);

  const mapa: Record<number, { estado: string; horaLlegada: string; horaSalida: string; comidaInicio: string; comidaFin: string; ipLlegada: string; ipSalida: string; origen: string; verificado: boolean }> = {};
  for (const r of registros) mapa[r.empleadoId] = { estado: r.estado, horaLlegada: r.horaLlegada, horaSalida: r.horaSalida, comidaInicio: r.comidaInicio, comidaFin: r.comidaFin, ipLlegada: r.ipLlegada, ipSalida: r.ipSalida, origen: r.origen, verificado: r.verificado };

  return (
    <AsistenciaClient
      dia={dia}
      hoy={hoy}
      ipOficina={config?.ipOficina ?? ""}
      minutosComida={config?.minutosComida ?? 60}
      empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre, area: e.area, horaEntrada: e.horaEntrada, registro: mapa[e.id] ?? null }))}
    />
  );
}
