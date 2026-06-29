// Cálculo de vacaciones según Art. 76 LFT (reforma "Vacaciones Dignas")
// Año 1 = 12 días; +2 por año hasta 20 (año 5); a partir del 6º, +2 por cada 5 años.

export function aniosServicio(fechaIngreso: Date, ref: Date = new Date()): number {
  let anios = ref.getFullYear() - fechaIngreso.getFullYear();
  const m = ref.getMonth() - fechaIngreso.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < fechaIngreso.getDate())) anios--;
  return Math.max(0, anios);
}

export function diasVacacionesLey(anios: number): number {
  if (anios < 1) return 0;        // El derecho al periodo anual aplica al cumplir 1 año
  if (anios <= 5) return 12 + (anios - 1) * 2; // 1→12, 2→14, 3→16, 4→18, 5→20
  return 20 + Math.floor((anios - 1) / 5) * 2; // 6-10→22, 11-15→24, 16-20→26...
}

// Devuelve los días que le corresponden hoy + contexto, a partir de la fecha de ingreso.
export function vacacionesPorLey(fechaIngreso: string | Date | null): {
  dias: number; anios: number; tieneFecha: boolean; cumplePrimerAnio: Date | null;
} {
  if (!fechaIngreso) return { dias: 0, anios: 0, tieneFecha: false, cumplePrimerAnio: null };
  const ing = new Date(fechaIngreso);
  const anios = aniosServicio(ing);
  const cumple = new Date(ing); cumple.setFullYear(ing.getFullYear() + 1);
  return { dias: diasVacacionesLey(anios), anios, tieneFecha: true, cumplePrimerAnio: cumple };
}

function masMeses(d: Date, meses: number): Date {
  const r = new Date(d); r.setMonth(r.getMonth() + meses); return r;
}

// Ventana legal (Art. 81): se activan al aniversario y deben otorgarse dentro de 6 meses.
export function ventanaVacaciones(fechaIngreso: string | Date | null, ref: Date = new Date()): {
  activadas: boolean; fecha: Date; limite: Date;
} | null {
  if (!fechaIngreso) return null;
  const ing = new Date(fechaIngreso);
  const anios = aniosServicio(ing, ref);
  if (anios < 1) {
    const primer = new Date(ing); primer.setFullYear(ing.getFullYear() + 1);
    return { activadas: false, fecha: primer, limite: masMeses(primer, 6) };
  }
  const ultima = new Date(ing); ultima.setFullYear(ing.getFullYear() + anios);
  return { activadas: true, fecha: ultima, limite: masMeses(ultima, 6) };
}
