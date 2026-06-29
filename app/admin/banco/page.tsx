import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BancoClient from "./BancoClient";

export const dynamic = "force-dynamic";

export default async function BancoPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const tareas = await prisma.responsabilidad.findMany({
    where: { puestoId: null },
    orderBy: { id: "desc" },
  });

  const puestos = await prisma.puesto.findMany({
    select: { id: true, nombre: true, titular: true, usuario: { select: { nombre: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <BancoClient
      tareas={tareas.map((t) => ({
        id: t.id, nombre: t.nombre, descripcion: t.descripcion,
        recurrencia: t.recurrencia, tiempoHoras: t.tiempoHoras, origen: t.origen,
      }))}
      puestos={puestos.map((p) => ({ id: p.id, nombre: p.nombre, titular: p.titular, usuarioNombre: p.usuario?.nombre ?? null }))}
    />
  );
}
