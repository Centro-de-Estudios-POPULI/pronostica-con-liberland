/* auth.js - sesion Nick+PIN (MOCK, sin backend). Inyecta la barra y maneja modo solo-lectura.
   Cuando exista backend, reemplazar login() por validacion real contra el servidor. */
(function(){
  var KEY = 'll_session';
  function getSession(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
  function setRO(){ document.documentElement.setAttribute('data-ro', getSession() ? '0' : '1'); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function login(){
    var nick = (document.getElementById('authNick').value||'').trim();
    var pin = (document.getElementById('authPin').value||'').trim();
    if(nick.length < 3){ alert('Ingresa tu Nick (minimo 3 caracteres).'); return; }
    if(!/^\d{4}$/.test(pin)){ alert('El PIN es de 4 digitos.'); return; }
    // MOCK: sin backend aceptamos cualquier Nick+PIN valido. El backend validara de verdad.
    localStorage.setItem(KEY, JSON.stringify({ nick: nick, ts: Date.now() }));
    render();
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
