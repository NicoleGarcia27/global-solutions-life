import { prisma } from "./prisma";

// Crea una notificación para el panel de administración. No revienta si falla.
export async function notificar(tipo: string, titulo: string, mensaje = "", link = "") {
  try {
    await prisma.notificacion.create({ data: { tipo, titulo, mensaje: mensaje.slice(0, 300), link } });
  } catch {
    /* no-op */
  }
}
