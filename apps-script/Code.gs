/**
 * Backend "Pronosticá con Stanley" — Google Apps Script
 * Guarda cada registro en una Hoja de Cálculo y el comprobante en Drive.
 *
 * DESPLIEGUE (una vez):
 *  1. Creá una Hoja de Cálculo de Google y copiá su ID (de la URL).
 *  2. Creá una carpeta en Drive para los comprobantes y copiá su ID.
 *  3. Pegá ambos IDs abajo (SHEET_ID, FOLDER_ID).
 *  4. script.google.com → Nuevo proyecto → pegá este código.
 *  5. Implementar → Nueva implementación → tipo "Aplicación web":
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *  6. Copiá la URL del Web App y pegala en web/app.js -> CONFIG.APPS_SCRIPT_URL
 */

const SHEET_ID  = "PEGAR_ID_DE_LA_HOJA";
const FOLDER_ID = "PEGAR_ID_DE_LA_CARPETA";

const HEADERS = ["Fecha", "Nombre", "Apellido", "Documento", "WhatsApp", "Email",
  "Ciudad", "Posición", "Campeón", "Finalista", "Figura", "Desempate",
  "Aciertos(32)", "Selecciones", "Comprobante"];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    // 1) guardar comprobante en Drive
    let fileUrl = "";
    if (d.comprobante && d.comprobante.b64) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const bytes = Utilities.base64Decode(d.comprobante.b64);
      const safe = (d.documento || "sincedula") + "_" + (d.apellido || "") ;
      const blob = Utilities.newBlob(bytes, d.comprobante.mime, safe + "_" + d.comprobante.name);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // 2) escribir fila en la hoja
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const sel = d.selecciones || [];
    sheet.appendRow([
      d.enviado || new Date().toISOString(),
      d.nombre, d.apellido, d.documento, "'" + (d.whatsapp || ""), d.email,
      d.ciudad, d.posicion, d.campeon, d.finalista, d.figura, d.desempate,
      sel.length, sel.join(", "), fileUrl
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, msg: "Endpoint activo. Usá POST para registrar." });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
