-- Ejecuta este script en Supabase SQL Editor
-- Objetivo: crear una tabla de usuarios en la nube, enlazada con auth.users

create extension if not exists pgcrypto;

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text,
  descripcion text,
  gustos text,
  foto_url text,
  proveedor text not null default 'email',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.usuarios enable row level security;

-- Cada usuario solo puede ver su propio registro
drop policy if exists "Usuarios pueden ver su perfil" on public.usuarios;
create policy "Usuarios pueden ver su perfil"
on public.usuarios
for select
using (auth.uid() = id);

-- Cada usuario solo puede insertar su propio registro
drop policy if exists "Usuarios pueden crear su perfil" on public.usuarios;
create policy "Usuarios pueden crear su perfil"
on public.usuarios
for insert
with check (auth.uid() = id);

-- Cada usuario solo puede actualizar su propio registro
drop policy if exists "Usuarios pueden actualizar su perfil" on public.usuarios;
create policy "Usuarios pueden actualizar su perfil"
on public.usuarios
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Actualiza updated_at en cada modificación
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists usuarios_set_updated_at on public.usuarios;
create trigger usuarios_set_updated_at
before update on public.usuarios
for each row
execute function public.set_updated_at();

-- Crea automáticamente la fila del usuario al registrarse en Auth
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre, proveedor)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.app_metadata->>'provider', 'email')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    proveedor = excluded.proveedor,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Opcional: sincronizar usuarios ya existentes en auth.users
insert into public.usuarios (id, email, nombre, proveedor)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as nombre,
  coalesce(u.app_metadata->>'provider', 'email') as proveedor
from auth.users u
on conflict (id) do nothing;
