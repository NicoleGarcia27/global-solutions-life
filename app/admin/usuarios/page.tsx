import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsuariosAdminClient from "./UsuariosAdminClient";

export const dynamic = "force-dynamic";

export default async function UsuariosAdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const usuarios = await prisma.usuario.findMany({
    include: { departamento: true },
    orderBy: { createdAt: "asc" },
  });

  return <UsuariosAdminClient usuarios={usuarios} />;
}
