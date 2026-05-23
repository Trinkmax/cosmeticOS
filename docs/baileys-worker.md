# Baileys worker — contrato HTTP

cosmeticOS no corre Baileys dentro de Vercel ni de las Supabase Edge Functions: Baileys requiere un socket persistente con WhatsApp Web, y ambos entornos son short-lived. La integración usa un **worker externo** (Fly.io / Railway / VPS) que cosmeticOS consume vía HTTP.

Este documento define el contrato que ese worker debe implementar para que la app lo use sin cambios en el código.

## Setup

Variables de entorno que la app necesita para hablar con el worker:

```
BAILEYS_WORKER_URL=https://baileys.cosmeticos.app
BAILEYS_WORKER_SECRET=<shared secret rotativo>
```

Ambos se configuran en Supabase Edge Functions (vía `supabase secrets`) y en Vercel para la app.

Todas las requests del worker llevan el header `X-Worker-Secret`. El worker debe verificarlo y rechazar con 401 si no coincide.

## Endpoints que el worker debe exponer

### `POST /sessions` — Crear una sesión nueva

Request:
```json
{
  "session_id": "uuid-de-whatsapp_sessions",
  "tenant_id": "uuid",
  "webhook_url": "https://tbjbezwtblecbrluwmtw.supabase.co/functions/v1/whatsapp-webhook"
}
```

Response 201:
```json
{ "ok": true, "qr": "data:image/png;base64,..." }
```

El worker arranca la conexión Baileys, espera el QR, lo devuelve como dataURL. Si la sesión ya tiene auth state guardado, devuelve `{ ok: true, qr: null }` y queda conectada.

### `GET /sessions/:session_id/status` — Estado de la sesión

Response 200:
```json
{
  "status": "qr_required" | "connecting" | "connected" | "logged_out" | "banned" | "error",
  "qr": "data:image/png;base64,...",
  "display_phone": "+5491155551234",
  "last_seen_at": "2026-05-23T01:00:00Z"
}
```

La app polea este endpoint mientras está conectando. Cuando aparece `qr`, lo muestra al usuario.

### `POST /sessions/:session_id/send` — Enviar mensaje

Request:
```json
{
  "to": "+5491155551234",
  "body": "Hola María! Te confirmo el turno para mañana."
}
```

Response 200:
```json
{ "ok": true, "external_id": "BAE5..." }
```

Errors 4xx/5xx devuelven `{ ok: false, error: "..." }`.

Si la sesión no está conectada → 409 Conflict.

### `DELETE /sessions/:session_id` — Desconectar y borrar credenciales

Response 200: `{ ok: true }`

### Webhook saliente (worker → cosmeticOS)

Cuando llega un mensaje entrante o cambia el estado de uno saliente, el worker debe hacer:

```
POST https://tbjbezwtblecbrluwmtw.supabase.co/functions/v1/whatsapp-webhook
Content-Type: application/json
X-Worker-Secret: <shared>

{
  "provider": "baileys",
  "session_id": "uuid",
  "kind": "message_in" | "message_status",
  "message": { ... payload ... }
}
```

(La Edge Function `whatsapp-webhook` actualmente parsea formato Meta. Cuando arme el contrato para Baileys, se extiende esa función.)

## Implementación recomendada

- **Stack:** Node.js 20 + Baileys + Fastify/Express + Redis (para guardar `creds.json` y `keys.json` por sesión).
- **Persistencia auth_state:** mejor encriptado en Postgres (`whatsapp_sessions.baileys_auth_state`) que en disco — así si el worker se reinicia se restaura sin re-escanear QR.
- **Concurrencia:** una sesión Baileys por proceso. Para escalar, sharding por `session_id` (consistent hashing).
- **Reconexión:** si Baileys emite `connection.update` con `lastDisconnect`, parsear `DisconnectReason` y decidir si re-conectar o pedir nuevo QR. Cuando `loggedOut` → marcar `status = logged_out` y NO reconectar (esperar que el dueño escanee QR nuevo).
- **Rate limiting:** WhatsApp limita ~80 mensajes/segundo por línea, pero con números nuevos hay throttle agresivo (ban risk). Mantener cola con backoff.
- **Health checks:** `/healthz` que retorna `200` solo si Redis + cluster de sesiones están OK.

## Estado actual en cosmeticOS

- ✅ Schema completo en DB (`whatsapp_sessions` con campo `baileys_auth_state` y `last_qr_payload`).
- ✅ Edge Function `whatsapp-send` ya detecta `provider = 'baileys'` y proxya a `${BAILEYS_WORKER_URL}/sessions/:id/send`.
- ✅ UI en `/app/whatsapp/setup` muestra opciones Meta y Baileys.
- ❌ Worker propiamente dicho **no está incluido en este monorepo**. Es un servicio independiente.

Cuando esté el worker, las dos variables de env se cargan y la integración funciona end-to-end sin tocar la app.
