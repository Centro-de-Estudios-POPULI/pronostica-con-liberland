# Plan — Etapa 2: Quiniela en vivo (día por día)

> Documento de trabajo. Lo vamos refinando. Estado: **borrador / diseño**.

## Idea
Cuando arranca la fase **eliminatoria real** del Mundial, se habilita una segunda fase de
juego: **día por día**, cada partido real se puede predecir con campos ricos (resultado,
amarillas, jugador del partido, etc.). Cada acierto **suma puntos por persona** y mantiene a
la gente enganchada hasta la final.

## Los 3 "juegos" sobre el mismo Mundial (cómo encaja todo)
1. **Etapa 1 – Fase de grupos** *(ya está)*: predecís clasificados → se cierra → 1.ª tanda de premios.
2. **Nostradamus** *(ya está, opcional)*: al cerrar grupos, sellás **tu cuadro completo** de una
   vez → premio al más certero. Es predicción "a futuro" sobre **tu** cuadro.
3. **Etapa 2 – Quiniela en vivo** *(NUEVO)*: sobre los **partidos reales**, día por día. Todos
   predicen los mismos partidos. Es la fase larga, con puntaje acumulado.

**Distinción clave (lo que hace coherente todo):**
- *Nostradamus* = tu cuadro propio, sellado temprano (cascada de TUS picks).
- *Etapa 2* = partidos **reales** tal como van saliendo. Cada partido se habilita recién
  cuando se conocen sus equipos reales (se carga el fixture real) y se cierra a la hora de
  inicio. Eso da el "día por día" natural y resuelve que "todavía no hay equipos reales".

## Alcance de campos por partido (a definir)
**MVP sugerido (mínimo viable):**
- Resultado **a los 90'** (marcador) — *ya existe la mecánica*
- ¿Quién avanza? (en eliminatorias) — *ya existe*
- **Definición** si hay empate a los 90': avanza por **alargue** o **penales** (aparece solo si el marcador es empate) — *ya existe la mecánica en el bracket; se reusa*
- 🟨 Total de amarillas del partido (un número)
- ⭐ Jugador del partido (de una lista corta por partido)

**Extensiones opcionales (cada una = más carga de datos diaria):**
- Primer goleador
- ¿Se define por penales?
- Total de goles
- Tarjetas rojas

## Puntaje (propuesta inicial, editable)
| Campo | Puntos |
|---|---|
| ¿Quién avanza? | 4 / 6 / 8 / 12 / 20 (según ronda, como ya está) |
| Marcador exacto (a 90') | 3 / 4 / 5 / 6 / 8 (como ya está) |
| Definición correcta (alargue/penales, si hubo empate) | +1 |
| Total de amarillas exacto | +3 (±1 → +1) |
| Jugador del partido | +5 |
| *(opcionales)* primer goleador / penales | +4 / +2 |

## Qué hay que construir
### Frontend
- Vista **Etapa 2**: partidos reales **agrupados por fecha**, con un formulario por partido
  (marcador + amarillas + MOTM + …). Reusa autosave (debounce) y cierre por hora que **ya existen**.
- Indicador de estado (guardado en la nube) y "cómo se puntúa".

### Backend (Apps Script + Sheets)
- **Fixture real**: qué equipos juegan cada partido (para mostrar los equipos reales).
- **Resultados reales ampliados**: marcador + amarillas + MOTM (+ opcionales) por partido.
- **Guardado de predicciones de Etapa 2**: opción A = pestaña nueva `Pronosticos_fase2`
  (1 fila por jugador+partido); opción B = dentro de `pronostico_json` bajo clave `fase2`.
  *(A escala mejor para puntuar; B reusa lo que ya hay.)*
- **Puntaje**: extender `computeRanking` / `scorePlayer_` con los campos nuevos.

### Operación (lo más caro, honesto)
- Alguien (admin) **carga los datos reales cada día**: marcador, amarillas, jugador del partido.
- Amarillas y MOTM **no salen solos** → carga manual diaria (32 partidos de eliminatoria) **o**
  integrar una **API** del Mundial (más desarrollo). Para la promo, lo realista = manual.
- Cuantos más campos, más carga diaria. El MVP equilibra enganche vs. trabajo.

## Decisiones abiertas (las vamos cerrando)
1. **Campos definitivos** por partido (MVP vs. extensiones).
2. **Jugador del partido**: ¿lista corta cargada por partido (más justa) o texto libre?
3. **Datos reales**: ¿carga manual diaria o API?
4. **Participantes**: ¿solo inscritos (compra) o se puede sumar gente nueva en Etapa 2?
5. **Relación con el bracket actual**: la pantalla de bracket (elegir quién avanza + marcador)
   se **transforma** en la vista de Etapa 2 alimentada por equipos **reales** (no por tu cascada).
   Nostradamus queda como juego aparte (cuadro sellado).

## Integración con todo el sitio (home + nav + flujo)
> **DECIDIDO (2026-06-11): Opción B (página `etapa2.html` aparte) + home consciente de fase.**

El sitio cambia según la **fase de la campaña** mediante un flag `PHASE` en `config.js`
(`inscripcion` | `grupos` | `eliminatorias` | `cerrado`) que adapta el home y el nav.
Implementación: `phase.js` setea `document.documentElement[data-phase]` (con override
`?phase=` para previsualizar); el CSS muestra/oculta el banner de fase y el link "Etapa 2" del nav.

**¿Dónde vive Etapa 2? (decisión principal)**
- **Opción A** — Etapa 2 = las etapas de llaves de `jugar.html` repotenciadas (mismas pantallas,
  ahora con equipos reales + día por día + campos ricos). *Un solo lugar; reusa todo.*
- **Opción B (recomendada)** — Etapa 2 = **página nueva** `etapa2.html`. `jugar.html` queda para
  Etapa 1 (grupos) + Nostradamus (tu cuadro sellado); `etapa2.html` es la quiniela diaria de
  partidos **reales**. *Más limpio conceptualmente: son juegos distintos (tu cuadro vs partidos
  reales) y el puntaje se razona más fácil.*

**Home (`index.html`) consciente de la fase:**
- `inscripcion` / `grupos`: hero actual ("Inscribite / Armá tu quiniela").
- `eliminatorias`: el hero cambia a "¡Empezaron las eliminatorias! Predecí los partidos de hoy"
  con CTA → `etapa2.html` + teaser de los partidos del día + link al ranking.
- `cerrado`: foco en el ranking final / ganadores.

**Nav (todas las páginas):** Inicio · Mi quiniela · **Etapa 2** · Ranking · Tienda.
La pestaña "Etapa 2" se muestra/destaca recién cuando está habilitada (antes "pronto").

**Flujo completo (ciclo de vida):**
1. Home → Inscribite → directo a Mi quiniela (grupos).
2. Cerrás grupos → comunidad + Nostradamus.
3. Terminan los grupos reales → se habilita **Etapa 2** → home y nav lo destacan → predecís día por día.
4. **Ranking** suma TODO: grupos + bonus Nostradamus + Etapa 2 diaria. La página de ranking gana
   una sección "Etapa 2" en "¿Cómo se puntúa?".

**Reconciliación cuadro propio vs. real:** al terminar los grupos reales, las llaves de
`jugar.html` (tu cuadro / Nostradamus) quedan como **histórico de lo que predijiste**, y la acción
en vivo se mueve a `etapa2.html` con los **equipos reales**.

## Estado del prototipo
- `etapa2-preview.html` = **mockup visual** con datos de ejemplo (equipos NO reales), para ver
  cómo quedaría la página. No tiene backend ni puntaje todavía.
