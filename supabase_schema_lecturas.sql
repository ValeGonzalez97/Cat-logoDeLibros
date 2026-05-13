-- Ejecuta este script en Supabase SQL Editor
-- Objetivo: crear tabla lecturas para guardar información de lecturas de libros

-- Ensure extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Tabla de Lecturas
create table if not exists public.lecturas (
  id uuid primary key default gen_random_uuid(),
  libro_id uuid not null,
  usuario_id uuid not null,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'leyendo', 'leido')),
  resena text,
  calificacion integer not null default 0 check (calificacion >= 0 and calificacion <= 5),
  favorito boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(libro_id, usuario_id)
);

alter table public.lecturas
  drop constraint if exists lecturas_libro_id_fkey,
  drop constraint if exists lecturas_usuario_id_fkey;

alter table public.lecturas
  add constraint lecturas_libro_id_fkey
  foreign key (libro_id)
  references public.libros(id)
  on delete cascade;

alter table public.lecturas
  add constraint lecturas_usuario_id_fkey
  foreign key (usuario_id)
  references public.usuarios(id)
  on delete cascade;

-- Habilitar RLS
alter table public.lecturas enable row level security;

-- Política: Los usuarios solo ven sus propias lecturas
drop policy if exists "Usuarios ven sus lecturas" on public.lecturas;
create policy "Usuarios ven sus lecturas"
on public.lecturas
for select
using (auth.uid() = usuario_id);

-- Política: Los usuarios pueden crear sus propias lecturas
drop policy if exists "Usuarios crean lecturas" on public.lecturas;
create policy "Usuarios crean lecturas"
on public.lecturas
for insert
with check (auth.uid() = usuario_id);

-- Política: Los usuarios pueden actualizar sus propias lecturas
drop policy if exists "Usuarios actualizan lecturas" on public.lecturas;
create policy "Usuarios actualizan lecturas"
on public.lecturas
for update
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

-- Política: Los usuarios pueden eliminar sus propias lecturas
drop policy if exists "Usuarios eliminan lecturas" on public.lecturas;
create policy "Usuarios eliminan lecturas"
on public.lecturas
for delete
using (auth.uid() = usuario_id);

-- Trigger para actualizar updated_at
drop trigger if exists lecturas_set_updated_at on public.lecturas;
create trigger lecturas_set_updated_at
before update on public.lecturas
for each row
execute function public.set_updated_at();

-- Crear índices para performance
create index if not exists idx_lecturas_usuario_id on public.lecturas(usuario_id);
create index if not exists idx_lecturas_libro_id on public.lecturas(libro_id);
create index if not exists idx_lecturas_favorito on public.lecturas(usuario_id, favorito) where favorito = true;
