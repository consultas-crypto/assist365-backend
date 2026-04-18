/**
 * Assist365 AI Assistant — Backend Centralizado
 * Alimenta tanto la Zendesk App como la Web App
 *
 * Requisitos: Node.js 18+
 * Variables de entorno necesarias:
 *   ANTHROPIC_API_KEY   — clave de API de Anthropic
 *   DOCS_URL_WTA        — URL pública Google Docs con condiciones de WTA (vouchers 365WT...)
 *   DOCS_URL_WM         — URL pública Google Docs con condiciones de WM  (vouchers 365WM...)
 *   PORT                — puerto (default 3000)
 *   ALLOWED_ORIGINS     — orígenes permitidos, separados por coma
 */

const http = require("http");
const https = require("https");
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const DOCS_URL_WTA = process.env.DOCS_URL_WTA || "";
const DOCS_URL_WM  = process.env.DOCS_URL_WM  || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*").split(",");

// Cache por proveedor (se refresca cada 10 min)
const cache = {
  WTA: { docs: "", expiry: 0 },
  WM:  { docs: "", expiry: 0 },
};

async function fetchDocs(provider) {
  const entry = cache[provider];
  if (Date.now() < entry.expiry && entry.docs) return entry.docs;

  const url = provider === "WTA" ? DOCS_URL_WTA : DOCS_URL_WM;
  if (!url) return `[Condiciones de ${provider} no configuradas. Definir DOCS_URL_${provider} en variables de entorno.]`;

  return new Promise((resolve) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    lib.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        entry.docs = data.slice(0, 40000);
        entry.expiry = Date.now() + 10 * 60 * 1000;
        resolve(entry.docs);
      });
    }).on("error", () => resolve(`[Error al obtener las condiciones de ${provider}. Verificar la URL.]`));
  });
}

/**
 * Detecta el proveedor leyendo el número de voucher en el texto.
 * Retorna "WTA", "WM", o null si no se detecta ninguno.
 */
function detectProvider(text) {
  if (!text) return null;
  const upper = text.toUpperCase();
  // 365WT (WTA) tiene prioridad sobre WM para evitar falsos positivos
  if (upper.includes("365WT")) return "WTA";
  if (upper.includes("365WM")) return "WM";
  return null;
}

/**
 * Busca el proveedor en el historial de conversación (últimos 10 turnos).
 * Útil cuando el agente mencionó el voucher en un mensaje anterior.
 */
function detectProviderFromHistory(history) {
  if (!Array.isArray(history)) return null;
  for (const turn of [...history].reverse()) {
    const found = detectProvider(turn.content);
    if (found) return found;
  }
  return null;
}

function buildSystemPrompt(docs, provider, lang) {
  const langInstruction = lang === "pt"
    ? "Responde SIEMPRE em português do Brasil."
    : "Responde SIEMPRE en español.";

  const providerLabel = provider === "WTA" ? "WTA (vouchers 365WT...)" : "WM (vouchers 365WM...)";

  return `Sos el asistente interno de Assist365, una empresa de asistencia al viajero.
Tu función es ayudar a los empleados a responder consultas sobre las condiciones generales del servicio.

${langInstruction}

PROVEEDOR ACTIVO: ${providerLabel}
Las condiciones cargadas corresponden ÚNICAMENTE a este proveedor.

CAPACIDADES:
1. Responder preguntas sobre coberturas y condiciones del servicio
2. Citar el artículo o cláusula exacta de las condiciones cuando sea relevante
3. Sugerir textos listos para enviar al cliente (cuando el empleado lo pida)
4. Resumir cláusulas complejas en lenguaje simple y claro

REGLAS:
- Basate ÚNICAMENTE en las condiciones generales del proveedor ${providerLabel} proporcionadas abajo
- Si algo no está cubierto en las condiciones, indicalo claramente
- Cuando cites un artículo, indicá el número/sección exacta
- Para sugerencias de respuesta al cliente, precedelas con "📋 TEXTO SUGERIDO PARA EL CLIENTE:"
- Sé conciso y directo; los agentes necesitan respuestas rápidas
- No inventes coberturas ni condiciones que no estén en el documento

CONDICIONES GENERALES — ${providerLabel}:
---
${docs}
---`;
}

// Mensaje que el asistente devuelve cuando no puede detectar el proveedor
const ASK_PROVIDER = {
  es: `Para darte la respuesta correcta necesito saber el proveedor del pasajero.\n\n¿El número de voucher empieza con **365WT** (WTA) o **365WM** (WM)?`,
  pt: `Para te dar a resposta correta, preciso saber o provedor do passageiro.\n\nO número do voucher começa com **365WT** (WTA) ou **365WM** (WM)?`,
};

async function handleChat(body, res) {
  const { message, ticketContext, language, history } = body;
  if (!message) return sendJSON(res, 400, { error: "El campo 'message' es requerido." });
  if (!ANTHROPIC_API_KEY) return sendJSON(res, 500, { error: "ANTHROPIC_API_KEY no configurada." });

  const lang = (language || "es").toLowerCase().startsWith("pt") ? "pt" : "es";

  // 1. Intentar detectar proveedor en el mensaje actual
  // 2. Si no, buscar en el historial (el agente lo pudo haber mencionado antes)
  const provider = detectProvider(message) || detectProviderFromHistory(history);

  // Si no se detectó proveedor, preguntarle al agente antes de continuar
  if (!provider) {
    return sendJSON(res, 200, {
      reply: ASK_PROVIDER[lang],
      lang,
      providerDetected: null,
    });
  }

  const docs = await fetchDocs(provider);
  const systemPrompt = buildSystemPrompt(docs, provider, lang);

  // Construir mensajes — incluye historial de conversación
  const messages = [];
  if (history && Array.isArray(history)) {
    for (const turn of history.slice(-10)) { // últimos 10 turnos
      if (turn.role && turn.content) messages.push({ role: turn.role, content: turn.content });
    }
  }

  // Agregar contexto del ticket si viene de Zendesk
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
      model: "claude-sonnet-4-20250514",
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
    ? origin || "*"
    : "";
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
      providers: {
        WTA: { docsLoaded: !!cache.WTA.docs, urlConfigured: !!DOCS_URL_WTA },
        WM:  { docsLoaded: !!cache.WM.docs,  urlConfigured: !!DOCS_URL_WM  },
      }
    });
  }

  res.writeHead(404).end("Not found");
});

server.listen(PORT, () => {
  console.log(`✅ Assist365 Backend corriendo en puerto ${PORT}`);
  console.log(`   ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY ? "✓ configurada" : "✗ FALTA"}`);
  console.log(`   DOCS_URL_WTA: ${DOCS_URL_WTA || "✗ FALTA — condiciones de WTA (vouchers 365WT...)"}`);
  console.log(`   DOCS_URL_WM:  ${DOCS_URL_WM  || "✗ FALTA — condiciones de WM  (vouchers 365WM...)"}`);
});
