import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const resp = await prisma.responsabilidad.update({
    where: { id: Number(id) },
    data: {
      ...(body.nombre !== undefined && { nombre: body.nombre }),
      ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
      ...(body.recurrencia !== undefined && { recurrencia: body.recurrencia }),
      ...(body.tiempoHoras !== undefined && { tiempoHoras: body.tiempoHoras }),
      ...(body.puestoId !== undefined && { puestoId: body.puestoId }),
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.origen !== undefined && { origen: body.origen }),
    },
  });
  return NextResponse.json(resp);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.responsabilidad.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
