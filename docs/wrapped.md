# build 101 wrapped

El "Spotify Wrapped" de la hackathon: **`/wrapped`**, tarjetas que se pasan a mano. No está en el menú, ni en el sitemap, ni se indexa.

## Correr el script

```bash
cp wrapped/repos.example.json wrapped/repos.json     # { equipo, repo_url, finalista }
cp wrapped/hidden.example.json wrapped/hidden.json   # opcional: hashes y palabras que nunca salen
export GITHUB_TOKEN=$(gh auth token)                 # si no está, el script prueba `gh auth token`
npm run metrics
```

Cada corrida clona o actualiza los repos en `.data/wrapped-repos/` (`git clone --filter=blob:none`), calcula todo y escribe `wrapped/metrics.json`. La primera vez tarda; después solo hace `fetch`. Los datos cubren desde la apertura (sábado 17, 09:00) hasta el cierre de código (domingo 18, 11:00); lo que se commiteó después no cuenta.

| flag / variable | qué hace |
|---|---|
| `CIERRE=13:30 npm run metrics` | pisa el fin de la ventana (por defecto `CODE_FREEZE_ISO` en `app/event.ts`: domingo 18, 11:00) |
| `-- --offline` | no hace fetch: usa los clones que ya hay |
| `ANTHROPIC_API_KEY` | elige el top 5 de commits graciosos con Claude (sin clave, esa tarjeta no se muestra). Se cachea en `.data/wrapped-cache/` |

`wrapped/repos.json` y `wrapped/hidden.json` están en `.gitignore`.

## Publicar

`/wrapped` importa `wrapped/metrics.json` al compilar: no hay API ni base de datos, la página muestra exactamente el archivo commiteado. Para cambiar los números, corré el script, commiteá el JSON y deployá.

## Cómo se ve

Abrí `/wrapped` y pasá las tarjetas con ← →, con las flechas de los costados, tocando los segmentos de la barra de abajo o deslizando en el celular. Inicio / fin van a la primera y a la última; `f` pone pantalla completa. Las tarjetas sin datos se saltean solas.

La tarjeta actual queda en la URL: `/wrapped?card=5`.

## Qué se cuenta y qué no

- Solo commits con **fecha de committer** entre el kickoff (sábado 17, 09:00) y el cierre (domingo 18, 11:00), sin merges, de todas las ramas.
- Líneas sin `node_modules`, builds, lockfiles, minificados, datos (`.csv`, `.ipynb`, …) ni archivos de más de 10.000 líneas en un commit.
- Los commits de `NO_LINES` (en `scripts/wrapped/metrics.ts`) cuentan como commit pero no suman líneas: código ajeno copiado entero.
- Autores unificados por equipo (mismo email, mismo nombre o login de GitHub). Bots afuera (dependabot, github-actions, vercel, renovate, `[bot]`). Los agentes de IA cuentan para el % de IA, no como builders.
- "IA": trailers `Co-Authored-By`/`Generated with` o autor de Claude, Cursor, Copilot, Kiro, Codex, Gemini, Devin, Windsurf, Aider, v0, Lovable, etc.
- SDKs, frameworks y modelos: `package.json`, `requirements*.txt`, `pyproject.toml` e imports del código en la rama principal. Lenguajes y PRs: API de GitHub.
- En pantalla nunca hay emails ni nombres de personas. Un mensaje no se muestra si: está en `hidden.json` (hash o palabra), tiene insultos o malas palabras, tiene emails/URLs/@menciones/cosas que parecen claves, o nombra a alguien de los autores. Ante la duda, no se muestra.
