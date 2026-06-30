import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.titulo?.trim() || !b.fecha) return NextResponse.json({ error: "Falta título o fecha" }, { status: 400 });

  const evento = await prisma.evento.create({
    data: {
      titulo: b.titulo,
      fecha: new Date(`${b.fecha}T00:00:00.000Z`),
      hora: b.hora ?? "",
      tipo: b.tipo ?? "evento",
      nota: b.nota ?? "",
    },
  });
  return NextResponse.json(evento);
}
