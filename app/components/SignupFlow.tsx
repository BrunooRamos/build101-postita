"use client";

import Link from "next/link";
import { ViewTransition, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  LIMITS,
  emptyApplication,
  validate,
  type Application,
  type FieldErrors,
  type Member,
  type Mode,
} from "@/lib/inscripcion";
import { APPLY_PATH, PARTICIPANTS_EMAIL } from "../event";

type Step = "form" | "review" | "sent" | "error";

const COPY: Record<Mode, { cmd: string; title: string; intro: string; other: { q: string; label: string; href: string } }> = {
  solo: {
    cmd: "$ build101 --join --solo",
    title: "busco equipo.",
    intro:
      "Contanos quién sos y cómo usás IA hoy. Si quedás seleccionado, te ayudamos a armar un equipo de 3.",
    other: { q: "¿Ya tenés equipo?", label: "inscribir a mi equipo →", href: `${APPLY_PATH}/equipo` },
  },
  team: {
    cmd: "$ build101 --join --team",
    title: "ya tenemos equipo.",
    intro:
      "Vos quedás como contacto del equipo. Completá los datos de los 3 integrantes: los evaluamos como equipo.",
    other: { q: "¿Todavía te falta alguien?", label: "inscribirme solo →", href: `${APPLY_PATH}/solo` },
  },
};

// ---------- campos ----------

type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email";
  multiline?: boolean;
  rows?: number;
  maxLength: number;
  optional?: boolean;
};

function Field({ id, label, value, error, onChange, multiline, rows = 4, optional, ...rest }: FieldProps) {
  const errId = `${id}-error`;
  const common = {
    id,
    name: id,
    value,
    placeholder: rest.placeholder,
    maxLength: rest.maxLength,
    autoComplete: rest.autoComplete,
    required: !optional,
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
  return (
    <>
      <div className="field-row">
        <Field
          id={id("firstName")}
          label="nombre"
          value={member.firstName}
          error={errors[id("firstName")]}
          onChange={set("firstName")}
          placeholder={isContact ? "Tu nombre" : "Nombre"}
          autoComplete={isContact ? "given-name" : "off"}
          maxLength={LIMITS.name}
        />
        <Field
          id={id("lastName")}
          label="apellido"
          value={member.lastName}
          error={errors[id("lastName")]}
          onChange={set("lastName")}
          placeholder={isContact ? "Tu apellido" : "Apellido"}
          autoComplete={isContact ? "family-name" : "off"}
          maxLength={LIMITS.name}
        />
      </div>
      <div className="field-row stack-sm">
        <Field
          id={id("phone")}
          label="celular"
          value={member.phone}
          error={errors[id("phone")]}
          onChange={set("phone")}
          placeholder="+598 9X XXX XXX"
          type="tel"
          inputMode="tel"
          autoComplete={isContact ? "tel" : "off"}
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
          autoComplete={isContact ? "email" : "off"}
          maxLength={LIMITS.email}
        />
      </div>
      <Field
        id={id("aiTools")}
        label={isContact ? "¿qué herramientas de IA usás hoy? ¿cómo?" : "¿qué herramientas de IA usa hoy? ¿cómo?"}
        value={member.aiTools}
        error={errors[id("aiTools")]}
        onChange={set("aiTools")}
        placeholder={isContact ? "Contanos qué usás y para qué." : "Qué usa y para qué."}
        multiline
        rows={isContact ? 4 : 3}
        maxLength={LIMITS.aiTools}
      />
    </>
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
        <ol className="flow-steps" aria-label="pasos">
          <li aria-current={onFirst ? "step" : undefined}>{first}</li>
          <li aria-current={!onFirst ? "step" : undefined}>{second}</li>
        </ol>
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

// ---------- flujo ----------

export function SignupFlow({ mode }: { mode: Mode }) {
  const [app, setApp] = useState<Application>(() => emptyApplication(mode));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef(0);
  const firstRender = useRef(true);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

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
        setStep("sent");
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

  // ----- enviado -----
  if (step === "sent") {
    return (
      <Shell
        mode={mode}
        step={step}
        title="inscripción enviada."
        intro="Tu postulación quedó registrada. No tenés que hacer nada más: te escribimos por mail cuando termine la selección."
        aside={
          <Aside q="¿Querés consultar algo?">
            <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
              hablá con Ramiro ↗
            </a>
          </Aside>
        }
      >
        <div className="state state-ok" role="status">
          <p className="label">✓ postulación recibida</p>
          <p className="state-title">
            listo, {contact.firstName}. {mode === "team" ? "la postulación de tu equipo" : "tu postulación"} quedó registrada.
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
        <div className="state state-error" role="alert">
          <p className="label">error de envío · datos conservados</p>
          <p className="state-title">no pudimos enviar tu inscripción.</p>
          <p>
            {serverError} Tus datos siguen acá. Intentá de nuevo o escribile a Ramiro para continuar.
          </p>
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
          {app.members.map((m, i) => (
            <div className="summary-member" key={i}>
              {mode === "team" && <p className="label">{i === 0 ? "contacto" : `integrante ${i + 1}`}</p>}
              <p className="summary-name">
                {m.firstName} {m.lastName}
              </p>
              <p className="summary-contact">
                {m.email} · {m.phone}
              </p>
              <p className="label">ia que usa hoy</p>
              <p className="summary-text">{m.aiTools}</p>
            </div>
          ))}
          <div className="summary-member">
            <p className="label">comentarios</p>
            <p className={`summary-text ${app.comments ? "" : "muted"}`}>{app.comments || "Sin comentarios."}</p>
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
  const commentsField = (
    <Field
      id="comments"
      label="comentarios extra"
      optional
      value={app.comments}
      onChange={(v) => setApp((a) => ({ ...a, comments: v }))}
      placeholder="Algo más que quieras que sepamos."
      multiline
      rows={3}
      maxLength={LIMITS.comments}
    />
  );
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

        {/* comentarios de toda la postulación: al final, después del equipo */}
        {mode === "team" ? <div className="form-section">{commentsField}</div> : commentsField}

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
