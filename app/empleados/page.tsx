import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmpleadosClient from "./EmpleadosClient";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const empleados = await prisma.empleado.findMany({ orderBy: { nombre: "asc" } });
  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });
  const usuarios = await prisma.usuario.findMany({ select: { id: true, nombre: true, email: true }, orderBy: { nombre: "asc" } });

  return (
    <EmpleadosClient
      empleados={empleados.map((e) => ({
        id: e.id, nombre: e.nombre, puesto: e.puesto, area: e.area, tipo: e.tipo,
        factura: e.factura, sueldoActual: e.sueldoActual,
        fechaIngreso: e.fechaIngreso ? e.fechaIngreso.toISOString() : null, activo: e.activo,
        usuarioId: e.usuarioId,
      }))}
      departamentos={departamentos.map((d) => d.nombre)}
      usuarios={usuarios}
    />
  );
}
