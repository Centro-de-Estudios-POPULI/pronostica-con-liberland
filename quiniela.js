/* =========================================================
   QUINIELA STANLEY — motor de pronósticos por etapas (diseño v1)
   Sin backend: el estado se guarda en localStorage.
   Luego se enchufa login / Google Sheets y el cálculo de puntos.
   ========================================================= */

/* ---- banderas por imagen (flagcdn) — los emojis no renderizan en Windows ---- */
const flagURL = iso => `https://flagcdn.com/h40/${iso}.png`;
const flagTag = t => `<img class="flagimg" src="${flagURL(t.iso)}" alt="${t.name}" loading="lazy" />`;

/* ---- 48 selecciones (genéricas, editar al conocerse el sorteo) — [nombre, ISO] ---- */
const TEAMS = [
  ["Argentina","ar"],["Brasil","br"],["Uruguay","uy"],["Colombia","co"],
  ["Chile","cl"],["Perú","pe"],["Ecuador","ec"],["Paraguay","py"],
  ["Bolivia","bo"],["Venezuela","ve"],["Francia","fr"],["Alemania","de"],
  ["España","es"],["Italia","it"],["Portugal","pt"],["Países Bajos","nl"],
  ["Bélgica","be"],["Inglaterra","gb-eng"],["Croacia","hr"],["Dinamarca","dk"],
  ["Suiza","ch"],["Serbia","rs"],["Polonia","pl"],["Austria","at"],
  ["Suecia","se"],["Noruega","no"],["Turquía","tr"],["Ucrania","ua"],
  ["Estados Unidos","us"],["México","mx"],["Canadá","ca"],["Costa Rica","cr"],
  ["Japón","jp"],["Corea del Sur","kr"],["Arabia Saudita","sa"],["Irán","ir"],
  ["Australia","au"],["Catar","qa"],["Marruecos","ma"],["Senegal","sn"],
  ["Nigeria","ng"],["Ghana","gh"],["Camerún","cm"],["Egipto","eg"],
  ["Argelia","dz"],["Costa de Marfil","ci"],["Túnez","tn"],["Sudáfrica","za"]
].map(([name,iso],id)=>({id,name,iso}));

/* ---- 12 grupos A–L de 4 ---- */
const GLETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const GROUPS = {};
GLETTERS.forEach((g,i)=>{ GROUPS[g] = [0,1,2,3].map(k=>i*4+k); });

/* ---- plantilla de dieciseisavos (16 partidos). Siembra provisional:
   se ajusta cuando se conozca el sorteo real. W=1.º, R=2.º, T=mejor 3.º ---- */
const R32_TEMPLATE = [
  [{t:'W',g:'A'},{t:'R',g:'B'}], [{t:'W',g:'C'},{t:'R',g:'D'}],
  [{t:'W',g:'E'},{t:'R',g:'F'}], [{t:'W',g:'G'},{t:'R',g:'H'}],
  [{t:'W',g:'I'},{t:'R',g:'J'}], [{t:'W',g:'K'},{t:'R',g:'L'}],
  [{t:'W',g:'B'},{t:'T',i:0}],   [{t:'W',g:'D'},{t:'T',i:1}],
  [{t:'W',g:'F'},{t:'T',i:2}],   [{t:'W',g:'H'},{t:'T',i:3}],
  [{t:'W',g:'J'},{t:'T',i:4}],   [{t:'W',g:'L'},{t:'T',i:5}],
  [{t:'R',g:'A'},{t:'T',i:6}],   [{t:'R',g:'C'},{t:'T',i:7}],
  [{t:'R',g:'E'},{t:'R',g:'G'}], [{t:'R',g:'I'},{t:'R',g:'K'}]
];

/* ---- etapas ---- */
const STAGES = [
  {id:'grupos', n:1, etapa:'Etapa 1', title:'Fase de grupos',  short:'Grupos',
   lead:'En cada grupo ordená 1.º, 2.º y 3.º (tocá cada equipo). Los dos primeros clasifican; después elegí los 8 mejores terceros.', locked:false},
  {id:'r32', n:2, etapa:'Etapa 2', title:'Dieciseisavos', short:'16avos', count:16, prev:null,
   lead:'Predecí el marcador de cada partido. El ganador avanza solo a octavos.', locked:false},
  {id:'r16', n:3, etapa:'Etapa 3', title:'Octavos de final', short:'Octavos', count:8, prev:'r32',
   lead:'Se habilita cuando se definan los dieciseisavos.', locked:true},
  {id:'qf',  n:4, etapa:'Etapa 4', title:'Cuartos de final', short:'Cuartos', count:4, prev:'r16',
   lead:'Se habilita cuando se definan los octavos.', locked:true},
  {id:'sf',  n:5, etapa:'Etapa 5', title:'Semifinales', short:'Semis', count:2, prev:'qf',
   lead:'Se habilita cuando se definan los cuartos.', locked:true},
  {id:'final', n:6, etapa:'Etapa 6', title:'La final', short:'Final', count:1, prev:'sf',
   lead:'Marcador de la final y del partido por el 3.er puesto.', locked:true}
];
const ROUND_ORDER = ['r32','r16','qf','sf','final'];

/* ---- estado ---- */
const KEY = 'stanley_quiniela_v1';
const DEFAULT = {rank:{}, thirds:[], scores:{}, pen:{}, design:false, active:'grupos'};
let state = load();
function load(){ try{ return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY))||{}); }catch(e){ return Object.assign({},DEFAULT); } }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

const team = id => (id==null?null:TEAMS[id]);

/* ---- resolución de equipos clasificados ---- */
function rankTeam(g, r){ // equipo con rank r en grupo g
  const m = state.rank[g]||{};
  const found = Object.keys(m).find(id=>m[id]===r);
  return found==null?null:Number(found);
}
function thirdsTeam(i){ return state.thirds[i]!=null ? state.thirds[i] : null; }

function matchDefs(round){
  if(round==='r32') return R32_TEMPLATE;
  const prev = STAGES.find(s=>s.id===round).prev;
  const cnt = STAGES.find(s=>s.id===round).count;
  return Array.from({length:cnt},(_,i)=>[
    {t:'WIN',round:prev,m:i*2},{t:'WIN',round:prev,m:i*2+1}]);
}

function slotInfo(slot){
  switch(slot.t){
    case 'W': return {id:rankTeam(slot.g,1), label:'1.º '+slot.g};
    case 'R': return {id:rankTeam(slot.g,2), label:'2.º '+slot.g};
    case 'T': return {id:thirdsTeam(slot.i), label:'Mejor 3.º'};
    case 'WIN': return {id:getWinner(slot.round,slot.m), label:'Por definir'};
    case 'LOSE': return {id:getLoser(slot.round,slot.m), label:'Por definir'};
  }
}
function resultOf(round,m){
  const key = round+'-'+m;
  const sc = state.scores[key];
  const defs = matchDefs(round)[m];
  const A = slotInfo(defs[0]).id, B = slotInfo(defs[1]).id;
  if(A==null||B==null||!sc||sc.a==null||sc.b==null) return {A,B,win:null,lose:null};
  let win,lose;
  if(sc.a>sc.b){win=A;lose=B;}
  else if(sc.b>sc.a){win=B;lose=A;}
  else { const p=state.pen[key]; if(!p) return {A,B,win:null,lose:null}; win=p==='a'?A:B; lose=p==='a'?B:A; }
  return {A,B,win,lose};
}
const getWinner = (round,m)=> resultOf(round,m).win;
const getLoser  = (round,m)=> resultOf(round,m).lose;

/* ---- completitud (para marcar etapas hechas) ---- */
function groupsDone(){
  const allGroups = GLETTERS.every(g=> rankTeam(g,1)!=null && rankTeam(g,2)!=null);
  return allGroups && state.thirds.length===8;
}
function roundDone(round){
  const cnt = STAGES.find(s=>s.id===round).count;
  for(let m=0;m<cnt;m++){ if(getWinner(round,m)==null) return false; }
  return true;
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
    const locked = s.locked && !state.design;
    const b = document.createElement('button');
    b.className='step-btn'+(s.id===state.active?' active':'')+(isDone(s.id)?' done':'')+(locked?' locked':'');
    b.innerHTML = `<span class="sb__n">${isDone(s.id)?'✓':s.n}</span>${s.short}${locked?' <span class="sb__lock">🔒</span>':''}`;
    if(!locked) b.onclick=()=>goto(s.id);
    stepperEl.appendChild(b);
  });
}

function goto(id){ state.active=id; save(); renderStepper(); renderStage(id); window.scrollTo({top:0,behavior:'smooth'}); }

function renderStage(id){
  const s = STAGES.find(x=>x.id===id);
  stagesEl.innerHTML='';
  const wrap = document.createElement('section');
  wrap.className='stage active';
  wrap.innerHTML = `<div class="stage__head">
      <span class="stage__kicker">${s.etapa}</span>
      <h2>${s.title}</h2><p>${s.lead}</p></div>`;

  const locked = s.locked && !state.design;
  if(locked){ wrap.appendChild(lockedMsg(s)); }
  else if(id==='grupos'){ wrap.appendChild(renderGroups()); wrap.appendChild(renderThirds()); }
  else { wrap.appendChild(renderRound(id)); }

  wrap.appendChild(stageNav(id));
  stagesEl.appendChild(wrap);
}

function lockedMsg(s){
  const d=document.createElement('div'); d.className='locked-msg';
  d.innerHTML=`<div class="lk__ico">🔒</div><h3>${s.title} — todavía no</h3>
    <p>Esta etapa se abre cuando se conozcan los partidos de la ronda anterior. Te avisaremos para que cargues tus pronósticos a tiempo.</p>
    <p style="margin-top:10px">Mientras tanto activá <strong>“Modo diseño”</strong> arriba para previsualizarla.</p>`;
  return d;
}

/* ---- fase de grupos ---- */
function renderGroups(){
  const grid=document.createElement('div'); grid.className='groups';
  GLETTERS.forEach(g=>{
    const card=document.createElement('div'); card.className='group';
    card.innerHTML=`<div class="group__head"><h4>Grupo ${g}</h4><span class="group__hint">1.º · 2.º clasifican · 3.º repechaje</span></div>`;
    GROUPS[g].forEach(id=>{
      const t=team(id); const r=(state.rank[g]||{})[id];
      const row=document.createElement('div');
      row.className='grow'+(r?(' r'+r):'');
      row.innerHTML=`${flagTag(t)}<span class="gname">${t.name}</span>
        <span class="grow__rank">${r?r+'°':''}</span>`;
      row.onclick=()=>cycleRank(g,id);
      card.appendChild(row);
    });
    grid.appendChild(card);
  });
  return grid;
}
function cycleRank(g,id){
  const m = state.rank[g] = state.rank[g]||{};
  if(m[id]){ // quitar
    const was=m[id]; delete m[id];
    if(was===3){ const i=state.thirds.indexOf(id); if(i>=0) state.thirds.splice(i,1); }
  } else {
    const used=Object.values(m);
    const free=[1,2,3].find(r=>!used.includes(r));
    if(!free) return; // ya hay 3 marcados
    m[id]=free;
  }
  save(); renderStepper(); renderStage('grupos');
}

function renderThirds(){
  const box=document.createElement('div'); box.className='thirds';
  // pool = equipos marcados como 3.º
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
      save(); renderStepper(); renderStage('grupos');
    };
    grid.appendChild(chip);
  });
  box.appendChild(grid);
  return box;
}

/* ---- rondas de bracket ---- */
function renderRound(round){
  const cont=document.createElement('div');
  const grid=document.createElement('div'); grid.className='round';
  const defs=matchDefs(round);
  defs.forEach((def,m)=> grid.appendChild(matchCard(round,m,def)));
  cont.appendChild(grid);

  if(round==='final'){
    cont.appendChild(thirdPlaceCard());
    cont.appendChild(championBanner());
  }
  return cont;
}

function matchCard(round,m,def){
  const key=round+'-'+m;
  const sc=state.scores[key]||{};
  const aI=slotInfo(def[0]), bI=slotInfo(def[1]);
  const res=resultOf(round,m);
  const card=document.createElement('div'); card.className='match'; card.dataset.key=key;
  card.innerHTML=`<div class="match__head"><span>Partido ${m+1}</span><span class="mdate">Fecha por confirmar</span></div>`;

  card.appendChild(teamRow(key,'a',aI,res.win));
  card.appendChild(teamRow(key,'b',bI,res.win));

  // fila de penales (desempate) — visible solo si empate con ambos equipos definidos
  const pen=document.createElement('div'); pen.className='match__pen'; pen.dataset.pen=key;
  pen.innerHTML=`<span>Empate → ¿quién avanza?</span>
    <button type="button" class="pbtn${state.pen[key]==='a'?' sel':''}" data-p="a">${aI.id!=null?team(aI.id).name:aI.label}</button>
    <button type="button" class="pbtn${state.pen[key]==='b'?' sel':''}" data-p="b">${bI.id!=null?team(bI.id).name:bI.label}</button>`;
  pen.querySelectorAll('.pbtn').forEach(btn=>btn.onclick=()=>{
    state.pen[key]=btn.dataset.p; save();
    refreshMatch(card,round,m,def);
    renderStepper();
  });
  card.appendChild(pen);
  togglePen(pen, round, m, def);
  return card;
}

function teamRow(key,slot,info,winId){
  const row=document.createElement('div');
  const known=info.id!=null;
  const isWin = known && winId===info.id;
  row.className='mteam'+(isWin?' win':'');
  row.dataset.slot=slot;
  const name = known ? `<span class="mname">${flagTag(team(info.id))} ${team(info.id).name}</span>`
                     : `<span class="mname tbd">${info.label}</span>`;
  const sc=state.scores[key]||{};
  const val = sc[slot]!=null ? sc[slot] : '';
  row.innerHTML = `${name}
    <input class="score" type="number" min="0" max="99" inputmode="numeric"
      value="${val}" ${known?'':'disabled'} aria-label="Goles" />`;
  return row;
}

function togglePen(penEl, round, m, def){
  const key=round+'-'+m; const sc=state.scores[key]||{};
  const aI=slotInfo(def[0]), bI=slotInfo(def[1]);
  const tie = aI.id!=null && bI.id!=null && sc.a!=null && sc.b!=null && sc.a===sc.b;
  penEl.style.display = tie ? 'flex' : 'none';
}

/* actualiza una tarjeta en vivo (sin reconstruir inputs → no pierde foco) */
function refreshMatch(card,round,m,def){
  const res=resultOf(round,m);
  ['a','b'].forEach(slot=>{
    const info=slotInfo(def[slot==='a'?0:1]);
    const row=card.querySelector(`.mteam[data-slot="${slot}"]`);
    row.classList.toggle('win', info.id!=null && res.win===info.id);
  });
  togglePen(card.querySelector('.match__pen'), round, m, def);
}

function thirdPlaceCard(){
  // 3.er puesto: perdedores de las 2 semifinales
  const def=[{t:'LOSE',round:'sf',m:0},{t:'LOSE',round:'sf',m:1}];
  // reutiliza matchDefs vía clave especial 'third'
  matchDefsCache['third']=[def];
  const wrap=document.createElement('div');
  wrap.innerHTML='<h3 style="font-family:Montserrat;font-weight:800;text-transform:uppercase;text-align:center;color:var(--ink);margin:34px 0 16px;font-size:18px">Partido por el 3.er puesto</h3>';
  const grid=document.createElement('div'); grid.className='round';
  grid.appendChild(matchCard('third',0,def));
  wrap.appendChild(grid);
  return wrap;
}

function championBanner(){
  const champ=getWinner('final',0);
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
  const mk=(s,label,cls)=>{
    if(!s) return '<span class="spacer"></span>';
    const locked=s.locked && !state.design;
    return `<button class="btn ${cls}${locked?'':''}" ${locked?'disabled style="opacity:.5"':''} data-go="${s.id}">${label}</button>`;
  };
  nav.innerHTML = (prev?mk(prev,'← '+prev.short,'btn--ghost'):'<span class="spacer"></span>')
    + '<span class="spacer"></span>'
    + (next?mk(next,next.short+' →',''):'');
  nav.querySelectorAll('[data-go]').forEach(b=>{ if(!b.disabled) b.onclick=()=>goto(b.dataset.go); });
  // ghost necesita fondo oscuro; en página clara lo forzamos a sólido
  nav.querySelectorAll('.btn--ghost').forEach(b=>{b.classList.remove('btn--ghost');});
  return nav;
}

/* cache para matchDefs de 'third' */
const matchDefsCache={};
const _matchDefs=matchDefs;
matchDefs=function(round){ return matchDefsCache[round]||_matchDefs(round); };

/* =========================================================
   eventos globales (scores) + init
   ========================================================= */
stagesEl.addEventListener('input', e=>{
  const inp=e.target.closest('.score'); if(!inp) return;
  const row=inp.closest('.mteam'); const card=inp.closest('.match');
  const key=card.dataset.key; const slot=row.dataset.slot;
  let v=parseInt(inp.value,10);
  state.scores[key]=state.scores[key]||{};
  if(isNaN(v)||inp.value===''){ delete state.scores[key][slot]; }
  else { v=Math.max(0,Math.min(99,v)); state.scores[key][slot]=v; }
  save();
  const round=key.split('-').slice(0,-1).join('-'); // 'r32' etc (final, third sin guion interno)
  const m=Number(key.split('-').pop());
  refreshMatch(card,round,m,matchDefs(round)[m]);
  renderStepper();
});

document.getElementById('design-mode').addEventListener('change', e=>{
  state.design=e.target.checked; save();
  renderStepper(); renderStage(state.active);
});

(function init(){
  document.getElementById('design-mode').checked=!!state.design;
  // si la etapa activa quedó bloqueada y no hay modo diseño, volver a grupos
  const act=STAGES.find(s=>s.id===state.active);
  if(act && act.locked && !state.design) state.active='grupos';
  renderStepper();
  renderStage(state.active);
})();
