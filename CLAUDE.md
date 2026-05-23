# CLAUDE.md — cosmeticOS

Guía de orientación para Claude (o cualquier ingeniero) trabajando en este repo.

## Qué es

SaaS multi-tenant para estéticas integrales (uñas, facial, masajes, spa, depilación, inyectables) en Argentina. Reemplaza agenda en papel + WhatsApp personal + Excel de caja.

## Stack

- **Next.js 16** App Router (Turbopack) + React 19 + TS strict
- **Supabase**: Postgres + Auth + Realtime + Storage + Edge Functions
- **Tailwind v4** (CSS-first con `@theme`) + shadcn-style components (custom)
- **motion** (Framer Motion 12+) — animaciones
- `@supabase/ssr` ≥0.10 con `getAll`/`setAll` cookies pattern
- Zod, react-hook-form, sonner, lucide-react, date-fns + date-fns-tz
- Worker de Baileys queda **fuera de Vercel** (Fly.io / Railway)

## Convenciones críticas

### 1. Multi-tenancy
- Shared schema + `tenant_id` + RLS. Toda tabla de dominio tiene `tenant_id` con FK a `tenants`.
- `current_tenant_id` y `current_location_id` viajan en el JWT via `custom_access_token_hook`.
- Cambiar tenant = RPC `switch_tenant(_tenant_id, _location_id?)` → `auth.refreshSession()` → claims actualizados.
- RLS pattern: `tenant_id = (SELECT (auth.jwt() ->> 'current_tenant_id')::uuid)` — el `(SELECT ...)` envolvente es OBLIGATORIO (Supabase lint `0003_auth_rls_initplan`).

### 2. Next.js 16
- **Usar `proxy.ts` (no `middleware.ts`).** Función `proxy`, no `middleware`. Default runtime = Node.js.
- Server Components por defecto. `'use client'` solo donde hay interactividad.
- Server actions con Zod validation siempre.
- Server actions no pueden ser inline (`async () => { "use server"; ... }`) dentro de Client Components — exportarlas desde un archivo `actions.ts` y pasarlas como props, o usar `.bind()`.
- `useActionState<TResult, FormData>` con generic explícito si el action retorna `Result<T>`.

### 3. Supabase (SSR)
- `await createClient()` desde `@/lib/supabase/server` (es async — `cookies()` es async en Next 16).
- Usar **`getUser()`** o **`getClaims()`** server-side. JAMÁS `getSession()` (no verifica el JWT).
- Cliente browser → `@/lib/supabase/client.ts` (lazy singleton).
- `@/lib/supabase/admin.ts` solo en Edge Functions o tareas de sistema. NUNCA en Server Component sin auth manual.

### 4. Auth helpers
- `getSession()` — retorna `{ user, currentTenantId, currentLocationId, currentRole, tenants[] }` o null
- `requireSession()` — redirige a /login si no hay sesión
- `requireTenant()` — redirige a /onboarding o /select-tenant si no hay tenant activo

### 5. Anti-overbooking
- Constraint EXCLUDE GIST en `appointment_professional_blocks` y `appointment_room_blocks` (denorm).
- Triggers mantienen los blocks en sync con `appointments + junctions`.
- Conflicto → SQLSTATE `23P01`. Capturar en server action y devolver mensaje UX.

### 6. UI/UX
- Español neutro (tú/usted). No voseo.
- Animaciones de motion (`@/components/motion/primitives`): FadeIn, SlideUp, Stagger.
- Focus rings custom: `ring-2 ring-ring ring-offset-2`.
- Skeletons "respiran" (clase `.skeleton-breath`).
- Empty states siempre con `EmptyState` (icon + título + descripción + CTA).
- Sin "Lorem ipsum". Sin "TODO: implementar". Lo que no esté terminado va con `<ComingSoon />`.

### 7. Dinero
- Todo en **centavos** (bigint en DB, `number` en TS). Helper `formatCents(cents, currency, locale)`.
- Currency default `ARS`. Timezone default `America/Argentina/Buenos_Aires`.

### 8. Teléfonos
- E164 con `libphonenumber-js` (default region AR). Helper `formatPhone(e164)`.
- Constraint en DB: `phone_e164 ~ '^\+[1-9]\d{6,14}$'`.
- Unique por `(tenant_id, phone_e164)`.

## Comandos

```sh
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
```

DB:
- Migraciones via MCP: `mcp__supabase__apply_migration` con `name` y `query`.
- Después de cambios DDL: `mcp__supabase__get_advisors` con `type=security` y `type=performance`.
- Tipos TS: `mcp__supabase__generate_typescript_types` → guardar en `src/lib/db/types.ts`.

## Estructura

```
src/
├── app/
│   ├── (auth)/             # /login, /signup, /logout
│   ├── (onboarding)/       # /onboarding, /select-tenant
│   ├── app/                # /app/* (dashboard) — layout con sidebar + topbar
│   │   ├── clientes/
│   │   ├── servicios/
│   │   ├── equipo/
│   │   ├── cabinas/
│   │   ├── turnero/
│   │   ├── caja/
│   │   ├── whatsapp/
│   │   └── ...             # paquetes, stock, comisiones, resenias, etc.
│   ├── layout.tsx          # root layout (html, fonts, theme provider)
│   ├── page.tsx            # landing pública
│   └── globals.css         # Tailwind v4 + @theme tokens
├── components/
│   ├── ui/                 # primitives (Button, Input, Dialog, etc.)
│   ├── app/                # PageHeader, EmptyState, Sidebar, Topbar
│   └── motion/             # FadeIn, SlideUp, Stagger
├── lib/
│   ├── supabase/           # server.ts, client.ts, admin.ts, proxy.ts
│   ├── auth/session.ts     # getSession, requireSession, requireTenant
│   ├── schemas/            # Zod schemas por dominio
│   ├── db/types.ts         # types generados
│   ├── env.ts              # env validation
│   └── utils.ts            # cn, formatCents, formatPhone, initials
└── proxy.ts                # Next.js 16 proxy (auth refresh + redirects)

supabase/
└── functions/whatsapp-webhook/  # Edge Function (Meta Cloud API receiver)
```

## Anti-patrones (no hacer)

- ❌ `middleware.ts` en Next 16 (deprecado, usar `proxy.ts`)
- ❌ `getSession()` server-side (sin verificación del JWT)
- ❌ `'use server'` directive inline dentro de Client Component
- ❌ Service role key en código del cliente o sin auth check
- ❌ Queries sin RLS bypass justificado
- ❌ Tablas de dominio sin `tenant_id`
- ❌ RLS policies sin `(SELECT ...)` wrapping en helpers
- ❌ Inglés en UI (es español)
- ❌ shadcn default look — todo customizado
- ❌ "TODO: implementar después" en código merged

## RLS Helpers (DB functions)

- `current_tenant_id()` — uuid del tenant activo del JWT
- `current_location_id()` — uuid de la location activa
- `is_tenant_member(_tenant_id)` — bool
- `is_tenant_admin(_tenant_id)` — bool (owner|admin)
- `has_tenant_role(_tenant_id, _roles[])` — bool
- `is_location_accessible(_location_id)` — bool

Todas SECURITY DEFINER con `set search_path = ''`. STABLE para cache por-query.

## RPCs públicas

**Auth/tenancy:**
- `create_tenant(...)` → jsonb `{ tenant_id, location_id }`
- `switch_tenant(_tenant_id, _location_id?)`
- `switch_location(_location_id)`

**Turnero:**
- `create_appointment(_location_id, _starts_at, _ends_at, _client_id?, _walk_in_name?, _service_ids[], _professional_ids[], _room_ids[], _notes?, _source?, _status?)` → uuid
- `is_professional_free(_professional_id, _starts_at, _ends_at, _exclude_appointment_id?)` → bool
- `is_room_free(_room_id, _starts_at, _ends_at, _exclude_appointment_id?)` → bool

**Clientes / KPIs:**
- `search_clients(_q, _limit?)` → rows (trigram + unaccent)
- `get_dashboard_kpis(_from?, _to?)` → jsonb

**Public booking (anon-callable):**
- `public_get_booking_info(_slug)` → jsonb (tenant + servicios + profesionales + ubicaciones, solo si `booking_link_enabled`)
- `public_get_availability(_tenant_slug, _professional_id, _date, _duration_minutes)` → jsonb (slots libres)
- `public_create_booking(...)` → jsonb (crea cliente+turno desde anon)

## Edge Functions activas

- `whatsapp-webhook` (verify_jwt=false) — recibe webhook de Meta + parsea a `whatsapp_messages`.
- `whatsapp-send` (verify_jwt=true) — envío outbound a Meta o proxy al worker Baileys.
- `appointment-reminders` (verify_jwt=false, X-Cron-Secret) — recordatorios 24h/2h por WhatsApp.
- `post-service-tasks` (verify_jwt=false) — solicita reseña 2h post-turno completado.
- `daily-jobs` (verify_jwt=false) — birthday + package_expiring.

## pg_cron schedules (Supabase, NO Vercel)

Vercel Hobby tiene límite de 2 crons/día. Los recordatorios viven en Supabase via pg_cron + pg_net:

| Job | Cron | Edge function |
|---|---|---|
| `cosmeticos_appointment_reminders_5min` | `*/5 * * * *` | appointment-reminders |
| `cosmeticos_review_request_5min` | `*/5 * * * *` | post-service-tasks |
| `cosmeticos_close_lingering_appointments_15min` | `*/15 * * * *` | (SQL inline) |
| `cosmeticos_birthday_check_daily` | `0 12 * * *` | daily-jobs (job=birthday) |
| `cosmeticos_package_expiring_daily` | `0 13 * * *` | daily-jobs (job=package_expiring) |
| `cosmeticos_expire_old_packages_daily` | `0 3 * * *` | (SQL inline) |

Ver vista `public.v_cron_jobs` para inspeccionar estado.

Helper `private.call_edge(fn_name, payload)` lee `cron_secret` del Vault y dispara via pg_net. Rotar secret: `select vault.update_secret(id, 'nuevo-valor');`.

## Setup pendiente fuera de código

1. **Habilitar el custom_access_token_hook**: en Supabase Dashboard → Auth → Hooks, registrar `public.custom_access_token_hook` como "Access Token Hook". Sin esto, el JWT no trae `current_tenant_id` y las RLS fallan silenciosamente.
2. **Edge Function env vars**: `CRON_SECRET` debe coincidir con el secret del vault. `WHATSAPP_META_VERIFY_TOKEN` para el webhook de Meta. Opcionalmente `BAILEYS_WORKER_URL` y `BAILEYS_WORKER_SECRET`.
3. **Storage buckets** (cuando se necesiten para fotos): `client-files`, `payouts`, `whatsapp-media`. Las firmas de consentimientos hoy se guardan inline como data URL.
4. **Worker de Baileys** (Fly.io o Railway) — ver `docs/baileys-worker.md` para el contrato HTTP.
5. **Webhook Meta**: apuntar a `https://tbjbezwtblecbrluwmtw.supabase.co/functions/v1/whatsapp-webhook` con `verify_token = WHATSAPP_META_VERIFY_TOKEN`.

## Estado actual del producto

### ✅ Módulos completos con UI funcional
- **Auth + onboarding** (signup, login, magic link, wizard de creación de tenant + sucursal)
- **App shell** (sidebar agrupada con motion layoutId, topbar con tenant+location switcher, theme toggle)
- **Clientes** (CRUD + búsqueda trigram E164 + detalle con stats + salud + notas)
- **Servicios + Categorías** (CRUD agrupado por categoría, palette de colores, reglas online_bookable/requires_consent/requires_room)
- **Equipo / Profesionales** (CRUD con bio, color, avatar)
- **Cabinas** (CRUD por sucursal)
- **Turnero** (calendario día por profesional, time grid, click-to-create, dialog completo con multi-servicio+multi-profesional+cabina, suma automática de duración/precio, anti-overbooking server-side capturando SQLSTATE 23P01, **realtime refresh** suscrito a appointments)
- **Caja** (apertura/cierre de sesión con conteo manual, registrar pago manual con cuenta+cliente+kind, ledger inmutable, totales por cuenta del día)
- **Paquetes** (catálogo + venta a cliente con balances por servicio, redención automática vía trigger en appointment_services)
- **Stock** (productos vendibles + insumos, alertas de mínimo, tabs)
- **Comisiones** (reglas porcentaje/fijo con prioridad, generar liquidación por período, marcar pagado)
- **Reseñas** (vista con stats, casos abiertos con resolver/descartar, lista completa)
- **Consentimientos** (templates + dialog de firma con canvas + hash SHA-256 + IP + UA capture)
- **Stats** (KPIs + revenue chart SVG + top profesionales + top servicios + desglose, range picker 7d/30d/90d/1año)
- **Configuración** (sucursales, miembros con invitar+roles+deshabilitar, branding con paleta+link público, cuenta con TZ/moneda)
- **WhatsApp**:
  - Setup (Meta + Baileys con QR placeholder cuando worker está configurado)
  - **Inbox** con lista de chats + ventana de conversación + envío + status indicators + **realtime subscribe** + assign + mark spam/closed
- **Booking público** `/r/[slug]` (5 pasos animados: servicio → profesional → día/hora con slots reales → datos → confirmación)

### ✅ Backend completo
- 19 migraciones, ~60 tablas, RLS hardened (SELECT/INSERT/UPDATE/DELETE separados, sin FOR ALL duplicados), 60+ índices en FKs
- Anti-overbooking via EXCLUDE GIST verificado por smoke test
- 5 Edge Functions deployadas y operativas
- pg_cron + pg_net orquesta 6 schedules
- Smoke tests pasados (anti-overbooking + cancelled-libera-slot + helpers)

### ⚠️ Lo que queda fuera del scope de este monorepo
- **Worker de Baileys** propiamente dicho (servicio aparte, contrato en `docs/baileys-worker.md`)
- **Embedded Signup de Meta** (requiere registro como Business en Meta + revisión)
- **PDFs de comisiones** (placeholder text; integrar react-pdf o similar cuando sea necesario)
- **Drag-to-move/resize** en el turnero (la creación funciona via click; drag se implementa más adelante)
- **Email transaccional** (Resend setup pendiente; WhatsApp ya cubre la mayoría de comms)
- **Pagos online** (MercadoPago/Modo SDK; el schema y caja manual están listos)
- **i18n** (todo en español por ahora; arquitectura tolera next-intl si hace falta)
