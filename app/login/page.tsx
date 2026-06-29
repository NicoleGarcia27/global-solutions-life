"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#eef2f7" }}>
      {/* Panel izquierdo — institucional */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: "linear-gradient(150deg, #14305a 0%, #1a3a6b 55%, #1e4a86 100%)" }}
      >
        {/* Glow decorativo */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,180,216,0.22), transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,180,216,0.12), transparent 70%)" }} />
        {/* Marca de agua del logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/api/logo" alt="" className="absolute -right-16 -bottom-10 opacity-[0.06] pointer-events-none select-none" style={{ width: 420, height: 420, objectFit: "contain" }} />

        <div className="relative text-center z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/logo" alt="GSL" width={150} height={150} className="mx-auto mb-6 drop-shadow-lg" style={{ objectFit: "contain" }} />
          <h1 className="text-4xl font-black text-white tracking-tight">Global Solutions Life</h1>
          <p className="text-lg mt-2" style={{ color: "#00b4d8" }}>Consultoría en Seguros &amp; Inversiones</p>
          <div className="mt-10 mx-auto w-16 border-t border-white/20" />
          <p className="text-white/50 text-sm mt-8 uppercase tracking-[3px]">Sistema Institucional de</p>
          <p className="text-white font-semibold text-lg mt-1">Gestión de Puestos &amp; KPIs</p>
        </div>

        <p className="absolute bottom-6 text-center text-white/35 text-xs w-full left-0">
          © {new Date().getFullYear()} Global Solutions Life · Todos los derechos reservados
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-12px_rgba(26,58,107,0.25)] p-9 w-full max-w-md border border-gray-100">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/logo" alt="GSL" width={68} height={68} className="mx-auto mb-2" style={{ objectFit: "contain" }} />
            <h1 className="text-lg font-bold" style={{ color: "#1a3a6b" }}>Global Solutions Life</h1>
          </div>

          <h2 className="text-2xl font-bold" style={{ color: "#1a3a6b" }}>Bienvenida</h2>
          <p className="text-gray-400 text-sm mb-7">Inicia sesión para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#1a3a6b" }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#00b4d8] transition"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#1a3a6b" }}>Contraseña</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#00b4d8] transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-white shadow-lg shadow-[#1a3a6b]/20 hover:brightness-110"
              style={{ backgroundColor: "#1a3a6b" }}
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-7">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold hover:underline" style={{ color: "#00b4d8" }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
