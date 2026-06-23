"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departamentos").then((r) => r.json()).then(setDepartamentos);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, departamentoId: departamentoId || null }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al registrarse");
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f4f8" }}>
      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12" style={{ backgroundColor: "#1a3a6b" }}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 text-5xl font-black" style={{ backgroundColor: "#00b4d8", color: "#fff" }}>
            G
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Global Solutions Life</h1>
          <p className="text-lg mb-1" style={{ color: "#00b4d8" }}>Consultoría en Seguros & Inversiones</p>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-white/60 text-sm">Sistema Institucional de</p>
            <p className="text-white font-semibold text-lg">Gestión de Puestos & KPIs</p>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "#1a3a6b" }}>Crear cuenta</h2>
          <p className="text-gray-500 text-sm mb-8">Completa tu información para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Nombre completo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a3a6b" }}>Área / Departamento</label>
              <select
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"
              >
                <option value="">Selecciona tu área (opcional)</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#00b4d8" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
