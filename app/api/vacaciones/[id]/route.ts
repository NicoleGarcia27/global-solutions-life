import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

const ESTADOS = ["solicitada", "aprobada", "rechazada", "tomada"];

// RH aprueba o rechaza una solicitud.
export async function PATCH(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (!ESTADOS.includes(b.estado)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  await prisma.vacacion.update({ where: { id: Number(id) }, data: { estado: b.estado } });
  return NextResponse.json({ ok: true });
}

// Admin borra cualquier registro; el empleado solo puede cancelar su propia solicitud pendiente.
export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  if (token.role === "admin") {
    await prisma.vacacion.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  }

  const vac = await prisma.vacacion.findUnique({ where: { id: Number(id) }, include: { empleado: true } });
  if (!vac || vac.empleado.usuarioId !== Number(token.sub) || vac.estado !== "solicitada") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await prisma.vacacion.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
