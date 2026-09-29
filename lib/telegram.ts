import type { Application } from "@/lib/inscripcion";

// Aviso por Telegram de cada inscripción nueva, vía la Bot API. Es opcional:
// sin las variables de entorno no hace nada. Nunca tira: si Telegram falla, la
// inscripción ya quedó guardada en la sheet y solo lo dejamos en el log.
//
//   TELEGRAM_BOT_TOKEN  el token que da @BotFather
//   TELEGRAM_CHAT_ID    el chat, grupo o canal donde avisar (ej. -1001234567890)

function toMessage(app: Application, id: string) {
  const lines =
    app.mode === "team"
      ? [`🟢 nueva inscripción · equipo${app.teamName ? ` "${app.teamName}"` : ""}`]
      : [`🟢 nueva inscripción · busca equipo${app.role ? ` (${app.role})` : ""}`];
  app.members.forEach((m) => {
    lines.push(`• ${m.fullName} — ${m.phone} · ${m.email}${m.university ? ` · ${m.university}` : ""}`);
  });
  lines.push("", `id: ${id}`);
  return lines.join("\n");
}

export async function notifyTelegram(app: Application, id: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: toMessage(app, id),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) console.error("[telegram] sendMessage falló", res.status, await res.text());
  } catch (err) {
    console.error("[telegram] error llamando a la API", err);
  }
}
