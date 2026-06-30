import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const file = readFileSync(join(process.cwd(), "public", "mascota-gsl.png"));
    return new NextResponse(file, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
