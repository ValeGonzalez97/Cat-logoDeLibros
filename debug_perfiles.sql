-- Ver todos los perfiles
SELECT 
  user_id,
  correo,
  nombre,
  foto_url
FROM public.perfiles
ORDER BY user_id;

-- Ver usuarios autenticados
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
