# cosmeticOS

El sistema operativo de las estéticas.

Plataforma SaaS multi-tenant para estéticas integrales (uñas, facial, masajes, spa, depilación, inyectables). Reemplaza agenda en papel + WhatsApp personal + Excel de caja por un único sistema.

## Stack

Next.js 16 (Turbopack) · React 19 · TypeScript · Tailwind v4 · motion · Supabase (Postgres + Auth + Realtime + Edge Functions) · Vercel.

## Setup local

```sh
pnpm install
pnpm dev
```

Abrir http://localhost:3000.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar.

## Estructura

Ver [CLAUDE.md](./CLAUDE.md).

## Estado

Foundation + módulos core (clientes, servicios, equipo, cabinas, turnero, caja) operativos. WhatsApp schema + webhook deployado. Módulos secundarios con stubs limpios.
