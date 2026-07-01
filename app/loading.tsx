export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full p-10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: "#00b4d8" }} />
        <p className="text-sm text-gray-400">Cargando…</p>
      </div>
    </div>
  );
}
