# Cambios realizados para mostrar portadas de libros

## Problema
Las portadas de libros no se mostraban en la galería porque se intentaba guardarlas como datos base64 incrustados (`data:image/jpeg;base64,...`), lo cual no es compatible con el componente `Image` de React Native.

## Solución implementada
Se cambió la estrategia para subir las imágenes a **Supabase Storage** en lugar de guardarlas como base64 incrustado.

### Cambios en los archivos:

#### 1. `app/(tabs)/create.tsx`
- Agregado: `import * as FileSystem from 'expo-file-system'`
- Modificado `pickImage()`: Ahora guarda la URI de la imagen en lugar de base64
- Agregado `uploadPortadaImage()`: Sube la imagen a Supabase Storage y retorna la URL pública
- Modificado `handleSubmit()`: Llama a `uploadPortadaImage()` antes de crear el libro

#### 2. `app/edit/[id].tsx`
- Agregado: `import * as FileSystem from 'expo-file-system'`
- Agregado: `import { supabase } from '@/lib/supabase'`
- Modificado `pickCover()`: Ahora guarda la URI en lugar de base64
- Agregado `uploadPortadaImage()`: Similar a create.tsx pero con validación para URLs existentes
- Modificado `handleUpdate()`: Sube la imagen si fue seleccionada

#### 3. `services/books.ts`
- Agregado logs detallados para rastrear el flujo de guardado de portada_url
- Mostrará los campos retornados por Supabase para verificar que portada_url viene correctamente

#### 4. `app/(tabs)/index.tsx`
- Agregado logs para verificar que portada_url viene en los datos recuperados

## Instrucciones de configuración

### Paso 1: Crear el bucket en Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Storage** en el menú lateral
4. Haz clic en **Create a new bucket**
5. Rellena:
   - **Name**: `book-covers`
   - **Public bucket**: ✅ Selecciona esta opción (para que las imágenes sean accesibles públicamente)
6. Haz clic en **Create**

### Paso 2: Verificar RLS (Row-Level Security) si es necesario

En Storage > book-covers > Policies, puedes dejar el acceso público o configurar restricciones si lo necesitas.

### Paso 3: Probar la aplicación

1. Ejecuta la app: `npm start`
2. Crea un nuevo libro y selecciona una imagen
3. Verifica en la consola que `[CreateBook] Upload successful` aparece con una URL de Supabase
4. Navega a la galería y verifica que la portada se muestra

## Cómo funciona

1. Usuario selecciona una imagen en create.tsx o edit/[id].tsx
2. Se lee el archivo local como base64 usando FileSystem
3. Se convierte el base64 a Blob
4. Se sube el Blob a Supabase Storage en `book-covers/portadas/{userId}/{timestamp}.jpg`
5. Se obtiene la URL pública de Supabase
6. Se guarda la URL en el campo `portada_url` de la BD
7. El componente `Image` en index.tsx renderiza la imagen usando la URL pública

## Ventajas de este enfoque

✅ Las imágenes se almacenan en Supabase Storage (no en la BD como blob)
✅ URLs públicas accesibles desde cualquier navegador
✅ Compatible con React Native en web, iOS y Android
✅ Escalabilidad: las imágenes no aumentan el tamaño de la BD
✅ Performance: CDN de Supabase entrega las imágenes rápidamente

## Logs para verificar

En la consola de desarrollador, busca:
- `[CreateBook] Upload successful, public URL:` - Confirmación de subida exitosa
- `[HomeScreen] First book portada_url:` - Verificación de que la URL viene desde la BD
- `[HomeScreen] First book keys:` - Muestra todos los campos que vienen del libro
