import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChecadorClient from "./ChecadorClient";

export const dynamic = "force-dynamic";

export default async function ChecadorPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) redirect("/login");

  const empleado = await prisma.empleado.findUnique({ where: { usuarioId: Number(user.id) } });

  const fechaStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  let registro = null;
  if (empleado) {
    const r = await prisma.asistencia.findUnique({
      where: { empleadoId_fecha: { empleadoId: empleado.id, fecha: new Date(`${fechaStr}T00:00:00.000Z`) } },
    });
    if (r) registro = { estado: r.estado, horaLlegada: r.horaLlegada, horaSalida: r.horaSalida, comidaInicio: r.comidaInicio, comidaFin: r.comidaFin, ipLlegada: r.ipLlegada, ipSalida: r.ipSalida };
  }
  const config = await prisma.config.findFirst();

  return (
    <ChecadorClient
      nombre={user.name ?? "Empleado"}
      vinculado={!!empleado}
      horaEntrada={empleado?.horaEntrada ?? "09:00"}
      minutosComida={config?.minutosComida ?? 60}
      registro={registro}
    />
  );
}
