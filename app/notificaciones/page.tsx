import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificacionesClient from "./NotificacionesClient";

export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const items = await prisma.notificacion.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  // Marca todas como leídas al abrir el centro
  await prisma.notificacion.updateMany({ where: { leida: false }, data: { leida: true } });

  return (
    <NotificacionesClient
      items={items.map((n) => ({ id: n.id, tipo: n.tipo, titulo: n.titulo, mensaje: n.mensaje, link: n.link, leida: n.leida, createdAt: n.createdAt.toISOString() }))}
    />
  );
}
