import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();
  if (!b.fechaInicio || !b.fechaFin) return NextResponse.json({ error: "Faltan fechas" }, { status: 400 });

  await prisma.vacacion.create({
    data: {
      empleadoId: Number(id),
      fechaInicio: new Date(b.fechaInicio),
      fechaFin: new Date(b.fechaFin),
      dias: Number(b.dias) || 1,
      estado: b.estado ?? "aprobada",
      nota: b.nota ?? "",
    },
  });
  return NextResponse.json({ ok: true });
}
