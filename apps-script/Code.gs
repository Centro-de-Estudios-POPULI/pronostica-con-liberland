/**
 * Liberland · "Pronosticá con Liberland" — Backend (Google Apps Script + Sheets)
 * ----------------------------------------------------------------------------
 * Maneja: inscripción (Nick+PIN+comprobante), login Nick+PIN, alta manual,
 * guardado de pronósticos y ranking. La Hoja ES el panel de operación.
 *
 * INSTALACIÓN (ver apps-script/SETUP-LIBERLAND.md):
 *   1. Crear una Hoja de cálculo en la cuenta Google del proyecto.
 *   2. Extensiones → Apps Script → pegar este archivo. Cambiar SALT (abajo).
 *   3. Ejecutar setupSheet() una vez (o menú "Liberland → Preparar Hoja").
 *   4. Implementar → Nueva implementación → Web App
 *        · Ejecutar como: yo   · Acceso: Cualquier usuario
 *      Copiar la URL .../exec y pegarla en web/config.js → APPS_SCRIPT_URL.
 *   Al cambiar este código: Implementar → Administrar → editar → Versión NUEVA
 *   (para conservar la misma URL /exec).
 */

// ⚠️ CAMBIAR por una cadena propia y secreta (no se comparte; solo vive acá).
var SALT = 'CAMBIA_ESTE_SALT_POR_UNO_PROPIO_2026';

var T_INSCRITOS = 'Inscritos';
var T_PRONOS    = 'Pronosticos';
var T_RESULT    = 'Resultados';
var T_RANKING   = 'Ranking';

var H_INSCRITOS = ['timestamp', 'nick', 'pin_hash', 'nombre', 'apellido', 'ci',
                   'whatsapp', 'estado', 'comprobante_url', 'id'];
var H_PRONOS    = ['nick', 'grupos_json', 'nostradamus_json', 'partidos_json', 'actualizado'];
var H_RESULT    = ['fecha', 'partido', 'avanza_real', 'goles_local', 'goles_visita', 'jugada_especial'];
var H_RANKING   = ['nick', 'puntos', 'estado'];

// ───────────────────────── Menú / setup ─────────────────────────
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Liberland')
    .addItem('Preparar Hoja (crear pestañas)', 'setupSheet')
    .addItem('Activar inscriptos seleccionados', 'activarSeleccion')
    .addItem('Rechazar inscriptos seleccionados', 'rechazarSeleccion')
    .addToUi();
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheet_(name, headers) {
  var s = ss_().getSheetByName(name);
  if (!s) { s = ss_().insertSheet(name); }
  if (headers && s.getLastRow() === 0) {
    s.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    s.setFrozenRows(1);
  }
  return s;
}

function setupSheet() {
  sheet_(T_INSCRITOS, H_INSCRITOS);
  sheet_(T_PRONOS, H_PRONOS);
  sheet_(T_RESULT, H_RESULT);
  sheet_(T_RANKING, H_RANKING);
  SpreadsheetApp.getActive().toast('Pestañas listas: Inscritos, Pronosticos, Resultados, Ranking.');
}

// ───────────────────────── Utilidades ─────────────────────────
function hashPin_(nick, pin) {
  var raw = SALT + '|' + String(nick).toLowerCase() + '|' + String(pin);
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Devuelve el número de fila (1-based, con cabecera) del nick, o 0.
function findRowByNick_(sh, nick) {
  var n = String(nick).trim().toLowerCase();
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var col = sh.getRange(2, 2, last - 1, 1).getValues(); // col 2 = nick
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]).trim().toLowerCase() === n) return i + 2;
  }
  return 0;
}

function getFolder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function saveComprobante_(nick, comp) {
  if (!comp || !comp.b64) return '';
  try {
    var folder = getFolder_('Liberland - Comprobantes de pago'); // privado por defecto
    var name = (nick || 'pago') + '_' + new Date().getTime() + '_' + (comp.name || 'comprobante');
    var blob = Utilities.newBlob(Utilities.base64Decode(comp.b64), comp.mime || 'application/octet-stream', name);
    return folder.createFile(blob).getUrl();
  } catch (err) { return 'ERROR_DRIVE: ' + err; }
}

// ───────────────────────── Endpoints ─────────────────────────
function doGet(e) {
  var a = (e && e.parameter && e.parameter.action) || '';
  if (a === 'existe')  return jsonOut_(existe_(e.parameter.nick));
  if (a === 'login')   return jsonOut_(login_(e.parameter.nick, e.parameter.pin));
  if (a === 'ranking') return jsonOut_(getRanking_());
  return jsonOut_({ ok: false, error: 'accion_desconocida' });
}

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) { return jsonOut_({ ok: false, error: 'json_invalido' }); }
  if (data.action === 'register')  return jsonOut_(register_(data));
  if (data.action === 'savePicks') return jsonOut_(savePicks_(data));
  return jsonOut_({ ok: false, error: 'accion_desconocida' });
}

// ¿el nick ya existe? (para avisar al instante en el registro)
function existe_(nick) {
  if (!nick) return { nick: false };
  var sh = sheet_(T_INSCRITOS, H_INSCRITOS);
  return { nick: findRowByNick_(sh, nick) > 0 };
}

// register: guarda inscripto con estado "pendiente" (el admin lo activa luego).
function register_(d) {
  var nick = String(d.nick || '').trim();
  if (nick.length < 3) return { ok: false, code: 'nick' };
  if (!/^\d{4}$/.test(String(d.pin || ''))) return { ok: false, code: 'pin' };

  var lock = LockService.getScriptLock();
  lock.tryLock(8000);
  try {
    var sh = sheet_(T_INSCRITOS, H_INSCRITOS);
    if (findRowByNick_(sh, nick) > 0) return { ok: false, code: 'dup_nick' };
    var url = saveComprobante_(nick, d.comprobante);
    sh.appendRow([new Date(), nick, hashPin_(nick, d.pin), d.nombre || '', d.apellido || '',
      "'" + (d.documento || ''), "'" + (d.whatsapp || ''), 'pendiente', url, d.id || '']);
    return { ok: true, estado: 'pendiente' };
  } finally { lock.releaseLock(); }
}

// login: valida nick+pin y que esté "activo".
function login_(nick, pin) {
  nick = String(nick || '').trim();
  var sh = sheet_(T_INSCRITOS, H_INSCRITOS);
  var r = findRowByNick_(sh, nick);
  if (!r) return { ok: false, code: 'no_existe' };
  var row = sh.getRange(r, 1, 1, H_INSCRITOS.length).getValues()[0];
  if (row[2] !== hashPin_(nick, pin)) return { ok: false, code: 'pin_incorrecto' };
  var estado = String(row[7]);
  if (estado !== 'activo') return { ok: false, code: 'pendiente', estado: estado };
  return { ok: true, estado: 'activo', nick: row[1] };
}

// savePicks: guarda pronósticos SOLO si nick+pin válidos y estado activo.
// Estructura flexible (JSON): grupos / nostradamus / partidos — se llena según
// la mecánica final (la define el front; el backend solo persiste el blob).
function savePicks_(d) {
  var auth = login_(d.nick, d.pin);
  if (!auth.ok) return auth;
  var lock = LockService.getScriptLock();
  lock.tryLock(8000);
  try {
    var sh = sheet_(T_PRONOS, H_PRONOS);
    var r = findRowByNick_(sh, d.nick);
    var vals = [d.nick, JSON.stringify(d.grupos || null), JSON.stringify(d.nostradamus || null),
      JSON.stringify(d.partidos || null), new Date()];
    if (r) sh.getRange(r, 1, 1, vals.length).setValues([vals]);
    else sh.appendRow(vals);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// Ranking: por ahora lee la pestaña Ranking (el cálculo se agrega con la
// mecánica final). Devuelve top 100 ordenado por puntos desc.
function getRanking_() {
  var sh = sheet_(T_RANKING, H_RANKING);
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, ranking: [] };
  var rows = sh.getRange(2, 1, last - 1, H_RANKING.length).getValues();
  var out = rows.map(function (r) { return { nick: r[0], puntos: Number(r[1]) || 0, estado: r[2] }; })
    .sort(function (a, b) { return b.puntos - a.puntos; }).slice(0, 100);
  return { ok: true, ranking: out };
}

// ───────────────────────── Admin (menú) ─────────────────────────
function activarSeleccion() { setEstadoSeleccion_('activo'); }
function rechazarSeleccion() { setEstadoSeleccion_('rechazado'); }

function setEstadoSeleccion_(estado) {
  var sh = ss_().getActiveSheet();
  if (sh.getName() !== T_INSCRITOS) {
    SpreadsheetApp.getUi().alert('Seleccioná filas en la pestaña "' + T_INSCRITOS + '".');
    return;
  }
  var rng = sh.getActiveRange();
  var start = rng.getRow(), n = rng.getNumRows();
  if (start < 2) { SpreadsheetApp.getUi().alert('Seleccioná filas de datos (no la cabecera).'); return; }
  var col = H_INSCRITOS.indexOf('estado') + 1;
  for (var i = 0; i < n; i++) sh.getRange(start + i, col).setValue(estado);
  SpreadsheetApp.getActive().toast(n + ' inscripto(s) → ' + estado);
}
