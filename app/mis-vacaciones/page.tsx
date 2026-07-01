import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { vacacionesPorLey } from "@/lib/vacaciones";
import MisVacacionesClient from "./MisVacacionesClient";

export const dynamic = "force-dynamic";
const DIAS_ANTICIPACION = 15;

export default async function MisVacacionesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/vacaciones");

  const empleado = await prisma.empleado.findUnique({
    where: { usuarioId: Number(user.id) },
    include: { vacaciones: { orderBy: { fechaInicio: "desc" } } },
  });

  const anio = new Date().getFullYear();
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const minInicio = new Date(new Date(`${ymd}T00:00:00.000Z`).getTime() + DIAS_ANTICIPACION * 86400000).toISOString().slice(0, 10);

  let datos = null;
  if (empleado) {
    const delAnio = empleado.vacaciones.filter((v) => new Date(v.fechaInicio).getFullYear() === anio);
    const tomados = delAnio.filter((v) => v.estado === "aprobada" || v.estado === "tomada").reduce((s, v) => s + v.dias, 0);
    const pendientes = delAnio.filter((v) => v.estado === "solicitada").reduce((s, v) => s + v.dias, 0);
    const corresponden = vacacionesPorLey(empleado.fechaIngreso).dias + (empleado.diasExtra || 0);
    datos = {
      corresponden,
      tomados,
      pendientes,
      disponibles: corresponden - tomados,
      tieneFecha: !!empleado.fechaIngreso,
      solicitudes: empleado.vacaciones.map((v) => ({
        id: v.id,
        fechaInicio: v.fechaInicio.toISOString().slice(0, 10),
        fechaFin: v.fechaFin.toISOString().slice(0, 10),
        dias: v.dias,
        estado: v.estado,
        nota: v.nota,
      })),
    };
  }

  return (
    <MisVacacionesClient
      vinculado={!!empleado}
      minInicio={minInicio}
      diasAnticipacion={DIAS_ANTICIPACION}
      anio={anio}
      datos={datos}
    />
  );
}
