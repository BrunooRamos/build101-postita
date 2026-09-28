"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { WindowChrome } from "./WindowChrome";
import { SPIN, reducedMotion, useInView } from "./useInView";
import { APPLY_OPEN, SPONSORS_EMAIL } from "../event";

type Line =
  | { k: "cmd"; text: string }
  | { k: "task"; text: string }
  | { k: "comment"; text: string }
  | { k: "step"; n: string; text: string }
  | { k: "q"; q: string; a: string }
  | { k: "blank" }
  | { k: "quote" };

const SCRIPT: Line[] = [
  { k: "cmd", text: "build101 --join" },
  { k: "blank" },
  { k: "step", n: "01", text: "completá tu inscripción" },
  { k: "step", n: "02", text: "revisamos tu postulación" },
  { k: "step", n: "03", text: "te confirmamos por email" },
];

function StaticLine({ line }: { line: Line }) {
  switch (line.k) {
    case "cmd":
      return (
        <div className="prompt-line">
          <span className="sigil">➜</span>
          <span className="cmd">{line.text}</span>
        </div>
      );
    case "task":
      return (
        <div className="out">
          <span className="ok">✔</span> {line.text}…
        </div>
      );
    case "comment":
      return <div className="comment">{line.text}</div>;
    case "step":
      return (
        <div className="out term-step">
          <span className="term-n">{line.n}</span>
          {line.text}
        </div>
      );
    case "q":
      return (
        <div className="prompt-line">
          <span className="sigil blue">?</span>
          <span className="cmd">{line.q}</span>
          <span className="out">› {line.a}</span>
        </div>
      );
    case "blank":
      return <div className="out">&nbsp;</div>;
    case "quote":
      return (
        <div>
          <span className="accent">&quot;</span>zero to product
          <span className="spark">.</span>{" "}
          <span className="accent">se evalúa funcionando, no en slides</span>
          <span className="accent">&quot;</span>
        </div>
      );
  }
}

type Active = { i: number; typed: string; spinning: boolean; showA: boolean };
type ReplEntry = { id: number; node: ReactNode };

/** Respuesta de `ask <pregunta>`: spinner mientras piensa, después el texto
 *  de /api/ask a medida que llega (streaming). */
function AskAnswer({ question }: { question: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<"thinking" | "streaming" | "done" | "error">("thinking");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (state !== "thinking") return;
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: question }),
          signal: abort.signal,
        });
        if (!res.body) throw new Error("sin body");
        if (!res.ok) {
          setAnswer(await res.text());
          setState("error");
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setState("streaming");
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setAnswer((a) => a + decoder.decode(value, { stream: true }));
        }
        setState("done");
      } catch {
        if (abort.signal.aborted) return;
        setAnswer("ask: sin conexión. probá help");
        setState("error");
      }
    })();
    return () => abort.abort();
  }, [question]);

  // la terminal tiene alto fijo: mantenela scrolleada al final mientras llega texto
  useEffect(() => {
    const body = ref.current?.closest(".term-body");
    if (body) body.scrollTop = body.scrollHeight;
  }, [answer, state]);

  if (state === "thinking")
    return (
      <div className="out" ref={ref}>
        <span className="spin-glyph">{SPIN[frame % SPIN.length]}</span> pensando…
      </div>
    );
  return (
    <div className={state === "error" ? "del-text" : "cmd"} ref={ref}>
      {answer}
      {state === "streaming" && <span className="cursor sm" />}
    </div>
  );
}

// ---- REPL command interpreter ----
function runCommand(
  raw: string,
  askEnabled: boolean,
): {
  out: ReactNode[];
  action?: "clear" | "inscribite" | "matrix" | "crash";
} {
  const cmd = raw.trim();
  const lower = cmd.toLowerCase();
  const O = (n: ReactNode) => [n];

  if (lower === "") return { out: [] };
  if (lower === "help" || lower === "?")
    return {
      out: O(
        <div className="out">
          comandos:{" "}
          {askEnabled && (
            <>
              <span className="accent">ask &lt;pregunta&gt;</span> ·{" "}
            </>
          )}
          <span className="accent">ls</span> ·{" "}
          <span className="accent">cat &lt;archivo&gt;</span> ·{" "}
          <span className="accent">consigna</span> ·{" "}
          <span className="accent">sponsors</span> ·{" "}
          <span className="accent">inscribite</span> ·{" "}
          <span className="accent">whoami</span> ·{" "}
          <span className="accent">cafe</span> ·{" "}
          <span className="accent">clear</span>
        </div>,
      ),
    };
  if (askEnabled && (lower === "ask" || lower.startsWith("ask ")))
    return {
      out: O(
        cmd.slice(3).trim() ? (
          <AskAnswer question={cmd.slice(3).trim()} />
        ) : (
          <div className="out">
            uso: <span className="accent">ask ¿tiene costo?</span>
          </div>
        ),
      ),
    };
  if (lower === "ls" || lower === "ls -la")
    return {
      out: O(
        <div className="out">
          builders/ mentores/ sponsors/{"  "}
          <span className="accent">readme.md</span> consigna.md reglas.txt
        </div>,
      ),
    };
  if (lower === "cat readme" || lower === "cat readme.md")
    return {
      out: [
        <div className="md-h" key="h"># build 101</div>,
        <div className="out" key="1">la hackathon de ia más grande de uruguay. un producto de ia real,</div>,
        <div className="out" key="2">construido en un fin de semana y pitcheado en vivo.</div>,
      ],
    };
  if (
    lower === "consigna" ||
    lower === "cat consigna" ||
    lower === "cat consigna.md"
  )
    return {
      out: O(
        <div className="out">
          consigna.md: <span className="accent">locked</span> — se revela en el
          kickoff. lo único seguro:{" "}
          <span className="accent">se evalúa funcionando y pitcheado en vivo.</span>
        </div>,
      ),
    };
  if (lower === "cat reglas" || lower === "cat reglas.txt")
    return {
      out: [
        <div className="out" key="1">1. se construye durante el evento.</div>,
        <div className="out" key="2">2. pitch en vivo, con el producto funcionando.</div>,
        <div className="out" key="3">3. equipos de 3 personas.</div>,
      ],
    };
  if (lower.startsWith("cat"))
    return { out: O(<div className="out">cat: {cmd.slice(3).trim() || "?"}: no such file. probá <span className="accent">ls</span></div>) };
  if (lower === "sponsors")
    return {
      out: O(
        <div className="out">
          gold · silver · partners · instituciones · nos dan energía —
          sumate → <span className="accent">{SPONSORS_EMAIL}</span>
        </div>,
      ),
    };
  if (lower === "whoami")
    return { out: O(<div className="out">un builder a punto de inscribirse — tipeá <span className="accent">inscribite</span></div>) };
  if (lower === "cafe" || lower === "coffee" || lower === "café")
    return { out: O(<div className="out">sirviendo café… (ilimitado durante el evento)</div>) };
  if (lower === "date")
    return { out: O(<div className="out">{new Date().toString().toLowerCase()}</div>) };
  if (lower === "matrix")
    return { out: O(<div className="ok">entrando a la matrix…</div>), action: "matrix" };
  if (lower === "crash" || lower === "throw" || lower.startsWith("throw "))
    return { out: O(<div className="del-text">lanzando excepción no controlada…</div>), action: "crash" };
  if (lower === "clear" || lower === "cls") return { out: [], action: "clear" };
  if (lower.startsWith("echo "))
    return { out: O(<div className="out">{cmd.slice(5)}</div>) };
  if (lower.startsWith("sudo"))
    return { out: O(<div className="del-text">permiso denegado.</div>) };
  if (lower.startsWith("rm"))
    return { out: O(<div className="del-text">buen intento — el repo se queda.</div>) };
  if (
    lower === "inscribite" ||
    lower === "git push" ||
    lower === "git push --inscribite" ||
    lower === "deploy"
  )
    return APPLY_OPEN
      ? { out: O(<div className="ok">abriendo inscripción…</div>), action: "inscribite" }
      : { out: O(<div className="out">las inscripciones todavía no abrieron — <span className="accent">pronto se anuncian</span>. volvé a tipear <span className="accent">inscribite</span> cuando abran.</div>) };
  return {
    out: O(
      <div className="out">
        command not found: {cmd}. probá <span className="accent">help</span>
      </div>,
    ),
  };
}

export function Terminal({ footer }: { footer?: ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [done, setDone] = useState(0);
  const [active, setActive] = useState<Active | null>(null);
  const [frame, setFrame] = useState(0);
  const [repl, setRepl] = useState<ReplEntry[]>([]);
  const [input, setInput] = useState("");
  const [askEnabled, setAskEnabled] = useState(false);
  const started = useRef(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // spinner ticker
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reducedMotion()) {
      setDone(SCRIPT.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((r) => timers.push(setTimeout(r, ms)));

    const type = async (i: number, text: string, speed: number) => {
      for (let c = 1; c <= text.length; c++) {
        if (cancelled) return;
        setActive({ i, typed: text.slice(0, c), spinning: false, showA: false });
        await sleep(speed);
      }
    };

    (async () => {
      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        const line = SCRIPT[i];
        if (line.k === "blank" || line.k === "quote") {
          setActive({ i, typed: "", spinning: false, showA: false });
          await sleep(line.k === "quote" ? 280 : 90);
        } else if (line.k === "cmd") {
          await type(i, line.text, 26);
          await sleep(160);
        } else if (line.k === "task") {
          await type(i, line.text, 11);
          setActive({ i, typed: line.text, spinning: true, showA: false });
          await sleep(520);
        } else if (line.k === "comment") {
          await type(i, line.text, 14);
        } else if (line.k === "step") {
          await type(i, line.text, 14);
        } else if (line.k === "q") {
          await type(i, line.q, 20);
          await sleep(140);
          setActive({ i, typed: line.q, spinning: false, showA: true });
          await sleep(280);
        }
        if (cancelled) return;
        setDone(i + 1);
        setActive(null);
        await sleep(line.k === "task" ? 70 : 120);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView]);

  const complete = done >= SCRIPT.length;

  // `ask` solo aparece si /api/ask tiene credenciales configuradas
  useEffect(() => {
    if (!complete) return;
    let alive = true;
    fetch("/api/ask")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => alive && setAskEnabled(Boolean(d.enabled)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [complete]);

  // keep the REPL scrolled to the bottom
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [repl, complete]);

  const push = (nodes: ReactNode[]) =>
    setRepl((r) => [...r, ...nodes.map((node) => ({ id: idRef.current++, node }))]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input;
    setInput("");
    push([
      <div className="prompt-line" key="echo">
        <span className="sigil">➜</span>
        <span className="cmd">{raw || " "}</span>
      </div>,
    ]);
    const { out, action } = runCommand(raw, askEnabled);
    if (action === "clear") {
      setRepl([]);
      return;
    }
    push(out);
    if (action === "inscribite") {
      window.dispatchEvent(new CustomEvent("uru:deploy"));
    } else if (action === "matrix") {
      window.dispatchEvent(new CustomEvent("uru:matrix"));
    } else if (action === "crash") {
      window.dispatchEvent(new CustomEvent("uru:crash"));
    }
  };

  const spin = SPIN[frame % SPIN.length];

  return (
    <div ref={ref}>
      <WindowChrome title="~/build-101 · admisiones">
        <div
          className="win-body term-body"
          ref={bodyRef}
          onClick={() => complete && inputRef.current?.focus()}
        >
          {SCRIPT.slice(0, done).map((line, i) => (
            <StaticLine key={i} line={line} />
          ))}

          {active &&
            (() => {
              const line = SCRIPT[active.i];
              if (line.k === "cmd")
                return (
                  <div className="prompt-line">
                    <span className="sigil">➜</span>
                    <span className="cmd">{active.typed}</span>
                    <span className="cursor" />
                  </div>
                );
              if (line.k === "task")
                return (
                  <div className="out">
                    <span className="spin-glyph">
                      {active.spinning ? spin : "⠿"}
                    </span>{" "}
                    {active.typed}
                    {!active.spinning && <span className="cursor sm" />}
                  </div>
                );
              if (line.k === "step")
                return (
                  <div className="out term-step">
                    <span className="term-n">{line.n}</span>
                    {active.typed}
                    <span className="cursor sm" />
                  </div>
                );
              if (line.k === "comment")
                return (
                  <div className="comment">
                    {active.typed}
                    <span className="cursor sm" />
                  </div>
                );
              if (line.k === "q")
                return (
                  <div className="prompt-line">
                    <span className="sigil blue">?</span>
                    <span className="cmd">{active.typed}</span>
                    {active.showA ? (
                      <span className="out">› {line.a}</span>
                    ) : (
                      <span className="cursor sm" />
                    )}
                  </div>
                );
              return <div className="out">&nbsp;</div>;
            })()}

          {complete && (
            <>
              {repl.length === 0 && (
                <div className="comment" style={{ marginTop: 6 }}>
                  {askEnabled ? (
                    <>
                      // preguntale algo: <span className="accent">ask ¿tiene costo?</span> ↵
                    </>
                  ) : (
                    <>
                      // es interactiva: escribí <span className="accent">help</span> y dale enter ↵
                    </>
                  )}
                </div>
              )}
              {repl.map((e) => (
                <div key={e.id}>{e.node}</div>
              ))}
              <form className="repl-line" onSubmit={submit}>
                <span className="sigil">➜</span>
                <input
                  ref={inputRef}
                  className="repl-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  aria-label="terminal interactiva"
                  placeholder="escribí un comando…"
                />
              </form>
            </>
          )}
        </div>
        {footer}
      </WindowChrome>
    </div>
  );
}
