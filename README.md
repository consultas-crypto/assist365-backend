# Assist365 — Backend Centralizado

Motor de IA compartido para la Zendesk App y la Web App.

## Requisitos
- Node.js 18 o superior
- API key de Anthropic
- URL pública de Google Docs o Notion con las condiciones generales

## Configuración

Crear un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
# Editar .env con los valores reales
```

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `ANTHROPIC_API_KEY` | Clave de API de Anthropic | ✅ Sí |
| `DOCS_URL` | URL pública del Google Doc / Notion con las condiciones generales | ✅ Sí |
| `PORT` | Puerto del servidor (default: 3000) | No |
| `ALLOWED_ORIGINS` | Orígenes permitidos separados por coma (default: *) | Recomendado en prod |

## Cómo obtener la URL de Google Docs

1. Abrir el Google Doc con las condiciones generales
2. Archivo → Publicar en la web → Texto sin formato
3. Copiar la URL generada y pegarla en `DOCS_URL`

La URL tiene este formato:
`https://docs.google.com/document/d/XXXXXXX/export?format=txt`

## Cómo obtener la URL de Notion

1. Abrir la página de Notion
2. Share → Publish to web → Copy link
3. Agregar `?outputType=markdown` al final de la URL

## Correr en desarrollo

```bash
node server.js
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/chat` | Consulta al asistente |
| GET | `/health` | Estado del servidor |

### Ejemplo de llamada a `/api/chat`

```json
{
  "message": "¿Cuál es la cobertura máxima para gastos médicos?",
  "language": "es",
  "ticketContext": {
    "subject": "Consulta sobre cobertura médica",
    "requester": "Juan García",
    "channel": "email"
  },
  "history": []
}
```

### Respuesta

```json
{
  "reply": "Según el Artículo 5.2 de las condiciones generales, la cobertura máxima para gastos médicos es...",
  "lang": "es"
}
```

## Deploy recomendado

- **Railway**: conectar el repo y definir las variables de entorno
- **Render**: Free tier suficiente para empezar
- **Fly.io**: más control, deploy con `fly deploy`

En todos los casos, configurar `ALLOWED_ORIGINS` con los dominios reales de la web app y de Zendesk.
