import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const kpi = await prisma.kpi.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json(kpi);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.kpi.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
