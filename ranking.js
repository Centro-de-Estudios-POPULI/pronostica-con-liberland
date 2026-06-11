/* Leaderboards — Ranking General Stanley + Modo Nostradamus */
const APPS_URL = (window.STANLEY||{}).APPS_SCRIPT_URL || '';
const lb  = document.getElementById('lb');
const upd = document.getElementById('lb-updated');
const me  = (()=>{ try{ return JSON.parse(localStorage.getItem('stanley_player')); }catch(e){ return null; } })();
const EMPTY = 'Los rankings se actualizarán una vez cerrada la etapa correspondiente.';
const cache = {};
let tab = 'general';

function msg(t){ lb.innerHTML = `<p class="lb-empty">${t}</p>`; upd.textContent = ''; }
function fmt(s){ try{ return new Intl.DateTimeFormat('es-BO',{dateStyle:'medium',timeStyle:'short',timeZone:'America/La_Paz'}).format(new Date(s)); }catch(e){ return s; } }
function medal(p){ return p===1?'🥇':p===2?'🥈':p===3?'🥉':p; }
function esc(s){ return String(s==null?'':s).replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }
/* nombre abreviado: "Carlos Aranda" -> "Carlos A." (no se exponen datos sensibles) */
function shortName(n){
  const parts = String(n||'').trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return '—';
  if(parts.length===1) return parts[0];
  return parts[0] + ' ' + parts[1][0].toUpperCase() + '.';
}
function estadoBadge(e){
  const k = String(e||'').toLowerCase();
  const cls = k.indexOf('clasif')===0 ? 'est est--ok' : k.indexOf('elimin')===0 ? 'est est--out' : 'est est--pend';
  return `<span class="${cls}">${esc(e||'—')}</span>`;
}

document.querySelectorAll('.rank-tab').forEach(b=> b.addEventListener('click', ()=>{
  document.querySelectorAll('.rank-tab').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  tab = b.dataset.tab;
  load();
}));

function load(){
  if(!APPS_URL){ msg('El ranking todavía no está conectado.'); return; }
  if(cache[tab]){ render(cache[tab]); return; }
  msg('Cargando ranking…');
  const action = tab==='nostra' ? 'ranking_nostra' : 'ranking';
  fetch(APPS_URL + '?action=' + action)
    .then(r=>r.json())
    .then(data=>{ cache[tab] = data; render(data); })
    .catch(()=> msg('No pudimos cargar el ranking. Probá de nuevo en un rato.'));
}

function render(data){
  const rows = (data && data.ranking) || [];
  if(!rows.length){ msg(EMPTY); return; }
  upd.textContent = data.actualizado ? ('Actualizado: ' + fmt(data.actualizado)) : '';
  const nostra = tab==='nostra';
  let html = `<table class="lb-table"><thead><tr>
    <th>#</th><th>Jugador</th><th class="lb-hide">Ciudad</th><th>${nostra?'Pts Nostradamus':'Puntos'}</th>${nostra?'':'<th class="lb-hide">Estado</th>'}
    </tr></thead><tbody>`;
  rows.forEach(row=>{
    const mine = me && row.nombre && me.nombre &&
      row.nombre.trim().toLowerCase()===me.nombre.trim().toLowerCase();
    html += `<tr class="${mine?'lb-me':''}">
      <td class="lb-pos">${medal(row.pos)}</td>
      <td>${esc(shortName(row.nombre))}</td>
      <td class="lb-hide">${esc(row.ciudad)||''}</td>
      <td class="lb-pts">${row.puntos}</td>
      ${nostra?'':`<td class="lb-hide">${estadoBadge(row.estado)}</td>`}
    </tr>`;
  });
  html += `</tbody></table>`;
  lb.innerHTML = html;
}

load();
