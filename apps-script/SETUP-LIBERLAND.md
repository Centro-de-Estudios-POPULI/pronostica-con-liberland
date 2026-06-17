# Backend Liberland — instalación (Google Sheets + Apps Script)

El sitio funciona en **modo demo** hasta que conecten este backend. Cuando esté
listo, las inscripciones, el login Nick+PIN y los pronósticos se guardan de verdad.
La **Hoja de cálculo es el panel de operación** (alta de inscriptos, resultados).

> Hacerlo con la **cuenta Google del proyecto** (la que va a administrar el juego).
> Esa cuenta será dueña de la Hoja, del Drive con los comprobantes y del backend.

## 1. Crear la Hoja y pegar el código
1. En esa cuenta Google → **Google Sheets** → **Hoja en blanco**. Ponele un nombre
   (ej. *Liberland Pronósticos*).
2. **Extensiones → Apps Script**. Borrá lo que haya y **pegá** el contenido de
   `apps-script/Code.gs` (de este repo).
3. Arriba del archivo, cambiá `SALT` por una **cadena secreta propia**
   (cualquier texto largo). No se comparte; solo vive en el script.
4. Guardá (💾).

## 2. Preparar las pestañas
- En el editor de Apps Script, elegí la función `setupSheet` y **Ejecutar** ▶
  (la primera vez pide **autorizar permisos** — aceptá con la cuenta del proyecto).
- Esto crea las pestañas **Inscritos, Pronosticos, Resultados, Ranking**.
- (Alternativa: desde la Hoja, menú **Liberland → Preparar Hoja**.)

## 3. Publicar como Web App
1. En Apps Script: **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** Yo (la cuenta del proyecto).
4. **Quién tiene acceso:** **Cualquier usuario**.
5. **Implementar** → copiá la **URL** que termina en `/exec`.

## 4. Conectar el sitio
- En `web/config.js`, pegá esa URL en `APPS_SCRIPT_URL`:
  ```js
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfy.../exec",
  ```
- Commit + push. Desde ese momento el sitio guarda en la nube (deja de ser demo).

> **Importante:** cada vez que cambien `Code.gs`, en Apps Script:
> **Implementar → Administrar implementaciones → (editar ✏️) → Versión: Nueva → Implementar.**
> Así se mantiene la **misma URL** `/exec`.

## 5. Operación diaria (lo que hace el admin)
- **Validar pagos / dar de alta:** en la pestaña **Inscritos** ves cada inscripción
  con su `comprobante_url` (la captura del pago en Drive, privada). Si el pago está
  bien, seleccioná esa(s) fila(s) y usá el menú **Liberland → Activar inscriptos
  seleccionados** (pasa `estado` a `activo`). Recién ahí esa persona puede **entrar
  con su Nick+PIN y guardar**. (Para rechazar: *Rechazar inscriptos seleccionados*.)
- **Resultados / ranking:** la pestaña **Resultados** y el cálculo del ranking se
  completan cuando cerremos la mecánica final (grupos simplificados + jugada
  especial). Por ahora el backend ya guarda inscriptos, login y pronósticos.

## Notas
- El **PIN se guarda hasheado** (SHA-256 + tu SALT), nunca en texto plano.
- Los **comprobantes** van a una carpeta privada de Drive de la cuenta del proyecto.
- Esquema actual de `Inscritos`: `timestamp · nick · pin_hash · nombre · apellido ·
  ci · whatsapp · estado · comprobante_url · id`.
