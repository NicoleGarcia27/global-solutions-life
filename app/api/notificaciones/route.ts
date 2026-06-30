import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// GET: lista + conteo de no leídas (solo admin)
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ items: [], noLeidas: 0 }, { status: 401 });

  const items = await prisma.notificacion.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const noLeidas = await prisma.notificacion.count({ where: { leida: false } });
  return NextResponse.json({ items, noLeidas });
}

// POST: marcar todas como leídas
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.notificacion.updateMany({ where: { leida: false }, data: { leida: true } });
  return NextResponse.json({ ok: true });
}
