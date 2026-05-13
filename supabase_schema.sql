-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase

-- 1. Crear la tabla de libros
CREATE TABLE public.libros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    genero TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('Leído', 'Leyendo', 'Pendiente')),
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Seguridad
-- Política para VER LOS LIBROS (solo el dueño puede ver los suyos)
CREATE POLICY "Los usuarios pueden ver sus propios libros" 
ON public.libros FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERTAR LIBROS (solo el dueño puede crear sus registros)
CREATE POLICY "Los usuarios pueden añadir libros a su nombre" 
ON public.libros FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para ACTUALIZAR LIBROS (solo el dueño puede modificarlos)
CREATE POLICY "Los usuarios pueden actualizar sus propios libros" 
ON public.libros FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Política para ELIMINAR LIBROS (solo el dueño puede borrarlos)
CREATE POLICY "Los usuarios pueden borrar sus propios libros" 
ON public.libros FOR DELETE 
USING (auth.uid() = user_id);
