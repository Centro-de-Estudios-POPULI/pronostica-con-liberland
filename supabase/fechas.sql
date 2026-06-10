-- =====================================================================
-- FECHAS REALES — Calendario fase final Mundial 2026 (hora de Bolivia, -04)
-- Correr en Supabase DESPUÉS de schema.sql, cuando el proyecto exista.
--
-- Nota: la PÁGINA ya bloquea cada partido a su hora exacta de inicio
-- (ver fechas por partido en quiniela.js → MATCHES). Esta tabla 'etapas'
-- es un respaldo a nivel de ronda. El bloqueo fino por partido en el
-- servidor se agregará al conectar Supabase (tabla de partidos + trigger).
--
-- 'cierre' = inicio del ÚLTIMO partido de la ronda (respaldo amplio).
-- 'apertura' de grupos / cierre de inscripciones: PENDIENTE (falta la fecha
-- de arranque de la fase de grupos / deadline de inscripción).
-- =====================================================================

update public.etapas set cierre = '2026-07-03 21:30-04' where id = 'r32';   -- Dieciseisavos (28 jun – 3 jul)
update public.etapas set cierre = '2026-07-07 16:00-04' where id = 'r16';   -- Octavos (4 – 7 jul)
update public.etapas set cierre = '2026-07-11 21:00-04' where id = 'qf';    -- Cuartos (9 – 11 jul)
update public.etapas set cierre = '2026-07-15 15:00-04' where id = 'sf';    -- Semifinales (14 – 15 jul)
update public.etapas set cierre = '2026-07-19 15:00-04' where id = 'final'; -- 3.er puesto (18 jul) y Final (19 jul)

-- Fase de grupos: completar cuando se confirme el arranque del torneo / cierre de inscripciones.
-- update public.etapas set apertura = '2026-06-XX 00:00-04', cierre = '2026-06-XX 12:00-04' where id = 'grupos';
