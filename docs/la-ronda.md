# La ronda · build 101

Juego en `/invertir`. Ranking en `/invertir/resultados`. La vista previa ya usa la nómina real de acreditaciones.

## Reglas

- Una cartera de US$ 1.000.000 por **persona**, no por equipo.
- Selección de equipo y nombre entre la nómina hardcodeada.
- Se reparte el millón completo entre uno o más equipos, en pasos de US$ 25.000.
- El equipo propio queda bloqueado tanto en la interfaz como en la API.
- La persona puede editar su cartera mientras la ronda esté abierta. Una confirmación reemplaza su cartera anterior; nunca agrega otro millón.
- Solo las carteras confirmadas aparecen en el ranking. Los resultados muestran capital, cantidad de inversores, porcentaje y posiciones compartidas en caso de empate.
- El ranking se actualiza cada cinco segundos, permite acceso directo y exportación CSV.

## Participantes y finalistas

Editar **`lib/investment-game.ts`**:

1. `INVESTOR_TEAMS` contiene los **33 equipos y 99 participantes** de `build101 - Acreditaciones.xlsx`, hoja `Acreditaciones`, columnas A–C (filas 2–100). Se conserva la asociación del archivo, incluidos los dos participantes sin marca de llegada. No se importan emails, teléfonos ni observaciones.
2. Los IDs de equipo (`equipo-01` a `equipo-33`) siguen la numeración de acreditaciones. Cada participante tiene un ID único, una cartera y US$ 1.000.000. Los totales se derivan de las 99 personas.
3. Completar `FINALIST_TEAM_IDS` con los **10 equipos que recibirán inversiones**, usando los IDs anteriores. La nómina de votantes sigue incluyendo a los 33 equipos; elegir finalistas no excluye a nadie de votar. El vínculo `teamId` bloquea en interfaz y servidor a los integrantes del propio equipo finalista.
4. Mientras no se elijan finalistas, la demo muestra 10 casilleros “a definir” y lo indica en pantalla. No se asignan votos ficticios a las personas reales (`seedDemoInvestments: false`). La nueva ronda `build101-acreditaciones-preview-v1` separa sus carteras de los datos de prueba anteriores.
5. Para la ronda definitiva, poner `INVESTMENT_GAME.demo` en `false` y elegir un `roundId` nuevo. Sin una lista de finalistas, este modo no habilita proyectos ficticios.
6. `open: true` permite guardar o editar. Cambiar a `false` y desplegar cierra la ronda y deja los resultados accesibles.

Las 99 carteras empiezan vacías: el capital total disponible es US$ 99.000.000 y el ranking arranca en cero. Importar la nómina no autentica personas ni crea cuentas en servicios externos; habilita su selección dentro del juego.

## Persistencia y despliegue

En desarrollo y servidores Node persistentes, las carteras se guardan en `.data/<roundId>.json` (ignorado por Git), con escrituras serializadas y reemplazo atómico del archivo. Se comparten entre navegadores que accedan a ese servidor y sobreviven a su reinicio. No usar el archivo como base de datos con varias instancias.

En Vercel, configurar una base Redis con API REST compatible con Upstash:

```text
INVESTMENTS_REDIS_REST_URL=https://...upstash.io
INVESTMENTS_REDIS_REST_TOKEN=...
```

El servidor usa un hash por ronda y un campo por participante. `HSET` reemplaza atómicamente la cartera de una persona y `HGETALL` permite reconstruir los totales. Las credenciales se usan solo en el servidor. Referencia: https://upstash.com/docs/redis/features/restapi.

También reconoce las variables que crea la integración de Vercel: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, o `KV_REST_API_URL` + `KV_REST_API_TOKEN`. No hace falta duplicarlas con el prefijo `INVESTMENTS_`.

**Sin Redis en Vercel:** con `demo: true`, la demo funciona con almacenamiento en ese navegador y sincroniza sus pestañas. La interfaz explica este alcance; no representa votos de otros dispositivos. Con `demo: false`, no acepta inversiones hasta configurar persistencia compartida. Nunca se simula un guardado real en memoria efímera de Vercel.

Desplegar este checkout en el proyecto Vercel existente habilita `https://build101.dev/invertir` y `https://build101.dev/invertir/resultados`; no se agrega un enlace a la landing.

## Identificación

La selección de nombre identifica la cartera; **no autentica a la persona**. Quien elija otro nombre podría cambiar esa cartera. Para una votación controlada, el siguiente paso antes de abrir la ronda real es agregar un PIN individual o enlace personal, según cómo se quiera repartir el acceso.

## Verificación

```bash
node --experimental-strip-types --test scripts/investment-game.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Además se verifican vía HTTP los rechazos de la API, la persistencia, el reemplazo de carteras y envíos simultáneos; en el navegador se prueba el flujo completo y la versión móvil.
