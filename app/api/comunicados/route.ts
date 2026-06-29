import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.titulo?.trim() || !b.mensaje?.trim()) return NextResponse.json({ error: "Falta título o mensaje" }, { status: 400 });

  const c = await prisma.comunicado.create({
    data: {
      titulo: b.titulo,
      mensaje: b.mensaje,
      fijado: b.fijado ?? false,
      autor: (token.name as string) ?? "Administración",
    },
  });
  return NextResponse.json(c);
}
