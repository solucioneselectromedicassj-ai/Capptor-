# Capptor

PWA de gestión de producción cinematográfica: ingesta de guión (texto libre → Fountain),
desglose por escena, shot list, colaboración por rol, notificaciones de cambios en tiempo
real y call sheets exportables a PDF.

## Stack

- React + Vite + TypeScript, Tailwind CSS v4
- Dexie.js (IndexedDB) previsto para offline-first
- Supabase (Postgres + Realtime + Auth + Edge Functions)
- `@react-pdf/renderer` para las call sheets
- CodeMirror 6 con resaltado Fountain custom
- `fountain-js` + parser/diff propios (`src/lib/fountain`)
- Zustand + React Router v6
- vite-plugin-pwa (manifest + service worker)

## Setup

1. `npm install`
2. Creá un proyecto en [Supabase](https://supabase.com) y corré `supabase/schema.sql`
   en el SQL editor (crea las tablas, RLS y las agrega a la publicación de Realtime).
3. Copiá `.env.example` a `.env` y completá `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API).
4. Deployá las Edge Functions:
   ```bash
   supabase functions deploy text-to-fountain
   supabase functions deploy invite-member
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
   El texto→Fountain y la invitación de miembros corren server-side para no exponer
   la API key de Anthropic ni el service role key en el bundle del cliente.
5. `npm run dev`

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — typecheck + build de producción (incluye el service worker PWA)
- `npm run preview` — sirve el build de producción localmente
- `npm run lint` — oxlint

## Estructura

Ver `src/components`, `src/lib`, `src/stores`, `src/pages` y `src/types` — organizados
por dominio (editor de guión, desglose, shot list, call sheet, notificaciones, proyecto).
El núcleo de parsing vive en `src/lib/fountain`: `parser.ts` (Fountain → escenas),
`diff.ts` (preserva UUIDs de escena entre ediciones del guión) y `textConverter.ts`
(texto libre → Fountain vía Edge Function).
