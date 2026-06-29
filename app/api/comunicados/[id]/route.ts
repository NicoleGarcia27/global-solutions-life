import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  const c = await prisma.comunicado.update({
    where: { id: Number(id) },
    data: {
      ...(b.titulo !== undefined && { titulo: b.titulo }),
      ...(b.mensaje !== undefined && { mensaje: b.mensaje }),
      ...(b.fijado !== undefined && { fijado: b.fijado }),
    },
  });
  return NextResponse.json(c);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.comunicado.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
