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

// ID de la planilla "build 101 · Postulaciones" (está en su URL). Con el ID el
// script funciona igual si se creó desde la planilla o como proyecto suelto.
const SHEET_ID = "1ztlBpXAVwKPrmlL8icWhM-wABs9na3-W1mEfkVeS9Zs";

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
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const lastCol = sheet.getLastColumn();
    // Hoja vacía (sin encabezados): se arman desde cero con los campos que
    // llegan, en el orden en que los manda el sitio.
    let headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    // Si el sitio manda un dato que todavía no tiene columna (un campo nuevo
    // del formulario), se agrega el encabezado al final en vez de perderlo.
    const missing = Object.keys(row).filter(function (k) {
      return headers.indexOf(k) === -1;
    });
    if (lastCol === 0) missing.push("notas_organizadores");
    if (missing.length) {
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
      headers = headers.concat(missing);
    }
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
