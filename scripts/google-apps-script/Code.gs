/**
 * build 101 · Postulaciones — web app de Apps Script.
 *
 * Recibe las postulaciones que manda /api/inscripcion y las agrega como fila en
 * la primera hoja de esta planilla. Las columnas se completan por nombre de
 * encabezado (fila 1), así que se pueden reordenar o agregar columnas propias
 * (por ejemplo "notas_organizadores") sin tocar este código.
 *
 * Instalación: ver docs/inscripciones-google-sheets.md.
 */

// Pegá acá el mismo valor que GOOGLE_SHEETS_WEBHOOK_SECRET en Vercel.
const SHARED_SECRET = "REEMPLAZAR_POR_EL_SECRETO";

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "json inválido" });
  }

  if (!payload || payload.secret !== SHARED_SECRET) {
    return reply({ ok: false, error: "no autorizado" });
  }

  const row = payload.row || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    // Prefijamos con ' los valores que Sheets interpretaría como fórmula o
    // número (celulares con +, textos que empiezan con =).
    const values = headers.map(function (h) {
      const v = row[h] == null ? "" : String(row[h]);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sheet.appendRow(values);
  } finally {
    lock.releaseLock();
  }

  return reply({ ok: true });
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
