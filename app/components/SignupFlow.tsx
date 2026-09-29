"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  LIMITS,
  ROLES,
  emptyApplication,
  formatPhone,
  normalizeLink,
  validate,
  type Application,
  type FieldErrors,
  type Member,
  type Mode,
} from "@/lib/inscripcion";
import { APPLY_DEADLINE, APPLY_DEADLINE_TIME, APPLY_PATH, EVENT_DATES_LONG, PARTICIPANTS_EMAIL, isApplyOpen } from "../event";

type Step = "form" | "review" | "sent" | "error" | "closed";

const COPY: Record<
  Mode,
  {
    cmd: string;
    title: string;
    intro: string;
    motivation: { label: string; placeholder: string };
    consent: string;
    other: { q: string; label: string; href: string };
  }
> = {
  solo: {
    cmd: "$ build101 --join --solo",
    title: "busco equipo.",
    intro: "Contanos quién sos y qué hacés. Si quedás seleccionado, te ayudamos a armar un equipo de 3.",
    motivation: {
      label: "¿por qué querés estar en build 101?",
      placeholder: "Un párrafo corto: qué te trae y qué te gustaría construir.",
    },
    consent: `Puedo estar el ${EVENT_DATES_LONG}, presencial, y estoy de acuerdo en compartir estos datos con build 101.`,
    other: { q: "¿Ya tenés equipo?", label: "inscribir a mi equipo →", href: `${APPLY_PATH}/equipo` },
  },
  team: {
    cmd: "$ build101 --join --team",
    title: "ya tenemos equipo.",
    intro: "Vos quedás como contacto del equipo. Completá los datos de los 3 integrantes: los evaluamos como equipo.",
    motivation: {
      label: "¿por qué quieren estar los 3 en build 101?",
      placeholder: "Un párrafo corto: qué los trae y qué aporta cada uno.",
    },
    consent: `Los 3 podemos estar el ${EVENT_DATES_LONG}, presencial, y estamos de acuerdo en compartir estos datos con build 101.`,
    other: { q: "¿Todavía te falta alguien?", label: "inscribirme solo →", href: `${APPLY_PATH}/solo` },
  },
};

// Borrador en el navegador: si recargás o salís a pedirle un dato a alguien,
// lo cargado sigue ahí. Se borra al enviar.
const draftKey = (mode: Mode) => `build101:inscripcion:v2:${mode}`;
type Draft = { app: Application; startedAt: number };

function readDraft(mode: Mode): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(mode));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    const fresh = emptyApplication(mode);
    if (!d?.app || d.app.mode !== mode || d.app.members?.length !== fresh.members.length) return null;
    // se mezcla con uno vacío: tolera borradores con campos de menos
    return {
      startedAt: d.startedAt,
      app: { ...fresh, ...d.app, members: fresh.members.map((m, i) => ({ ...m, ...d.app.members[i] })) },
    };
  } catch {
    return null;
  }
}

function writeDraft(mode: Mode, draft: Draft | null) {
  try {
    if (draft) localStorage.setItem(draftKey(mode), JSON.stringify(draft));
    else localStorage.removeItem(draftKey(mode));
  } catch {
    // sin almacenamiento (modo privado, bloqueado): el formulario anda igual
  }
}

const hasContent = (app: Application) =>
  Boolean(app.teamName || app.motivation || app.role || app.members.some((m) => Object.values(m).some(Boolean)));

// ---------- campos ----------

type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "url";
  multiline?: boolean;
  rows?: number;
  maxLength: number;
  optional?: boolean;
};

function Field({ id, label, value, error, onChange, onBlur, multiline, rows = 4, optional, ...rest }: FieldProps) {
  const errId = `${id}-error`;
  const common = {
    id,
    name: id,
    value,
    placeholder: rest.placeholder,
    maxLength: rest.maxLength,
    autoComplete: rest.autoComplete,
    required: !optional,
    onBlur,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errId : undefined,
  };
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (opcional)</span>}
      </label>
      {multiline ? (
        <textarea {...common} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          {...common}
          type={rest.type ?? "text"}
          inputMode={rest.inputMode}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && (
        <p className="field-error" id={errId}>
          {error}
        </p>
      )}
    </div>
  );
}

function MemberFields({
  index,
  member,
  errors,
  onChange,
  isContact,
}: {
  index: number;
  member: Member;
  errors: FieldErrors;
  onChange: (m: Member) => void;
  isContact: boolean;
}) {
  const id = (f: keyof Member) => `members.${index}.${f}`;
  const set = (f: keyof Member) => (v: string) => onChange({ ...member, [f]: v });
  const auto = (token: string) => (isContact ? token : "off");
  return (
    <>
      <Field
        id={id("fullName")}
        label="nombre y apellido"
        value={member.fullName}
        error={errors[id("fullName")]}
        onChange={set("fullName")}
        placeholder={isContact ? "Tu nombre y apellido" : "Nombre y apellido"}
        autoComplete={auto("name")}
        maxLength={LIMITS.fullName}
      />
      <div className="field-row stack-sm">
        <Field
          id={id("phone")}
          label="celular"
          value={member.phone}
          error={errors[id("phone")]}
          onChange={set("phone")}
          onBlur={() => member.phone && onChange({ ...member, phone: formatPhone(member.phone) })}
          placeholder="099 123 456"
          type="tel"
          inputMode="tel"
          autoComplete={auto("tel")}
          maxLength={LIMITS.phone}
        />
        <Field
          id={id("email")}
          label="mail"
          value={member.email}
          error={errors[id("email")]}
          onChange={set("email")}
          placeholder={isContact ? "vos@ejemplo.com" : "mail@ejemplo.com"}
          type="email"
          inputMode="email"
          autoComplete={auto("email")}
          maxLength={LIMITS.email}
        />
      </div>
      <div className="field-row stack-sm">
        <Field
          id={id("university")}
          label="universidad"
          optional
          value={member.university}
          onChange={set("university")}
          placeholder="Ej: UM, UdelaR, ORT"
          autoComplete="off"
          maxLength={LIMITS.org}
        />
        <Field
          id={id("company")}
          label="empresa"
          optional
          value={member.company}
          onChange={set("company")}
          placeholder={isContact ? "Dónde trabajás" : "Dónde trabaja"}
          autoComplete={auto("organization")}
          maxLength={LIMITS.org}
        />
      </div>
      <Field
        id={id("link")}
        label="LinkedIn o web"
        optional
        value={member.link}
        error={errors[id("link")]}
        onChange={set("link")}
        onBlur={() => member.link && onChange({ ...member, link: normalizeLink(member.link) })}
        placeholder="linkedin.com/in/…"
        type="url"
        inputMode="url"
        autoComplete={auto("url")}
        maxLength={LIMITS.link}
      />
    </>
  );
}

function RoleField({ value, error, onChange }: { value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <fieldset
      className={`field choices ${error ? "has-error" : ""}`}
      aria-describedby={error ? "role-error" : undefined}
    >
      <legend>¿qué hacés?</legend>
      <div className="choices-list">
        {ROLES.map((r, i) => (
          <label className="choice" key={r.value}>
            <input
              type="radio"
              name="role"
              id={i === 0 ? "role" : undefined}
              value={r.value}
              checked={value === r.value}
              onChange={() => onChange(r.value)}
            />
            <span>{r.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id="role-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ConsentField({
  text,
  checked,
  error,
  onChange,
}: {
  text: string;
  checked: boolean;
  error?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label className="check">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
        />
        <span>{text}</span>
      </label>
      {error && (
        <p className="field-error" id="consent-error">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- layout ----------

function Shell({
  mode,
  step,
  title,
  intro,
  aside,
  children,
}: {
  mode: Mode;
  step: Step;
  title: string;
  intro: ReactNode;
  aside: ReactNode;
  children: ReactNode;
}) {
  const first = mode === "team" ? "01 equipo" : "01 tus datos";
  const second = step === "sent" ? "02 enviado" : "02 revisar";
  const onFirst = step === "form";
  return (
    <div className="wrap flow">
      <div className="flow-context">
        <p className="mono-line">
          {step === "sent" ? "$ build101 --join ✓" : COPY[mode].cmd}
        </p>
        {step !== "closed" && (
          <ol className="flow-steps" aria-label="pasos">
            <li aria-current={onFirst ? "step" : undefined}>{first}</li>
            <li aria-current={!onFirst ? "step" : undefined}>{second}</li>
          </ol>
        )}
        {/* mismo name que el título de la tarjeta en SignupPaths: al navegar,
            la tarjeta elegida se transforma en este título */}
        <ViewTransition name={`path-${mode}`} share="path-morph">
          <h1 className="flow-title" tabIndex={-1} id="flow-title">
            {title}
          </h1>
        </ViewTransition>
        <p className="flow-intro">{intro}</p>
      </div>
      <div className="flow-main">{children}</div>
      <div className="flow-aside">{aside}</div>
    </div>
  );
}

function Aside({ q, children }: { q: string; children: ReactNode }) {
  return (
    <>
      <p>{q}</p>
      {children}
    </>
  );
}

const TalkToRamiro = ({ q }: { q: string }) => (
  <Aside q={q}>
    <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
      hablá con Ramiro ↗
    </a>
  </Aside>
);

// ---------- flujo ----------

export function SignupFlow({ mode }: { mode: Mode }) {
  const [app, setApp] = useState<Application>(() => emptyApplication(mode));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [restored, setRestored] = useState(false);
  const startedAt = useRef(0);
  const loaded = useRef(false);
  const firstRender = useRef(true);

  // Al abrir: si ya cerró la inscripción se avisa de entrada; si no, se
  // recupera el borrador. Es sincronizar con el reloj y con localStorage
  // después de hidratar (el HTML estático no los conoce).
  useEffect(() => {
    loaded.current = true;
    startedAt.current = Date.now();
    if (!isApplyOpen()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ver arriba
      setStep("closed");
      return;
    }
    const draft = readDraft(mode);
    if (draft && hasContent(draft.app)) {
      // el tiempo de llenado cuenta desde el borrador (anti-spam de 3 s)
      startedAt.current = draft.startedAt || startedAt.current;
      setApp(draft.app);
      setRestored(true);
    }
  }, [mode]);

  // Guardado del borrador mientras se completa.
  useEffect(() => {
    if (!loaded.current || step === "sent" || step === "closed") return;
    writeDraft(mode, hasContent(app) ? { app, startedAt: startedAt.current } : null);
  }, [app, mode, step]);

  // Al llegar desde la landing la página viene scrolleada muy abajo, y Next
  // recién sube después de que React mide la transición: el título quedaría
  // fuera de pantalla y React no lo empareja con la tarjeta. Subir en la fase
  // de layout lo deja visible a tiempo para el morph.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Al cambiar de paso: arriba de todo y foco en el título (lectores de pantalla).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById("flow-title")?.focus();
  }, [step]);

  const setMember = (i: number) => (m: Member) =>
    setApp((a) => ({ ...a, members: a.members.map((x, j) => (j === i ? m : x)) }));

  const discardDraft = () => {
    writeDraft(mode, null);
    setApp(emptyApplication(mode));
    setErrors({});
    setRestored(false);
    startedAt.current = Date.now();
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = Object.keys(errs)[0];
    if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
  };

  const toReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(app);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }
    setStep("review");
  };

  const submit = async () => {
    if (sending) return;
    setSending(true);
    setServerError("");
    try {
      const res = await fetch("/api/inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...app, website: honeypot, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: boolean; error?: string; fields?: FieldErrors }
        | null;
      if (res.ok && data?.ok) {
        writeDraft(mode, null);
        setStep("sent");
        return;
      }
      if (res.status === 403) {
        setStep("closed");
        return;
      }
      if (data?.fields && Object.keys(data.fields).length > 0) {
        setErrors(data.fields);
        setStep("form");
        focusFirstError(data.fields);
        return;
      }
      setServerError(data?.error ?? "No pudimos enviar tu inscripción.");
      setStep("error");
    } catch {
      setServerError("No pudimos conectarnos. Revisá tu conexión.");
      setStep("error");
    } finally {
      setSending(false);
    }
  };

  const copy = COPY[mode];
  const contact = app.members[0];
  const firstName = contact.fullName.split(" ")[0];

  // ----- inscripciones cerradas -----
  if (step === "closed") {
    return (
      <Shell
        mode={mode}
        step={step}
        title="las inscripciones cerraron."
        intro={`Cerraron el ${APPLY_DEADLINE} a las ${APPLY_DEADLINE_TIME}. Gracias por el interés en build 101.`}
        aside={<TalkToRamiro q="¿Tenés alguna duda?" />}
      >
        <div className="state state-error" role="status">
          <p className="label">inscripciones cerradas</p>
          <p>Si ya te inscribiste, te escribimos por mail cuando termine la selección.</p>
          <div className="state-actions">
            <Link href="/" className="btn btn-ghost">
              volver al sitio
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ----- enviado -----
  if (step === "sent") {
    return (
      <Shell
        mode={mode}
        step={step}
        title="inscripción enviada."
        intro="Tu postulación quedó registrada. No tenés que hacer nada más: te escribimos por mail cuando termine la selección."
        aside={<TalkToRamiro q="¿Querés consultar algo?" />}
      >
        <div className="state state-ok" role="status">
          <p className="label">✓ postulación recibida</p>
          <p className="state-title">
            listo, {firstName}. {mode === "team" ? "la postulación de tu equipo" : "tu postulación"} quedó registrada.
          </p>
          <p>
            No vas a recibir un mail de confirmación ahora. Te escribimos a <b>{contact.email}</b> cuando termine la
            selección. {mode === "team" ? "Su lugar" : "Tu lugar"} todavía no está confirmado.
          </p>
          <div className="state-actions">
            <Link href="/" className="btn btn-ghost">
              volver al sitio
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // ----- error de envío -----
  if (step === "error") {
    return (
      <Shell
        mode={mode}
        step="review"
        title="no pudimos enviar tu inscripción."
        intro="Tus datos siguen acá: podés reintentar o escribirle a Ramiro."
        aside={
          <Aside q="¿Algo está mal?">
            <button type="button" className="link-strong" onClick={() => setStep("form")}>
              ← editar datos
            </button>
          </Aside>
        }
      >
        <div className="state state-error" role="alert">
          <p className="label">error de envío · datos conservados</p>
          <p>{serverError}</p>
          <div className="state-actions">
            <button type="button" className="btn btn-primary" onClick={submit} disabled={sending}>
              {sending ? "enviando…" : "reintentar"}
            </button>
            <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-quiet">
              hablá con Ramiro ↗
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  // ----- revisar -----
  if (step === "review") {
    const roleLabel = ROLES.find((r) => r.value === app.role)?.label;
    return (
      <Shell
        mode={mode}
        step={step}
        title="todo listo para enviar."
        intro="Revisá tus datos antes de enviar. Enviar tu inscripción todavía no confirma un lugar."
        aside={
          <Aside q="¿Algo está mal?">
            <button type="button" className="link-strong" onClick={() => setStep("form")}>
              ← editar datos
            </button>
          </Aside>
        }
      >
        <div className="card summary">
          <p className="label">{mode === "team" ? `equipo${app.teamName ? ` · ${app.teamName}` : ""}` : "busco equipo"}</p>
          {app.members.map((m, i) => {
            const org = [m.university, m.company].filter(Boolean).join(" · ");
            const link = normalizeLink(m.link);
            return (
              <div className="summary-member" key={i}>
                {mode === "team" && <p className="label">{i === 0 ? "contacto" : `integrante ${i + 1}`}</p>}
                <p className="summary-name">{m.fullName}</p>
                <p className="summary-contact">
                  {m.email} · {formatPhone(m.phone)}
                </p>
                {org && <p className="summary-text">{org}</p>}
                {link && (
                  <p className="summary-text summary-link">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link.replace(/^https?:\/\/(www\.)?/, "")} ↗
                    </a>
                  </p>
                )}
              </div>
            );
          })}
          {roleLabel && (
            <div className="summary-member">
              <p className="label">qué hacés</p>
              <p className="summary-text">{roleLabel}</p>
            </div>
          )}
          <div className="summary-member">
            <p className="label">{mode === "team" ? "por qué quieren estar" : "por qué querés estar"}</p>
            <p className="summary-text">{app.motivation}</p>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary btn-block" onClick={submit} disabled={sending}>
              {sending ? "enviando…" : "enviar inscripción →"}
            </button>
            <p className="fine">Usamos estos datos solo para gestionar tu postulación a esta edición de build 101.</p>
          </div>
        </div>
      </Shell>
    );
  }

  // ----- formulario -----
  const errorCount = Object.keys(errors).length;
  return (
    <Shell
      mode={mode}
      step={step}
      title={copy.title}
      intro={copy.intro}
      aside={
        <Aside q={copy.other.q}>
          <Link href={copy.other.href} className="link-strong">
            {copy.other.label}
          </Link>
        </Aside>
      }
    >
      <form className="card form" onSubmit={toReview} noValidate>
        {restored && (
          <p className="draft-note" role="status">
            Recuperamos lo que habías cargado.
            <button type="button" onClick={discardDraft}>
              empezar de cero
            </button>
          </p>
        )}
        {errorCount > 0 && (
          <p className="form-alert" role="alert">
            Revisá {errorCount === 1 ? "el campo marcado" : `los ${errorCount} campos marcados`}.
          </p>
        )}

        {mode === "team" && <p className="label">vos · contacto del equipo</p>}
        <MemberFields index={0} member={app.members[0]} errors={errors} onChange={setMember(0)} isContact />

        {mode === "team" && (
          <div className="form-section">
            <p className="label">tu equipo</p>
            <Field
              id="teamName"
              label="nombre del equipo"
              optional
              value={app.teamName}
              onChange={(v) => setApp((a) => ({ ...a, teamName: v }))}
              placeholder="Cómo se llaman"
              maxLength={LIMITS.teamName}
            />
            {app.members.slice(1).map((m, j) => (
              <fieldset className="member" key={j + 1}>
                <legend className="label label-strong">integrante {j + 2}</legend>
                <MemberFields
                  index={j + 1}
                  member={m}
                  errors={errors}
                  onChange={setMember(j + 1)}
                  isContact={false}
                />
              </fieldset>
            ))}
          </div>
        )}

        <div className="form-section">
          {mode === "solo" && (
            <RoleField
              value={app.role}
              error={errors.role}
              onChange={(v) => setApp((a) => ({ ...a, role: v as Application["role"] }))}
            />
          )}
          <Field
            id="motivation"
            label={copy.motivation.label}
            value={app.motivation}
            error={errors.motivation}
            onChange={(v) => setApp((a) => ({ ...a, motivation: v }))}
            placeholder={copy.motivation.placeholder}
            multiline
            rows={4}
            maxLength={LIMITS.motivation}
          />
          <ConsentField
            text={copy.consent}
            checked={app.consent}
            error={errors.consent}
            onChange={(v) => setApp((a) => ({ ...a, consent: v }))}
          />
        </div>

        {/* honeypot: invisible para personas, tentador para bots */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="website">website</label>
          <input
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-block">
            revisar →
          </button>
          <p className="fine">Usamos estos datos solo para gestionar tu postulación a esta edición de build 101.</p>
        </div>
      </form>
    </Shell>
  );
}
