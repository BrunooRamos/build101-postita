// ============================================================
// Inscripción — tipos y validación compartidos entre el formulario
// (cliente) y /api/inscripcion (servidor). El servidor vuelve a validar
// todo: lo del cliente es solo para mostrar errores al lado del campo.
// ============================================================

export type Mode = "solo" | "team";

/** Lo mismo para cada integrante: nada que uno no pueda contestar por otro. */
export type Member = {
  fullName: string;
  phone: string;
  email: string;
  /** Opcionales: no todos estudian, trabajan o tienen LinkedIn. */
  university: string;
  company: string;
  link: string;
};

/** "¿Qué hacés?" — solo para quien busca equipo: sirve para armar equipos que se complementen. */
export const ROLES = [
  { value: "desarrollo", label: "desarrollo" },
  { value: "diseño", label: "diseño" },
  { value: "producto", label: "producto" },
  { value: "negocio", label: "negocio" },
  { value: "otro", label: "otro" },
] as const;
export type Role = (typeof ROLES)[number]["value"];

export type Application = {
  mode: Mode;
  /** Solo para equipos; opcional. */
  teamName: string;
  /** 1 integrante para "solo", 3 para "team". El primero es el contacto. */
  members: Member[];
  /** Solo para "solo". */
  role: Role | "";
  /** Por qué quieren estar (los 3, o vos si venís solo). */
  motivation: string;
  /** Disponibilidad los dos días + acuerdo en compartir los datos. */
  consent: boolean;
};

/** Campos extra anti-spam que viajan con el envío (no se guardan). */
export type AntiSpam = {
  /** Honeypot: un campo oculto que una persona nunca completa. */
  website?: string;
  /** Epoch ms de cuando se empezó a llenar el formulario. */
  startedAt?: number;
};

export const TEAM_MEMBERS = 3;

export const LIMITS = {
  fullName: 80,
  phone: 24,
  email: 120,
  org: 80,
  link: 200,
  teamName: 60,
  motivation: 700,
} as const;

/** Un párrafo corto, pero que diga algo. */
export const MOTIVATION_MIN = 40;

export const emptyMember = (): Member => ({
  fullName: "",
  phone: "",
  email: "",
  university: "",
  company: "",
  link: "",
});

export const emptyApplication = (mode: Mode): Application => ({
  mode,
  teamName: "",
  members: Array.from({ length: mode === "team" ? TEAM_MEMBERS : 1 }, emptyMember),
  role: "",
  motivation: "",
  consent: false,
});

/** Errores por campo. Claves: "members.0.email", "motivation", etc. */
export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Dígitos con +, espacios, guiones, puntos o paréntesis opcionales.
const PHONE_RE = /^\+?[\d\s\-().]+$/;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";

// Párrafos: se respetan los saltos de línea.
const cleanText = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().replace(/\n{3,}/g, "\n\n").slice(0, max) : "";

/**
 * Celular en un solo formato, para escribir por WhatsApp directo desde la
 * planilla. Uruguay: 099 123 456 · 99 123 456 · +598 99 123 456 → "+598 99 123 456".
 * Otros países quedan como "+<dígitos>". Si no se reconoce, se devuelve tal cual.
 */
export function formatPhone(raw: string): string {
  const s = raw.trim();
  const d = s.replace(/\D/g, "");
  let local = "";
  if (d.startsWith("598") && d.length === 11) local = d.slice(3);
  else if (d.startsWith("0") && d.length === 9) local = d.slice(1);
  else if (d.length === 8 && !s.startsWith("+")) local = d;
  if (local) {
    // celular 9X XXX XXX · fijo XXXX XXXX
    return local.startsWith("9")
      ? `+598 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
      : `+598 ${local.slice(0, 4)} ${local.slice(4)}`;
  }
  if (s.startsWith("+") && d.length >= 8) return `+${d}`;
  return s;
}

/** "linkedin.com/in/ana" → "https://linkedin.com/in/ana". Vacío queda vacío. */
export function normalizeLink(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function isValidLink(link: string) {
  try {
    const u = new URL(link);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Normaliza cualquier input (p. ej. el body del POST) a una Application. */
export function normalize(input: unknown): Application | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const mode: Mode | null = raw.mode === "solo" || raw.mode === "team" ? raw.mode : null;
  if (!mode || !Array.isArray(raw.members)) return null;
  const expected = mode === "team" ? TEAM_MEMBERS : 1;
  if (raw.members.length !== expected) return null;

  const members = raw.members.map((m) => {
    const r = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
    return {
      fullName: clean(r.fullName, LIMITS.fullName),
      phone: formatPhone(clean(r.phone, LIMITS.phone)),
      email: clean(r.email, LIMITS.email).toLowerCase(),
      university: clean(r.university, LIMITS.org),
      company: clean(r.company, LIMITS.org),
      link: normalizeLink(clean(r.link, LIMITS.link)),
    };
  });

  const role = ROLES.find((x) => x.value === raw.role)?.value ?? "";

  return {
    mode,
    teamName: mode === "team" ? clean(raw.teamName, LIMITS.teamName) : "",
    members,
    role: mode === "solo" ? role : "",
    motivation: cleanText(raw.motivation, LIMITS.motivation),
    consent: raw.consent === true,
  };
}

export function validate(app: Application): FieldErrors {
  const errors: FieldErrors = {};
  const seen = new Map<string, number>();

  app.members.forEach((m, i) => {
    const k = (f: keyof Member) => `members.${i}.${f}`;

    const name = m.fullName.trim();
    if (!name) errors[k("fullName")] = "Completá nombre y apellido.";
    else if (name.split(/\s+/).length < 2) errors[k("fullName")] = "Poné nombre y apellido.";

    const digits = m.phone.replace(/\D/g, "");
    if (!m.phone.trim()) errors[k("phone")] = "Completá el celular.";
    else if (!PHONE_RE.test(m.phone) || digits.length < 8 || digits.length > 15)
      errors[k("phone")] = "Revisá el celular: por ejemplo, 099 123 456.";

    const email = m.email.trim().toLowerCase();
    if (!email) errors[k("email")] = "Completá el mail.";
    else if (!EMAIL_RE.test(email)) errors[k("email")] = "Revisá el mail: por ejemplo, vos@ejemplo.com.";
    else if (seen.has(email)) errors[k("email")] = "Cada integrante necesita un mail distinto.";
    else seen.set(email, i);

    const link = normalizeLink(m.link);
    if (link && !isValidLink(link)) errors[k("link")] = "Revisá el link: por ejemplo, linkedin.com/in/tu-perfil.";
  });

  if (app.mode === "solo" && !app.role) errors.role = "Elegí qué hacés.";

  const motivation = app.motivation.trim();
  if (!motivation)
    errors.motivation = app.mode === "team" ? "Cuéntennos por qué quieren estar." : "Contanos por qué querés estar.";
  else if (motivation.length < MOTIVATION_MIN) errors.motivation = "Un poco más: un par de oraciones alcanza.";

  if (!app.consent) errors.consent = "Necesitamos esta confirmación para seguir.";

  return errors;
}
