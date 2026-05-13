-- Ejecutar en Supabase SQL Editor
-- Crea columnas compatibles para categoria/genero y sincroniza datos existentes

ALTER TABLE public.libros
ADD COLUMN IF NOT EXISTS genero TEXT;

ALTER TABLE public.libros
ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Backfill bidireccional para no perder datos historicos
UPDATE public.libros
SET genero = categoria
WHERE genero IS NULL
  AND categoria IS NOT NULL;

UPDATE public.libros
SET categoria = genero
WHERE categoria IS NULL
  AND genero IS NOT NULL;

-- Vincular libros al usuario autenticado
ALTER TABLE public.libros
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Asegurar clave foranea a auth.users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'libros_user_id_fkey'
  ) THEN
    ALTER TABLE public.libros
    ADD CONSTRAINT libros_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Vincular perfiles al usuario autenticado
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS correo TEXT;

UPDATE public.perfiles p
SET correo = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.correo IS NULL OR p.correo = '');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'perfiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.perfiles
    ADD CONSTRAINT perfiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_perfiles_user_id_unique
  ON public.perfiles(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname IN ('perfiles_select_own', 'perfiles_select_all')
  ) THEN
    DROP POLICY IF EXISTS perfiles_select_own ON public.perfiles;
    DROP POLICY IF EXISTS perfiles_select_all ON public.perfiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname = 'perfiles_select_all'
  ) THEN
    CREATE POLICY perfiles_select_all
      ON public.perfiles
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname = 'perfiles_insert_own'
  ) THEN
    CREATE POLICY perfiles_insert_own
      ON public.perfiles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname = 'perfiles_update_own'
  ) THEN
    CREATE POLICY perfiles_update_own
      ON public.perfiles
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname = 'perfiles_delete_own'
  ) THEN
    CREATE POLICY perfiles_delete_own
      ON public.perfiles
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_libros_user_id ON public.libros(user_id);

-- Activar RLS para aislar datos por usuario
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'libros'
      AND policyname = 'libros_select_own'
  ) THEN
    CREATE POLICY libros_select_own
      ON public.libros
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'libros'
      AND policyname = 'libros_insert_own'
  ) THEN
    CREATE POLICY libros_insert_own
      ON public.libros
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'libros'
      AND policyname = 'libros_update_own'
  ) THEN
    CREATE POLICY libros_update_own
      ON public.libros
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'libros'
      AND policyname = 'libros_delete_own'
  ) THEN
    CREATE POLICY libros_delete_own
      ON public.libros
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
