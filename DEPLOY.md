# Deploy en Vercel — cosmeticOS

Guía paso a paso. Asumimos que el proyecto Supabase ya está creado (`tbjbezwtblecbrluwmtw`).

## 1. Subir a GitHub

El repo ya tiene remote configurado en `github.com/Trinkmax/cosmeticOS`.

```bash
git push -u origin main
```

Si pide auth, usá un Personal Access Token de GitHub con scope `repo`.

## 2. Conectar el repo en Vercel

1. Andá a [vercel.com/new](https://vercel.com/new)
2. Importá el repo `Trinkmax/cosmeticOS`
3. **Framework Preset**: Next.js (auto-detect)
4. **Build Command**: `pnpm build` (auto-detect)
5. **Output Directory**: `.next` (default)
6. **Install Command**: `pnpm install --frozen-lockfile`
7. **Node Version**: 20.x o superior

## 3. Variables de entorno

En Vercel → Project → Settings → Environment Variables, sumá:

| Variable | Valor | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tbjbezwtblecbrluwmtw.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` (de Supabase → Settings → API) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (Supabase → Settings → API → service_role) | **Production, Preview** (NO Development) |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.com` (la URL de producción) | Production |
| `NEXT_PUBLIC_APP_URL` | `https://${VERCEL_URL}` o tu preview URL | Preview |
| `WHATSAPP_META_VERIFY_TOKEN` | un string aleatorio largo (rotar antes de prod) | Production, Preview |
| `BAILEYS_WORKER_URL` | opcional — solo si tenés worker corriendo | Production |
| `BAILEYS_WORKER_SECRET` | opcional — string aleatorio | Production |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` da **acceso total a la DB**. NUNCA lo metas en variables con prefijo `NEXT_PUBLIC_` ni lo expongas a clientes.

## 4. Configurar dominio

1. Vercel → Project → Settings → Domains
2. Agregá tu dominio (ej. `app.cosmeticos.com`)
3. Vercel te da los registros DNS (A o CNAME) para configurar
4. Una vez propagado, actualizá `NEXT_PUBLIC_APP_URL` con el dominio final

## 5. Configurar Supabase para el dominio nuevo

Necesario para que el auth funcione con redirects desde el dominio de Vercel:

### 5.1. URL Configuration

Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: `https://tu-dominio.com` (o la URL de Vercel)
- **Redirect URLs** (sumar todas):
  - `https://tu-dominio.com/**`
  - `https://*.vercel.app/**` (para los previews)
  - `http://localhost:3000/**` (para desarrollo)

### 5.2. Activar el Auth Hook (crítico)

Supabase → **Authentication** → **Hooks** → **Send a custom access token**:
- **Hook type**: Postgres function
- **Schema**: `public`
- **Function name**: `custom_access_token_hook`
- **Enable**: ✅

Sin esto, el JWT no trae `current_tenant_id` y toda la RLS falla en silencio.

## 6. Configurar Edge Functions de Supabase

Las Edge Functions ya están deployadas en Supabase (`whatsapp-webhook`, `whatsapp-send`, `appointment-reminders`, `post-service-tasks`, `daily-jobs`). Solo hay que cargar sus env vars:

Supabase → **Edge Functions** → **Secrets**:

```
CRON_SECRET=cosmeticos-production-cron-CHANGE-ME
WHATSAPP_META_VERIFY_TOKEN=el-mismo-token-que-pusiste-en-vercel
APP_PUBLIC_URL=https://tu-dominio.com
BAILEYS_WORKER_URL=                  # opcional
BAILEYS_WORKER_SECRET=               # opcional
```

> El `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase automáticamente — no los seteés a mano.

## 7. Actualizar el vault de Supabase para que matchee CRON_SECRET

El `cron_secret` está en el Vault de Supabase (lo usa `pg_cron` para llamar a las Edge Functions):

```sql
-- Rotar el cron_secret en vault
select vault.update_secret(
  (select id from vault.secrets where name = 'cron_secret'),
  'cosmeticos-production-cron-CHANGE-ME'
);
```

Tiene que ser **exactamente el mismo valor** que pusiste en `CRON_SECRET` en las Edge Functions.

## 8. Configurar Meta Webhook (si vas a usar Meta Cloud API)

Meta Business → WhatsApp → Configuration → Webhook:
- **Callback URL**: `https://tbjbezwtblecbrluwmtw.supabase.co/functions/v1/whatsapp-webhook`
- **Verify Token**: el mismo `WHATSAPP_META_VERIFY_TOKEN` que pusiste arriba
- **Subscribe to**: `messages`, `message_status`

## 9. Smoke test en producción

Una vez deployado:

1. ✅ Abrí `https://tu-dominio.com` → ves la landing
2. ✅ Login con un usuario existente (admin@cosmeticos.com / Cosmeticos2026)
3. ✅ Dashboard carga datos (si no carga: revisar Auth Hook + JWT en DevTools → Application → Cookies → buscar el `sb-...` y verificar que tiene `current_tenant_id`)
4. ✅ Crear un turno y verificar anti-overbooking
5. ✅ Abrir el booking público `https://tu-dominio.com/r/kikinails` en incógnito
6. ✅ pg_cron sigue corriendo independiente (verificá con `select * from public.v_cron_jobs` en Supabase SQL editor)

## 10. Post-deploy: monitoring

- **Vercel logs**: Dashboard → Project → Logs (en tiempo real)
- **Supabase logs**: Dashboard → Logs → Edge Functions / Database
- **Realtime status**: Dashboard → Logs → Realtime
- **Performance**: Vercel → Project → Analytics (habilitalo desde Settings → Analytics)

## Rollback

Si algo rompe en producción:

```bash
# Promote previous deployment to production from Vercel dashboard
# o por CLI:
vercel rollback
```

Ningún rollback toca la DB. Los cambios de schema se manejan separados (vía MCP o `supabase` CLI).

## Cosas que NO se hostean en Vercel

- **Worker de Baileys**: si lo usás, va a Fly.io / Railway / VPS. Ver `docs/baileys-worker.md`.
- **Cron jobs**: corren en Supabase (pg_cron + pg_net), no en Vercel. Plan Hobby tiene límite de 2 daily crons; no usamos ninguno.
- **Edge Functions de WhatsApp**: corren en Supabase, no en Vercel.

## Comandos útiles

```bash
# Local dev
pnpm dev

# Build local (igual que Vercel)
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Regenerar tipos de DB (después de cambiar schema)
# Via Supabase MCP: mcp__supabase__generate_typescript_types → src/lib/db/types.ts
```
