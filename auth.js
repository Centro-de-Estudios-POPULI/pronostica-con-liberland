/* auth.js - sesion Nick+PIN. Inyecta la barra de login y maneja el modo solo-lectura.
   Si hay APPS_SCRIPT_URL (config.js) valida contra el backend; si no, modo demo. */
(function(){
  var KEY = 'll_session';
  function backendUrl(){ return (window.STANLEY || {}).APPS_SCRIPT_URL || ''; }
  function getSession(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
  function setRO(){ document.documentElement.setAttribute('data-ro', getSession() ? '0' : '1'); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function saveSession(nick, pin){ localStorage.setItem(KEY, JSON.stringify({ nick: nick, pin: pin, ts: Date.now() })); render(); }
  function loginMsg(res){
    var c = res && res.code;
    if(c === 'no_existe') return 'Ese Nick no existe. ¿Te inscribiste?';
    if(c === 'pin_incorrecto') return 'PIN incorrecto.';
    if(c === 'pendiente') return 'Tu inscripción está pendiente: te activamos cuando confirmemos tu pago.';
    return 'No pudimos validar tu acceso. Probá de nuevo.';
  }
  function login(){
    var nick = (document.getElementById('authNick').value||'').trim();
    var pin = (document.getElementById('authPin').value||'').trim();
    if(nick.length < 3){ alert('Ingresa tu Nick (minimo 3 caracteres).'); return; }
    if(!/^\d{4}$/.test(pin)){ alert('El PIN es de 4 digitos.'); return; }
    var url = backendUrl();
    if(!url){ saveSession(nick, pin); return; }   // demo sin backend
    var btn = document.getElementById('authIn'); if(btn){ btn.disabled = true; btn.textContent = '...'; }
    var q = new URLSearchParams({ action: 'login', nick: nick, pin: pin });
    fetch(url + '?' + q.toString()).then(function(r){ return r.json(); }).then(function(res){
      if(res && res.ok){ saveSession(res.nick || nick, pin); }
      else { alert(loginMsg(res)); if(btn){ btn.disabled = false; btn.textContent = 'Entrar'; } }
    }).catch(function(){ alert('No pudimos validar (revisá tu conexión).'); if(btn){ btn.disabled = false; btn.textContent = 'Entrar'; } });
  }
  function render(){
    var bar = document.getElementById('authbar'); if(!bar) return;
    var s = getSession();
    if(s && s.nick){
      bar.innerHTML = '<span class="authbar__who">&#128100; <b>'+esc(s.nick)+'</b> &middot; podes guardar tus pronosticos</span>'
        + '<button class="authbar__btn" id="authOut">Salir</button>';
      document.getElementById('authOut').onclick = function(){ localStorage.removeItem(KEY); render(); };
    } else {
      bar.innerHTML = '<span class="authbar__msg">&#128274; Modo solo lectura</span>'
        + '<input id="authNick" placeholder="Tu Nick" autocomplete="off" />'
        + '<input id="authPin" placeholder="PIN" inputmode="numeric" maxlength="4" />'
        + '<button class="authbar__btn" id="authIn">Entrar</button>';
      document.getElementById('authIn').onclick = login;
    }
    setRO();
  }
  function mount(){
    if(!document.getElementById('authbar')){
      var bar = document.createElement('div'); bar.className='authbar'; bar.id='authbar';
      var anchor = document.querySelector('.gamebar') || document.querySelector('.nav');
      if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(bar, anchor.nextSibling); }
      else { document.body.insertBefore(bar, document.body.firstChild); }
    }
    render();
  }
  if(document.readyState!=='loading') mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
