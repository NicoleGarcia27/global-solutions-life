import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { notificar } from "@/lib/notificaciones";

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
  const etiqueta = body.tipo === "sugerencia" ? "sugerencia" : body.tipo === "reconocimiento" ? "reconocimiento" : "queja";
  await notificar("buzon", `Nuevo mensaje en el buzón (${etiqueta})`, mensaje, "/admin/buzon");
  return NextResponse.json({ ok: true });
}
