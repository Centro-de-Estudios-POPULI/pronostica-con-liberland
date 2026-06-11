/* =========================================================
   QUINIELA STANLEY — motor de pronósticos por etapas
   Cuadro de la fase eliminatoria (llaves) con fechas reales.
   Sin backend aún: el estado se guarda en localStorage.
   ========================================================= */

/* ---- banderas por imagen (flagcdn) ---- */
const flagURL = iso => `https://flagcdn.com/h40/${iso}.png`;
const flagTag = t => `<img class="flagimg" src="${flagURL(t.iso)}" alt="${t.name}" loading="lazy" />`;

/* ---- 48 selecciones en 12 grupos A–L  [nombre, ISO] ---- */
const TEAMS = [
  // A
  ["México","mx"],["Corea del Sur","kr"],["Sudáfrica","za"],["República Checa","cz"],
  // B
  ["Canadá","ca"],["Bosnia y Herzegovina","ba"],["Qatar","qa"],["Suiza","ch"],
  // C
  ["Brasil","br"],["Marruecos","ma"],["Haití","ht"],["Escocia","gb-sct"],
  // D
  ["Estados Unidos","us"],["Paraguay","py"],["Australia","au"],["Turquía","tr"],
  // E
  ["Alemania","de"],["Costa de Marfil","ci"],["Ecuador","ec"],["Curazao","cw"],
  // F
  ["Países Bajos","nl"],["Japón","jp"],["Suecia","se"],["Túnez","tn"],
  // G
  ["Bélgica","be"],["Egipto","eg"],["Irán","ir"],["Nueva Zelanda","nz"],
  // H
  ["España","es"],["Uruguay","uy"],["Arabia Saudita","sa"],["Cabo Verde","cv"],
  // I
  ["Francia","fr"],["Senegal","sn"],["Noruega","no"],["Irak","iq"],
  // J
  ["Argentina","ar"],["Argelia","dz"],["Austria","at"],["Jordania","jo"],
  // K
  ["Portugal","pt"],["Colombia","co"],["Uzbekistán","uz"],["RD del Congo","cd"],
  // L
  ["Inglaterra","gb-eng"],["Croacia","hr"],["Ghana","gh"],["Panamá","pa"]
].map(([name,iso],id)=>({id,name,iso}));

const GLETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const GROUPS = {};
GLETTERS.forEach((g,i)=>{ GROUPS[g] = [0,1,2,3].map(k=>i*4+k); });

/* ---- BRACKET REAL (partidos 73–104) ----
   slots:  W=1.º grupo · R=2.º grupo · T=mejor 3.º (i=índice 0–7)
           WIN/LOSE = ganador/perdedor del partido nº m
   d = fecha/hora real (America/La_Paz, -04:00)                         */
const MATCHES = {
  // Dieciseisavos (28 jun – 3 jul)
  73:{e:'r32', a:{t:'R',g:'A'}, b:{t:'R',g:'B'},               d:'2026-06-28T15:00:00-04:00'},
  76:{e:'r32', a:{t:'W',g:'C'}, b:{t:'R',g:'F'},               d:'2026-06-29T13:00:00-04:00'},
  74:{e:'r32', a:{t:'W',g:'E'}, b:{t:'T',i:0,set:'A·B·C·D·F'}, d:'2026-06-29T16:30:00-04:00'},
  75:{e:'r32', a:{t:'W',g:'F'}, b:{t:'R',g:'C'},               d:'2026-06-29T21:00:00-04:00'},
  78:{e:'r32', a:{t:'R',g:'E'}, b:{t:'R',g:'I'},               d:'2026-06-30T13:00:00-04:00'},
  77:{e:'r32', a:{t:'W',g:'I'}, b:{t:'T',i:1,set:'C·D·F·G·H'}, d:'2026-06-30T17:00:00-04:00'},
  79:{e:'r32', a:{t:'W',g:'A'}, b:{t:'T',i:2,set:'C·E·F·H·I'}, d:'2026-06-30T21:00:00-04:00'},
  80:{e:'r32', a:{t:'W',g:'L'}, b:{t:'T',i:3,set:'E·H·I·J·K'}, d:'2026-07-01T12:00:00-04:00'},
  82:{e:'r32', a:{t:'W',g:'G'}, b:{t:'T',i:4,set:'A·E·H·I·J'}, d:'2026-07-01T16:00:00-04:00'},
  81:{e:'r32', a:{t:'W',g:'D'}, b:{t:'T',i:5,set:'B·E·F·I·J'}, d:'2026-07-01T20:00:00-04:00'},
  84:{e:'r32', a:{t:'W',g:'H'}, b:{t:'R',g:'J'},               d:'2026-07-02T14:00:00-04:00'},
  83:{e:'r32', a:{t:'R',g:'K'}, b:{t:'R',g:'L'},               d:'2026-07-02T18:00:00-04:00'},
  85:{e:'r32', a:{t:'W',g:'B'}, b:{t:'T',i:6,set:'E·F·G·I·J'}, d:'2026-07-02T22:00:00-04:00'},
  88:{e:'r32', a:{t:'R',g:'D'}, b:{t:'R',g:'G'},               d:'2026-07-03T14:00:00-04:00'},
  86:{e:'r32', a:{t:'W',g:'J'}, b:{t:'R',g:'H'},               d:'2026-07-03T18:30:00-04:00'},
  87:{e:'r32', a:{t:'W',g:'K'}, b:{t:'T',i:7,set:'D·E·I·J·L'}, d:'2026-07-03T21:30:00-04:00'},
  // Octavos (4–7 jul)
  90:{e:'r16', a:{t:'WIN',m:73}, b:{t:'WIN',m:75}, d:'2026-07-04T13:00:00-04:00'},
  89:{e:'r16', a:{t:'WIN',m:74}, b:{t:'WIN',m:77}, d:'2026-07-04T17:00:00-04:00'},
  91:{e:'r16', a:{t:'WIN',m:76}, b:{t:'WIN',m:78}, d:'2026-07-05T16:00:00-04:00'},
  92:{e:'r16', a:{t:'WIN',m:79}, b:{t:'WIN',m:80}, d:'2026-07-05T20:00:00-04:00'},
  93:{e:'r16', a:{t:'WIN',m:83}, b:{t:'WIN',m:84}, d:'2026-07-06T15:00:00-04:00'},
  94:{e:'r16', a:{t:'WIN',m:81}, b:{t:'WIN',m:82}, d:'2026-07-06T15:00:00-04:00'},
  95:{e:'r16', a:{t:'WIN',m:86}, b:{t:'WIN',m:88}, d:'2026-07-07T12:00:00-04:00'},
  96:{e:'r16', a:{t:'WIN',m:85}, b:{t:'WIN',m:87}, d:'2026-07-07T16:00:00-04:00'},
  // Cuartos (9–11 jul)
  97:{e:'qf', a:{t:'WIN',m:89}, b:{t:'WIN',m:90}, d:'2026-07-09T16:00:00-04:00'},
  98:{e:'qf', a:{t:'WIN',m:93}, b:{t:'WIN',m:94}, d:'2026-07-10T15:00:00-04:00'},
  99:{e:'qf', a:{t:'WIN',m:91}, b:{t:'WIN',m:92}, d:'2026-07-11T17:00:00-04:00'},
  100:{e:'qf', a:{t:'WIN',m:95}, b:{t:'WIN',m:96}, d:'2026-07-11T21:00:00-04:00'},
  // Semifinales (14–15 jul)
  101:{e:'sf', a:{t:'WIN',m:97}, b:{t:'WIN',m:98},  d:'2026-07-14T15:00:00-04:00'},
  102:{e:'sf', a:{t:'WIN',m:99}, b:{t:'WIN',m:100}, d:'2026-07-15T15:00:00-04:00'},
  // 3.er puesto y Final (18–19 jul)
  103:{e:'tercer', lbl:'3.er puesto', a:{t:'LOSE',m:101}, b:{t:'LOSE',m:102}, d:'2026-07-18T17:00:00-04:00'},
  104:{e:'final',  lbl:'Final',       a:{t:'WIN',m:101},  b:{t:'WIN',m:102},  d:'2026-07-19T15:00:00-04:00'}
};

const STAGES = [
  {id:'grupos', n:1, etapa:'Etapa 1', title:'Fase de grupos', short:'Grupos',
   lead:'En cada grupo ordená 1.º, 2.º y 3.º (tocá cada equipo). Los dos primeros clasifican; después elegí los 8 mejores terceros.'},
  {id:'r32', n:2, etapa:'Etapa 2', title:'Dieciseisavos', short:'16avos',
   lead:'Del 28 jun al 3 jul · 16 partidos. Elegí quién avanza; cargá el marcador a 90\' y, si hay empate, definí si pasa por alargue o penales.'},
  {id:'r16', n:3, etapa:'Etapa 3', title:'Octavos de final', short:'Octavos',
   lead:'Del 4 al 7 jul · 8 partidos.'},
  {id:'qf', n:4, etapa:'Etapa 4', title:'Cuartos de final', short:'Cuartos',
   lead:'Del 9 al 11 jul · 4 partidos.'},
  {id:'sf', n:5, etapa:'Etapa 5', title:'Semifinales', short:'Semis',
   lead:'14 y 15 jul · 2 partidos.'},
  {id:'final', n:6, etapa:'Etapa 6', title:'Final y 3.er puesto', short:'Final',
   lead:'3.er puesto (18 jul) y la gran final (19 jul). Elegí al campeón y sumá puntos con los marcadores.'}
];

const STAGE_MATCHES = {
  r32:[73,76,74,75,78,77,79,80,82,81,84,83,85,88,86,87],
  r16:[90,89,91,92,93,94,95,96],
  qf:[97,98,99,100],
  sf:[101,102],
  final:[103,104]
};

/* etiqueta genérica por llave (sin numeración oficial de partidos) */
const LLAVE = {};
STAGE_MATCHES.r32.forEach((n,i)=> LLAVE[n]='Llave '+(i+1));
STAGE_MATCHES.r16.forEach((n,i)=> LLAVE[n]='Octavos '+(i+1));
STAGE_MATCHES.qf.forEach((n,i)=> LLAVE[n]='Cuartos '+(i+1));
STAGE_MATCHES.sf.forEach((n,i)=> LLAVE[n]='Semifinal '+(i+1));
LLAVE[103]='3.er puesto'; LLAVE[104]='Final';
const matchLabel = num => LLAVE[num] || ('Cruce '+num);

/* ---- estado ---- */
const KEY = 'stanley_quiniela_v2';
const DEFAULT = {rank:{}, thirds:[], scores:{}, adv:{}, design:false, active:'grupos',
  groupsSubmitted:false, nostradamus:{sent:false, at:''}, golesGrupos:'', campeonRef:null};
let state = load();
function load(){
  let s; try{ s = Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY))||{}); }catch(e){ s = Object.assign({},DEFAULT); }
  if(!s.nostradamus || typeof s.nostradamus!=='object') s.nostradamus = {sent:false, at:''};
  return s;
}
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); scheduleCloud(); }

/* ---- jugador + guardado en la nube (Google Sheets vía Apps Script) ---- */
const APPS_URL = (window.STANLEY||{}).APPS_SCRIPT_URL || '';
function getPlayer(){ try{ return JSON.parse(localStorage.getItem('stanley_player')); }catch(e){ return null; } }
function setCloud(s){
  const el=document.getElementById('cloud'); if(!el) return;
  const map={pend:'☁️ Cambios sin guardar',saving:'☁️ Guardando…',ok:'✅ Guardado',
             err:'⚠️ Sin conexión · queda local',local:'💾 Local'};
  el.textContent=map[s]||''; el.dataset.s=s||'';
}
let _saveTimer=null;
function scheduleCloud(){
  if(!getPlayer() || !APPS_URL){ setCloud('local'); return; }
  setCloud('pend'); clearTimeout(_saveTimer); _saveTimer=setTimeout(cloudSave, 2500);
}
const _nm = id => id!=null ? team(id).name : '';
function buildPronostico(){
  const clasificados=[];
  GLETTERS.forEach(g=>{ const a=rankTeam(g,1), b=rankTeam(g,2);
    if(a!=null) clasificados.push({e:_nm(a),p:1});
    if(b!=null) clasificados.push({e:_nm(b),p:2}); });
  state.thirds.forEach(id=> clasificados.push({e:_nm(id),p:3}));
  const llaves={};
  Object.keys(MATCHES).forEach(n=>{ const r=resultOf(n); if(r.win==null) return;
    const adv=state.adv[n], sc=state.scores[n]||{};
    const gf=adv==='a'?sc.a:sc.b, gc=adv==='a'?sc.b:sc.a;
    // gf/gc = marcador a 90' desde el que avanza; tb = método si hubo empate a 90' ('alargue'|'penales')
    llaves[n]={av:_nm(r.win), gf:(gf!=null?gf:''), gc:(gc!=null?gc:''), tb:(sc.tb||'')};
  });
  return {clasificados, llaves};
}
function cloudSave(){
  const p=getPlayer(); if(!p || !APPS_URL) return;
  setCloud('saving');
  const fin=resultOf(104);
  const body={ action:'savePicks', id:p.id, nombre:p.nombre, documento:p.documento,
    avance:progressStats().pct, campeon:_nm(getWinner(104)),
    finalista:[fin.A,fin.B].map(_nm).filter(Boolean).join(' / '), tercero:_nm(getWinner(103)),
    grupos_enviados: state.groupsSubmitted?1:0,
    nostradamus: state.nostradamus.sent?1:0, nostra_at: state.nostradamus.at||'',
    goles_grupos: state.golesGrupos||'', campeon_ref: _nm(state.campeonRef),
    pronostico: buildPronostico() };
  fetch(APPS_URL, { method:'POST', body:JSON.stringify(body) })
    .then(()=>setCloud('ok')).catch(()=>setCloud('err'));
}

const team = id => (id==null?null:TEAMS[id]);
const fmtFecha = iso => new Intl.DateTimeFormat('es-BO',
  {weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'America/La_Paz'}
).format(new Date(iso)).replace(',', '');

/* tiempo relativo "en 3d 5h" */
function relTime(iso){
  const diff=new Date(iso).getTime()-Date.now();
  if(diff<=0) return 'cerrado';
  const d=Math.floor(diff/864e5), h=Math.floor((diff%864e5)/36e5), m=Math.floor((diff%36e5)/6e4);
  if(d>0) return `en ${d}d ${h}h`;
  if(h>0) return `en ${h}h ${m}m`;
  return `en ${m}m`;
}

/* toast (aviso flotante) */
function toast(msg,type){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.className='toast show'+(type?' '+type:'');
  clearTimeout(toast._t); toast._t=setTimeout(()=>{ t.className='toast'; },2800);
}

/* progreso + próximo cierre, por etapa */
function stageMeta(id){
  if(id==='grupos'){
    const gc=GLETTERS.filter(g=>rankTeam(g,1)!=null&&rankTeam(g,2)!=null).length;
    const tn=state.thirds.length;
    return `<span class="chip-prog${gc===12?' ok':''}">Grupos ${gc}/12</span>`
         + `<span class="chip-prog${tn===8?' ok':''}">Terceros ${tn}/8</span>`;
  }
  const nums=STAGE_MATCHES[id]; const chosen=nums.filter(n=>state.adv[n]).length;
  let html=`<span class="chip-prog${chosen===nums.length?' ok':''}">Elegidos ${chosen}/${nums.length}</span>`;
  const up=nums.map(n=>({n,t:new Date(MATCHES[n].d).getTime()})).filter(x=>x.t>Date.now()).sort((a,b)=>a.t-b.t)[0];
  if(up) html+=`<span class="chip-prog">⏱ Cierra ${matchLabel(up.n)} ${relTime(MATCHES[up.n].d)}</span>`;
  return html;
}

/* festeja cuando una etapa se completa (una sola vez) */
const _doneFlag={};
let _allDoneShown=false;
function notifyIfComplete(id){
  const d=isDone(id);
  if(d && !_doneFlag[id]){ _doneFlag[id]=true; const s=STAGES.find(x=>x.id===id); toast(`🎉 ¡${s.title} completa!`,'ok'); }
  else if(!d){ _doneFlag[id]=false; }
}

/* ---- progreso global ---- */
function progressStats(){
  const gc=GLETTERS.filter(g=>rankTeam(g,1)!=null&&rankTeam(g,2)!=null).length;
  const tn=Math.min(state.thirds.length,8);
  const mc=Object.keys(MATCHES).filter(n=>state.adv[n]).length;
  const done=gc+tn+mc, total=12+8+32;
  return {done,total,pct:Math.round(done/total*100)};
}
function updateProgress(){
  const st=progressStats();
  const f=document.getElementById('pg-fill'), l=document.getElementById('pg-label');
  if(f) f.style.width=st.pct+'%';
  if(l) l.textContent=st.pct+'%';
  if(st.pct===100 && !_allDoneShown){ _allDoneShown=true; toast('🏆 ¡Quiniela completa! Mucha suerte',''); }
  else if(st.pct<100) _allDoneShown=false;
}

/* ---- próximo partido (cuenta regresiva en la barra) ---- */
function nextMatch(){
  return Object.keys(MATCHES).map(n=>({n:+n,t:new Date(MATCHES[n].d).getTime()}))
    .filter(x=>x.t>Date.now()).sort((a,b)=>a.t-b.t)[0]||null;
}
function tickNext(){
  const el=document.getElementById('nextmatch'); if(!el) return;
  const up=nextMatch();
  if(!up){ el.textContent=''; return; }
  let diff=up.t-Date.now();
  const d=Math.floor(diff/864e5), h=Math.floor((diff%864e5)/36e5), m=Math.floor((diff%36e5)/6e4), s=Math.floor((diff%6e4)/1e3);
  const pad=x=>String(x).padStart(2,'0');
  el.innerHTML=`⏱ <b>${matchLabel(up.n)}</b> ${d>0?d+'d ':''}${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* ---- resumen "Mi quiniela" (modal) ---- */
function openResumen(){
  const body=document.getElementById('modal-body');
  const nm=id=> id!=null ? flagTag(team(id))+team(id).name : '—';
  const cell=id=> id==null
    ? `<span class="rg-team empty">—</span>`
    : `<span class="rg-team">${flagTag(team(id))}<span class="nm">${team(id).name}</span></span>`;
  let grp='';
  GLETTERS.forEach(g=>{ grp+=`<div class="rg-row"><span class="rg-g">${g}</span>${cell(rankTeam(g,1))}${cell(rankTeam(g,2))}</div>`; });
  const champ=getWinner(104), fin=resultOf(104), third=getWinner(103);
  const finalists=[fin.A,fin.B].some(x=>x!=null)?`${nm(fin.A)} <b>vs</b> ${nm(fin.B)}`:'Por definir';
  const st=progressStats();
  body.innerHTML=`<h3 class="modal__h">📋 Mi quiniela</h3>
    <p class="modal__p">Avance: <b>${st.pct}%</b> (${st.done}/${st.total})</p>
    <div class="res-block"><h4>🏆 Campeón</h4><p>${nm(champ)}</p></div>
    <div class="res-block"><h4>Final</h4><p>${finalists}</p></div>
    <div class="res-block"><h4>3.er puesto</h4><p>${nm(third)}</p></div>
    <div class="res-block"><h4>Clasificados de grupos</h4>
      <div class="res-groups">
        <div class="rg-head"><span class="rg-c">Gr</span><span>1.º clasificado</span><span>2.º clasificado</span></div>
        ${grp}
      </div>
    </div>
    <div class="modal__actions">
      <button class="btn btn--sm" id="res-share">📲 Compartir imagen</button>
      <button class="btn btn--sm" id="res-close" style="background:#9aa2a6">Cerrar</button>
    </div>`;
  const modal=document.getElementById('modal');
  modal.classList.add('wide'); modal.hidden=false;
  body.querySelector('#res-close').onclick=closeModal;
  body.querySelector('#res-share').onclick=shareResumen;
}

/* ---- compartir (texto, fallback) ---- */
function share(){
  const champ=getWinner(104);
  const txt = champ!=null
    ? `Mi campeón en la quiniela Stanley es ${team(champ).name} 🏆 ¿Te animás a pronosticar?`
    : `Armé mi quiniela en Pronosticá con Stanley 🏆 ¿Te animás?`;
  const url='https://centro-de-estudios-populi.github.io/pronostica-con-stanley/';
  if(navigator.share){ navigator.share({title:'Pronosticá con Stanley',text:txt,url}).catch(()=>{}); }
  else { window.open('https://wa.me/?text='+encodeURIComponent(txt+' '+url),'_blank'); }
}

/* ---- imagen para redes (canvas, marca Stanley) ---- */
const loadImg = src => new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
function ensureFonts(){
  if(!document.fonts) return Promise.resolve();
  const load = Promise.all([
    document.fonts.load('400 130px Anton'),
    document.fonts.load('900 22px Montserrat'),
    document.fonts.load('800 40px Montserrat'),
    document.fonts.load('700 34px Montserrat'),
    document.fonts.load('600 24px Montserrat')
  ]).then(()=>document.fonts.ready).catch(()=>{});
  const timeout = new Promise(r=>setTimeout(r,1500));   // nunca se cuelga esperando fuentes
  return Promise.race([load, timeout]);
}
async function buildShareCanvas(withLogo){
  const W=1080,H=1080;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d');
  // fondo cancha (rayas verde oscuro)
  for(let i=0;i<W;i+=140){ x.fillStyle=((i/140)%2)?'#022417':'#03301f'; x.fillRect(i,0,140,H); }
  // marcas de cancha
  x.strokeStyle='rgba(255,255,255,.10)'; x.lineWidth=3;
  x.beginPath(); x.arc(W/2,H/2,170,0,Math.PI*2); x.stroke();
  x.beginPath(); x.moveTo(W/2,0); x.lineTo(W/2,H); x.stroke();
  // franja Bolivia
  const bw=W/3; x.fillStyle='#DA291C'; x.fillRect(0,0,bw,16);
  x.fillStyle='#F4C300'; x.fillRect(bw,0,bw,16); x.fillStyle='#007A33'; x.fillRect(bw*2,0,bw,16);
  // logo Stanley (blanco). En HTTPS no contamina; bajo file:// puede tainting → por eso es opcional
  // datos + banderas (en HTTPS/localhost no contaminan; bajo file:// sí)
  const champ=getWinner(104), fin=resultOf(104), third=getWinner(103);
  const flags={};
  if(withLogo){
    const ids=new Set(); [champ,fin.A,fin.B,third].forEach(id=>{ if(id!=null) ids.add(id); });
    const arr=[...ids]; const imgs=await Promise.all(arr.map(id=>loadFlagImg(team(id).iso)));
    arr.forEach((id,i)=> flags[id]=imgs[i]);
  }
  if(withLogo){
    try{ const logo=await loadImg('assets/logo-stanley-horizontal.png');
      drawLogoFitted(x, logo, W/2, 56, 360, 186);
    }catch(e){}
  }
  x.textAlign='center';
  x.fillStyle='#b59677'; x.font='800 30px Montserrat, sans-serif';
  x.fillText('PRONOSTICÁ · TEMPORADA FUTBOLERA', W/2, 300);
  x.fillStyle='rgba(255,255,255,.85)'; x.font='800 40px Montserrat, sans-serif';
  x.fillText('MI CAMPEÓN', W/2, 432);
  // campeón con su bandera
  const name=(champ!=null?team(champ).name:'Por definir').toUpperCase();
  const showCF = champ!=null && flags[champ];
  let fs=132; x.font=`400 ${fs}px Anton, sans-serif`;
  const maxW = showCF ? W-300 : W-130;
  while(x.measureText(name).width>maxW && fs>54){ fs-=6; x.font=`400 ${fs}px Anton, sans-serif`; }
  const nameW=x.measureText(name).width;
  if(showCF){
    const fw=flagDims(fs).fw, gap=36, total=fw+gap+nameW, sx=(W-total)/2;
    drawCanvasFlag(x, flags[champ], sx, 582, fs);
    x.textAlign='left'; x.fillStyle='#fff'; x.font=`400 ${fs}px Anton, sans-serif`; x.fillText(name, sx+fw+gap, 582); x.textAlign='center';
  } else {
    x.fillStyle='#fff'; x.fillText(name, W/2, 582);
  }
  x.fillStyle='#b59677'; x.fillRect(W/2-64, 626, 128, 6);
  x.fillStyle='rgba(255,255,255,.92)'; x.font='700 34px Montserrat, sans-serif'; x.fillText('LA FINAL', W/2, 712);
  x.font='600 31px Montserrat, sans-serif';
  drawFlaggedPair(x, fin.A, fin.B, 758, 31, flags, 'rgba(255,255,255,.82)');
  if(third!=null){
    x.font='600 27px Montserrat, sans-serif';
    drawLabeledTeam(x, '3.er puesto · ', third, team(third).name, W/2, 804, 27, flags, 'rgba(255,255,255,.65)');
  }
  const p=getPlayer();
  if(p&&p.nombre){ x.fillStyle='#b59677'; x.font='700 31px Montserrat, sans-serif'; x.fillText('por '+p.nombre, W/2, 884); }
  x.fillStyle='rgba(255,255,255,.6)'; x.font='600 24px Montserrat, sans-serif';
  x.fillText('Pronosticá con Stanley · stanley1913.bo', W/2, 1012);
  return c;
}
/* genera el blob; si el canvas se contamina (file://) reintenta sin logo */
function makeBlob(withLogo){
  return buildShareCanvas(withLogo).then(c=> new Promise(res=>{
    try{ c.toBlob(b=>res(b||null),'image/png'); }catch(e){ res(null); }
  })).catch(()=>null);
}
async function shareImage(){
  toast('Generando tu imagen…');
  await ensureFonts();
  let blob = await makeBlob(true);
  if(!blob) blob = await makeBlob(false);     // fallback sin logo (evita taint local)
  if(!blob){ toast('No se pudo generar la imagen','warn'); return; }
  showSharePreview(blob);
}
/* vista previa: siempre se ve (no depende de la API de compartir) */
function defaultShareText(){
  const champ=getWinner(104);
  return champ!=null
    ? `Mi campeón en la quiniela Stanley es ${team(champ).name} 🏆 ¿Te animás?`
    : 'Armé mi quiniela en Pronosticá con Stanley 🏆';
}
function showSharePreview(blob, opts){
  opts = opts||{};
  const filename = opts.filename || 'mi-campeon-stanley.png';
  const title    = opts.title    || '📲 Compartí tu campeón';
  const txt      = opts.text     || defaultShareText();
  const url=URL.createObjectURL(blob);
  const file=new File([blob],filename,{type:'image/png'});
  const canShareFiles = !!(navigator.canShare && navigator.canShare({files:[file]}));
  const body=document.getElementById('modal-body');
  body.innerHTML=`
    <h3 class="modal__h">${title}</h3>
    <img class="share-preview" src="${url}" alt="${title} · Pronosticá con Stanley" />
    <div class="modal__actions">
      <button class="btn btn--sm" id="sp-dl">⬇️ Descargar</button>
      ${canShareFiles?'<button class="btn btn--sm" id="sp-share">Compartir</button>':''}
    </div>`;
  document.getElementById('modal').hidden=false;
  body.querySelector('#sp-dl').onclick=()=>{
    const a=document.createElement('a'); a.href=url; a.download=filename;
    document.body.appendChild(a); a.click(); a.remove();
    toast('⬇️ Imagen descargada','ok');
  };
  const sb=body.querySelector('#sp-share');
  if(sb) sb.onclick=async()=>{
    try{ await navigator.share({files:[file], text:txt, url:'https://centro-de-estudios-populi.github.io/pronostica-con-stanley/'}); }catch(e){}
  };
  setTimeout(()=>URL.revokeObjectURL(url), 60000);
}

/* =========================================================
   IMAGEN DEL RESUMEN — cuadro completo (logo + banderas)
   ========================================================= */
function loadFlagImg(iso){
  return new Promise(res=>{ const i=new Image(); i.crossOrigin='anonymous';
    i.onload=()=>res(i); i.onerror=()=>res(null); i.src=flagURL(iso); });
}
function fitFont(ctx, text, max, base, weight){
  let fs=base; ctx.font=`${weight} ${fs}px Montserrat, sans-serif`;
  while(ctx.measureText(text).width>max && fs>13){ fs-=2; ctx.font=`${weight} ${fs}px Montserrat, sans-serif`; }
  return fs;
}
/* tamaño de bandera (3:2) proporcional a la altura del texto */
function flagDims(fontH){ const fh=fontH*0.72, fw=fh*1.5; return {fw,fh}; }
/* dibuja una bandera centrada vertical en la baseline del texto; devuelve su ancho */
function drawCanvasFlag(ctx, img, sx, baseline, fontH){
  const d=flagDims(fontH), midY=baseline-fontH*0.33;
  ctx.drawImage(img, sx, midY-d.fh/2, d.fw, d.fh);
  ctx.strokeStyle='rgba(255,255,255,.3)'; ctx.lineWidth=1.5; ctx.strokeRect(sx, midY-d.fh/2, d.fw, d.fh);
  return d.fw;
}
/* dibuja el logo ajustado a una caja (maxW × maxH), centrado en cx; devuelve el borde inferior */
function drawLogoFitted(ctx, img, cx, top, maxW, maxH){
  let w=maxW, h=w*img.height/img.width;
  if(h>maxH){ h=maxH; w=h*img.width/img.height; }
  ctx.drawImage(img, cx-w/2, top, w, h);
  return top+h;
}
/* "prefijo + [bandera] + nombre" centrado en cx (ctx.font ya seteado) */
function drawLabeledTeam(ctx, prefix, id, name, cx, baseline, fontH, flags, color){
  const fw=flagDims(fontH).fw, gap=fontH*0.4;
  const showFlag = id!=null && flags && flags[id];
  const pw = prefix? ctx.measureText(prefix).width : 0;
  const nw = ctx.measureText(name).width;
  const total = pw + (showFlag? fw+gap : 0) + nw;
  let sx=cx-total/2;
  ctx.textAlign='left'; ctx.fillStyle=color;
  if(prefix){ ctx.fillText(prefix, sx, baseline); sx+=pw; }
  if(showFlag){ drawCanvasFlag(ctx, flags[id], sx, baseline, fontH); sx+=fw+gap; }
  ctx.fillStyle=color; ctx.fillText(name, sx, baseline);
  ctx.textAlign='center';
}
/* "[bandera] A  vs  [bandera] B" centrado (ctx.font ya seteado) */
function drawFlaggedPair(ctx, idA, idB, baseline, fontH, flags, color){
  const fw=flagDims(fontH).fw, gap=fontH*0.4, sep='   vs   ';
  const nA=idA!=null?team(idA).name:'—', nB=idB!=null?team(idB).name:'—';
  const segW=(id,nm)=> ((id!=null&&flags&&flags[id])? fw+gap:0) + ctx.measureText(nm).width;
  const total=segW(idA,nA)+ctx.measureText(sep).width+segW(idB,nB);
  let sx=(ctx.canvas.width-total)/2;
  ctx.textAlign='left';
  const seg=(id,nm)=>{ if(id!=null&&flags&&flags[id]){ drawCanvasFlag(ctx, flags[id], sx, baseline, fontH); sx+=fw+gap; }
    ctx.fillStyle=color; ctx.fillText(nm, sx, baseline); sx+=ctx.measureText(nm).width; };
  seg(idA,nA); ctx.fillStyle=color; ctx.fillText(sep, sx, baseline); sx+=ctx.measureText(sep).width; seg(idB,nB);
  ctx.textAlign='center';
}
async function buildResumenCanvas(withMedia){
  const W=1080, H=1500;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d');
  // fondo cancha (rayas)
  for(let i=0;i<W;i+=140){ x.fillStyle=((i/140)%2)?'#022417':'#03301f'; x.fillRect(i,0,140,H); }
  x.strokeStyle='rgba(255,255,255,.07)'; x.lineWidth=3;
  x.beginPath(); x.moveTo(W/2,150); x.lineTo(W/2,H); x.stroke();
  // franja Bolivia
  const bw=W/3; x.fillStyle='#DA291C'; x.fillRect(0,0,bw,16);
  x.fillStyle='#F4C300'; x.fillRect(bw,0,bw,16); x.fillStyle='#007A33'; x.fillRect(bw*2,0,bw,16);

  // datos
  const champ=getWinner(104), fin=resultOf(104), third=getWinner(103);
  const rows=GLETTERS.map(g=>({g, a:rankTeam(g,1), b:rankTeam(g,2)}));

  // precargar banderas (solo si withMedia)
  const flags={};
  if(withMedia){
    const ids=new Set();
    [champ,fin.A,fin.B,third].forEach(id=>{ if(id!=null) ids.add(id); });
    rows.forEach(r=>{ if(r.a!=null) ids.add(r.a); if(r.b!=null) ids.add(r.b); });
    const arr=[...ids];
    const imgs=await Promise.all(arr.map(id=>loadFlagImg(team(id).iso)));
    arr.forEach((id,i)=> flags[id]=imgs[i]);
  }

  // logo o wordmark
  function drawWordmark(){ x.textAlign='center'; x.fillStyle='#fff'; x.font='400 56px Anton, sans-serif'; x.fillText('STANLEY 1913', W/2, 112); }
  if(withMedia){
    try{ const logo=await loadImg('assets/logo-stanley-horizontal.png');
      drawLogoFitted(x, logo, W/2, 38, 300, 112);
    }catch(e){ drawWordmark(); }
  } else { drawWordmark(); }

  // kicker
  x.textAlign='center';
  x.fillStyle='#b59677'; x.font='800 26px Montserrat, sans-serif';
  x.fillText('MI QUINIELA · TEMPORADA FUTBOLERA', W/2, 192);

  // campeón
  x.fillStyle='rgba(255,255,255,.9)'; x.font='800 30px Montserrat, sans-serif'; x.fillText('TU CAMPEÓN', W/2, 240);
  const champName=(champ!=null?team(champ).name:'Por definir').toUpperCase();
  let cfs=84; x.font=`400 ${cfs}px Anton, sans-serif`;
  const maxNameW=(champ!=null && withMedia && flags[champ]) ? W-300 : W-150;
  while(x.measureText(champName).width>maxNameW && cfs>40){ cfs-=4; x.font=`400 ${cfs}px Anton, sans-serif`; }
  const cnameW=x.measureText(champName).width;
  const cBaseline=332;
  if(champ!=null && withMedia && flags[champ]){
    const fw=flagDims(cfs).fw, gap=30, total=fw+gap+cnameW, sx=(W-total)/2;
    drawCanvasFlag(x, flags[champ], sx, cBaseline, cfs);
    x.textAlign='left'; x.fillStyle='#fff'; x.font=`400 ${cfs}px Anton, sans-serif`; x.fillText(champName, sx+fw+gap, cBaseline);
    x.textAlign='center';
  } else {
    x.fillStyle='#fff'; x.font=`400 ${cfs}px Anton, sans-serif`; x.fillText(champName, W/2, cBaseline);
  }
  x.fillStyle='#b59677'; x.fillRect(W/2-70, 360, 140, 6);

  // final + tercero
  const fname=id=> id!=null?team(id).name:'—';
  x.fillStyle='rgba(255,255,255,.92)'; x.font='800 26px Montserrat, sans-serif'; x.fillText('LA FINAL', W/2, 426);
  const finText=`${fname(fin.A)}   vs   ${fname(fin.B)}`;
  fitFont(x, finText, W-150, 34, '700'); x.fillStyle='rgba(255,255,255,.86)'; x.fillText(finText, W/2, 470);
  if(third!=null){ x.fillStyle='rgba(255,255,255,.6)'; x.font='600 24px Montserrat, sans-serif'; x.fillText('3.er puesto · '+team(third).name, W/2, 514); }

  // divisor
  x.strokeStyle='rgba(181,150,119,.5)'; x.lineWidth=2; x.beginPath(); x.moveTo(80,558); x.lineTo(W-80,558); x.stroke();

  // clasificados — encabezado
  x.fillStyle='#b59677'; x.font='800 24px Montserrat, sans-serif'; x.fillText('CLASIFICADOS · FASE DE GRUPOS', W/2, 600);
  x.textAlign='left'; x.fillStyle='rgba(255,255,255,.5)'; x.font='800 16px Montserrat, sans-serif';
  x.fillText('GR', 72, 646); x.fillText('1.º', 150, 646); x.fillText('2.º', 540, 646);

  // celda de equipo (bandera + nombre)
  function drawTeamCell(id, flagX, y, fwc, fhc, rightEdge){
    const nameX=flagX+fwc+14;
    if(id==null){ x.fillStyle='rgba(255,255,255,.4)'; x.font='600 24px Montserrat, sans-serif'; x.fillText('—', nameX, y+8); return; }
    if(withMedia && flags[id]){ x.drawImage(flags[id], flagX, y-fhc/2, fwc, fhc);
      x.strokeStyle='rgba(255,255,255,.22)'; x.lineWidth=1; x.strokeRect(flagX, y-fhc/2, fwc, fhc); }
    const nm=team(id).name;
    const fs=fitFont(x, nm, rightEdge-nameX, 26, '600');
    x.fillStyle='#fff'; x.fillText(nm, nameX, y+fs*0.34);
  }
  const rowY0=692, step=60, fw=40, fh=26;
  rows.forEach((r,i)=>{
    const y=rowY0 + i*step;
    if(i%2===0){ x.fillStyle='rgba(255,255,255,.045)'; x.fillRect(60, y-step/2+2, W-120, step-4); }
    // badge del grupo
    x.fillStyle='#b59677'; x.beginPath(); x.arc(90, y, 21, 0, Math.PI*2); x.fill();
    x.fillStyle='#06251a'; x.textAlign='center'; x.font='900 22px Montserrat, sans-serif'; x.fillText(r.g, 90, y+8);
    x.textAlign='left';
    drawTeamCell(r.a, 150, y, fw, fh, 520);
    drawTeamCell(r.b, 540, y, fw, fh, 1010);
  });

  // pie
  const p=getPlayer();
  x.textAlign='center';
  if(p&&p.nombre){ x.fillStyle='#b59677'; x.font='700 26px Montserrat, sans-serif'; x.fillText('por '+p.nombre, W/2, H-92); }
  x.fillStyle='rgba(255,255,255,.6)'; x.font='600 22px Montserrat, sans-serif';
  x.fillText('Pronosticá con Stanley · stanley1913.bo', W/2, H-50);
  return c;
}
function makeResumenBlob(withMedia){
  return buildResumenCanvas(withMedia).then(c=> new Promise(res=>{
    try{ c.toBlob(b=>res(b||null),'image/png'); }catch(e){ res(null); }
  })).catch(()=>null);
}
async function shareResumen(){
  toast('Generando tu resumen…');
  await ensureFonts();
  let blob = await makeResumenBlob(true);
  if(!blob) blob = await makeResumenBlob(false);   // fallback sin logo/banderas (file://)
  if(!blob){ toast('No se pudo generar la imagen','warn'); return; }
  const champ=getWinner(104);
  showSharePreview(blob, {
    title:'📲 Compartí tu quiniela',
    filename:'mi-quiniela-stanley.png',
    text: champ!=null
      ? `Mi quiniela Stanley — campeón: ${team(champ).name} 🏆 ¿Te animás a pronosticar?`
      : 'Armé mi quiniela en Pronosticá con Stanley 🏆 ¿Te animás?'
  });
}

/* ---- confeti (sin librerías) ---- */
function confetti(){
  const c=document.createElement('canvas'); c.className='confetti-c';
  c.width=window.innerWidth; c.height=window.innerHeight; document.body.appendChild(c);
  const ctx=c.getContext('2d');
  const cols=['#01A66A','#b59677','#DA291C','#F4C300','#ffffff','#2BE08A'];
  const P=Array.from({length:130},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*0.4,
    r:4+Math.random()*5,vy:2+Math.random()*4,vx:-2+Math.random()*4,rot:Math.random()*6,vr:-0.2+Math.random()*0.4,
    col:cols[Math.floor(Math.random()*cols.length)]}));
  let t0=null;
  (function frame(ts){ if(!t0)t0=ts;
    ctx.clearRect(0,0,c.width,c.height);
    P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.col;
      ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6); ctx.restore(); });
    if(ts-t0<2600) requestAnimationFrame(frame); else c.remove();
  })();
}

/* ---- resolución de equipos ---- */
function rankTeam(g, r){
  const m = state.rank[g]||{};
  const found = Object.keys(m).find(id=>m[id]===r);
  return found==null?null:Number(found);
}
function slotInfo(slot){
  switch(slot.t){
    case 'W':    return {id:rankTeam(slot.g,1), label:'1.º '+slot.g};
    case 'R':    return {id:rankTeam(slot.g,2), label:'2.º '+slot.g};
    case 'T':    return {id:(state.thirds[slot.i]!=null?state.thirds[slot.i]:null), label:'Mejor 3.º'};
    case 'WIN':  return {id:getWinner(slot.m), label:'Ganador '+matchLabel(slot.m)};
    case 'LOSE': return {id:getLoser(slot.m),  label:'Perdedor '+matchLabel(slot.m)};
  }
}
function resultOf(num){
  const def = MATCHES[num];
  const A = slotInfo(def.a).id, B = slotInfo(def.b).id;
  const adv = state.adv[num];
  if(A==null||B==null||!adv) return {A,B,win:null,lose:null};
  const win = adv==='a'?A:B, lose = adv==='a'?B:A;
  return {A,B,win,lose};
}
const getWinner = num => resultOf(num).win;
const getLoser  = num => resultOf(num).lose;

/* ¿el partido ya está cerrado? — modo diseño ignora todo
   Reglas: 1) Nostradamus sellado bloquea TODO el cuadro · 2) las llaves requieren
   la fase de grupos enviada · 3) si no, cierra por su hora de inicio. */
function matchLocked(num){
  if(state.design) return false;
  if(state.nostradamus.sent) return true;
  if(!state.groupsSubmitted) return true;
  return Date.now() >= new Date(MATCHES[num].d).getTime();
}
/* grupos en solo-lectura una vez enviados (diseño lo ignora para probar) */
const groupsLocked = () => state.groupsSubmitted && !state.design;

/* ---- completitud ---- */
function groupsDone(){
  const allGroups = GLETTERS.every(g=> rankTeam(g,1)!=null && rankTeam(g,2)!=null);
  return allGroups && state.thirds.length===8;
}
function roundDone(stageId){
  return STAGE_MATCHES[stageId].every(num=> getWinner(num)!=null);
}
const isDone = id => id==='grupos' ? groupsDone() : roundDone(id);
/* Nostradamus completo = todas las llaves (16avos→final) con un ganador elegido */
const KO_STAGES = ['r32','r16','qf','sf','final'];
const nostraComplete = () => KO_STAGES.every(sid=> STAGE_MATCHES[sid].every(num=> getWinner(num)!=null));

/* =========================================================
   RENDER
   ========================================================= */
const stepperEl = document.getElementById('stepper');
const stagesEl  = document.getElementById('stages');

function renderStepper(){
  stepperEl.innerHTML='';
  STAGES.forEach(s=>{
    const lockedStep = s.id!=='grupos' && !state.groupsSubmitted && !state.design;
    const b = document.createElement('button');
    b.className='step-btn'+(s.id===state.active?' active':'')+(isDone(s.id)?' done':'')+(lockedStep?' locked':'');
    b.innerHTML = `<span class="sb__n">${lockedStep?'🔒':(isDone(s.id)?'✓':s.n)}</span>${s.short}`;
    b.onclick = lockedStep ? ()=>toast('Primero enviá tu fase de grupos','warn') : ()=>goto(s.id);
    stepperEl.appendChild(b);
  });
  updateProgress();
}
function goto(id){ state.active=id; save(); renderStepper(); renderStage(id); window.scrollTo({top:0,behavior:'smooth'}); }

function renderStage(id){
  if(id==='nostra'){ renderNostra(); return; }
  const s = STAGES.find(x=>x.id===id);
  stagesEl.innerHTML='';
  const wrap = document.createElement('section');
  wrap.className='stage active';
  wrap.innerHTML = `<div class="stage__head">
      <span class="stage__kicker">${s.etapa}</span>
      <h2>${s.title}</h2><p>${s.lead}</p>
      <div class="stage__meta">${stageMeta(id)}</div></div>`;
  if(id==='grupos'){ wrap.appendChild(renderGroups()); wrap.appendChild(renderThirds()); wrap.appendChild(basePronostico()); wrap.appendChild(groupsSubmitBar()); }
  else { wrap.appendChild(renderRound(id)); }
  wrap.appendChild(stageNav(id));
  stagesEl.appendChild(wrap);
}

/* ---- fase de grupos ---- */
function renderGroups(){
  const locked=groupsLocked();
  const grid=document.createElement('div'); grid.className='groups'+(locked?' ro':'');
  GLETTERS.forEach(g=>{
    const card=document.createElement('div'); card.className='group';
    card.innerHTML=`<div class="group__head"><h4>Grupo ${g}</h4><span class="group__hint">${locked?'🔒 enviado':'1.º · 2.º clasifican · 3.º repechaje'}</span></div>`;
    const rk=state.rank[g]||{}; const rankedCount=Object.keys(rk).length;
    const thirdsFull = state.thirds.length>=8;
    GROUPS[g].forEach(id=>{
      const t=team(id); const r=rk[id];
      const isFourth   = !r && rankedCount>=3;                               // 4.º: sin puesto y grupo completo
      const isThirdOut = r===3 && thirdsFull && !state.thirds.includes(id);  // 3.º que no entró en los 8 mejores
      const out = isFourth || isThirdOut;
      const rankCls = (r && !isThirdOut) ? ' r'+r : '';   // 1°/2° y 3.º elegido conservan su color
      const badge = r ? r+'°' : (isFourth ? '4°' : '');
      const row=document.createElement('div');
      row.className='grow'+rankCls+(out?' out':'')+(locked?' ro':'');
      row.innerHTML=`${flagTag(t)}<span class="gname">${t.name}</span>
        <span class="grow__rank">${badge}</span>`;
      if(!locked) row.onclick=()=>cycleRank(g,id);
      card.appendChild(row);
    });
    grid.appendChild(card);
  });
  return grid;
}
function cycleRank(g,id){
  if(groupsLocked()) return;
  const m = state.rank[g] = state.rank[g]||{};
  if(m[id]){
    const was=m[id]; delete m[id];
    if(was===3){ const i=state.thirds.indexOf(id); if(i>=0) state.thirds.splice(i,1); }
  } else {
    const used=Object.values(m);
    const free=[1,2,3].find(r=>!used.includes(r));
    if(!free) return;
    m[id]=free;
  }
  save(); notifyIfComplete('grupos'); renderStepper(); renderStage('grupos');
}
function renderThirds(){
  const locked=groupsLocked();
  const box=document.createElement('div'); box.className='thirds';
  const pool=[];
  GLETTERS.forEach(g=>{ const id=rankTeam(g,3); if(id!=null) pool.push(id); });
  const n=state.thirds.length;
  box.innerHTML=`<div class="thirds__head"><h3>Mejores terceros</h3>
    <span class="counter${n===8?' full':''}">${n} / 8</span></div>
    <p class="hint">De los terceros que marcaste en cada grupo, elegí los 8 que también clasifican.</p>`;
  if(!pool.length){
    const e=document.createElement('p'); e.className='thirds__empty';
    e.textContent='Marcá un tercero (3.er toque) en los grupos para habilitar esta selección.';
    box.appendChild(e); return box;
  }
  const grid=document.createElement('div'); grid.className='thirds__grid';
  pool.forEach(id=>{
    const t=team(id); const sel=state.thirds.includes(id);
    const full = state.thirds.length>=8 && !sel;
    const chip=document.createElement('div');
    chip.className='third'+(sel?' sel':'')+(full?' disabled':'')+(locked?' ro':'');
    chip.innerHTML=`${flagTag(t)}<span>${t.name}</span>`;
    if(!locked) chip.onclick=()=>{
      const i=state.thirds.indexOf(id);
      if(i>=0) state.thirds.splice(i,1);
      else { if(state.thirds.length>=8) return; state.thirds.push(id); }
      save(); notifyIfComplete('grupos'); renderStepper(); renderStage('grupos');
    };
    grid.appendChild(chip);
  });
  box.appendChild(grid);
  return box;
}

/* ---- rondas de bracket ---- */
function renderRound(stageId){
  const cont=document.createElement('div');
  const grid=document.createElement('div'); grid.className='round';
  STAGE_MATCHES[stageId].forEach(num=> grid.appendChild(matchCard(num)));
  cont.appendChild(grid);
  if(stageId==='final') cont.appendChild(championBanner());
  return cont;
}

function matchCard(num){
  const def=MATCHES[num]; const key=String(num);
  const aI=slotInfo(def.a), bI=slotInfo(def.b);
  const res=resultOf(num);
  const locked=matchLocked(num);
  const card=document.createElement('div'); card.className='match'+(locked?' locked':''); card.dataset.key=key;
  card.innerHTML=`<div class="match__head"><span>${matchLabel(num)}</span><span class="mdate">${fmtFecha(def.d)}</span></div>`;
  card.appendChild(advRow(key,'a',aI,res.win,num,locked));
  card.appendChild(advRow(key,'b',bI,res.win,num,locked));
  card.appendChild(matchFoot(key,num,aI,bI,locked));
  return card;
}
function advRow(key,slot,info,winId,num,locked){
  const row=document.createElement('div');
  const known=info.id!=null;
  const isWin = known && winId===info.id;
  const clickable = known && !locked;
  row.className='mteam'+(clickable?' pick':'')+(known?'':' tbd-row')+(isWin?' win':'');
  row.dataset.slot=slot;
  if(known){
    const t=team(info.id);
    row.innerHTML=`<span class="mname">${flagTag(t)} ${t.name}</span>
      <span class="advflag">${isWin?'✓ avanza':'avanza'}</span>`;
    if(clickable) row.onclick=()=>chooseAdv(key,slot,num);
  } else {
    row.innerHTML=`<span class="mname tbd">${info.label}</span>`;
  }
  return row;
}
function matchFoot(key,num,aI,bI,locked){
  const foot=document.createElement('div'); foot.className='match__foot';
  if(locked){
    let why='🔒 Cerrado · ya se jugó o está en juego';
    if(!state.groupsSubmitted) why='🔒 Enviá tu fase de grupos para habilitar';
    else if(state.nostradamus.sent) why='🔒 Sellado en Nostradamus';
    foot.innerHTML=`<span class="foot-hint">${why}</span>`; return foot;
  }
  if(aI.id==null||bI.id==null){
    foot.innerHTML=`<span class="foot-hint">${MATCHES[num].e==='r32'?'Completá la fase de grupos':'Se define con la ronda anterior'}</span>`;
    return foot; }
  const adv=state.adv[num]; const sc=state.scores[num];
  if(!adv){ foot.innerHTML=`<span class="foot-hint">👆 Tocá quién avanza</span>`; return foot; }
  const hasScore = sc && sc.a!=null && sc.b!=null;
  const btn=document.createElement('button');
  btn.className='scorebtn'+(hasScore?' set':'');
  if(hasScore){
    const tbtxt = (sc.a===sc.b) ? (sc.tb==='penales'?' · pen' : ' · alargue') : '';
    btn.innerHTML = `✅ ${sc.a}–${sc.b}${tbtxt} <small>editar</small>`;
  } else {
    btn.innerHTML = `🎯 Cargar resultado <small>90' + definición</small>`;
  }
  btn.onclick=()=>openScoreModal(key,num);
  foot.appendChild(btn);
  return foot;
}
function chooseAdv(key,slot,num){
  const prev=state.adv[num];
  state.adv[num]=slot;
  if(prev && prev!==slot) delete state.scores[num];   // marcador viejo pudo quedar contradictorio
  save();
  refreshCard(key,num); renderStepper();
  const st = MATCHES[num].e==='tercer'?'final':MATCHES[num].e;
  notifyIfComplete(st);
  if(num===104) confetti();                 // ¡elegiste campeón!
  // auto-scroll a la próxima llave sin elegir (misma ronda)
  const list=STAGE_MATCHES[st], idx=list.indexOf(num);
  const nx=list.slice(idx+1).find(n=>!state.adv[n]
    && slotInfo(MATCHES[n].a).id!=null && slotInfo(MATCHES[n].b).id!=null && !matchLocked(n));
  if(nx){ const elc=document.querySelector(`.match[data-key="${nx}"]`); if(elc) elc.scrollIntoView({behavior:'smooth',block:'center'}); }
  // (el modal de marcador NO se abre solo: lo abre el usuario con el botón 🎯)
}
function refreshCard(key,num){
  const old=document.querySelector(`.match[data-key="${key}"]`);
  if(old) old.replaceWith(matchCard(num));
}

/* ---- modal de resultado (90' + definición por alargue/penales) ---- */
function closeModal(){ const m=document.getElementById('modal'); if(m){m.hidden=true; m.classList.remove('wide'); document.getElementById('modal-body').innerHTML='';} }
function openScoreModal(key,num){
  const def=MATCHES[num];
  const aI=slotInfo(def.a), bI=slotInfo(def.b);
  if(aI.id==null||bI.id==null) return;
  const A=team(aI.id), B=team(bI.id);
  const adv=state.adv[num]; if(!adv) return;
  const advTeam = adv==='a'?A:B;
  const sc=state.scores[num]||{};
  const hasScore = sc.a!=null && sc.b!=null;
  let tb = sc.tb||null;                       // método elegido ('alargue'|'penales'), solo si empate a 90'
  const body=document.getElementById('modal-body');
  body.innerHTML=`
    <h3 class="modal__h">🎯 Resultado del partido</h3>
    <p class="modal__p">Cargá el marcador a los <b>90 minutos</b>. Avanza <b>${advTeam.name}</b>; si hay empate a los 90', definís cómo pasa.</p>
    <div class="modal__match">
      <div class="ms-row${adv==='a'?' adv':''}"><span class="mname">${flagTag(A)} ${A.name}</span>
        <input class="score" type="number" min="0" max="99" inputmode="numeric" id="ms-a" value="${sc.a!=null?sc.a:''}"></div>
      <div class="ms-row${adv==='b'?' adv':''}"><span class="mname">${flagTag(B)} ${B.name}</span>
        <input class="score" type="number" min="0" max="99" inputmode="numeric" id="ms-b" value="${sc.b!=null?sc.b:''}"></div>
    </div>
    <div class="tb-block" id="tb-block" hidden>
      <p class="tb-q">Empate a los 90' — <b>${advTeam.name}</b> avanza por:</p>
      <div class="tb-opts">
        <button type="button" class="tb-opt" data-tb="alargue">⏱ Alargue <small>(30')</small></button>
        <button type="button" class="tb-opt" data-tb="penales">🥅 Penales</button>
      </div>
    </div>
    <p class="modal__note">📌 Acertar el marcador a 90' suma puntos extra; acertar la definición (alargue/penales) da un bonus.</p>
    <p class="modal__warn" id="ms-warn" hidden></p>
    <div class="modal__actions">
      ${sc.a!=null
        ? '<button class="btn btn--sm" id="ms-clear" style="background:#9aa2a6">Quitar</button>'
        : '<button class="btn btn--sm" id="ms-skip" style="background:#aab">Más tarde</button>'}
      <button class="btn btn--sm" id="ms-save">Guardar</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  const warn=body.querySelector('#ms-warn');
  const tbBlock=body.querySelector('#tb-block');
  const inA=body.querySelector('#ms-a'), inB=body.querySelector('#ms-b');
  function refreshTB(){
    const a=parseInt(inA.value,10), b=parseInt(inB.value,10);
    const tie = !isNaN(a)&&!isNaN(b)&&a===b;
    tbBlock.hidden=!tie;
    if(!tie) tb=null;
    body.querySelectorAll('.tb-opt').forEach(btn=> btn.classList.toggle('sel', btn.dataset.tb===tb));
  }
  inA.addEventListener('input',refreshTB);
  inB.addEventListener('input',refreshTB);
  body.querySelectorAll('.tb-opt').forEach(btn=> btn.onclick=()=>{ tb=btn.dataset.tb; refreshTB(); });
  refreshTB();
  const skip=body.querySelector('#ms-skip'); if(skip) skip.onclick=closeModal;
  const clr=body.querySelector('#ms-clear'); if(clr) clr.onclick=()=>{ delete state.scores[num]; save(); refreshCard(key,num); renderStepper(); closeModal(); };
  body.querySelector('#ms-save').onclick=()=>{
    const a=parseInt(inA.value,10), b=parseInt(inB.value,10);
    if(isNaN(a)||isNaN(b)){ warn.textContent='Completá ambos marcadores o tocá “Más tarde”.'; warn.hidden=false; return; }
    const advG=adv==='a'?a:b, rivG=adv==='a'?b:a;
    if(rivG>advG){ warn.textContent=`${advTeam.name} avanza: su marcador no puede ser menor al del rival (un empate se define en alargue o penales).`; warn.hidden=false; return; }
    if(a===b && !tb){ warn.textContent="Empate a los 90': elegí si avanza por alargue o por penales."; warn.hidden=false; return; }
    state.scores[num]={a:Math.max(0,Math.min(99,a)), b:Math.max(0,Math.min(99,b)), tb:(a===b?tb:null)};
    save(); refreshCard(key,num); renderStepper(); closeModal();
  };
}

function championBanner(){
  const champ=getWinner(104);
  const b=document.createElement('div'); b.className='champion-banner';
  b.innerHTML=`<div class="cb__k">Tu campeón</div>
    <div class="cb__team">${champ!=null?flagTag(team(champ))+' '+team(champ).name:'🏆 Por definir'}</div>`;
  if(champ!=null){
    const sh=document.createElement('button'); sh.className='cb__share';
    sh.innerHTML='📲 Compartir mi campeón'; sh.onclick=shareImage;
    b.appendChild(sh);
  }
  return b;
}

/* navegación inferior */
function stageNav(id){
  const order=STAGES.map(s=>s.id);
  const i=order.indexOf(id);
  const nav=document.createElement('div'); nav.className='stage__nav';
  const prev=STAGES[i-1], next=STAGES[i+1];
  nav.innerHTML = (prev?`<button class="btn" data-go="${prev.id}">← ${prev.short}</button>`:'<span class="spacer"></span>')
    + '<span class="spacer"></span>'
    + (next?`<button class="btn" data-go="${next.id}">${next.short} →</button>`:'');
  nav.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{
    const fwd = order.indexOf(b.dataset.go) > i;
    if(fwd && !isDone(id)) toast(`Te faltan datos en ${STAGES[i].title} — podés completarlos luego`,'warn');
    goto(b.dataset.go);
  });
  return nav;
}

/* ---- modal de confirmación genérico ---- */
function openConfirmModal({title, body, ok, onOk}){
  const mb=document.getElementById('modal-body');
  mb.innerHTML=`<h3 class="modal__h">${title}</h3><p class="modal__p">${body}</p>
    <div class="modal__actions">
      <button class="btn btn--sm" id="cf-no" style="background:#9aa2a6">Cancelar</button>
      <button class="btn btn--sm" id="cf-yes">${ok}</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  mb.querySelector('#cf-no').onclick=closeModal;
  mb.querySelector('#cf-yes').onclick=()=>{ closeModal(); onOk(); };
}

/* ---- ETAPA 1: barra de envío de la fase de grupos ---- */
/* ---- pronóstico base (desempate por goles + campeón de referencia) ---- */
const baseDone = () => state.golesGrupos!=='' && state.golesGrupos!=null
  && !isNaN(parseInt(state.golesGrupos,10)) && state.campeonRef!=null;
function basePronostico(){
  const locked=groupsLocked();
  const wrap=document.createElement('div'); wrap.className='base-pron';
  wrap.innerHTML=`
    <h3 class="base-pron__title">Para cerrar tu fase de grupos</h3>
    <p class="base-pron__lead">Dos datos del Ranking General Stanley: el desempate y tu campeón de referencia.</p>
    <div class="base-pron__grid">
      <label class="base-field">
        <span>⚽ Total de goles de la fase de grupos <small>(desempate)</small></span>
        <input id="base-goles" type="number" min="0" max="400" inputmode="numeric" value="${state.golesGrupos}" placeholder="Ej. 140" ${locked?'disabled':''}>
      </label>
      <label class="base-field">
        <span>🏆 Campeón de referencia</span>
        <select id="base-champ" ${locked?'disabled':''}>
          <option value="">Elegí una selección…</option>
          ${TEAMS.map(t=>`<option value="${t.id}"${state.campeonRef===t.id?' selected':''}>${t.name}</option>`).join('')}
        </select>
      </label>
    </div>`;
  if(!locked){
    wrap.querySelector('#base-goles').addEventListener('change',e=>{
      state.golesGrupos=e.target.value; save(); renderStepper(); renderStage('grupos'); });
    wrap.querySelector('#base-champ').addEventListener('change',e=>{
      state.campeonRef=e.target.value===''?null:Number(e.target.value); save(); renderStepper(); renderStage('grupos'); });
  }
  return wrap;
}

function groupsSubmitBar(){
  const wrap=document.createElement('div'); wrap.className='submit-bar';
  if(state.groupsSubmitted){
    const done=document.createElement('div'); done.className='submit-bar__done';
    done.innerHTML='🔒 <b>Fase de grupos enviada.</b> Tus clasificados quedaron registrados para la Etapa 1.';
    wrap.appendChild(done);
    wrap.appendChild(communityEl());
    if(!state.nostradamus.sent){
      const b=document.createElement('button'); b.className='btn btn--lg'; b.textContent='🔮 Jugar Nostradamus';
      b.onclick=openNostradamusModal; wrap.appendChild(b);
    } else {
      const tag=document.createElement('div'); tag.className='submit-bar__done';
      tag.innerHTML='🔮 <b>Nostradamus enviado.</b> Tu cuadro completo quedó sellado.';
      const b=document.createElement('button'); b.className='btn'; b.style.background='var(--green)';
      b.textContent='Ver mi Nostradamus'; b.onclick=()=>goto('nostra');
      wrap.appendChild(tag); wrap.appendChild(b);
    }
    return wrap;
  }
  const gd=groupsDone(), ready=gd && baseDone();
  const b=document.createElement('button'); b.className='btn btn--lg'; b.disabled=!ready;
  b.textContent = ready ? '✅ Enviar fase de grupos'
    : (gd ? 'Completá goles de desempate y campeón' : 'Completá 12 grupos y 8 terceros para enviar');
  b.onclick=submitGroups;
  wrap.appendChild(b);
  if(!ready){
    const hint=document.createElement('p'); hint.className='submit-bar__hint';
    hint.textContent='Al enviar se cierra tu participación en la Etapa 1: no podrás cambiar tus clasificados.';
    wrap.appendChild(hint);
  }
  return wrap;
}
function submitGroups(){
  if(!groupsDone() || !baseDone() || state.groupsSubmitted) return;
  openConfirmModal({
    title:'¿Enviar tu fase de grupos?',
    body:'Una vez enviada <b>no podrás modificar</b> tus clasificados. Con esto cerrás tu participación en la Etapa 1 (primera entrega de premios).',
    ok:'Sí, enviar',
    onOk:()=>{
      state.groupsSubmitted=true; save(); cloudSave();
      renderStepper(); renderStage('grupos'); confetti();
      setTimeout(openGroupsDoneModal, 700);
    }
  });
}

/* ---- comunidad WhatsApp (link real va en config.js → WHATSAPP_INVITE_URL) ---- */
const waInviteURL = () => (window.STANLEY||{}).WHATSAPP_INVITE_URL || '';
const hasCommunity = () => /chat\.whatsapp\.com\/.+/.test(waInviteURL());
function communityEl(){
  if(hasCommunity()){
    const a=document.createElement('a'); a.className='btn'; a.style.background='var(--green)';
    a.href=waInviteURL(); a.target='_blank'; a.rel='noopener'; a.textContent='💬 Unirme a la comunidad';
    return a;
  }
  const note=document.createElement('p'); note.className='submit-bar__hint';
  note.textContent='💬 La comunidad de WhatsApp se habilita muy pronto — ahí van rankings y avisos de cada etapa.';
  return note;
}

/* ---- al cerrar la fase de grupos: comunidad + Nostradamus ---- */
function openGroupsDoneModal(){
  const body=document.getElementById('modal-body');
  const url=waInviteURL(), wa=hasCommunity();
  const waBtn = wa
    ? `<a class="btn btn--sm" id="gd-wa" href="${url}" target="_blank" rel="noopener" style="background:var(--green)">💬 Unirme a la comunidad</a>`
    : '';
  const waNote = wa ? '' : `<p class="modal__note">💬 La comunidad de WhatsApp se habilita muy pronto: ahí te llegan los rankings y los avisos de cada etapa.</p>`;
  body.innerHTML=`
    <h3 class="modal__h">✅ ¡Participación registrada!</h3>
    <p class="modal__p">Cerraste tu <b>fase de grupos</b>: ya estás dentro de la Etapa 1. Te quedan dos cosas:</p>
    <ul class="nostra-list">
      <li>💬 <b>Comunidad WhatsApp</b> — rankings, recordatorios y avisos de cada etapa.</li>
      <li>🔮 <b>Nostradamus</b> — predecí TODO el cuadro de una vez y competí por un kit Stanley.</li>
    </ul>
    ${waNote}
    <div class="modal__actions modal__actions--stack">
      ${waBtn}
      <button class="btn btn--sm" id="gd-nostra">🔮 Jugar Nostradamus</button>
      <button class="btn btn--sm" id="gd-later" style="background:#9aa2a6">Ahora no</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  body.querySelector('#gd-later').onclick=closeModal;
  body.querySelector('#gd-nostra').onclick=()=>{ closeModal(); goto('nostra'); };
}

/* ---- popup Nostradamus ---- */
function openNostradamusModal(){
  const body=document.getElementById('modal-body');
  body.innerHTML=`
    <h3 class="modal__h">🔮 Modo Nostradamus</h3>
    <p class="modal__p">¿Te animás a predecir <b>todo el cuadro</b> —de 16avos a la final— ahora mismo, en base a tus clasificados?</p>
    <ul class="nostra-list">
      <li>🎯 Sellás tu bracket completo de una sola vez.</li>
      <li>🏆 El que más se acerque gana un <b>kit Stanley</b> especial.</li>
      <li>⚠️ Es un compromiso: <b>no podrás editarlo</b> después.</li>
      <li>➕ Igual seguís sumando puntos ronda por ronda en el ranking general.</li>
    </ul>
    <div class="modal__actions">
      <button class="btn btn--sm" id="nostra-later" style="background:#9aa2a6">Ahora no</button>
      <button class="btn btn--sm" id="nostra-go">Jugar Nostradamus</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  body.querySelector('#nostra-later').onclick=closeModal;
  body.querySelector('#nostra-go').onclick=()=>{ closeModal(); goto('nostra'); };
}

/* ---- vista Nostradamus: todo el cuadro de una vez ---- */
function renderNostra(){
  stagesEl.innerHTML='';
  const sent=state.nostradamus.sent;
  const wrap=document.createElement('section'); wrap.className='stage active';
  wrap.innerHTML=`<div class="stage__head">
      <span class="stage__kicker">Modo Nostradamus</span>
      <h2>🔮 Tu cuadro completo</h2>
      <p>${sent
        ? 'Tu bracket quedó sellado. Competís por el kit Stanley con la predicción más certera; seguís sumando puntos ronda por ronda.'
        : 'Predecí de 16avos a la final con tus clasificados. Al confirmar, queda sellado y entrás a la competencia por el kit Stanley.'}</p></div>`;
  KO_STAGES.forEach(sid=>{
    const s=STAGES.find(x=>x.id===sid);
    const h=document.createElement('h3'); h.className='nostra-round-title'; h.textContent=s.title;
    wrap.appendChild(h);
    wrap.appendChild(renderRound(sid));
  });
  const bar=document.createElement('div'); bar.className='submit-bar';
  if(sent){
    const d=document.createElement('div'); d.className='submit-bar__done';
    d.innerHTML='🔒 <b>Nostradamus sellado.</b> ¡Mucha suerte!';
    bar.appendChild(d);
  } else {
    const full=nostraComplete();
    const b=document.createElement('button'); b.className='btn btn--lg'; b.disabled=!full;
    b.textContent = full ? '🔮 Enviar mis pronósticos' : 'Elegí quién avanza en todas las llaves';
    b.onclick=confirmNostra;
    bar.appendChild(b);
    const hint=document.createElement('p'); hint.className='submit-bar__hint';
    hint.textContent='Elegí quién avanza en cada llave (obligatorio). El marcador a 90\' y la definición son opcionales pero suman para acercarte más.';
    bar.appendChild(hint);
  }
  const back=document.createElement('button'); back.className='btn'; back.style.background='#9aa2a6';
  back.textContent='← Volver a grupos'; back.onclick=()=>goto('grupos');
  bar.appendChild(back);
  wrap.appendChild(bar);
  stagesEl.appendChild(wrap);
}
function confirmNostra(){
  if(!nostraComplete() || state.nostradamus.sent) return;
  openConfirmModal({
    title:'¿Sellar tu Nostradamus?',
    body:'Tu cuadro completo quedará <b>bloqueado</b>: no podrás editarlo. Competís por el kit Stanley con la predicción más certera.',
    ok:'Sí, sellar',
    onOk:()=>{
      state.nostradamus={sent:true, at:new Date().toISOString()};
      save(); cloudSave();
      renderStepper(); renderNostra(); confetti();
      toast('🔮 ¡Nostradamus sellado! Mucha suerte','ok');
    }
  });
}

/* ---- eventos globales + init ---- */
document.getElementById('modal-x').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

document.getElementById('design-mode').addEventListener('change', e=>{
  state.design=e.target.checked; save();
  renderStepper(); renderStage(state.active);
});

document.getElementById('btn-resumen').addEventListener('click', openResumen);
document.getElementById('btn-share').addEventListener('click', shareImage);

(function init(){
  const p=getPlayer(); const nameEl=document.getElementById('player-name');
  if(p){ nameEl.textContent='Hola, '+p.nombre+' · tus pronósticos se guardan'+(APPS_URL?' en la nube':' (local)'); setCloud(APPS_URL?'ok':'local'); }
  else { nameEl.innerHTML='Modo invitado — <a href="index.html" style="color:var(--tan);font-weight:700">inscribite</a> para guardar tus pronósticos'; setCloud('local'); }
  document.getElementById('design-mode').checked=!!state.design;
  STAGES.forEach(s=>_doneFlag[s.id]=isDone(s.id));   // evita festejar al cargar
  _allDoneShown = progressStats().pct===100;
  // antes de enviar grupos, la única etapa jugable es 'grupos' (salvo modo diseño)
  if(!state.groupsSubmitted && !state.design && state.active!=='grupos') state.active='grupos';
  renderStepper();
  renderStage(state.active);
  tickNext(); setInterval(tickNext,1000);
})();
