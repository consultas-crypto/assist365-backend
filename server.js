/**
 * Assist365 AI Assistant — Backend Centralizado
 * Alimenta tanto la Zendesk App como la Web App
 *
 * Requisitos: Node.js 18+
 * Variable de entorno necesaria:
 *   ANTHROPIC_API_KEY — clave de API de Anthropic
 *   PORT              — puerto (default 3000)
 *   ALLOWED_ORIGINS   — orígenes permitidos, separados por coma
 *
 * Las condiciones generales están embebidas directamente en el código.
 * Para actualizarlas, editar las constantes DOCS_WTA y DOCS_WM abajo.
 */

const http = require("http");
const https = require("https");
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*").split(",");

// ─────────────────────────────────────────────────────────────
// CONDICIONES GENERALES — WTA (vouchers 365WT...)
// ─────────────────────────────────────────────────────────────
const DOCS_WTA = `CONDICIONES GENERALES Y PARTICULARES — ASSIST 365 — PROVEEDOR WTA (vouchers 365WT...)
VIGENCIA: NOVIEMBRE 2025

EDAD LÍMITE:
- Planes larga estadía: 64 años
- Planes viajes cortos: 85 años inclusive (50% recargo desde 75 hasta 85 años)
- Planes multiviajes: 69 años

VIGENCIA: Desde cero horas del día de inicio hasta las 23:59 del día de fin indicado en el voucher. Planes viajes cortos: máximo 90 días. Planes larga estadía: 365 días.

VALIDEZ GEOGRÁFICA: Mundial. Excluye país de residencia habitual del beneficiario.

PROCEDIMIENTO DE ASISTENCIA: Contactar a la Central de Servicios de Asistencia ANTES de tomar cualquier iniciativa o gasto. Notificar dentro de las 24 horas de ocurrido el evento.

DEFINICIONES CLAVE:
- Accidente: daño corporal por agentes externos, violentos, súbitos e independientes de la voluntad del beneficiario.
- Enfermedad Preexistente: proceso patológico con origen anterior al inicio del viaje o vigencia del plan.
- Enfermedad Crónica: proceso patológico continuo mayor a 30 días.
- Deportes Amateur: practicados por aficionados, ocio o actividades recreativas.
- Deportes Profesionales: practicados con o sin lucro en competencias, torneos, campeonatos.
- Monto global: límite máximo de cobertura económica total durante la vigencia.

BENEFICIOS PRINCIPALES (verificar topes en el voucher):

1. ASISTENCIA MÉDICA POR ACCIDENTE/ENFERMEDAD NO PREEXISTENTE:
Consultas médicas, atención por especialistas (previa autorización), exámenes complementarios (previa autorización), internaciones, intervenciones quirúrgicas de emergencia, terapia intensiva.

2. ASISTENCIA MÉDICA POR COVID-19 (hasta 85 años):
Cubre gastos hospitalarios, respirador mecánico y test PCR (previa autorización médica). No opera como reintegro. No cubre cuarentena en hotel.

3. COBERTURA EN PAÍS DE ORIGEN (limitado a accidentes):
Solo si regresa por muerte de familiar en 1° grado o siniestro grave en domicilio. Vigencia máxima 30 días. Solo aplica para vacaciones demostrables.

4. ASISTENCIA MÉDICA POR ENFERMEDAD PREEXISTENTE:
NO es un upgrade ni un adicional. Algunos planes incluyen un tope de cobertura para preexistencias dentro del voucher. Para saber si el cliente tiene esta cobertura, el agente debe verificar si figura un monto para "enfermedad preexistente" en el voucher del cliente.
Si el voucher incluye cobertura de preexistencias, aplica SOLO para:
- Episodios agudos e impredecibles (descompensación súbita)
- El beneficiario debe haber estado estable 12 meses previos al inicio del viaje
- Solo para atención médica primaria hasta lograr estabilización
Excluye incluso con cobertura: diálisis, trasplantes, oncología, psiquiatría, enfermedades de transmisión sexual, viajes cuyo motivo sea el tratamiento médico.

5. MÉDICO ONLINE 24 HORAS: Telemedicina disponible 365 días.

6. SOPORTE EMOCIONAL: Telepsicología disponible.

7. URGENCIA ODONTOLÓGICA: Solo trauma, accidente o infección. Limitado a tratamiento del dolor y extracción. Excluye conductos, coronas, prótesis, limpiezas.

8. MEDICAMENTOS AMBULATORIOS: Solo recetados por médico de la central, previa autorización. Solo primeros 30 días de tratamiento.

9. EVACUACIÓN MÉDICA: Previa autorización de la central. Traslado al centro de salud más cercano.

10. REPATRIACIÓN SANITARIA: Solo autorizada por Departamento Médico de ASSIST 365. En clase turista. No aplica para preexistencias salvo planes que las contemplen.

11. REPATRIACIÓN FUNERARIA: Cubre féretro simple, trámites administrativos y transporte hasta aeropuerto de ingreso al país de residencia. No aplica si el fallecimiento es por suicidio, drogas o alcohol.

12. TRASLADO DE FAMILIAR: Si hospitalización supera 10 días viajando solo. Un pasaje en clase turista.

13. COMPENSACIÓN POR PÉRDIDA DE EQUIPAJE: Complementaria a lo que paga la aerolínea. Solo vuelos internacionales regulares. Requiere PIR y pago previo de la aerolínea.

14. GASTOS POR VUELO DEMORADO O CANCELADO: Demora superior a 6 horas. Cubre alojamiento, alimentación y comunicaciones. No aplica desde ciudad de residencia habitual.

15. GASTOS POR DEMORA DE EQUIPAJE: Demora superior a 6 horas. Solo artículos de primera necesidad (higiene y vestimenta básica).

16. SALA VIP: Para planes iguales o mayores a USD 30.000. Requiere registrar vuelos 7 horas antes en https://travelregistration.online. Demora mayor a 60 minutos.

UPGRADES OPCIONALES (deben constar en el voucher):

UPGRADE COBERTURA DEPORTIVA (hasta USD 30.000):
Deportes CUBIERTOS incluyen: Alpinismo/Andinismo hasta 5.500 m, Atletismo, Buceo autónomo, Cabalgata, Canotaje Británico, Ciclismo, Escalada en Muro (Palestra), Esquí acuático, Fútbol, Golf, Kayak, Maratones, Natación, Pádel, Paintball, Patinaje, Pesca, Rafting en río, Remo, Senderismo/Hiking, Snowboard, Squash, Tennis, Trekking hasta 1.000 m (baja montaña), Trekking desde 1.000 m hasta 1.500 m (media montaña), Trekking desde 1.500 m hasta 2.500 m (alta montaña), Vela, Voleibol, Waterpolo, Windsurf, y muchos más.

IMPORTANTE TREKKING EN WTA:
- Trekking baja montaña (hasta 1.000 m): CUBIERTO
- Trekking media montaña (1.000 m a 1.500 m): CUBIERTO  
- Trekking alta montaña (1.500 m a 2.500 m): CUBIERTO
- Alpinismo/Andinismo moderada a alta altitud (2.001 m a 5.500 m): CUBIERTO
- Alpinismo/Andinismo muy alta o extrema altitud (5.501 m a 7.500 m): EXCLUIDO

Deportes EXCLUIDOS del upgrade deportivo WTA: Ala delta, Artes marciales, Automovilismo, Barranquismo, Biatlón, BMX, Boxeo, Canopy/tirolesa, Carreras de motos, Crossfit, Cuatrimoto, Escalada de roca, Escalada en hielo, Espeleología, Expediciones, Heli Skiing, Judo, Kárate, Kayak en rápidos de aguas bravas, Kick Boxing, Kitesurf, Levantamiento de pesas, Lucha, Luge, Maratón de montaña, Motociclismo, Motocross, Paracaidismo, Parapente, Paseos en globo, Puenting, Rugby, Skeleton, Surfing, Taekwondo, Tiro deportivo, Trekking extremo (más de 2.500 m — excluido en WTA), Triatlón, Wakesurfing, y otros.

Límite de edad para deportes extremos: 15 a 65 años.

UPGRADE CANCELACIÓN MULTI CAUSA: Cubre penalidades por cancelar tours, paquetes, vuelos, cruceros. Causas al 100%: fallecimiento/accidente/enfermedad grave, convocatoria judicial, daños en domicilio, cuarentena médica, despido laboral, servicio militar, epidemia/desastre natural, complicaciones de embarazo, cancelación de boda. Causas al 70%: secuestro, cancelación por empresa, cambio de trabajo, no aprobación de visa. No aplica mayores de 74 años.

UPGRADE EMBARAZO: Hasta semana 32 de gestación. Cubre emergencias, partos de emergencia, ecografías de urgencia. No cubre controles rutinarios, partos normales, gastos del recién nacido. Edad: 19 a 45 años.

UPGRADE TECNOLOGÍA PROTEGIDA: Cubre robo/pérdida/hurto de: cámaras (USD 400), filmadoras (USD 250), celulares (USD 750), tablets (USD 450), laptops (USD 800). No cubre daños accidentales. Requiere denuncia policial dentro de las 24 horas.

UPGRADE ROTURA DE EQUIPAJE: Daño que exponga el contenido. Solo durante vuelo internacional. Informar dentro de las 24 horas.

UPGRADE MASCOTAS: Perros y gatos de 4 meses a 8 años. Vacunación completa obligatoria. Solo emergencias comprobables. Incluye repatriación funeraria de mascota.

UPGRADE PARQUE TEMÁTICO: 70% del valor del ticket. Causas: cierre por clima, enfermedad grave, cierre del parque, accidente de tránsito camino al parque. No aplica mayores de 74 años.

EXCLUSIONES GENERALES (aplican a todos los beneficios):
- Enfermedades preexistentes, crónicas o recurrentes (salvo upgrade específico contratado)
- Infarto cerebral, ACV, cáncer, tumores, aterosclerosis, infarto al miocardio, angina de pecho, neumonía
- Tratamientos no autorizados por la central
- Homeopatía, acupuntura, curas termales, podología, manicura, pedicura
- Lesiones por actos criminales del beneficiario
- Tratamientos por drogas, narcóticos, alcohol o medicamentos sin receta
- Prótesis dentales, lentes, audífonos, sillas de ruedas, muletas
- Competencias deportivas y deportes de riesgo no cubiertos por upgrade
- Enfermedades mentales (neurosis, psicosis, etc.)
- Embarazo, parto, controles ginecológicos (salvo upgrade)
- SIDA/VIH, enfermedades venéreas
- Eventos por fuerzas naturales extraordinarias (tsunami, terremoto, huracán)
- Suicidio o intento de suicidio
- Guerras, terrorismo, actos de guerra
- Exámenes de rutina o preventivos
- Hernias de cualquier tipo
- Situación migratoria o laboral ilegal
- Trabajo en el exterior (cualquier tipo)
- Países en guerra civil o extranjera (Afganistán, Irak, Sudán, Somalia, Corea del Norte)

REINTEGROS:
- Plazo para presentar documentación: 30 días desde finalización del voucher
- ASSIST 365 tiene 15 días para solicitar documentos faltantes
- ASSIST 365 tiene 15 días hábiles para analizar y emitir carta de aprobación/negación
- Pago del reintegro: 15 días después de recibir datos bancarios completos
- El beneficiario tiene 30 días desde la aprobación para enviar datos bancarios

CONTACTO: operaciones@assist-365.com | Montevideo 757 3°, Buenos Aires, Argentina`;

// ─────────────────────────────────────────────────────────────
// CONDICIONES GENERALES — WM (vouchers 365WM...)
// ─────────────────────────────────────────────────────────────
const DOCS_WM = `CONDICIONES GENERALES Y PARTICULARES — ASSIST 365 — PROVEEDOR WM (vouchers 365WM...)
VIGENCIA: DICIEMBRE 2025

EDAD LÍMITE: 85 años inclusive (50% recargo desde 75 hasta 85 años).
Para planes anuales multiviajes: hasta 74 años inclusive.

VIGENCIA: Desde cero horas del día de inicio hasta las 23:59 del día de fin indicado en el voucher. Planes viajes cortos: máximo 90 días.

VALIDEZ GEOGRÁFICA: Mundial. Excluye país de residencia habitual del beneficiario.

PROCEDIMIENTO DE ASISTENCIA: Contactar a la Central de Asistencia ANTES de cualquier gasto. Puede hacerse por WhatsApp o teléfono. Notificar dentro de las 48 horas (WM tiene 48 horas, diferente a WTA que tiene 24 horas). Para casos en altamar: 48 horas después de desembarcar.

DEFINICIONES CLAVE:
- Accidente: daño corporal por agentes externos, violentos, súbitos.
- Accidente Grave: amputación, fractura de huesos largos, trauma craneoencefálico, quemaduras 2° y 3° grado, lesiones severas de columna con compromiso medular, lesiones oculares o auditivas graves.
- Enfermedad Preexistente: proceso patológico con origen anterior al inicio del viaje o vigencia del plan.
- Enfermedad Crónica: proceso patológico continuo mayor a 30 días.
- Paciente Estable: sin variación de estado de salud, síntomas y signos sin cambios recientes.
- Monto máximo global evento múltiple: límite de USD 250.000 por acontecimiento/evento (máximo USD 150.000 por persona).

BENEFICIOS PRINCIPALES (verificar topes en el voucher):

1. ASISTENCIA MÉDICA POR ACCIDENTE/ENFERMEDAD NO PREEXISTENTE:
Consultas médicas, atención por especialistas (previa autorización), exámenes complementarios (previa autorización), internaciones, intervenciones quirúrgicas de emergencia, terapia intensiva.
LÍMITE POR CATÁSTROFE: máximo USD 150.000 por persona, USD 250.000 acumulado por evento.

2. ASISTENCIA MÉDICA POR COVID-19 (hasta 85 años):
Cubre gastos hospitalarios, respirador mecánico y test PCR (previa autorización médica). No opera como reintegro salvo autorización previa. No cubre cuarentena en hotel.

3. COBERTURA EN PAÍS DE RESIDENCIA (limitado a accidentes):
Solo si regresa por muerte de familiar en 1° grado o siniestro grave en domicilio. Vigencia máxima 30 días. Solo aplica si el beneficiario no tiene ningún sistema de cobertura en su país. Solo para vacaciones demostrables.

4. ASISTENCIA MÉDICA POR ENFERMEDAD PREEXISTENTE:
NO es un upgrade ni un adicional. Algunos planes incluyen un tope de cobertura para preexistencias dentro del voucher. Para saber si el cliente tiene esta cobertura, el agente debe verificar si figura un monto para "enfermedad preexistente" en el voucher del cliente.
Si el voucher incluye cobertura de preexistencias, aplica SOLO para:
- Episodios agudos, descompensación súbita e inesperada
- Solo para atención médica primaria hasta lograr estabilización
- La central se reserva el derecho de decidir el tratamiento o repatriación
Excluye incluso con cobertura: diálisis, trasplantes, oncología, psiquiatría, enfermedades de transmisión sexual, viajes cuyo motivo sea tratamiento médico.

5. MÉDICO ONLINE 24 HORAS: Telemedicina para dolencias leves. 365 días al año.

6. TERAPIAS DE RECUPERACIÓN FÍSICA: Solo accidentes no laborales. Previa autorización. Máximo 10 sesiones.

7. SOPORTE EMOCIONAL: Solo por repatriación sanitaria, fallecimiento de familiar o catástrofe natural durante el viaje.

8. MEDICAMENTOS AMBULATORIOS: Solo recetados por médico de la central. Solo primeros 30 días.

9. URGENCIA ODONTOLÓGICA: Solo trauma, accidente o infección. Solo tratamiento del dolor y extracción. Excluye conductos, coronas, prótesis, limpiezas.

10. EVACUACIÓN MÉDICA: Previa autorización. Al centro de salud más cercano.

11. REPATRIACIÓN SANITARIA: Solo autorizada por Departamento Médico. En clase turista. No aplica para preexistencias salvo planes que las contemplen.

12. REPATRIACIÓN FUNERARIA: Féretro simple, trámites administrativos, transporte hasta aeropuerto del país de residencia. No aplica si fallecimiento es por suicidio, drogas, alcohol, o si el motivo del viaje era tratamiento médico. No aplica si la compra se hizo con el beneficiario ya hospitalizado.

13. TRASLADO DE FAMILIAR: Si hospitalización supera 10 días viajando solo. Reembolso de un pasaje en clase turista hasta el monto máximo del plan.

14. COBERTURA PARA MASCOTAS (incluida en algunos planes WM, no es upgrade):
Perros y gatos de 4 meses a 8 años. Solo si la mascota queda hospitalizada. Cubre consultas, medicación, cirugías. Incluye repatriación funeraria. Vacunación completa obligatoria.

15. ASISTENCIA EN ROBO O EXTRAVÍO DE DOCUMENTOS: Asesoramiento sobre procedimientos. No cubre costos de reemplazo.

16. CONTENCIÓN FAMILIAR: Transmisión de mensajes y apoyo a familiares del beneficiario durante una urgencia.

17. COMPENSACIÓN POR PÉRDIDA DE EQUIPAJE: Complementaria a la aerolínea. Solo vuelos internacionales regulares. Requiere PIR y pago previo de la aerolínea. No aplica para pérdidas en transporte terrestre.

18. GASTOS POR VUELO DEMORADO O CANCELADO: Demora superior a 6 horas. Cubre alojamiento, alimentación y comunicaciones. Solo vestuario e higiene básica. No aplica desde ciudad de residencia.

19. GASTOS POR DEMORA DE EQUIPAJE: Demora superior a 6 horas. Solo artículos de primera necesidad.

20. SALA VIP: Demora de 60 minutos o más. Reintegro de gastos de sala VIP. Hasta 3 acompañantes beneficiarios de ASSIST 365. Solo viajes de hasta 89 días. Notificar dentro de las 48 horas.

UPGRADES OPCIONALES WM (deben constar en el voucher):

UPGRADE COBERTURA DEPORTIVA WM (hasta USD 30.000):
Deportes CUBIERTOS incluyen: Aeromodelismo, Atletismo, Bádminton, Baloncesto, Béisbol, Buceo autónomo, Cabalgata con silla, Ciclismo, Ciclismo de montaña, Esquí, Fútbol, Golf, Hockey, Kayak, Maratones, Montañismo y escalada, Natación, Pádel, Paintball, Patinaje, Pesca deportiva, Remo, Skateboarding, Snorkel, Squash, Tenis, Trekking baja montaña (hasta 1.000 m), Trekking media montaña (1.000 m a 1.500 m), Vela, Voleibol, y muchos más.

IMPORTANTE TREKKING EN WM:
- Trekking baja montaña (hasta 1.000 m): CUBIERTO
- Trekking media montaña (1.000 m a 1.500 m): CUBIERTO
- Trekking alta montaña (desde 1.500 m hasta 2.500 m): EXCLUIDO en WM
- Alpinismo por encima de 2.500 m: EXCLUIDO en WM

DIFERENCIA CLAVE WTA vs WM EN TREKKING:
- WTA cubre trekking hasta 5.500 m (con upgrade deportivo)
- WM solo cubre trekking hasta 1.500 m (con upgrade deportivo)

Deportes EXCLUIDOS del upgrade deportivo WM: Ala delta, Automovilismo, Barranquismo, Biatlón, BMX, Boxeo, Canopy/tirolesa, Canotaje, Carrera de montaña/senderos, Ciclismo de nieve, Ciclismo MTB, Crossfit, Cuatrimoto, Escalada de roca, Espeleología, Esquí alpino, Esquí de fondo, Esquí fuera de pista, Excursionismo, Judo/Yudo, Kárate, Kitesurf, Lucha, Luge, Moto náutica, Motociclismo, Paracaidismo, Parapente, Paseos en globo, Raquetas de nieve, Rugby, Snowboarding, Surfing, Taekwondo, Tiro deportivo, Trekking de alta montaña (desde 1.500 m), Triatlón, Trineo, y otros.

Límite de edad para deportes: 15 a 65 años.

UPGRADE CANCELACIÓN MULTI CAUSA: Cubre penalidades por cancelar tours, paquetes, vuelos, cruceros. Aviso a la central: máximo 48 horas (WM tiene 48 horas). Causas al 100%: fallecimiento/accidente/enfermedad grave, convocatoria judicial, daños en domicilio, cuarentena médica, despido laboral, servicio militar, epidemia/desastre natural, complicaciones de embarazo, cancelación de boda, entrega de niño en adopción, parto de emergencia. Causas al 70%: secuestro, cancelación por empresa, cambio de trabajo, no aprobación de visa. No aplica mayores de 74 años. Monto máximo global por evento: USD 10.000 para todos los beneficiarios afectados.

UPGRADE EMBARAZO WM: Hasta semana 32 de gestación. Cubre emergencias, aborto espontáneo, partos de emergencia. No cubre controles rutinarios, partos normales, abortos provocados, gastos del recién nacido, embarazos mayores a 32 semanas. Edad: 19 a 45 años. El monto del upgrade está DENTRO del monto de asistencia médica general, no es adicional.

UPGRADE TECNOLOGÍA PROTEGIDA WM: Solo cubre ROBO (no pérdida ni hurto como en WTA). Cámaras (USD 400), filmadoras (USD 250), celulares (USD 750), tablets (USD 450), laptops (USD 800). Máximo total USD 2.000. No aplica bajo custodia de aerolínea. Requiere denuncia policial dentro de las 24 horas.

UPGRADE ROTURA DE EQUIPAJE WM: Daño en exterior del equipaje durante vuelo internacional. Aviso dentro de las 48 horas (WM tiene 48 horas). Solo cubre daño exterior, no robo o daño del contenido. Solo un equipaje por beneficiario.

UPGRADE RESPONSABILIDAD CIVIL FRENTE A TERCEROS: Cubre daños personales y/o materiales causados a terceros como consecuencia directa de un accidente.

UPGRADE MASCOTAS (adicional para planes que no incluyen mascotas): Mismas condiciones que la cobertura de mascotas incluida.

EXCLUSIONES GENERALES WM (aplican a todos los beneficios):
- Enfermedades preexistentes, crónicas o recurrentes (salvo upgrade específico)
- Infarto cerebral, ACV, cáncer, tumores, aterosclerosis, infarto al miocardio, angina de pecho, neumonía
- Tratamientos no autorizados por la central
- Homeopatía, acupuntura, curas termales, podología, manicura, pedicura
- Lesiones por actos criminales del beneficiario
- Tratamientos por drogas, narcóticos, alcohol o medicamentos sin receta
- Prótesis dentales, lentes, audífonos, sillas de ruedas, muletas
- Competencias deportivas y deportes de riesgo no cubiertos por upgrade
- Enfermedades mentales
- Embarazo y parto (salvo upgrade)
- SIDA/VIH, enfermedades e infecciones de transmisión sexual
- Eventos por fuerzas naturales extraordinarias (tsunami, terremoto, huracán, cenizas volcánicas)
- Suicidio o intento de suicidio
- Guerras, terrorismo, actos de guerra
- Actos de mala fe, mentiras u ocultamiento de información, documentación fraudulenta
- Exámenes de rutina o preventivos
- Hernias de cualquier tipo
- Situación migratoria o laboral ilegal
- Trabajo en el exterior (cualquier tipo)
- Países en guerra civil o extranjera (Afganistán, Irak, Sudán, Somalia, Corea del Norte)
- Enfermedades hepáticas (cirrosis, abscesos)

DIFERENCIAS IMPORTANTES WM vs WTA:
1. Plazo para notificar emergencia: WM tiene 48 horas (WTA tiene 24 horas)
2. Trekking con upgrade deportivo: WM cubre hasta 1.500 m (WTA cubre hasta 5.500 m)
3. Upgrade tecnología: WM solo cubre robo (WTA cubre robo, pérdida y hurto)
4. Cobertura de mascotas: En WM puede estar incluida en el plan base (no solo como upgrade)
5. Upgrade embarazo WM: el monto está DENTRO del monto general (no es adicional)
6. Sala VIP WM: por reintegro, hasta 3 acompañantes, notificar en 48 horas
7. Multiviajes WM: límite de edad hasta 74 años (WTA hasta 69 años)

REINTEGROS:
- Plazo para presentar documentación: 30 días desde finalización del voucher
- Completar formulario online en www.assist-365.com
- ASSIST 365 tiene 15 días para solicitar documentos faltantes
- ASSIST 365 tiene 15 días hábiles para analizar y emitir carta de aprobación/negación
- Pago del reintegro: 15 días después de recibir datos bancarios completos

CONTACTO: operaciones@assist-365.com | Montevideo 757 3°, Buenos Aires, Argentina`;

// ─────────────────────────────────────────────────────────────
// Detección automática de proveedor por voucher
// ─────────────────────────────────────────────────────────────
function detectProvider(text) {
  if (!text) return null;
  const upper = text.toUpperCase();
  const hasWTA = upper.includes("365WT") || /\bWTA\b/.test(upper);
  const hasWM  = upper.includes("365WM") || /\bWM\b/.test(upper);
  if (hasWTA && hasWM) return "BOTH";
  if (hasWTA) return "WTA";
  if (hasWM)  return "WM";
  return null;
}

function detectProviderFromHistory(history) {
  if (!Array.isArray(history)) return null;
  for (const turn of [...history].reverse()) {
    const found = detectProvider(turn.content);
    if (found) return found;
  }
  return null;
}

function getDocs(provider) {
  if (provider === "BOTH") return DOCS_WTA + "\n\n" + DOCS_WM;
  return provider === "WTA" ? DOCS_WTA : DOCS_WM;
}

// ─────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────
function buildSystemPrompt(provider, lang) {
  const langInstruction = lang === "pt"
    ? "Responde SIEMPRE em português do Brasil."
    : "Responde SIEMPRE en español.";
  const providerLabel = provider === "BOTH"
    ? "WTA (vouchers 365WT...) y WM (vouchers 365WM...)"
    : provider === "WTA"
      ? "WTA (vouchers 365WT...)"
      : "WM (vouchers 365WM...)";
  const docs = getDocs(provider);

  return `Sos el asistente interno de Assist365, una empresa de asistencia al viajero.
Tu función es ayudar a los empleados a responder consultas sobre las condiciones generales del servicio.

${langInstruction}

PROVEEDOR ACTIVO: ${providerLabel}
Las condiciones cargadas corresponden ÚNICAMENTE a este proveedor.

CAPACIDADES:
1. Responder preguntas sobre coberturas y condiciones del servicio
2. Citar la sección o cláusula exacta de las condiciones cuando sea relevante
3. Sugerir textos listos para enviar al cliente (cuando el empleado lo pida)
4. Resumir cláusulas complejas en lenguaje simple y claro
5. Señalar diferencias entre planes cuando sea relevante para la consulta

REGLAS:
- Basate ÚNICAMENTE en las condiciones del proveedor ${providerLabel} proporcionadas abajo
- Si algo no está cubierto en las condiciones, indicalo claramente
- Cuando cites una sección, indicá el nombre exacto
- Para sugerencias de respuesta al cliente, precedelas con "📋 TEXTO SUGERIDO PARA EL CLIENTE:"
- Sé conciso y directo; los agentes necesitan respuestas rápidas
- No inventes coberturas ni condiciones que no estén en el documento
- NUNCA mencionar un "upgrade de cobertura por enfermedad preexistente" — ese upgrade NO existe en Assist365
- La cobertura por enfermedad preexistente es un TOPE que viene incluido dentro del voucher en ciertos planes. NO es un upgrade ni algo que se compra por separado
- Cuando un agente pregunte por preexistencias, siempre indicar que debe verificar si el voucher del cliente incluye un monto/tope para "enfermedad preexistente"
- Si el voucher no incluye ese tope, las preexistencias no están cubiertas
- Las condiciones de AMBOS proveedores (WTA y WM) están cargadas y disponibles. NUNCA decir que no tenés las condiciones de algún proveedor
- Si el agente pregunta por ambos proveedores al mismo tiempo (por ejemplo "en WTA y WM" o "en ambos"), respondé sobre los DOS proveedores usando las condiciones que tenés cargadas de cada uno. No limites la respuesta a uno solo

REGLAS CRÍTICAS PARA TEXTOS SUGERIDOS AL CLIENTE:
- En la respuesta al agente podés y debés mencionar WTA, WM y las diferencias entre proveedores — esa info es útil para el agente
- PERO en el bloque "📋 TEXTO SUGERIDO PARA EL CLIENTE:" NUNCA mencionar WTA, WM ni ningún proveedor
- En ese bloque NUNCA mencionar que existe otro proveedor o que se puede cambiar de proveedor
- En ese bloque usar siempre "su plan" o "el plan contratado", nunca nombres de proveedores
- Si querés sugerir una alternativa de plan, escribir "[XXX]" para que el agente complete
- El cliente debe percibir que trata con una sola empresa: Assist365
- NUNCA incluir emails, teléfonos, links ni invitar al cliente a contactar a nadie — el texto es solo informativo
- NUNCA agregar una "Nota para el agente" después del texto sugerido — la respuesta al agente va antes del bloque, no después
- El texto sugerido debe ser claro, directo y limitarse a explicar la cobertura o la situación del plan

CONDICIONES GENERALES — ${providerLabel}:
---
${docs}
---`;
}

const ASK_PROVIDER = {
  es: `Para darte la respuesta correcta necesito saber el proveedor del pasajero.\n\n¿El número de voucher empieza con **365WT** (WTA) o **365WM** (WM)?`,
  pt: `Para te dar a resposta correta, preciso saber o provedor do passageiro.\n\nO número do voucher começa com **365WT** (WTA) ou **365WM** (WM)?`,
};

// ─────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────
async function handleChat(body, res) {
  const { message, ticketContext, language, history } = body;
  if (!message) return sendJSON(res, 400, { error: "El campo 'message' es requerido." });
  if (!ANTHROPIC_API_KEY) return sendJSON(res, 500, { error: "ANTHROPIC_API_KEY no configurada." });

  const lang = (language || "es").toLowerCase().startsWith("pt") ? "pt" : "es";
  const provider = detectProvider(message) || detectProviderFromHistory(history);

  if (!provider) {
    return sendJSON(res, 200, { reply: ASK_PROVIDER[lang], lang, providerDetected: null });
  }

  const systemPrompt = buildSystemPrompt(provider, lang);
  const messages = [];

  if (history && Array.isArray(history)) {
    for (const turn of history.slice(-10)) {
      if (turn.role && turn.content) messages.push({ role: turn.role, content: turn.content });
    }
  }

  let userMessage = message;
  if (ticketContext) {
    userMessage = `[Contexto del ticket]\nAsunto: ${ticketContext.subject || "N/A"}\nCliente: ${ticketContext.requester || "N/A"}\nCanal: ${ticketContext.channel || "N/A"}\n\n[Consulta del agente]\n${message}`;
  }
  messages.push({ role: "user", content: userMessage });

  try {
    const response = await callAnthropic(systemPrompt, messages);
    sendJSON(res, 200, { reply: response, lang, providerDetected: provider });
  } catch (err) {
    console.error("Error Anthropic API:", err.message);
    sendJSON(res, 502, { error: "Error al contactar el motor IA. Intentá nuevamente." });
  }
}

function callAnthropic(system, messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages,
    });
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0]) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error(parsed.error?.message || "Respuesta vacía de Anthropic"));
          }
        } catch (e) {
          reject(new Error("Error al parsear respuesta de Anthropic"));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)
    ? origin || "*" : "";
  return {
    "Access-Control-Allow-Origin": allowed || ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const corsHeaders = getCORSHeaders(origin);
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.writeHead(204).end();

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body);
        await handleChat(parsed, res);
      } catch {
        sendJSON(res, 400, { error: "JSON inválido." });
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    return sendJSON(res, 200, {
      status: "ok",
      providers: { WTA: { docsLoaded: true }, WM: { docsLoaded: true } }
    });
  }

  res.writeHead(404).end("Not found");
});

server.listen(PORT, () => {
  console.log(`✅ Assist365 Backend corriendo en puerto ${PORT}`);
  console.log(`   ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY ? "✓ configurada" : "✗ FALTA"}`);
  console.log(`   Condiciones WTA: ✓ embebidas`);
  console.log(`   Condiciones WM:  ✓ embebidas`);
});
