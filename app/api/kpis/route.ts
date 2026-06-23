import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const kpi = await prisma.kpi.create({
    data: {
      area: body.area,
      metrica: body.metrica,
      meta: body.meta,
      actual: body.actual ?? "",
      unidad: body.unidad ?? "%",
      frecuencia: body.frecuencia ?? "Mensual",
      estado: "pendiente",
      puestoId: body.puestoId,
    },
  });
  return NextResponse.json(kpi);
}
