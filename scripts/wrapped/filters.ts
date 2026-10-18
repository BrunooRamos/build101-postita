// build 101 wrapped — qué se puede mostrar en la tele.
// Va a una pantalla de un evento con sponsors: ante la duda, no se muestra.

/** minúsculas, sin tildes y con el leetspeak más común deshecho (p0t0 → poto). */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[0@4$137]/g, (c) => ({ "0": "o", "@": "a", "4": "a", $: "s", "1": "i", "3": "e", "7": "t" })[c]!);
}

// Raíces: matchean al principio de una palabra ("mierda", "mierdas",
// "pelotudez"). Rioplatense, español neutro e inglés. Amplia a propósito.
const STEMS = [
  // rioplatense / español
  "boludo", "boluda", "boludez", "pelotud", "forro", "forra", "garch", "pija", "verga", "choto", "chota", "concha",
  "mierd", "carajo", "puta", "puto", "putit", "hdp", "lpm", "ctm", "qlo", "culo", "culia", "coger", "cogid", "cojer",
  "follar", "chupal", "chupame", "sorete", "trolo", "marica", "pajer", "paja", "orto", "ortiva", "mogolic", "mogolo",
  "retrasad", "subnormal", "idiota", "imbecil", "estupid", "pendej", "cabron", "huevon", "gilipoll", "joder",
  "jodid", "zorra", "perra", "nazi", "hitler", "matar", "suicid", "violar", "violad", "droga", "falopa", "porro",
  "teta", "pete", "malparid", "cagad", "cagar", "cago", "garca", "chorro", "tarad", "inutil", "asco",
  // inglés
  "fuck", "fck", "fuk", "wtf", "stfu", "shit", "bitch", "bastard", "asshole", "dick", "cock", "cunt", "pussy",
  "porn", "sex", "nsfw", "slut", "whore", "fag", "nigg", "retard", "damn", "crap", "piss", "kill", "rape", "suck",
  "bollocks", "wank", "twat", "prick", "jerk", "motherf", "hell", "drunk", "weed", "stupid", "idiot", "dumb",
];
// Palabras que empiezan con una raíz pero son inocentes en un commit.
const SAFE = new Set([
  "pajaro", "pajaros", "ortografia", "ortografico", "ortogonal", "hello", "helloworld", "helper", "helpers",
  "helpful", "sexto", "sexta", "cockpit", "peter", "petes", "asconfig", "puthon",
]);
const PHRASES = [/\bnegro\s+de\b/, /\bla\s+concha\b/, /\bque\s+lo\s+pario\b/, /\bme\s+cago\b/];

/** ¿Tiene algo que no queremos en la tele? */
export function isOffensive(text: string) {
  const norm = normalize(text);
  if (PHRASES.some((re) => re.test(norm))) return true;
  return norm
    .split(/[^a-z]+/)
    .some((word) => word && !SAFE.has(word) && STEMS.some((stem) => word.startsWith(stem)));
}

/** Datos que nunca van a pantalla: emails, URLs, menciones, cosas que parecen
 *  claves o tokens. */
export function hasPrivateData(text: string) {
  return (
    /[\w.+-]+@[\w-]+\.[\w.]+/.test(text) || // email
    /\bhttps?:\/\/|www\.|\.(com|io|dev|app|uy|ai)\b/i.test(text) || // urls y dominios
    /(^|\s)@[\w-]{2,}/.test(text) || // @menciones
    /\b(sk|pk|rk|ghp|gho|ghs|github_pat|xox[abp]|AKIA|AIza)[-_][\w-]{8,}/.test(text) || // claves conocidas
    /\b[A-Za-z0-9+/_-]{32,}\b/.test(text) || // tokens largos (y hashes)
    /\b\d{7,}\b/.test(text) // teléfonos, cédulas
  );
}

export type Hidden = { commits: string[]; words: string[] };

/** Fábrica del filtro final: `show(hash, text)` devuelve el texto listo para
 *  pantalla o null si no se puede mostrar. `names` son tokens de nombres de
 *  personas (sacados de los autores) que tampoco pueden aparecer. */
export function makeShowFilter(hidden: Hidden, names: Set<string>) {
  const hiddenHashes = hidden.commits.map((h) => h.trim().toLowerCase()).filter((h) => h.length >= 4);
  const hiddenWords = hidden.words.map((w) => normalize(w.trim())).filter(Boolean);
  return (hash: string, text: string): string | null => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) return null;
    if (hiddenHashes.some((h) => hash.toLowerCase().startsWith(h))) return null;
    const norm = normalize(clean);
    if (hiddenWords.some((w) => norm.includes(w))) return null;
    if (isOffensive(clean) || hasPrivateData(clean)) return null;
    if (norm.split(/[^a-z]+/).some((w) => names.has(w))) return null;
    return clean;
  };
}

/** ¿Se puede mostrar esta palabra suelta (nube de palabras)? */
export function wordIsShowable(word: string, hidden: Hidden, names: Set<string>) {
  const norm = normalize(word);
  if (names.has(norm) || isOffensive(word)) return false;
  return !hidden.words.some((w) => w.trim() && norm.includes(normalize(w.trim())));
}
