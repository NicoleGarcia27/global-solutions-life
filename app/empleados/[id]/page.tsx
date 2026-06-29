import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EmpleadoDetalle from "./EmpleadoDetalle";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export default async function EmpleadoPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const { id } = await params;
  const e = await prisma.empleado.findUnique({
    where: { id: Number(id) },
    include: {
      incrementos: { orderBy: { fecha: "desc" } },
      vacaciones: { orderBy: { fechaInicio: "desc" } },
    },
  });
  if (!e) notFound();

  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });

  return (
    <EmpleadoDetalle
      empleado={{
        id: e.id, nombre: e.nombre, puesto: e.puesto, area: e.area, tipo: e.tipo,
        factura: e.factura, sueldoActual: e.sueldoActual, correo: e.correo, telefono: e.telefono,
        notas: e.notas, activo: e.activo, diasVacaciones: e.diasVacaciones,
        fechaIngreso: e.fechaIngreso ? e.fechaIngreso.toISOString().slice(0, 10) : "",
      }}
      incrementos={e.incrementos.map((i) => ({
        id: i.id, fecha: i.fecha.toISOString(), sueldoNuevo: i.sueldoNuevo, porcentaje: i.porcentaje, nota: i.nota,
      }))}
      vacaciones={e.vacaciones.map((v) => ({
        id: v.id, fechaInicio: v.fechaInicio.toISOString(), fechaFin: v.fechaFin.toISOString(), dias: v.dias, estado: v.estado, nota: v.nota,
      }))}
      departamentos={departamentos.map((d) => d.nombre)}
    />
  );
}
