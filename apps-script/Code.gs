/**
 * QUINIELA STANLEY — backend Google Apps Script (Sheets + Drive)
 *
 * Pestañas:
 *   Participantes      registro (datos + link comprobante)
 *   Pronosticos        1 fila por jugador (clasificados + llaves resueltos)
 *   Resultados_grupos  REAL: qué selecciones clasificaron (admin)
 *   Resultados_partidos REAL: por partido, quién avanzó + goles (admin)
 *   Ranking            calculado por computeRanking()
 *
 * MENU (al abrir la Hoja, como dueño): "Quiniela"
 *   - Preparar pestañas de Resultados  -> crea/pre-llena Resultados_*
 *   - Recalcular ranking               -> recalcula la pestaña Ranking
 *
 * Endpoint público: GET ?action=ranking  -> JSON del leaderboard (para la web).
 *
 * NOTA: SHEET_ID y FOLDER_ID van como placeholders en el repo (público).
 * Los valores reales se pegan SOLO en el proyecto de script.google.com.
 */

const SHEET_ID  = "PEGAR_ID_DE_LA_HOJA";
const FOLDER_ID = "PEGAR_ID_DE_LA_CARPETA";

/* ====== PUNTOS (editables) ====== */
const PUNTOS = {
  clasificado: 3,      // por cada seleccion que clasifico a dieciseisavos
  puesto_exacto: 1,    // bonus si ademas acerto el puesto (1ro o 2do)
  avanza:   { r32:4,  r16:6,  qf:8,  sf:12, tercer:8, final:20 },
  marcador: { r32:3,  r16:4,  qf:5,  sf:6,  tercer:5, final:8  }
};
const BONUS_PUESTO = true;

/* equipos por grupo (deben coincidir EXACTO con quiniela.js) */
const GRUPOS_TEAMS = {
  A:["México","Corea del Sur","Sudáfrica","República Checa"],
  B:["Canadá","Bosnia y Herzegovina","Qatar","Suiza"],
  C:["Brasil","Marruecos","Haití","Escocia"],
  D:["Estados Unidos","Paraguay","Australia","Turquía"],
  E:["Alemania","Costa de Marfil","Ecuador","Curazao"],
  F:["Países Bajos","Japón","Suecia","Túnez"],
  G:["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H:["España","Uruguay","Arabia Saudita","Cabo Verde"],
  I:["Francia","Senegal","Noruega","Irak"],
  J:["Argentina","Argelia","Austria","Jordania"],
  K:["Portugal","Colombia","Uzbekistán","RD del Congo"],
  L:["Inglaterra","Croacia","Ghana","Panamá"]
};
function matchEtapa_(n){
  n=Number(n);
  if(n>=73&&n<=88) return "r32";
  if(n>=89&&n<=96) return "r16";
  if(n>=97&&n<=100) return "qf";
  if(n>=101&&n<=102) return "sf";
  if(n===103) return "tercer";
  if(n===104) return "final";
  return "";
}

/* ============ WEB API ============ */
function doPost(e){
  try{
    const d = JSON.parse(e.postData.contents);
    const action = d.action || "register";
    if(action==="register")  return json(register_(d));
    if(action==="savePicks") return json(savePicks_(d));
    return json({ok:false, error:"accion desconocida: "+action});
  }catch(err){ return json({ok:false, error:String(err)}); }
}
function doGet(e){
  const p = (e && e.parameter) || {};
  if(p.action==="ranking") return json(rankingJson_());
  if(p.action==="existe"){
    const dup = findDuplicates_(p.ci||"", p.comp||"", p.id||"");
    return json({ok:true, ci:dup.ci, comp:dup.comp});
  }
  return json({ok:true, msg:"Quiniela Stanley API activa."});
}

/* ============ REGISTRO ============ */
function register_(d){
  const sh = sheet_("Participantes",
    ["id","nombre","apellido","documento","whatsapp","email","ciudad","comprobante","fecha","comprobante_nro"]);
  // anti-duplicado: 1 CI y 1 numero de comprobante por persona (ignora la propia fila si reenvia con el mismo id)
  const dup = findDuplicates_(d.documento, d.comprobante_nro, d.id);
  if(dup.ci)   return {ok:false, code:"dup_ci",   error:"Ese documento (CI) ya esta inscrito."};
  if(dup.comp) return {ok:false, code:"dup_comp", error:"Ese numero de comprobante ya fue registrado."};
  let fileUrl = "";
  if(d.comprobante && d.comprobante.b64) fileUrl = saveFile_(d.comprobante, d.documento||d.id);
  upsert_(sh, 0, d.id, [
    d.id||"", d.nombre||"", d.apellido||"", d.documento||"",
    "'"+(d.whatsapp||""), d.email||"", d.ciudad||"", fileUrl, new Date(),
    "'"+(d.comprobante_nro||"")
  ]);
  return {ok:true, id:d.id};
}

/* Busca duplicados en Participantes. Devuelve {ci, comp}. excludeId = no contar la fila propia. */
function findDuplicates_(documento, compNro, excludeId){
  const out = {ci:false, comp:false};
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName("Participantes");
  if(!sh || sh.getLastRow()<2) return out;
  const doc  = normKey_(documento);
  const comp = normKey_(compNro);
  const data = sh.getDataRange().getValues();   // [id,nombre,apellido,documento,...,fecha,comprobante_nro]
  for(let i=1;i<data.length;i++){
    const r = data[i];
    if(excludeId && String(r[0])===String(excludeId)) continue;
    if(doc  && normKey_(r[3])===doc)  out.ci   = true;
    if(comp && normKey_(r[9])===comp) out.comp = true;
    if(out.ci && (out.comp || !comp)) break;
  }
  return out;
}
function normKey_(v){ return String(v==null?"":v).toLowerCase().replace(/\s+/g,"").trim(); }

/* ============ PRONOSTICOS ============ */
/* OJO: pronostico_json queda en el indice 8 (lo lee computeRanking en r[8]).
   Los campos nuevos (grupos_enviados / nostradamus / nostra_at) van AL FINAL
   (indices 9,10,11) para no correr columnas ni romper el ranking. */
function savePicks_(d){
  const sh = sheet_("Pronosticos",
    ["id","nombre","documento","actualizado","avance%","campeon","finalista","tercer_puesto","pronostico_json",
     "grupos_enviados","nostradamus","nostra_at"]);
  upsert_(sh, 0, d.id, [
    d.id||"", d.nombre||"", d.documento||"", new Date(), d.avance||0,
    d.campeon||"", d.finalista||"", d.tercero||"",
    JSON.stringify(d.pronostico||{}),
    d.grupos_enviados?1:0, d.nostradamus?1:0, "'"+(d.nostra_at||"")
  ]);
  return {ok:true};
}

/* ============ RESULTADOS (admin) ============ */
function setupResultados(){
  const g = sheet_("Resultados_grupos", ["grupo","equipo","puesto_real","clasifico"]);
  if(g.getLastRow()<=1){
    Object.keys(GRUPOS_TEAMS).forEach(gr=>{
      GRUPOS_TEAMS[gr].forEach(eq=> g.appendRow([gr, eq, "", ""]));
    });
  }
  const p = sheet_("Resultados_partidos", ["partido","etapa","avanza_real","goles_avanza","goles_rival"]);
  if(p.getLastRow()<=1){
    for(let n=73;n<=104;n++) p.appendRow([n, matchEtapa_(n), "", "", ""]);
  }
  SpreadsheetApp.getActive().toast("Pestanas de Resultados listas. Carga los datos reales y luego Recalcular ranking.");
}

/* ============ RANKING ============ */
function computeRanking(){
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // --- resultados reales ---
  const realQual = {};   // equipo -> {clasifico:bool, puesto:int}
  const rg = ss.getSheetByName("Resultados_grupos");
  if(rg){ rg.getDataRange().getValues().slice(1).forEach(r=>{
    if(!r[1]) return;
    realQual[String(r[1]).trim()] = { clasifico: parseBool_(r[3]), puesto: Number(r[2])||0 };
  });}
  const realRound = {};  // etapa -> { equipo: {gf,gc} }
  const rp = ss.getSheetByName("Resultados_partidos");
  if(rp){ rp.getDataRange().getValues().slice(1).forEach(r=>{
    const et=String(r[1]).trim(), av=String(r[2]).trim();
    if(!et||!av) return;
    (realRound[et]=realRound[et]||{})[av] = { gf:numOr_(r[3]), gc:numOr_(r[4]) };
  });}

  // --- participantes (ciudad/fecha) ---
  const info = {};
  const pa = ss.getSheetByName("Participantes");
  if(pa){ pa.getDataRange().getValues().slice(1).forEach(r=>{
    info[String(r[0])] = { ciudad:r[6]||"", fecha:r[8]||"", nombre:r[1]||"" };
  });}

  // --- jugadores ---
  const pr = ss.getSheetByName("Pronosticos");
  const rows = pr ? pr.getDataRange().getValues().slice(1) : [];
  const tabla = rows.map(r=>{
    const id=String(r[0]); let pron={};
    try{ pron = JSON.parse(r[8]||"{}"); }catch(e){}
    const sc = scorePlayer_(pron, realQual, realRound);
    const meta = info[id] || {};
    return { id, nombre: r[1]||meta.nombre||"", ciudad: meta.ciudad||"",
             puntos: sc.puntos, exactos: sc.exactos, fecha: meta.fecha||"" };
  });

  tabla.sort((a,b)=> b.puntos-a.puntos || b.exactos-a.exactos || (new Date(a.fecha))-(new Date(b.fecha)));

  const sh = sheet_("Ranking", ["pos","id","nombre","ciudad","puntos","exactos","actualizado"]);
  sh.clearContents(); sh.appendRow(["pos","id","nombre","ciudad","puntos","exactos","actualizado"]);
  const now = new Date();
  tabla.forEach((t,i)=> sh.appendRow([i+1, t.id, t.nombre, t.ciudad, t.puntos, t.exactos, now]));
  SpreadsheetApp.getActive().toast("Ranking recalculado: "+tabla.length+" jugadores.");
}

function scorePlayer_(pron, realQual, realRound){
  let puntos=0, exactos=0;
  // grupos
  (pron.clasificados||[]).forEach(c=>{
    const real = realQual[String(c.e).trim()];
    if(real && real.clasifico){
      puntos += PUNTOS.clasificado;
      if(BONUS_PUESTO && (c.p===1||c.p===2) && real.puesto===c.p) puntos += PUNTOS.puesto_exacto;
    }
  });
  // llaves: por equipo y por ronda
  const llaves = pron.llaves||{};
  Object.keys(llaves).forEach(num=>{
    const et = matchEtapa_(num);
    const pk = llaves[num];            // {av, gf, gc}
    const real = (realRound[et]||{})[String(pk.av).trim()];
    if(!real) return;                  // ese equipo NO avanzo realmente en esa ronda
    puntos += (PUNTOS.avanza[et]||0);
    if(pk.gf!=="" && pk.gc!=="" && Number(pk.gf)===real.gf && Number(pk.gc)===real.gc){
      puntos += (PUNTOS.marcador[et]||0); exactos++;
    }
  });
  return {puntos, exactos};
}

function rankingJson_(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName("Ranking");
  if(!sh || sh.getLastRow()<2) return {ok:true, ranking:[], actualizado:""};
  const data = sh.getDataRange().getValues();
  const out = data.slice(1).map(r=>({pos:r[0], nombre:r[2], ciudad:r[3], puntos:r[4], exactos:r[5]}));
  return {ok:true, ranking:out, actualizado: String(data[1][6]||"")};
}

/* ============ helpers ============ */
function onOpen(){
  SpreadsheetApp.getUi().createMenu("Quiniela")
    .addItem("Preparar pestañas de Resultados", "setupResultados")
    .addItem("Recalcular ranking", "computeRanking")
    .addToUi();
}
function parseBool_(v){
  if(v===true) return true;
  return ["true","si","1","x","verdadero"].indexOf(String(v).toLowerCase().trim())>=0;
}
function numOr_(v){ const n=Number(v); return isNaN(n)?null:n; }
function saveFile_(file, hint){
  if(!FOLDER_ID || FOLDER_ID.indexOf("PEGAR")===0) return "";
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const bytes = Utilities.base64Decode(file.b64);
  const name = "comprobante_"+(hint||"")+"_"+Date.now()+extOf_(file.mime, file.name);
  const f = folder.createFile(Utilities.newBlob(bytes, file.mime||"application/octet-stream", name));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return f.getUrl();
}
function extOf_(mime, name){
  if(name && name.indexOf(".")>=0) return "."+name.split(".").pop();
  if(!mime) return "";
  if(mime.indexOf("pdf")>=0) return ".pdf";
  if(mime.indexOf("png")>=0) return ".png";
  if(mime.indexOf("jpeg")>=0||mime.indexOf("jpg")>=0) return ".jpg";
  return "";
}
function sheet_(name, headers){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(name);
  if(!sh){ sh = ss.insertSheet(name); sh.appendRow(headers); }
  else if(sh.getLastRow()===0){ sh.appendRow(headers); }
  return sh;
}
function upsert_(sh, keyCol, key, values){
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try{
    const data = sh.getDataRange().getValues();
    let row=-1;
    for(let i=1;i<data.length;i++){ if(String(data[i][keyCol])===String(key)){ row=i+1; break; } }
    if(row>0) sh.getRange(row,1,1,values.length).setValues([values]);
    else sh.appendRow(values);
  } finally { lock.releaseLock(); }
}
function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
