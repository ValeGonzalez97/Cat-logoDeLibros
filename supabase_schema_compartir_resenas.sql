-- Ejecuta este script en Supabase SQL Editor
-- Objetivo: permitir compartir reseñas con otros usuarios de la app
-- Usamos un nombre sin acentos para evitar problemas de schema cache en Supabase

create extension if not exists pgcrypto;

-- Usamos public.perfiles como directorio de contactos
-- Debe existir la columna user_id y, opcionalmente, correo/foto_url/nombre.

create table if not exists public.resenas_compartidas (
  id uuid primary key default gen_random_uuid(),
  emisor_id uuid not null references auth.users(id) on delete cascade,
  receptor_id uuid not null references auth.users(id) on delete cascade,
  libro_id uuid not null references public.libros(id) on delete cascade,
  resena text not null,
  view_count int not null default 0,
  first_read_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.resenas_compartidas enable row level security;

drop policy if exists "Emisor ve sus resenas compartidas" on public.resenas_compartidas;
create policy "Emisor ve sus reseñas compartidas"
on public.resenas_compartidas
for select
using (auth.uid() = emisor_id);

drop policy if exists "Receptor ve sus resenas compartidas" on public.resenas_compartidas;
create policy "Receptor ve sus reseñas compartidas"
on public.resenas_compartidas
for select
using (auth.uid() = receptor_id);

drop policy if exists "Usuarios comparten resenas" on public.resenas_compartidas;
create policy "Usuarios comparten resenas"
on public.resenas_compartidas
for insert
with check (auth.uid() = emisor_id);

drop policy if exists "Receptor marca como leido" on public.resenas_compartidas;
create policy "Receptor marca como leido"
on public.resenas_compartidas
for update
using (auth.uid() = receptor_id)
with check (auth.uid() = receptor_id);
