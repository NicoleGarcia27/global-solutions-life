import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

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
  const estado = p.estado === "activo" ? "Aprobado" : p.estado === "en_proceso" ? "En revisión" : "Pendiente";
  const dash = "—";

  return (
    <div className="doc-root">
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        .doc-root { background:#fff; color:#222; font-family: Arial, Helvetica, sans-serif; font-size:10pt; line-height:1.35; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .page { max-width:820px; margin:0 auto; padding:24px 32px 40px; }

        .doc-header { width:100%; border-collapse:collapse; margin-bottom:4px; }
        .doc-header td { border:1px solid #1a3a6b; padding:8px 10px; vertical-align:middle; }
        .dh-logo { width:120px; text-align:center; }
        .dh-logo img { width:64px; height:64px; object-fit:contain; }
        .dh-logo .emp { font-size:6.5pt; color:#1a3a6b; font-weight:bold; margin-top:4px; letter-spacing:.5px; }
        .dh-center { text-align:center; }
        .dh-center .doc-type { font-size:8pt; letter-spacing:3px; color:#00b4d8; font-weight:bold; }
        .dh-center .doc-name { font-size:15pt; font-weight:bold; color:#1a3a6b; margin-top:2px; }
        .dh-center .doc-dep { font-size:8.5pt; color:#777; margin-top:2px; }
        .dh-right { width:175px; font-size:8pt; color:#555; line-height:1.6; }
        .dh-right b { color:#1a3a6b; }

        .sec-bar { background:#1a3a6b; color:#fff; font-size:9.5pt; font-weight:bold; padding:4px 10px; letter-spacing:.5px; margin-top:14px; }

        .info { width:100%; border-collapse:collapse; }
        .info td { border:1px solid #d4d9e0; padding:5px 9px; font-size:9.5pt; vertical-align:top; }
        .info td.lbl { background:#eef2f7; color:#54627a; font-weight:bold; width:135px; font-size:8.3pt; text-transform:uppercase; letter-spacing:.3px; }

        .tasks { width:100%; border-collapse:collapse; }
        .tasks th { background:#1a3a6b; color:#fff; font-size:8.3pt; padding:5px 7px; text-align:left; text-transform:uppercase; letter-spacing:.3px; }
        .tasks td { border:1px solid #d4d9e0; padding:5px 7px; font-size:9pt; vertical-align:top; }
        .tasks td.num { text-align:center; width:26px; color:#888; font-weight:bold; }
        .tasks td.act { width:30%; font-weight:bold; color:#1a3a6b; }
        .tasks td.freq { width:72px; text-align:center; }
        .tasks td.time { width:48px; text-align:center; }

        .obs-row td { border:1px solid #d4d9e0; padding:5px 9px; font-size:9.3pt; vertical-align:top; }
        .obs-row td.lbl { background:#fff7e6; color:#92660a; font-weight:bold; width:200px; font-size:8.3pt; }

        .firmas { width:100%; border-collapse:collapse; margin-top:38px; }
        .firmas td { text-align:center; font-size:8.5pt; color:#444; width:33.33%; padding:0 14px; }
        .firmas .line { border-top:1px solid #333; padding-top:5px; }
        .firmas .role { color:#888; font-size:7.5pt; margin-top:2px; }

        .foot { margin-top:24px; border-top:1px solid #d4d9e0; padding-top:6px; font-size:7.5pt; color:#999; display:flex; justify-content:space-between; }

        @media print { .no-print{ display:none !important; } .page{ padding:0; } @page{ margin:14mm; } }
      `}</style>

      <PrintButton />

      <div className="page">
        {/* Encabezado institucional */}
        <table className="doc-header">
          <tbody>
            <tr>
              <td className="dh-logo" rowSpan={1}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/api/logo" alt="GSL" />
                <div className="emp">GLOBAL SOLUTIONS LIFE</div>
              </td>
              <td className="dh-center">
                <div className="doc-type">DESCRIPCIÓN DE PUESTO</div>
                <div className="doc-name">{p.nombre}</div>
                <div className="doc-dep">{p.departamento?.nombre ?? "Sin área asignada"}</div>
              </td>
              <td className="dh-right">
                <div><b>Código:</b> {p.codigo || dash}</div>
                <div><b>Versión:</b> 1</div>
                <div><b>Fecha:</b> {fecha}</div>
                <div><b>Estado:</b> {estado}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* I. Identificación */}
        <div className="sec-bar">I.&nbsp;&nbsp;IDENTIFICACIÓN DEL PUESTO</div>
        <table className="info">
          <tbody>
            <tr>
              <td className="lbl">Titular</td><td>{p.titular || dash}</td>
              <td className="lbl">Reporta a</td><td>{p.reportaA || dash}</td>
            </tr>
            <tr>
              <td className="lbl">Departamento</td><td>{p.departamento?.nombre ?? dash}</td>
              <td className="lbl">Supervisa a</td><td>{p.supervisaA || dash}</td>
            </tr>
            <tr>
              <td className="lbl">Escolaridad</td><td>{p.escolaridad || dash}</td>
              <td className="lbl">Experiencia</td><td>{p.experiencia || dash}</td>
            </tr>
            <tr>
              <td className="lbl">Rango de edad</td><td>{p.edadMin}–{p.edadMax} años</td>
              <td className="lbl">Horario</td><td>{p.horario || dash}</td>
            </tr>
            <tr>
              <td className="lbl">T. de adaptación</td><td>{p.tiempoAdaptacion || dash}</td>
              <td className="lbl">Periodicidad</td><td>{p.periodicidad || dash}</td>
            </tr>
            <tr>
              <td className="lbl">Objetivo del puesto</td>
              <td colSpan={3}>{p.objetivo || dash}</td>
            </tr>
          </tbody>
        </table>

        {/* II. Tareas */}
        {p.responsabilidades.length > 0 && (
          <>
            <div className="sec-bar">II.&nbsp;&nbsp;TAREAS Y ACTIVIDADES</div>
            <table className="tasks">
              <thead>
                <tr>
                  <th style={{ width: 26 }}>#</th>
                  <th>Actividad</th>
                  <th>¿Cómo la desarrolla?</th>
                  <th style={{ width: 72 }}>Frecuencia</th>
                  <th style={{ width: 48 }}>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {p.responsabilidades.map((r, i) => (
                  <tr key={r.id}>
                    <td className="num">{i + 1}</td>
                    <td className="act">{r.nombre}</td>
                    <td>{r.descripcion || dash}</td>
                    <td className="freq">{r.recurrencia}</td>
                    <td className="time">{r.tiempoHoras}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* III. Personal a cargo */}
        {p.tienePersonal && (
          <>
            <div className="sec-bar">III.&nbsp;&nbsp;PERSONAL A CARGO Y SUPERVISIÓN</div>
            <table className="info">
              <tbody>
                <tr>
                  <td className="lbl">Personas a cargo</td><td>{p.numPersonasACargo || dash}</td>
                  <td className="lbl">Autoridad</td><td>{p.autoridadSobre || dash}</td>
                </tr>
                <tr><td className="lbl">¿Cómo supervisa?</td><td colSpan={3}>{p.comoSupervisa || dash}</td></tr>
                <tr><td className="lbl">¿Cómo audita?</td><td colSpan={3}>{p.comoAudita || dash}</td></tr>
                <tr><td className="lbl">¿Cómo evalúa?</td><td colSpan={3}>{p.comoEvalua || dash}</td></tr>
              </tbody>
            </table>
          </>
        )}

        {/* IV. Relaciones */}
        {(p.internoConQuien || p.externoConQuien) && (
          <>
            <div className="sec-bar">IV.&nbsp;&nbsp;RELACIONES DE TRABAJO</div>
            <table className="info">
              <tbody>
                <tr><td className="lbl">Relaciones internas</td><td colSpan={3}>{p.internoConQuien || dash}</td></tr>
                <tr><td className="lbl">Relaciones externas</td><td colSpan={3}>{p.externoConQuien || dash}</td></tr>
              </tbody>
            </table>
          </>
        )}

        {/* V. Documentos y decisiones */}
        {(p.documentosQueGenera || p.decisionesIndependientes || p.decisionesConAutorizacion) && (
          <>
            <div className="sec-bar">V.&nbsp;&nbsp;DOCUMENTOS Y NIVEL DE DECISIÓN</div>
            <table className="info">
              <tbody>
                <tr><td className="lbl">Documentos que genera</td><td colSpan={3}>{p.documentosQueGenera || dash}</td></tr>
                <tr><td className="lbl">Decisiones autónomas</td><td colSpan={3}>{p.decisionesIndependientes || dash}</td></tr>
                <tr><td className="lbl">Decisiones c/ autorización</td><td colSpan={3}>{p.decisionesConAutorizacion || dash}</td></tr>
              </tbody>
            </table>
          </>
        )}

        {/* VI. Perfil y herramientas */}
        {(p.herramientas || p.formacion || p.competencias) && (
          <>
            <div className="sec-bar">VI.&nbsp;&nbsp;PERFIL Y HERRAMIENTAS</div>
            <table className="info">
              <tbody>
                {p.herramientas && <tr><td className="lbl">Herramientas</td><td colSpan={3}>{p.herramientas}</td></tr>}
                {p.formacion && <tr><td className="lbl">Formación deseable</td><td colSpan={3}>{p.formacion}</td></tr>}
                {p.competencias && <tr><td className="lbl">Competencias</td><td colSpan={3}>{p.competencias}</td></tr>}
              </tbody>
            </table>
          </>
        )}

        {/* VII. Observaciones */}
        {(p.tareasNoCorresponden || p.tareasQueNadieHace || p.problemasFrecuentes) && (
          <>
            <div className="sec-bar">VII.&nbsp;&nbsp;OBSERVACIONES DEL EMPLEADO</div>
            <table className="info">
              <tbody>
                {p.tareasNoCorresponden && (
                  <tr className="obs-row"><td className="lbl">Tareas que no le corresponden</td><td colSpan={3}>{p.tareasNoCorresponden}</td></tr>
                )}
                {p.tareasQueNadieHace && (
                  <tr className="obs-row"><td className="lbl">Tareas que nadie realiza</td><td colSpan={3}>{p.tareasQueNadieHace}</td></tr>
                )}
                {p.problemasFrecuentes && (
                  <tr className="obs-row"><td className="lbl">Problemas frecuentes</td><td colSpan={3}>{p.problemasFrecuentes}</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* VIII. Notas de auditoría */}
        {p.adminNotas && (
          <>
            <div className="sec-bar">VIII.&nbsp;&nbsp;NOTAS DE AUDITORÍA (RH / DIRECCIÓN)</div>
            <table className="info">
              <tbody>
                <tr><td colSpan={4} style={{ background: "#f5f8ff" }}>{p.adminNotas}</td></tr>
              </tbody>
            </table>
          </>
        )}

        {/* Firmas */}
        <table className="firmas">
          <tbody>
            <tr>
              <td><div className="line">{p.titular || "Titular del puesto"}</div><div className="role">Titular del puesto</div></td>
              <td><div className="line">&nbsp;</div><div className="role">Revisó — Recursos Humanos</div></td>
              <td><div className="line">&nbsp;</div><div className="role">Autorizó — Dirección General</div></td>
            </tr>
          </tbody>
        </table>

        <div className="foot">
          <span>Global Solutions Life · Consultoría en Seguros &amp; Inversiones</span>
          <span>Documento generado el {fecha}</span>
        </div>
      </div>
    </div>
  );
}
