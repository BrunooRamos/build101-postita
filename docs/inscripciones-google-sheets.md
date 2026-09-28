# Inscripciones → Google Sheets

El formulario de `/inscripcion` manda cada postulación a `/api/inscripcion`, que la valida y la agrega como fila en la planilla **build 101 · Postulaciones** (Drive de Ramiro). La escritura la hace un web app de Apps Script pegado a la planilla: no hace falta una cuenta de Google Cloud.

```
navegador ──POST──▶ /api/inscripcion (Vercel) ──POST + secreto──▶ Apps Script ──▶ Google Sheet
```

## Configuración (una sola vez, ~5 minutos)

1. **Abrí la planilla** "build 101 · Postulaciones". La fila 1 ya tiene los encabezados; no la borres.
2. **Pegá el script:** Extensiones → Apps Script. Borrá lo que haya en `Code.gs` y pegá el contenido de [`scripts/google-apps-script/Code.gs`](../scripts/google-apps-script/Code.gs).
3. **Generá un secreto** (cualquier texto largo y aleatorio, por ejemplo con `openssl rand -hex 32`) y pegalo en `SHARED_SECRET`. Guardá.
4. **Publicá el web app:** Implementar → Nueva implementación → tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Autorizá los permisos cuando te los pida (es tu propia planilla).
   - Copiá la URL que termina en `/exec`.
5. **Variables en Vercel** (Project → Settings → Environment Variables, en Production y Preview):
   - `GOOGLE_SHEETS_WEBHOOK_URL` = la URL `/exec`
   - `GOOGLE_SHEETS_WEBHOOK_SECRET` = el mismo secreto del paso 3
6. **Redeploy** y mandá una postulación de prueba desde el preview. Tiene que aparecer una fila nueva.

Para probar en local, poné las mismas dos variables en `.env.local` (está en `.gitignore`).

> "Cualquier usuario" significa que la URL acepta requests sin login de Google. Lo que protege la planilla es el secreto: sin él, el script rechaza el envío. Si el secreto se filtra, cambialo en el script **y** en Vercel.

Si cambiás el código del script, hacé Implementar → Gestionar implementaciones → editar → **Nueva versión**; la URL se mantiene.

## Columnas

Una fila por postulación. El script completa las columnas por nombre de encabezado, así que podés reordenarlas o sumar columnas propias. Desde la versión del script con encabezados automáticos, si el sitio manda un dato sin columna, el script la crea al final (hay que publicar esa versión: Implementar → Gestionar implementaciones → **Nueva versión**). Con una versión anterior del script, el dato se descarta: agregá los encabezados a mano antes de publicar un campo nuevo.

| columna | contenido |
|---|---|
| `fecha` | fecha y hora de Montevideo |
| `id` | id corto de la postulación |
| `tipo` | `equipo` o `busca equipo` |
| `estado` | arranca en `pendiente`; lo cambian ustedes (aceptado, rechazado…) |
| `nombre_equipo` | opcional, solo equipos |
| `rol` | solo "busca equipo": `desarrollo`, `diseño`, `producto`, `negocio` u `otro` |
| `motivacion` | por qué quieren estar (el equipo, o la persona si viene sola) |
| `acepta` | `sí`: confirmaron disponibilidad los dos días y que comparten los datos |
| `p1_*` | contacto: `nombre` (nombre y apellido), `celular` (`+598 9X XXX XXX`), `mail`, `universidad`, `empresa`, `link` |
| `p2_*`, `p3_*` | integrantes 2 y 3, mismos campos (vacío si busca equipo) |
| `notas_organizadores` | columna libre para ustedes (el sitio no la toca) |

`universidad`, `empresa` y `link` son opcionales. Las postulaciones anteriores al formulario v2 tienen `p*_apellido`, `p*_ia` y `comentarios` en lugar de los campos nuevos: esas columnas quedan en la planilla para esas filas.

## Anti-spam

- Campo oculto (honeypot) y tiempo mínimo de llenado: los bots reciben un "ok" falso y no se guarda nada.
- Límites cada 10 minutos: 40 envíos por IP (en el WiFi de una facultad muchos comparten IP) y 5 por IP + mail de contacto.
- Validación completa en el servidor (mails, celulares, links, campos obligatorios, mails repetidos en un equipo).

## Borrador

El formulario guarda lo que se va cargando en el navegador de quien lo completa (`localStorage`): si recarga o sale a pedirle un dato a un compañero, lo encuentra al volver. Se borra al enviar o con "empezar de cero".

## Abrir y cerrar inscripciones

- **Cierre automático:** la API rechaza envíos después de `APPLY_DEADLINE_ISO` (se acepta hasta el final del minuto 23:59), y el formulario avisa que cerró apenas se abre. No hace falta tocar nada a la hora del cierre.
- **Textos de la landing:** las páginas son estáticas y siguen diciendo "inscripciones abiertas" hasta que pongas `APPLY_OPEN` en `false` en `app/event.ts` y se vuelva a publicar. Hacelo el día después del cierre.
- `APPLY_OPEN` en `false` también cierra todo antes de tiempo: la landing deja de linkear al formulario y la API rechaza envíos.
