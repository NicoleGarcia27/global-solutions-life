import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export default async function ImprimirPuesto({ params }: Props) {
  const { id } = await params;
  const p = await prisma.puesto.findUnique({
    where: { id: Number(id) },
    include: { departamento: true, responsabilidades: { orderBy: { orden: "asc" } }, usuario: { select: { nombre: true } } },
  });
  if (!p) notFound();

  const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <title>Descriptor de Puesto — {p.nombre}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: white; }
          .page { max-width: 800px; margin: 0 auto; padding: 30px 40px; }
          .header { border-bottom: 3px solid #1a3a6b; padding-bottom: 16px; margin-bottom: 20px; }
          .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
          .empresa { font-size: 10pt; color: #00b4d8; font-weight: bold; }
          .titulo { font-size: 18pt; font-weight: bold; color: #1a3a6b; margin-top: 4px; }
          .subtitulo { font-size: 10pt; color: #666; margin-top: 2px; }
          .meta { font-size: 9pt; color: #888; text-align: right; }
          .seccion { margin-bottom: 18px; }
          .seccion-titulo { background: #1a3a6b; color: white; padding: 5px 10px; font-size: 10pt; font-weight: bold; margin-bottom: 8px; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
          .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 16px; }
          .campo label { font-size: 8pt; color: #888; display: block; }
          .campo p { font-size: 10pt; color: #1a1a1a; margin-top: 1px; }
          .tarea { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 10px; margin-bottom: 6px; }
          .tarea-num { font-size: 8pt; color: #888; }
          .tarea-nombre { font-size: 10pt; font-weight: bold; color: #1a3a6b; }
          .tarea-desc { font-size: 9pt; color: #555; margin-top: 3px; }
          .tarea-meta { font-size: 8pt; color: #888; margin-top: 4px; }
          .obs { background: #fef9c3; border-left: 3px solid #f59e0b; padding: 8px 10px; font-size: 9pt; color: #555; margin-bottom: 6px; }
          .notas-admin { background: #eff6ff; border-left: 3px solid #1a3a6b; padding: 8px 10px; font-size: 9pt; color: #1a3a6b; }
          .firma { display: grid; grid-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 50px; }
          .firma-linea { border-top: 1px solid #333; padding-top: 4px; font-size: 9pt; text-align: center; }
          .print-btn { position: fixed; top: 20px; right: 20px; background: #1a3a6b; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 12px; cursor: pointer; }
          @media print { .print-btn { display: none; } body { font-size: 10pt; } .page { padding: 15px 20px; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
        <div className="page">
          {/* Header */}
          <div className="header">
            <div className="header-top">
              <div>
                <div className="empresa">GLOBAL SOLUTIONS LIFE</div>
                <div className="titulo">{p.nombre}</div>
                <div className="subtitulo">{p.departamento?.nombre ?? "Sin área"} {p.codigo && `· Código: ${p.codigo}`}</div>
              </div>
              <div className="meta">
                <div>Fecha: {fecha}</div>
                {p.usuario && <div>Elaboró: {p.usuario.nombre}</div>}
                <div>Estado: {p.estado === "activo" ? "Revisado" : p.estado === "en_proceso" ? "En revisión" : "Pendiente"}</div>
              </div>
            </div>
          </div>

          {/* Datos generales */}
          <div className="seccion">
            <div className="seccion-titulo">I. IDENTIFICACIÓN DEL PUESTO</div>
            <div className="grid3">
              {p.titular && <div className="campo"><label>Titular</label><p>{p.titular}</p></div>}
              {p.reportaA && <div className="campo"><label>Reporta a</label><p>{p.reportaA}</p></div>}
              {p.supervisaA && <div className="campo"><label>Supervisa a</label><p>{p.supervisaA}</p></div>}
              <div className="campo"><label>Horario</label><p>{p.horario}</p></div>
              <div className="campo"><label>Escolaridad requerida</label><p>{p.escolaridad}</p></div>
              {p.experiencia && <div className="campo"><label>Experiencia</label><p>{p.experiencia}</p></div>}
              <div className="campo"><label>Rango de edad</label><p>{p.edadMin}–{p.edadMax} años</p></div>
              <div className="campo"><label>Tiempo de adaptación</label><p>{p.tiempoAdaptacion}</p></div>
              <div className="campo"><label>Periodicidad de medición</label><p>{p.periodicidad}</p></div>
            </div>
            {p.objetivo && <div className="campo" style={{marginTop: 10}}><label>Objetivo del puesto</label><p>{p.objetivo}</p></div>}
          </div>

          {/* Tareas */}
          {p.responsabilidades.length > 0 && (
            <div className="seccion">
              <div className="seccion-titulo">II. TAREAS Y ACTIVIDADES ({p.responsabilidades.length})</div>
              {p.responsabilidades.map((r, i) => (
                <div key={r.id} className="tarea">
                  <div className="tarea-num">Tarea {i + 1}</div>
                  <div className="tarea-nombre">{r.nombre}</div>
                  {r.descripcion && <div className="tarea-desc">{r.descripcion}</div>}
                  <div className="tarea-meta">Frecuencia: {r.recurrencia} · Tiempo estimado: {r.tiempoHoras}h</div>
                </div>
              ))}
            </div>
          )}

          {/* Personal a cargo */}
          {p.tienePersonal && (
            <div className="seccion">
              <div className="seccion-titulo">III. PERSONAL A CARGO</div>
              <div className="grid2">
                {p.numPersonasACargo && <div className="campo"><label>Número de personas</label><p>{p.numPersonasACargo}</p></div>}
                {p.autoridadSobre && <div className="campo"><label>Autoridad sobre el personal</label><p>{p.autoridadSobre}</p></div>}
              </div>
              {p.comoSupervisa && <div className="campo" style={{marginTop:8}}><label>¿Cómo supervisa?</label><p>{p.comoSupervisa}</p></div>}
              {p.comoAudita && <div className="campo" style={{marginTop:8}}><label>¿Cómo audita?</label><p>{p.comoAudita}</p></div>}
              {p.comoEvalua && <div className="campo" style={{marginTop:8}}><label>¿Cómo evalúa?</label><p>{p.comoEvalua}</p></div>}
            </div>
          )}

          {/* Relaciones */}
          {(p.internoConQuien || p.externoConQuien) && (
            <div className="seccion">
              <div className="seccion-titulo">IV. RELACIONES DE TRABAJO</div>
              {p.internoConQuien && <div className="campo"><label>Relaciones internas</label><p>{p.internoConQuien}</p></div>}
              {p.externoConQuien && <div className="campo" style={{marginTop:8}}><label>Relaciones externas</label><p>{p.externoConQuien}</p></div>}
            </div>
          )}

          {/* Documentos y decisiones */}
          {(p.documentosQueGenera || p.decisionesIndependientes || p.decisionesConAutorizacion) && (
            <div className="seccion">
              <div className="seccion-titulo">V. DOCUMENTOS Y NIVEL DE DECISIÓN</div>
              {p.documentosQueGenera && <div className="campo"><label>Documentos que genera</label><p>{p.documentosQueGenera}</p></div>}
              {p.decisionesIndependientes && <div className="campo" style={{marginTop:8}}><label>Decisiones independientes</label><p>{p.decisionesIndependientes}</p></div>}
              {p.decisionesConAutorizacion && <div className="campo" style={{marginTop:8}}><label>Decisiones con autorización</label><p>{p.decisionesConAutorizacion}</p></div>}
            </div>
          )}

          {/* Herramientas y formación */}
          {(p.herramientas || p.formacion || p.competencias) && (
            <div className="seccion">
              <div className="seccion-titulo">VI. PERFIL Y HERRAMIENTAS</div>
              {p.herramientas && <div className="campo"><label>Herramientas de trabajo</label><p>{p.herramientas}</p></div>}
              {p.formacion && <div className="campo" style={{marginTop:8}}><label>Formación deseable</label><p>{p.formacion}</p></div>}
              {p.competencias && <div className="campo" style={{marginTop:8}}><label>Competencias requeridas</label><p>{p.competencias}</p></div>}
            </div>
          )}

          {/* Observaciones */}
          {(p.tareasNoCorresponden || p.tareasQueNadieHace || p.problemasFrecuentes) && (
            <div className="seccion">
              <div className="seccion-titulo">VII. OBSERVACIONES DEL EMPLEADO</div>
              {p.tareasNoCorresponden && <div className="obs"><strong>Tareas que considera que no le corresponden:</strong> {p.tareasNoCorresponden}</div>}
              {p.tareasQueNadieHace && <div className="obs"><strong>Tareas que nadie hace:</strong> {p.tareasQueNadieHace}</div>}
              {p.problemasFrecuentes && <div className="obs"><strong>Problemas frecuentes:</strong> {p.problemasFrecuentes}</div>}
            </div>
          )}

          {/* Notas admin */}
          {p.adminNotas && (
            <div className="seccion">
              <div className="seccion-titulo">VIII. NOTAS DE AUDITORÍA</div>
              <div className="notas-admin">{p.adminNotas}</div>
            </div>
          )}

          {/* Firmas */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:40, marginTop:50}}>
            <div className="firma-linea">Titular del puesto</div>
            <div className="firma-linea">Revisó: RH / Dirección</div>
            <div className="firma-linea">Autorizó</div>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn').addEventListener('click', function() { window.print(); });
        `}} />
      </body>
    </html>
  );
}
