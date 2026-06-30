import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  // Solo puede borrar sus propias notas
  await prisma.nota.deleteMany({ where: { id: Number(id), usuarioId: Number(token.sub) } });
  return NextResponse.json({ ok: true });
}
