import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { notificar } from "@/lib/notificaciones";
import { vacacionesPorLey, aniosServicio } from "@/lib/vacaciones";

export const dynamic = "force-dynamic";

// Tarea diaria: avisa de los eventos de hoy y de cumpleaños de antigüedad.
export async function GET(req: NextRequest) {
  // Verificación opcional del secreto del cron (si está configurado en Vercel)
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const fecha = new Date(`${ymd}T00:00:00.000Z`);
  const [, mm, dd] = ymd.split("-");

  // 1) Eventos de hoy — solo del calendario de los administradores.
  // Los eventos de los empleados son privados y no deben avisar en la campana del admin.
  const admins = await prisma.usuario.findMany({ where: { role: "admin" }, select: { id: true } });
  const adminIds = admins.map((a) => a.id);
  const eventosHoy = await prisma.evento.findMany({ where: { fecha, avisado: false, usuarioId: { in: adminIds } } });
  for (const e of eventosHoy) {
    await notificar("evento", `Hoy: ${e.titulo}`, e.hora ? `A las ${e.hora}` : "Durante el día", "/");
    await prisma.evento.update({ where: { id: e.id }, data: { avisado: true } });
  }

  // 2) Aniversarios de ingreso (cumplen un año más de servicio hoy)
  const empleados = await prisma.empleado.findMany({ where: { activo: true, fechaIngreso: { not: null } } });
  let aniversarios = 0;
  for (const emp of empleados) {
    const ing = emp.fechaIngreso!;
    const im = pad(ing.getUTCMonth() + 1);
    const idd = pad(ing.getUTCDate());
    if (im === mm && idd === dd) {
      const anios = aniosServicio(ing);
      if (anios >= 1) {
        const dias = vacacionesPorLey(ing).dias;
        await notificar("vacaciones", `Aniversario: ${emp.nombre} cumple ${anios} ${anios === 1 ? "año" : "años"}`, `Le corresponden ${dias} días de vacaciones (Art. 76 LFT).`, `/empleados/${emp.id}`);
        aniversarios++;
      }
    }
  }

  return NextResponse.json({ ok: true, eventos: eventosHoy.length, aniversarios });
}

function pad(n: number) { return String(n).padStart(2, "0"); }
