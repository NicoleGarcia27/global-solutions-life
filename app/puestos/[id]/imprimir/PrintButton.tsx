"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        position: "fixed", top: 20, right: 20, background: "#1a3a6b", color: "white",
        border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer", zIndex: 50,
      }}
      className="no-print"
    >
      🖨️ Imprimir / Guardar PDF
    </button>
  );
}
