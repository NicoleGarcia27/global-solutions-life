"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f4f8" }}>
      {/* Panel izquierdo azul marino */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12" style={{ backgroundColor: "#1a3a6b" }}>
        <div className="text-center">
          <img src="/logo-g.png" alt="GSL Logo" className="w-40 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-2">Global Solutions Life</h1>
          <p className="text-lg mb-1" style={{ color: "#00b4d8" }}>Consultoría en Seguros & Inversiones</p>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-white/60 text-sm">Sistema Institucional de</p>
            <p className="text-white font-semibold text-lg">Gestión de Puestos & KPIs</p>
          </div>
        </div>
      </div>

      {/* Panel derecho login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-6">
            <img src="/logo-g.png" alt="GSL Logo" className="w-20 mx-auto mb-3" />
            <h1 className="text-xl font-bold" style={{ color: "#1a3a6b" }}>Global Solutions Life</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a3a6b" }}>Bienvenida</h2>
          <p className="text-gray-500 text-sm mb-8">Inicia sesión para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={{ borderColor: email ? "#00b4d8" : "" }}
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition disabled:opacity-50 text-white"
              style={{ backgroundColor: "#1a3a6b" }}
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
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
