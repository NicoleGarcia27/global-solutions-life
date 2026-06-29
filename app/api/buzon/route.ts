import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint público y anónimo: NO requiere sesión y NO guarda identidad.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const mensaje = (body.mensaje ?? "").trim();
  if (!mensaje) return NextResponse.json({ error: "El mensaje es obligatorio" }, { status: 400 });

  await prisma.queja.create({
    data: {
      tipo: body.tipo ?? "queja",
      area: body.area ?? "",
      mensaje: mensaje.slice(0, 4000),
    },
  });
  return NextResponse.json({ ok: true });
}
