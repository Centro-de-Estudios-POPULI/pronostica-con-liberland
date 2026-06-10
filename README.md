# Pronosticá con Stanley — landing + registro (v1)

Landing de campaña + formulario de registro en **un solo paso** (datos + comprobante + predicciones), con identidad de cancha verde. Front-end estático; los datos van a Google Sheets + Drive vía Apps Script.

## Archivos
```
web/
├── index.html         landing + formulario
├── styles.css         estilos (paleta cancha, Anton/Archivo/Inter)
├── app.js             48 selecciones, contador 32/32, countdown, envío
├── assets/            logos Stanley + pieza de premios
└── apps-script/Code.gs backend (pegar en script.google.com)
```

## Probar local
Abrí `index.html` en el navegador (doble clic). Sin backend conectado funciona en **modo demo**: valida y muestra la confirmación, pero NO guarda (lo avisa en consola).

## Poner en marcha (checklist)

**1. Backend (Google) —** seguí los pasos arriba en `apps-script/Code.gs`:
   - Crear Hoja de Cálculo → copiar su ID.
   - Crear carpeta en Drive para comprobantes → copiar su ID.
   - Pegar ambos IDs en `Code.gs`, desplegar como Web App, copiar la URL.

**2. Conectar —** pegá esa URL en `app.js` → `CONFIG.APPS_SCRIPT_URL`.

**3. Configurar `app.js` → CONFIG:**
   - `DEADLINE`: fecha/hora real de cierre de inscripciones.
   - `WHATSAPP_INVITE_URL`: link de la comunidad de WhatsApp.

**4. Hosting —** subir la carpeta `web/` a **GitHub Pages** o **Cloudflare Pages** (estático, gratis). Listo.

## Lo que falta definir / reemplazar (placeholders)
- [ ] **Lista de 48 selecciones** en `app.js` → `COUNTRIES` (hoy es genérica/editable).
- [ ] **Imágenes reales de los 3+ productos** de premios (hoy son degradados).
- [ ] **Bases y condiciones** finales (texto legal a validar por legal).
- [ ] Email de contacto y período exacto de la promo.

## Cuidado de marca (ya aplicado)
Lenguaje 100% genérico (fútbol, selecciones, temporada). Sin nombres oficiales, logos de torneo ni mención de sponsor. Disclaimer visible en hero y footer.
