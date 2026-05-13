-- Ejecuta esto en el SQL Editor de Supabase para agregar los nuevos campos

ALTER TABLE public.libros 
ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'leyendo', 'leído')),
ADD COLUMN IF NOT EXISTS fecha_lectura DATE,
ADD COLUMN IF NOT EXISTS calificacion INTEGER NOT NULL DEFAULT 0 CHECK (calificacion >= 0 AND calificacion <= 5);
