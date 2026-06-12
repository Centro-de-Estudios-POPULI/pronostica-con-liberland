# Backend Supabase — Quiniela Stanley

La página sigue alojada en **GitHub Pages**. Supabase solo guarda los datos
(participantes + pronósticos) y resuelve login (magic link), reglas (cierre por
fecha, una entrada por CI) y el ranking (SQL).

## 1. Crear el proyecto
1. Entrá a https://supabase.com → **Sign in** (con GitHub o email).
2. **New project** → nombre `quiniela-stanley`, elegí región (South America / São Paulo es la más cercana), poné una contraseña de base de datos y guardala.
3. Esperá ~2 min a que se aprovisione.

## 2. Crear el esquema
1. En el proyecto → menú izquierdo **SQL Editor** → **New query**.
2. Pegá TODO el contenido de [`schema.sql`](./schema.sql) y dale **Run**.
3. En **Table Editor** deberías ver: `participantes`, `pron_grupos`, `pron_partidos`, `resultados_grupos`, `resultados_partidos`, `etapas`, `config`, y la vista `ranking`.

## 3. Activar el login por magic link
1. **Authentication → Providers → Email**: dejá habilitado **Email**.
2. Activá **Magic Link** (sin contraseña). Opcional: desactivar "Confirm email" para que el primer clic ya entre.
3. **Authentication → URL Configuration → Site URL**: poné la URL del sitio
   `https://stanley1913bolivia.github.io/pronostica-con-stanley/`
   y agregala también en **Redirect URLs**.

## 4. Comprobantes (Storage)
1. **Storage → New bucket** → nombre `comprobantes`.
2. Dejalo **privado** (los comprobantes son datos personales). Subiremos cada
   archivo desde el front y guardaremos su ruta en `participantes.comprobante_url`.

## 5. Copiar las claves para el front
**Settings → API**:
- **Project URL** → ej. `https://xxxxxxxx.supabase.co`
- **anon public key** → clave pública (segura para el navegador; RLS protege los datos)

> Pasame esos dos valores y los conecto en el sitio.
> La **service_role key** (también en esa pantalla) es **secreta**: NO va nunca
> en el sitio público. Solo se usa para cargar resultados / tareas de admin.

## 6. (Más adelante) Cargar fechas de cierre
Cuando tengas las fechas reales, se actualizan en la tabla `etapas` (columnas
`apertura`/`cierre`). Mientras `cierre` sea `null`, la etapa queda **abierta**.
Ejemplo:
```sql
update public.etapas set apertura = '2026-06-11 12:00-04', cierre = '2026-07-01 18:00-04' where id = 'grupos';
```

## Puntaje (editable)
Los valores de puntos viven en la tabla `config` y se cambian sin tocar código:
`pts_clasificado`, `pts_puesto_exacto`, `pts_avanza`, `pts_marcador_exacto`.

## Cómo se calcula el ranking
La vista `ranking` cruza los pronósticos contra `resultados_grupos` /
`resultados_partidos` (lo que cargás como real) y suma según `config`. Expone
solo `nombre`, `ciudad` y `puntos` (sin datos personales). Se consulta:
```sql
select * from public.ranking limit 50;
```
