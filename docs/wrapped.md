# build 101 wrapped

El "Spotify Wrapped" de la hackathon para la tele del cierre: **`/wrapped`**. No está en el menú, ni en el sitemap, ni se indexa.

## Correr el script

```bash
cp wrapped/repos.example.json wrapped/repos.json     # { equipo, repo_url, finalista }
cp wrapped/hidden.example.json wrapped/hidden.json   # opcional: hashes y palabras que nunca salen
export GITHUB_TOKEN=$(gh auth token)                 # si no está, el script prueba `gh auth token`
npm run metrics
```

Cada corrida clona o actualiza los repos en `.data/wrapped-repos/` (`git clone --filter=blob:none`), calcula todo y escribe `wrapped/metrics.json` (commitealo: es el snapshot que ve el deploy si Redis está vacío). La primera vez tarda; después solo hace `fetch`. Correlo cada 10–15 min hasta el cierre.

| flag / variable | qué hace |
|---|---|
| `CIERRE=13:30 npm run metrics` | pisa la hora de cierre de código (por defecto `CODE_FREEZE_ISO` en `app/event.ts`) |
| `-- --no-publish` | solo escribe el archivo local |
| `-- --offline` | no hace fetch: usa los clones que ya hay |
| `ANTHROPIC_API_KEY` | elige el top 5 de commits graciosos con Claude (sin clave, esa tarjeta no se muestra). Se cachea en `.data/wrapped-cache/` |

`wrapped/repos.json` y `wrapped/hidden.json` están en `.gitignore`.

## Publicar

La página lee `GET /api/wrapped`, que devuelve, en orden:

1. el último `metrics.json` publicado en Redis (key `build101:wrapped:metrics`), si hay credenciales;
2. en local, `wrapped/metrics.json` recién escrito;
3. si no hay nada, el snapshot commiteado `wrapped/metrics.json` (también real, de la última corrida).

Usa el mismo Redis REST (Upstash) que la ronda de inversión. Para que el script publique, exportá las mismas credenciales que tiene Vercel:

```bash
export INVESTMENTS_REDIS_REST_URL=https://...upstash.io
export INVESTMENTS_REDIS_REST_TOKEN=...
npm run metrics      # → "publicado: /wrapped lo toma en la próxima vuelta del loop"
```

(también acepta `UPSTASH_REDIS_REST_URL/TOKEN` o `KV_REST_API_URL/TOKEN`, y las lee de `.env.local`). No hace falta redeploy: la tele recarga los datos en cada vuelta del loop y, si la carga falla, sigue mostrando los últimos buenos. El pie muestra "actualizado hace X min" según la hora de la corrida del script.

## En la tele

Abrí `/wrapped` en pantalla completa (`f`). Espacio pausa, ← → cambian de tarjeta. Cada tarjeta dura ~9 s y cada 6 aparece la vista general. Las tarjetas sin datos (p. ej. "a último minuto" antes del cierre) se saltean solas.

Para revisar una tarjeta: `/wrapped?card=5&hold`.

## Qué se cuenta y qué no

- Solo commits con **fecha de committer** entre el kickoff y el cierre, sin merges, de todas las ramas.
- Líneas sin `node_modules`, builds, lockfiles, minificados, datos (`.csv`, `.ipynb`, …) ni archivos de más de 10.000 líneas en un commit.
- Autores unificados por equipo (mismo email, mismo nombre o login de GitHub). Bots afuera (dependabot, github-actions, vercel, renovate, `[bot]`). Los agentes de IA cuentan para el % de IA, no como builders.
- "IA": trailers `Co-Authored-By`/`Generated with` o autor de Claude, Cursor, Copilot, Kiro, Codex, Gemini, Devin, Windsurf, Aider, v0, Lovable, etc.
- SDKs, frameworks y modelos: `package.json`, `requirements*.txt`, `pyproject.toml` e imports del código en la rama principal. Lenguajes y PRs: API de GitHub.
- En pantalla nunca hay emails ni nombres de personas. Un mensaje no se muestra si: está en `hidden.json` (hash o palabra), tiene insultos o malas palabras, tiene emails/URLs/@menciones/cosas que parecen claves, o nombra a alguien de los autores. Ante la duda, no se muestra.
