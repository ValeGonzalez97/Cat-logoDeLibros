# Cambios Realizados en "The Curated Shelf"

## Resumen de Cambios (6 May 2026)

### 1. **Actualización de Crear Libro (Frontend)**
- Cambié el campo "Reseña o Notas" → "Descripción del Libro"
- La descripción ahora se guarda como `descripcion` en la tabla `libros`
- Placeholder mejorado: "Describe el contenido, tema principal o un resumen breve del libro..."

**Archivo:** `app/(tabs)/create.tsx`

### 2. **Nuevos Tipos en TypeScript**
Se actualizó `types/database.ts` con:
- **Book Interface:** Simplificada (removida `favorito`, `estado`, `paginas_leidas` — ahora van en `lecturas`)
- **Lectura Interface:** Nueva tabla para guardar información de lecturas:
  - `id`, `libro_id`, `usuario_id`
  - `fecha_inicio`, `fecha_fin` (timestamps)
  - `estado` (pendiente | leyendo | leído)
  - `resena` (texto de la reseña)
  - `calificacion` (0-5 estrellas)
  - `favorito` (boolean)
  - `created_at`, `updated_at`

**Archivo:** `types/database.ts`

### 3. **Nuevos Servicios**
Se agregó `LecturaService` en `services/books.ts` con métodos:
- `getLecturas()` — obtener todas las lecturas del usuario
- `getFavoritoBooks()` — obtener solo libros marcados como favoritos
- `getLecturaByLibroId()` — obtener lectura de un libro específico
- `upsertLectura()` — crear o actualizar lectura
- `updateLectura()` — actualizar lectura existente
- `toggleFavorito()` — marcar/desmarcar como favorito
- `deleteLectura()` — eliminar lectura

**Archivo:** `services/books.ts`

---

## ⚠️ Cambios Necesarios en Supabase (IMPORTANTE)

### Paso 1: Actualizar tabla `libros`
Necesitas agregar la columna `descripcion` a la tabla existente `libros`:

```sql
ALTER TABLE public.libros
ADD COLUMN IF NOT EXISTS descripcion TEXT;
```

**También remover (opcional, pero recomendado para limpiar):**
- Las columnas `paginas_leidas`, `favorito`, `estado`, `fecha_lectura`, `calificacion` que estaban en libros
- Estas ahora van en la tabla `lecturas`

Si tienes datos que quieras migrar, primero cópialos a `lecturas` antes de eliminar las columnas.

### Paso 2: Crear tabla `lecturas`
Ejecuta el script completo en Supabase → SQL Editor:

**Archivo:** `supabase_schema_lecturas.sql`

Este script crea:
- Tabla `lecturas` con todas las columnas necesarias
- Políticas RLS para que cada usuario solo vea sus propias lecturas
- Índices para performance
- Trigger para actualizar `updated_at`

---

## Cómo Aplicar los Cambios en Supabase

1. **Abre Supabase Dashboard** → Tu proyecto
2. **Ve a SQL Editor**
3. **Ejecuta primero:**
   ```sql
   ALTER TABLE public.libros
   ADD COLUMN IF NOT EXISTS descripcion TEXT;
   ```
4. **Luego ejecuta el contenido completo de:** `supabase_schema_lecturas.sql`

---

## Funcionalidad Nueva

### Guardar Lecturas
Cuando un usuario quiera registrar una lectura de un libro:
```typescript
import { LecturaService } from '@/services/books';

await LecturaService.upsertLectura({
  libro_id: 'uuid-del-libro',
  estado: 'leyendo',
  calificacion: 4,
  favorito: false,
  fecha_inicio: new Date().toISOString(),
  resena: 'Gran libro, muy interesante'
});
```

### Obtener Libros Favoritos
```typescript
const favoritos = await LecturaService.getFavoritoBooks();
// Devuelve todas las lecturas donde favorito = true
```

### Marcar como Favorito
```typescript
await LecturaService.toggleFavorito('uuid-de-lectura', true);
```

---

## Notas Importantes

1. **Tabla usuarios:** Necesita existir y estar vinculada a `auth.users`
   - Si no la creaste aún, ejecuta: `supabase_schema_users.sql`

2. **RLS Policies:** Las nuevas políticas en `lecturas` garantizan que cada usuario solo vea sus propias lecturas

3. **Índices:** Se crearon índices en `usuario_id`, `libro_id` y `favorito` para mejor performance

4. **Unique constraint:** No puede haber dos lecturas del mismo usuario para el mismo libro (se usa `upsert`)

---

## Archivos Modificados

- ✅ `app/(tabs)/create.tsx` — Cambiar etiqueta y guardar descripción
- ✅ `types/database.ts` — Nuevos tipos `Lectura`, `CreateLecturaDTO`, `UpdateLecturaDTO`
- ✅ `services/books.ts` — Nuevo `LecturaService`
- ✅ `supabase_schema_lecturas.sql` — **EJECUTAR EN SUPABASE**

---

**Próximos pasos sugeridos:**
1. Ejecuta los scripts SQL en Supabase
2. Crea pantalla de "Mis Lecturas" para ver y editar lecturas
3. Agrega formulario para calificar y escribir reseñas
4. Crea filtro de "Libros Favoritos"
