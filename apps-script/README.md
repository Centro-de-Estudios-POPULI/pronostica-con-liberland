# Backend Google Sheets — Quiniela Stanley

El sitio (GitHub Pages) envía el **registro** y los **pronósticos** a un Web App de
Apps Script, que escribe en una Hoja de Cálculo. Los comprobantes van a una carpeta de Drive.

## Pasos (una sola vez)
1. **Hoja de cálculo**: creá una Hoja de Google nueva. Copiá su **ID** (en la URL, entre `/d/` y `/edit`).
2. **Carpeta de Drive**: creá una carpeta para los comprobantes. Copiá su **ID** (en la URL, después de `/folders/`).
3. **Proyecto Apps Script**: andá a https://script.google.com → *Nuevo proyecto*. Borrá el contenido y pegá `Code.gs` de esta carpeta.
4. Pegá los dos IDs arriba de `Code.gs` (`SHEET_ID`, `FOLDER_ID`). Guardá.
5. **Implementar → Nueva implementación → Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier usuario**
   - Implementar → autorizá los permisos cuando lo pida.
6. Copiá la **URL del Web App** (termina en `/exec`) y pegala en `web/config.js` → `APPS_SCRIPT_URL`.
7. `git commit` + `push`. Listo: el sitio empieza a guardar en la nube.

> Si después editás `Code.gs`: *Implementar → Administrar implementaciones → (editar) → Nueva versión*.

## Qué se guarda
- Pestaña **Participantes**: `id, nombre, apellido, documento, whatsapp, email, ciudad, comprobante, fecha, comprobante_nro`.
- Pestaña **Pronosticos**: `id, nombre, documento, actualizado, avance%, campeon, finalista, tercer_puesto, pronostico_json, grupos_enviados, nostradamus, nostra_at` (1 fila por jugador; se actualiza con cada cambio). `pronostico_json` (columna I) trae clasificados + llaves resueltos. Los 3 últimos campos (columnas J, K, L) registran si el jugador **envió su fase de grupos** (1/0), si **selló su Nostradamus** (1/0) y **cuándo** (fecha ISO).

El **id** lo genera la página al inscribirse y queda en el navegador del jugador, así sus
pronósticos (cargados después, incluso otro día) se vinculan a su registro.

## Bajar a Excel
*Archivo → Descargar → Microsoft Excel (.xlsx)* desde la Hoja. Las columnas `*_json` traen
el detalle completo; si querés expandirlas a columnas, lo hacemos con un script aparte.

## Notas
- Mientras `APPS_SCRIPT_URL` esté vacío en `config.js`, el sitio anda en **modo demo**
  (valida y guarda local, no envía a la nube).
- Dedup: el servidor rechaza inscripciones con un **CI** o un **nº de comprobante** ya usados
  (`register_` consulta `findDuplicates_` antes de escribir). La página, además, chequea por
  `GET ?action=existe&ci=…&comp=…` antes de enviar para avisar al usuario al instante. Si reenviás
  con el mismo `id` (mismo navegador), se actualiza tu propia fila en vez de bloquear.
- **Nota:** el `comprobante_nro` se guarda como columna nueva. En una Hoja creada antes de este
  cambio, la cabecera de esa columna puede quedar vacía pero los datos igual se escriben en la
  columna J; opcional poner el título `comprobante_nro` en J1 a mano.
- **Nota (Pronosticos):** `grupos_enviados`, `nostradamus` y `nostra_at` se agregaron al final
  (columnas J, K, L) para no correr `pronostico_json` ni romper `computeRanking` (que lee la
  columna I). En una Hoja existente las cabeceras J1/K1/L1 pueden quedar vacías, pero los datos
  se escriben igual; opcional rotularlas a mano. **Tras editar `Code.gs` hay que re-desplegar
  Versión nueva** (Administrar implementaciones → editar) para que la URL `/exec` tome el cambio.
