# Configuración de Supabase Storage

## Pasos para configurar el bucket de portadas

Para que las imágenes se carguen correctamente, necesitas crear un bucket en Supabase Storage:

### 1. Ve al Dashboard de Supabase
- Inicia sesión en https://supabase.com/dashboard
- Selecciona tu proyecto

### 2. Crea el bucket `book-covers`
- Ve a Storage (en el menú lateral)
- Haz clic en "Create a new bucket"
- Nombre: `book-covers`
- Selecciona "Public bucket" para permitir acceso público a las imágenes
- Haz clic en Create

### 3. Opcional: Configura políticas de acceso (RLS)
Si necesitas restricciones adicionales:
- Ve a Storage > Policies (en el bucket book-covers)
- Configura las políticas según necesites

## Verificar que funciona
- Las imágenes se subirán a: `book-covers/portadas/{userId}/{timestamp}.jpg`
- Las URLs serán públicas y accesibles sin autenticación
