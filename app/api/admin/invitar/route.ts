import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, email } = await req.json();
  if (!nombre || !email) return NextResponse.json({ error: "Nombre y correo requeridos" }, { status: 400 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const url = process.env.NEXTAUTH_URL ?? "https://global-solutions-life.vercel.app";

  const { error } = await resend.emails.send({
    from: "Global Solutions Life <onboarding@resend.dev>",
    to: email,
    subject: "Invitación — Sistema de Gestión de Puestos GSL",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;">
        <div style="background:#1a3a6b;padding:20px 24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">Global Solutions Life</h1>
          <p style="color:#00b4d8;margin:4px 0 0;font-size:13px;">Sistema Institucional de Gestión de Puestos</p>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p style="color:#374151;font-size:15px;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            Has sido invitado/a a registrarte en el sistema institucional de Global Solutions Life.
            Por favor accede al siguiente enlace, crea tu cuenta y llena la información de tu puesto.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${url}/registro" style="background:#1a3a6b;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
              Crear mi cuenta →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;">
            Si tienes algún problema, contacta a tu área de Recursos Humanos.
          </p>
        </div>
      </div>
    `,
  });

  if (error) return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
