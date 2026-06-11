/* ====== CONFIG (viene de config.js → window.STANLEY) ====== */
const CONFIG = window.STANLEY || { APPS_SCRIPT_URL:"", DEADLINE:"2026-06-11T12:00:00-04:00", WHATSAPP_INVITE_URL:"https://chat.whatsapp.com/" };
const newId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
  : 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2);

/* ====== archivo comprobante ====== */
const fileInput = document.getElementById("comprobante");
const fileHint = document.getElementById("file-hint");
let fileData = null; // {name, mime, b64}
fileInput.addEventListener("change", () => {
  const f = fileInput.files[0];
  if (!f) { fileData = null; fileHint.textContent = "Tocá para subir tu comprobante"; fileHint.classList.remove("ok"); return; }
  if (f.size > 6 * 1024 * 1024) { showError("El comprobante supera los 6 MB. Subí una imagen más liviana."); fileInput.value = ""; return; }
  const reader = new FileReader();
  reader.onload = e => {
    fileData = { name: f.name, mime: f.type || "application/octet-stream", b64: String(e.target.result).split(",")[1] };
    fileHint.textContent = "✓ " + f.name;
    fileHint.classList.add("ok");
  };
  reader.readAsDataURL(f);
});

/* ====== countdown ====== */
const deadline = new Date(CONFIG.DEADLINE).getTime();
const pad = n => String(n).padStart(2, "0");
function tick() {
  const diff = deadline - Date.now();
  const d = Math.max(0, Math.floor(diff / 864e5));
  const h = Math.max(0, Math.floor((diff % 864e5) / 36e5));
  const m = Math.max(0, Math.floor((diff % 36e5) / 6e4));
  const s = Math.max(0, Math.floor((diff % 6e4) / 1e3));
  document.getElementById("cd-d").textContent = d;
  document.getElementById("cd-h").textContent = pad(h);
  document.getElementById("cd-m").textContent = pad(m);
  document.getElementById("cd-s").textContent = pad(s);
}
tick(); setInterval(tick, 1000);

/* ====== submit (solo registro) ====== */
const form = document.getElementById("form");
const errorEl = document.getElementById("form-error");
const submitBtn = document.getElementById("submit");
function showError(msg) { errorEl.textContent = msg; errorEl.hidden = false; errorEl.scrollIntoView({ behavior: "smooth", block: "center" }); }
function resetBtn() { submitBtn.disabled = false; submitBtn.textContent = "Inscribirme y armar mi quiniela"; }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  for (const el of form.querySelectorAll("input[required]")) {
    if (el.type === "file" || el.type === "checkbox") continue;
    if (!el.value.trim()) { showError("Completá todos los campos obligatorios."); el.focus(); return; }
  }
  if (!form.canal.value) { showError("Elegí tu canal de compra."); form.canal.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) { showError("Revisá tu correo: no parece válido."); form.email.focus(); return; }
  if (form.whatsapp.value.replace(/\D/g, "").length < 7) { showError("Revisá tu WhatsApp: falta el número."); form.whatsapp.focus(); return; }
  if (!fileData) return showError("Subí tu factura o respaldo de compra.");
  if (!document.getElementById("terminos").checked)  return showError("Tenés que aceptar las bases y la veracidad de tus datos.");
  if (!document.getElementById("validacion").checked) return showError("Tenés que aceptar la validación de tu inscripción.");
  if (!document.getElementById("datos").checked)      return showError("Tenés que aceptar el tratamiento de datos y comunicaciones.");

  const player = {
    id: newId(),
    nombre: form.nombre.value.trim(),
    documento: form.documento.value.trim(),
    email: form.email.value.trim()
  };
  const comprobanteNro = form.comprobante_nro.value.trim();
  const payload = {
    action: "register",
    id: player.id,
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    documento: form.documento.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    email: form.email.value.trim(),
    ciudad: form.ciudad.value.trim(),
    canal: form.canal.value,
    comprobante_nro: comprobanteNro,
    enviado: new Date().toISOString(),
    comprobante: fileData
  };

  submitBtn.disabled = true; submitBtn.textContent = "Verificando…";
  try {
    if (!CONFIG.APPS_SCRIPT_URL) {
      // modo demo (sin backend conectado): simula éxito, guarda jugador local
      await new Promise(r => setTimeout(r, 500));
      console.warn("APPS_SCRIPT_URL vacío: registro NO enviado a la nube (modo demo).", payload);
    } else {
      // Chequeo previo de duplicado (GET es legible cross-origin, como el ranking).
      // El servidor igual deduplica al guardar; esto es solo para avisar al usuario.
      try {
        const q = new URLSearchParams({ action: "existe", ci: player.documento, comp: comprobanteNro });
        const chk = await fetch(CONFIG.APPS_SCRIPT_URL + "?" + q.toString()).then(r => r.json());
        if (chk && chk.ci)   { resetBtn(); return showError("Ese documento (CI) ya está inscrito. Si ya participaste, entrá a tu quiniela desde el menú."); }
        if (chk && chk.comp) { resetBtn(); return showError("Ese número de comprobante ya fue registrado. Cada compra puede inscribirse una sola vez."); }
      } catch (e) { console.warn("Chequeo de duplicado no disponible; continúo (el servidor deduplica igual).", e); }

      submitBtn.textContent = "Enviando…";
      // text/plain → request "simple" (sin preflight CORS a Apps Script).
      // El id lo generamos en el cliente, así que no dependemos de leer la respuesta.
      await fetch(CONFIG.APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    }
    localStorage.setItem("stanley_player", JSON.stringify(player));   // vincula la quiniela
    goToQuiniela();
  } catch (err) {
    resetBtn();
    showError("No pudimos registrar tu inscripción. Revisá tu conexión e intentá de nuevo.");
    console.error(err);
  }
});

function goToQuiniela() {
  // tras inscribirse, directo a armar la quiniela.
  // La invitación a la comunidad se ofrece al CERRAR la fase de grupos (en jugar.html).
  submitBtn.textContent = "¡Listo! Abriendo tu quiniela…";
  window.location.href = "jugar.html";
}

/* ====== carrusel de fotos de producto (Tu equipo Stanley) ====== */
document.querySelectorAll("[data-carousel]").forEach(function (box, idx) {
  var imgs = box.querySelectorAll(".prize__img");
  if (imgs.length < 2) return;
  var i = 0;
  // arranque escalonado para que no roten todas a la vez
  setTimeout(function () {
    setInterval(function () {
      imgs[i].classList.remove("is-active");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("is-active");
    }, 3200);
  }, idx * 900);
});
