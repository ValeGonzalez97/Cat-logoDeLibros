-- Verificar qué perfiles existen con sus correos
SELECT 
  p.user_id,
  p.correo,
  p.nombre,
  u.email as auth_email
FROM public.perfiles p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.correo;

-- Contar cuántos perfiles hay
SELECT COUNT(*) as total_perfiles FROM public.perfiles;

-- Ver si hay perfiles SIN correo
SELECT user_id, correo, nombre FROM public.perfiles WHERE correo IS NULL OR correo = '';
