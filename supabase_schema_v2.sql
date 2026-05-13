-- Corre esto en Supabase -> SQL Editor (Para que funcione SIN LOGIN)

-- 1. Eliminar la tabla vieja si la creaste
DROP TABLE IF EXISTS public.libros;

-- 2. Crear la tabla simple sin IDs de usuario (Modo público)
CREATE TABLE public.libros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    paginas INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nota: NO habilitamos RLS. El acceso será totalmente público para leer y escribir desde tu App.