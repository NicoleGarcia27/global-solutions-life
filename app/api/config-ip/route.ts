import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { ipOficina } = await req.json();
  const existente = await prisma.config.findFirst();
  if (existente) {
    await prisma.config.update({ where: { id: existente.id }, data: { ipOficina: ipOficina ?? "" } });
  } else {
    await prisma.config.create({ data: { ipOficina: ipOficina ?? "" } });
  }
  return NextResponse.json({ ok: true });
}
