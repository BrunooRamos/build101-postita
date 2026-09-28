// ============================================================
// Inscripción — tipos y validación compartidos entre el formulario
// (cliente) y /api/inscripcion (servidor). El servidor vuelve a validar
// todo: lo del cliente es solo para mostrar errores al lado del campo.
// ============================================================

export type Mode = "solo" | "team";

export type Member = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  aiTools: string;
};

export type Application = {
  mode: Mode;
  /** Solo para equipos; opcional. */
  teamName: string;
  /** 1 integrante para "solo", 3 para "team". El primero es el contacto. */
  members: Member[];
  comments: string;
};

/** Campos extra anti-spam que viajan con el envío (no se guardan). */
export type AntiSpam = {
  /** Honeypot: un campo oculto que una persona nunca completa. */
  website?: string;
  /** Epoch ms de cuando se abrió el formulario. */
  startedAt?: number;
};

export const TEAM_MEMBERS = 3;

export const LIMITS = {
  name: 60,
  phone: 24,
  email: 120,
  aiTools: 1000,
  comments: 1000,
  teamName: 60,
} as const;

export const emptyMember = (): Member => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  aiTools: "",
});

export const emptyApplication = (mode: Mode): Application => ({
  mode,
  teamName: "",
  members: Array.from({ length: mode === "team" ? TEAM_MEMBERS : 1 }, emptyMember),
  comments: "",
});

/** Errores por campo. Claves: "members.0.email", "teamName", etc. */
export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Dígitos con +, espacios, guiones o paréntesis opcionales; 8 a 15 dígitos.
const PHONE_RE = /^\+?[\d\s\-()]+$/;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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
      firstName: clean(r.firstName, LIMITS.name),
      lastName: clean(r.lastName, LIMITS.name),
      phone: clean(r.phone, LIMITS.phone),
      email: clean(r.email, LIMITS.email).toLowerCase(),
      aiTools: clean(r.aiTools, LIMITS.aiTools),
    };
  });

  return {
    mode,
    teamName: mode === "team" ? clean(raw.teamName, LIMITS.teamName) : "",
    members,
    comments: clean(raw.comments, LIMITS.comments),
  };
}

export function validate(app: Application): FieldErrors {
  const errors: FieldErrors = {};
  const seen = new Map<string, number>();

  app.members.forEach((m, i) => {
    const k = (f: keyof Member) => `members.${i}.${f}`;
    if (!m.firstName.trim()) errors[k("firstName")] = "Completá el nombre.";
    if (!m.lastName.trim()) errors[k("lastName")] = "Completá el apellido.";

    const digits = m.phone.replace(/\D/g, "");
    if (!m.phone.trim()) errors[k("phone")] = "Completá el celular.";
    else if (!PHONE_RE.test(m.phone) || digits.length < 8 || digits.length > 15)
      errors[k("phone")] = "Revisá el celular: por ejemplo, +598 99 123 456.";

    const email = m.email.trim().toLowerCase();
    if (!email) errors[k("email")] = "Completá el mail.";
    else if (!EMAIL_RE.test(email)) errors[k("email")] = "Revisá el mail: por ejemplo, vos@ejemplo.com.";
    else if (seen.has(email)) errors[k("email")] = "Cada integrante necesita un mail distinto.";
    else seen.set(email, i);

    if (!m.aiTools.trim()) errors[k("aiTools")] = "Contanos qué herramientas de IA usás y cómo.";
  });

  return errors;
}
