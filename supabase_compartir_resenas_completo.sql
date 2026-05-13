-- Script completo para habilitar compartir reseñas entre usuarios
-- Ejecuta todo esto en el SQL Editor de Supabase

-- 1. Crear tabla de reseñas compartidas
CREATE TABLE IF NOT EXISTS public.resenas_compartidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receptor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  libro_id UUID NOT NULL REFERENCES public.libros(id) ON DELETE CASCADE,
  resena TEXT NOT NULL,
  view_count INT NOT NULL DEFAULT 0,
  first_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_resenas_compartidas_emisor_id 
  ON public.resenas_compartidas(emisor_id);

CREATE INDEX IF NOT EXISTS idx_resenas_compartidas_receptor_id 
  ON public.resenas_compartidas(receptor_id);

CREATE INDEX IF NOT EXISTS idx_resenas_compartidas_libro_id 
  ON public.resenas_compartidas(libro_id);

-- 3. Habilitar Row Level Security
ALTER TABLE public.resenas_compartidas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS

-- El emisor puede ver sus propias reseñas compartidas
DROP POLICY IF EXISTS "Emisor ve sus reseñas compartidas" ON public.resenas_compartidas;
CREATE POLICY "Emisor ve sus reseñas compartidas"
  ON public.resenas_compartidas
  FOR SELECT
  USING (auth.uid() = emisor_id);

-- El receptor puede ver las reseñas compartidas con él
DROP POLICY IF EXISTS "Receptor ve sus reseñas compartidas" ON public.resenas_compartidas;
CREATE POLICY "Receptor ve sus reseñas compartidas"
  ON public.resenas_compartidas
  FOR SELECT
  USING (auth.uid() = receptor_id);

-- Los usuarios pueden compartir reseñas
DROP POLICY IF EXISTS "Usuarios comparten reseñas" ON public.resenas_compartidas;
CREATE POLICY "Usuarios comparten reseñas"
  ON public.resenas_compartidas
  FOR INSERT
  WITH CHECK (auth.uid() = emisor_id);

-- El receptor puede marcar como leído
DROP POLICY IF EXISTS "Receptor marca como leído" ON public.resenas_compartidas;
CREATE POLICY "Receptor marca como leído"
  ON public.resenas_compartidas
  FOR UPDATE
  USING (auth.uid() = receptor_id)
  WITH CHECK (auth.uid() = receptor_id);

GRANT ALL ON public.resenas_compartidas TO authenticated;

-- Verificación (opcional): Ver cuántas reseñas compartidas existen
-- SELECT COUNT(*) FROM public.resenas_compartidas;
