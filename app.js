/* ====== CONFIG (editar estos 3 valores) ====== */
const CONFIG = {
  // Pegá acá la URL del Web App de Google Apps Script (ver apps-script/Code.gs)
  APPS_SCRIPT_URL: "",
  // Fecha/hora de cierre de inscripciones (ISO, hora local Bolivia -04:00)
  DEADLINE: "2026-06-11T12:00:00-04:00",
  // Link de invitación a la comunidad de WhatsApp (para clasificados)
  WHATSAPP_INVITE_URL: "https://chat.whatsapp.com/"
};

/* ====== 48 SELECCIONES (genéricas, editables) ====== */
const COUNTRIES = [
  ["🇦🇷","Argentina"],["🇧🇷","Brasil"],["🇺🇾","Uruguay"],["🇨🇴","Colombia"],
  ["🇨🇱","Chile"],["🇵🇪","Perú"],["🇪🇨","Ecuador"],["🇵🇾","Paraguay"],
  ["🇧🇴","Bolivia"],["🇻🇪","Venezuela"],["🇫🇷","Francia"],["🇩🇪","Alemania"],
  ["🇪🇸","España"],["🇮🇹","Italia"],["🇵🇹","Portugal"],["🇳🇱","Países Bajos"],
  ["🇧🇪","Bélgica"],["🇬🇧","Inglaterra"],["🇭🇷","Croacia"],["🇩🇰","Dinamarca"],
  ["🇨🇭","Suiza"],["🇷🇸","Serbia"],["🇵🇱","Polonia"],["🇦🇹","Austria"],
  ["🇸🇪","Suecia"],["🇳🇴","Noruega"],["🇹🇷","Turquía"],["🇺🇦","Ucrania"],
  ["🇺🇸","Estados Unidos"],["🇲🇽","México"],["🇨🇦","Canadá"],["🇨🇷","Costa Rica"],
  ["🇯🇵","Japón"],["🇰🇷","Corea del Sur"],["🇸🇦","Arabia Saudita"],["🇮🇷","Irán"],
  ["🇦🇺","Australia"],["🇶🇦","Catar"],["🇲🇦","Marruecos"],["🇸🇳","Senegal"],
  ["🇳🇬","Nigeria"],["🇬🇭","Ghana"],["🇨🇲","Camerún"],["🇪🇬","Egipto"],
  ["🇩🇿","Argelia"],["🇨🇮","Costa de Marfil"],["🇹🇳","Túnez"],["🇿🇦","Sudáfrica"]
];
const MAX = 32;
const selected = new Set();
let posicion = "";

/* ====== render grilla de selecciones ====== */
const teamsEl = document.getElementById("teams");
const counterEl = document.getElementById("counter");
COUNTRIES.forEach(([flag, name]) => {
  const el = document.createElement("div");
  el.className = "team";
  el.dataset.name = name;
  el.innerHTML = `<span class="flag">${flag}</span><span>${name}</span>`;
  el.addEventListener("click", () => toggle(name, el));
  teamsEl.appendChild(el);
});

function toggle(name, el) {
  if (selected.has(name)) { selected.delete(name); el.classList.remove("sel"); }
  else { if (selected.size >= MAX) return; selected.add(name); el.classList.add("sel"); }
  updateCounter();
  refreshSelects();
}

function updateCounter() {
  counterEl.textContent = `${selected.size} / ${MAX}`;
  counterEl.classList.toggle("full", selected.size === MAX);
  const full = selected.size >= MAX;
  document.querySelectorAll(".team").forEach(t => {
    t.classList.toggle("disabled", full && !t.classList.contains("sel"));
  });
}

/* campeón / finalista: opciones desde las selecciones elegidas */
const campeonEl = document.getElementById("campeon");
const finalistaEl = document.getElementById("finalista");
function refreshSelects() {
  [campeonEl, finalistaEl].forEach(sel => {
    const prev = sel.value;
    const placeholder = sel.options[0].textContent;
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    [...selected].sort().forEach(n => {
      const o = document.createElement("option");
      o.value = n; o.textContent = n;
      sel.appendChild(o);
    });
    if (selected.has(prev)) sel.value = prev;
  });
}

/* chips posición */
document.querySelectorAll("#posicion .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll("#posicion .chip").forEach(c => c.classList.remove("sel"));
    chip.classList.add("sel");
    posicion = chip.dataset.val;
  });
});

/* archivo comprobante */
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

/* ====== submit ====== */
const form = document.getElementById("form");
const errorEl = document.getElementById("form-error");
const submitBtn = document.getElementById("submit");
function showError(msg) { errorEl.textContent = msg; errorEl.hidden = false; errorEl.scrollIntoView({ behavior: "smooth", block: "center" }); }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  // validaciones
  for (const el of form.querySelectorAll("input[required], select[required]")) {
    if (el.type === "file") continue;
    if (!el.value.trim()) { showError("Completá todos los campos obligatorios."); el.focus(); return; }
  }
  if (!fileData) return showError("Subí tu comprobante de compra.");
  if (selected.size !== MAX) return showError(`Elegí exactamente ${MAX} selecciones. Llevás ${selected.size}.`);
  if (!posicion) return showError("Elegí tu posición en la cancha.");
  if (!document.getElementById("terminos").checked) return showError("Tenés que aceptar las bases y condiciones.");

  const payload = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    documento: form.documento.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    email: form.email.value.trim(),
    ciudad: form.ciudad.value.trim(),
    selecciones: [...selected],
    campeon: form.campeon.value,
    finalista: form.finalista.value,
    figura: form.figura.value.trim(),
    desempate: form.desempate.value,
    posicion,
    enviado: new Date().toISOString(),
    comprobante: fileData
  };

  submitBtn.disabled = true; submitBtn.textContent = "Enviando…";
  try {
    if (!CONFIG.APPS_SCRIPT_URL) {
      // modo demo (sin backend conectado): simula éxito
      await new Promise(r => setTimeout(r, 600));
      console.warn("APPS_SCRIPT_URL vacío: registro NO guardado (modo demo).", payload);
    } else {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "Error del servidor");
    }
    showConfirm();
  } catch (err) {
    submitBtn.disabled = false; submitBtn.textContent = "Enviar mi jugada";
    showError("No pudimos registrar tu jugada. Revisá tu conexión e intentá de nuevo.");
    console.error(err);
  }
});

function showConfirm() {
  form.closest(".form-card").hidden = true;
  const c = document.getElementById("confirm");
  c.hidden = false;
  document.getElementById("wa-cta").href = CONFIG.WHATSAPP_INVITE_URL;
  c.scrollIntoView({ behavior: "smooth", block: "center" });
}

updateCounter();
