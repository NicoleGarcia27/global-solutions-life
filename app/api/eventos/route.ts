import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { notificar } from "@/lib/notificaciones";

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

  const fechaTxt = new Date(`${b.fecha}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  const tipoTxt = b.tipo === "reunion" ? "Reunión" : b.tipo === "recordatorio" ? "Recordatorio" : b.tipo === "importante" ? "Importante" : "Evento";
  await notificar("evento", `${tipoTxt} agendado: ${evento.titulo}`, `${fechaTxt}${b.hora ? ` · ${b.hora}` : ""}`, "/");
  return NextResponse.json(evento);
}
