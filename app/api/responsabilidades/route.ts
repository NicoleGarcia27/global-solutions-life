import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const resp = await prisma.responsabilidad.create({
    data: {
      nombre: body.nombre,
      tiempoHoras: body.tiempoHoras ?? 1,
      recurrencia: body.recurrencia ?? "Mensual",
      nivel: body.nivel ?? "Medio",
      orden: body.orden ?? 0,
      puestoId: body.puestoId,
    },
  });
  return NextResponse.json(resp);
}
