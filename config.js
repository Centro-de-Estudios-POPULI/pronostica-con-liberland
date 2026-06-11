/* ====== CONFIG ÚNICA — pegar acá los valores ======
   APPS_SCRIPT_URL: URL del Web App de Apps Script (ver apps-script/Code.gs).
                    Mientras esté vacío, el sitio funciona en MODO DEMO
                    (valida y guarda localmente, pero NO envía a la nube). */
window.STANLEY = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwQ6NHmn9lx91oWtiNo2--fUmhM7RLBgIUoPfZBhVj_uTZfuURiOjFWXr1_CZ2IxrzP/exec",
  WHATSAPP_INVITE_URL: "https://chat.whatsapp.com/",
  DEADLINE: "2026-06-18T11:30:00-04:00",  // cierre de inscripciones: jue 18 jun 2026, 11:30 (hora Bolivia)
  // Fase de la campaña: controla el home y el nav.
  //   inscripcion | grupos | eliminatorias | cerrado
  // (se puede previsualizar con ?phase=eliminatorias en la URL)
  PHASE: "inscripcion"
};
