# build 101 — sitio

Landing e inscripción de [build 101](https://build101.dev), la hackathon de IA más grande de Uruguay (17 y 18 de octubre de 2026, Universidad de Montevideo · FIUM, LATU).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript, deploy en Vercel.
- CSS propio con tokens (`app/globals.css`) y la capa de terminal / easter eggs (`app/fx.css`). Sin Tailwind.
- Tipografía: Geist Sans para leer, Geist Mono para la voz "terminal" (wordmark, titular del hero, terminal, números).

## Correr en local

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run lint
```

Para probar el envío de inscripciones en local, copiá `.env.example` a `.env.local` y completá las variables (ver abajo).

## Dónde se edita cada cosa

| qué | dónde |
|---|---|
| Fechas, horarios, sede, fecha límite, organizadores, LinkedIn, mails | `app/event.ts` (fuente única de verdad) |
| Redes de build 101 (footer, schema `sameAs`, `/llms.txt`) | `SOCIALS` en `app/event.ts` |
| Abrir / cerrar inscripciones | `APPLY_OPEN` en `app/event.ts` |
| Preguntas frecuentes (se usan también en el schema y `/llms.txt`) | `app/faqs.tsx` |
| Sponsors por categoría y tamaño de cada logo | `app/components/Sponsors.tsx` + logos en `public/sponsors/` |
| Mentores y jurado (hoy TBA) | `app/components/Mentors.tsx` |
| Fotos de la sede | `app/components/SedeCarousel.tsx` + `public/fium-*.webp` |

## Inscripción

- `/inscripcion` → elegir camino; `/inscripcion/equipo` (3 integrantes) y `/inscripcion/solo` (busca equipo).
- Flujo: datos → revisar → enviado (o error, conservando los datos).
- `POST /api/inscripcion` valida en el servidor (`lib/inscripcion.ts`) y escribe una fila en la Google Sheet **build 101 · Postulaciones** vía un web app de Apps Script.
- Configuración paso a paso: [`docs/inscripciones-google-sheets.md`](docs/inscripciones-google-sheets.md).

Variables de entorno (Vercel → Settings → Environment Variables):

```
GOOGLE_SHEETS_WEBHOOK_URL=      # URL /exec del web app de Apps Script
GOOGLE_SHEETS_WEBHOOK_SECRET=   # el mismo valor que SHARED_SECRET en el script
```

## Easter eggs

La terminal del hero es interactiva (`help`), el código Konami (o tipear `deploy`) dispara la lluvia matrix, `crash` en la terminal muestra un error falso que se arregla solo, y "quiero participar" corre un deploy falso antes de abrir el formulario.
