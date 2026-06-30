import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const b = await req.json();
  const data: { ipOficina?: string; minutosComida?: number } = {};
  if (b.ipOficina !== undefined) data.ipOficina = b.ipOficina;
  if (b.minutosComida !== undefined) data.minutosComida = Number(b.minutosComida) || 0;

  const existente = await prisma.config.findFirst();
  if (existente) {
    await prisma.config.update({ where: { id: existente.id }, data });
  } else {
    await prisma.config.create({ data });
  }
  return NextResponse.json({ ok: true });
}
