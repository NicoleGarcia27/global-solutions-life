import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.texto?.trim()) return NextResponse.json({ error: "Escribe algo" }, { status: 400 });

  const nota = await prisma.nota.create({ data: { texto: b.texto.slice(0, 500), color: b.color ?? "amarillo" } });
  return NextResponse.json(nota);
}
