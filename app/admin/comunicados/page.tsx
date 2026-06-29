import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ComunicadosClient from "./ComunicadosClient";

export const dynamic = "force-dynamic";

export default async function AdminComunicadosPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const comunicados = await prisma.comunicado.findMany({
    orderBy: [{ fijado: "desc" }, { createdAt: "desc" }],
  });

  return (
    <ComunicadosClient
      comunicados={comunicados.map((c) => ({
        id: c.id, titulo: c.titulo, mensaje: c.mensaje, fijado: c.fijado, autor: c.autor,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
