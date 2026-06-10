/* =========================================================
   QUINIELA STANLEY — motor de pronósticos por etapas
   Bracket real Mundial 2026 (partidos 73–104) con fechas reales.
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
   lead:'Del 28 jun al 3 jul · 16 partidos. Elegí quién avanza en cada llave; sumá puntos extra adivinando el marcador.'},
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

/* ---- estado ---- */
const KEY = 'stanley_quiniela_v2';
const DEFAULT = {rank:{}, thirds:[], scores:{}, adv:{}, design:false, active:'grupos'};
let state = load();
function load(){ try{ return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY))||{}); }catch(e){ return Object.assign({},DEFAULT); } }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

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
  if(up) html+=`<span class="chip-prog">⏱ Cierra P${up.n} ${relTime(MATCHES[up.n].d)}</span>`;
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
  el.innerHTML=`⏱ <b>P${up.n}</b> ${d>0?d+'d ':''}${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* ---- resumen "Mi quiniela" (modal) ---- */
function openResumen(){
  const body=document.getElementById('modal-body');
  const nm=id=> id!=null ? flagTag(team(id))+team(id).name : '—';
  let grp='';
  GLETTERS.forEach(g=>{ grp+=`<div class="res-row"><b>${g}</b> · 1.º ${nm(rankTeam(g,1))} · 2.º ${nm(rankTeam(g,2))}</div>`; });
  const champ=getWinner(104), fin=resultOf(104), third=getWinner(103);
  const finalists=[fin.A,fin.B].some(x=>x!=null)?`${nm(fin.A)} <b>vs</b> ${nm(fin.B)}`:'Por definir';
  const st=progressStats();
  body.innerHTML=`<h3 class="modal__h">📋 Mi quiniela</h3>
    <p class="modal__p">Avance: <b>${st.pct}%</b> (${st.done}/${st.total})</p>
    <div class="res-block"><h4>🏆 Campeón</h4><p>${nm(champ)}</p></div>
    <div class="res-block"><h4>Final</h4><p>${finalists}</p></div>
    <div class="res-block"><h4>3.er puesto</h4><p>${nm(third)}</p></div>
    <div class="res-block"><h4>Clasificados de grupos</h4>${grp}</div>
    <div class="modal__actions">
      <button class="btn btn--sm" id="res-share">📲 Compartir</button>
      <button class="btn btn--sm" id="res-close" style="background:#9aa2a6">Cerrar</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  body.querySelector('#res-close').onclick=closeModal;
  body.querySelector('#res-share').onclick=share;
}

/* ---- compartir ---- */
function share(){
  const champ=getWinner(104);
  const txt = champ!=null
    ? `Mi campeón en la quiniela Stanley es ${team(champ).name} 🏆 ¿Te animás a pronosticar?`
    : `Armé mi quiniela en Pronosticá con Stanley 🏆 ¿Te animás?`;
  const url='https://centro-de-estudios-populi.github.io/pronostica-con-stanley/';
  if(navigator.share){ navigator.share({title:'Pronosticá con Stanley',text:txt,url}).catch(()=>{}); }
  else { window.open('https://wa.me/?text='+encodeURIComponent(txt+' '+url),'_blank'); }
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
    case 'WIN':  return {id:getWinner(slot.m), label:'Ganador '+slot.m};
    case 'LOSE': return {id:getLoser(slot.m),  label:'Perdedor '+slot.m};
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

/* ¿el partido ya está cerrado? (pasó su hora de inicio) — modo diseño lo ignora */
const matchLocked = num => !state.design && Date.now() >= new Date(MATCHES[num].d).getTime();

/* ---- completitud ---- */
function groupsDone(){
  const allGroups = GLETTERS.every(g=> rankTeam(g,1)!=null && rankTeam(g,2)!=null);
  return allGroups && state.thirds.length===8;
}
function roundDone(stageId){
  return STAGE_MATCHES[stageId].every(num=> getWinner(num)!=null);
}
const isDone = id => id==='grupos' ? groupsDone() : roundDone(id);

/* =========================================================
   RENDER
   ========================================================= */
const stepperEl = document.getElementById('stepper');
const stagesEl  = document.getElementById('stages');

function renderStepper(){
  stepperEl.innerHTML='';
  STAGES.forEach(s=>{
    const b = document.createElement('button');
    b.className='step-btn'+(s.id===state.active?' active':'')+(isDone(s.id)?' done':'');
    b.innerHTML = `<span class="sb__n">${isDone(s.id)?'✓':s.n}</span>${s.short}`;
    b.onclick=()=>goto(s.id);
    stepperEl.appendChild(b);
  });
  updateProgress();
}
function goto(id){ state.active=id; save(); renderStepper(); renderStage(id); window.scrollTo({top:0,behavior:'smooth'}); }

function renderStage(id){
  const s = STAGES.find(x=>x.id===id);
  stagesEl.innerHTML='';
  const wrap = document.createElement('section');
  wrap.className='stage active';
  wrap.innerHTML = `<div class="stage__head">
      <span class="stage__kicker">${s.etapa}</span>
      <h2>${s.title}</h2><p>${s.lead}</p>
      <div class="stage__meta">${stageMeta(id)}</div></div>`;
  if(id==='grupos'){ wrap.appendChild(renderGroups()); wrap.appendChild(renderThirds()); }
  else { wrap.appendChild(renderRound(id)); }
  wrap.appendChild(stageNav(id));
  stagesEl.appendChild(wrap);
}

/* ---- fase de grupos ---- */
function renderGroups(){
  const grid=document.createElement('div'); grid.className='groups';
  GLETTERS.forEach(g=>{
    const card=document.createElement('div'); card.className='group';
    card.innerHTML=`<div class="group__head"><h4>Grupo ${g}</h4><span class="group__hint">1.º · 2.º clasifican · 3.º repechaje</span></div>`;
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
      row.className='grow'+rankCls+(out?' out':'');
      row.innerHTML=`${flagTag(t)}<span class="gname">${t.name}</span>
        <span class="grow__rank">${badge}</span>`;
      row.onclick=()=>cycleRank(g,id);
      card.appendChild(row);
    });
    grid.appendChild(card);
  });
  return grid;
}
function cycleRank(g,id){
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
    chip.className='third'+(sel?' sel':'')+(full?' disabled':'');
    chip.innerHTML=`${flagTag(t)}<span>${t.name}</span>`;
    chip.onclick=()=>{
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
  card.innerHTML=`<div class="match__head"><span>${def.lbl?def.lbl:'Partido '+num}</span><span class="mdate">${fmtFecha(def.d)}</span></div>`;
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
  if(locked){ foot.innerHTML=`<span class="foot-hint">🔒 Cerrado · ya se jugó o está en juego</span>`; return foot; }
  if(aI.id==null||bI.id==null){
    foot.innerHTML=`<span class="foot-hint">${MATCHES[num].e==='r32'?'Completá la fase de grupos':'Se define con la ronda anterior'}</span>`;
    return foot; }
  const adv=state.adv[num]; const sc=state.scores[num];
  if(!adv){ foot.innerHTML=`<span class="foot-hint">👆 Tocá quién avanza</span>`; return foot; }
  const hasScore = sc && sc.a!=null && sc.b!=null;
  const btn=document.createElement('button');
  btn.className='scorebtn'+(hasScore?' set':'');
  btn.innerHTML = hasScore ? `🎯 Marcador ${sc.a}–${sc.b} <small>editar</small>`
                           : `🎯 Adivinar marcador <small>+ puntos extra</small>`;
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

/* ---- modal de marcador (puntos extra) ---- */
function closeModal(){ const m=document.getElementById('modal'); if(m){m.hidden=true; document.getElementById('modal-body').innerHTML='';} }
function openScoreModal(key,num){
  const def=MATCHES[num];
  const aI=slotInfo(def.a), bI=slotInfo(def.b);
  if(aI.id==null||bI.id==null) return;
  const A=team(aI.id), B=team(bI.id);
  const adv=state.adv[num]; if(!adv) return;
  const advTeam = adv==='a'?A:B;
  const sc=state.scores[num]||{};
  const hasScore = sc.a!=null && sc.b!=null;
  const body=document.getElementById('modal-body');
  body.innerHTML=`
    <h3 class="modal__h">🎯 Puntos extra</h3>
    <p class="modal__p">${hasScore?'Editá tu marcador para los puntos extra.':'<b>Opcional:</b> adiviná el marcador exacto y sumá puntos extra. Avanza '+advTeam.name+'.'}</p>
    <div class="modal__match">
      <div class="ms-row${adv==='a'?' adv':''}"><span class="mname">${flagTag(A)} ${A.name}</span>
        <input class="score" type="number" min="0" max="99" inputmode="numeric" id="ms-a" value="${sc.a!=null?sc.a:''}"></div>
      <div class="ms-row${adv==='b'?' adv':''}"><span class="mname">${flagTag(B)} ${B.name}</span>
        <input class="score" type="number" min="0" max="99" inputmode="numeric" id="ms-b" value="${sc.b!=null?sc.b:''}"></div>
    </div>
    <p class="modal__note">📌 Si empatan, <b>${advTeam.name}</b> avanza por penales (según tu decisión).</p>
    <p class="modal__warn" id="ms-warn" hidden></p>
    <div class="modal__actions">
      ${sc.a!=null
        ? '<button class="btn btn--sm" id="ms-clear" style="background:#9aa2a6">Quitar marcador</button>'
        : '<button class="btn btn--sm" id="ms-skip" style="background:#aab">Más tarde</button>'}
      <button class="btn btn--sm" id="ms-save">Guardar</button>
    </div>`;
  document.getElementById('modal').hidden=false;
  const warn=body.querySelector('#ms-warn');
  const skip=body.querySelector('#ms-skip'); if(skip) skip.onclick=closeModal;
  const clr=body.querySelector('#ms-clear'); if(clr) clr.onclick=()=>{ delete state.scores[num]; save(); refreshCard(key,num); renderStepper(); closeModal(); };
  body.querySelector('#ms-save').onclick=()=>{
    const a=parseInt(body.querySelector('#ms-a').value,10);
    const b=parseInt(body.querySelector('#ms-b').value,10);
    if(isNaN(a)||isNaN(b)){ warn.textContent='Completá ambos marcadores o tocá “Más tarde”.'; warn.hidden=false; return; }
    const advG=adv==='a'?a:b, rivG=adv==='a'?b:a;
    if(rivG>advG){ warn.textContent=`El que no avanza no puede ganar: ${advTeam.name} debe ir igual o arriba (un empate se va a penales).`; warn.hidden=false; return; }
    state.scores[num]={a:Math.max(0,Math.min(99,a)), b:Math.max(0,Math.min(99,b))};
    save(); refreshCard(key,num); renderStepper(); closeModal();
  };
}

function championBanner(){
  const champ=getWinner(104);
  const b=document.createElement('div'); b.className='champion-banner';
  b.innerHTML=`<div class="cb__k">Tu campeón</div>
    <div class="cb__team">${champ!=null?flagTag(team(champ))+' '+team(champ).name:'🏆 Por definir'}</div>`;
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

/* ---- eventos globales + init ---- */
document.getElementById('modal-x').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

document.getElementById('design-mode').addEventListener('change', e=>{
  state.design=e.target.checked; save();
  renderStepper(); renderStage(state.active);
});

document.getElementById('btn-resumen').addEventListener('click', openResumen);
document.getElementById('btn-share').addEventListener('click', share);

(function init(){
  document.getElementById('design-mode').checked=!!state.design;
  STAGES.forEach(s=>_doneFlag[s.id]=isDone(s.id));   // evita festejar al cargar
  _allDoneShown = progressStats().pct===100;
  renderStepper();
  renderStage(state.active);
  tickNext(); setInterval(tickNext,1000);
})();
