# 🔧 Configuración de Supabase - Instrucciones

## Paso 1: Obtener tu Connection String de Supabase

1. Ve a tu proyecto en Supabase: https://app.supabase.com/
2. En el menú lateral, haz clic en **"Project Settings"** (ícono de engranaje)
3. Haz clic en **"Database"**
4. Busca la sección **"Connection string"**
5. Selecciona la pestaña **"URI"**
6. Copia la cadena de conexión que se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
7. **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con la contraseña de tu proyecto

## Paso 2: Crear el archivo .env

1. En la carpeta raíz del proyecto (`c:\Users\18322\Documents\GitHub\wquinterod`), crea un archivo llamado `.env`
2. Copia y pega el siguiente contenido:

```env
# Database - Supabase Connection
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-aleatoria-minimo-32-caracteres-aqui"

# App
NODE_ENV="development"
```

3. Reemplaza:
   - `[TU-PASSWORD]` con la contraseña de tu base de datos Supabase
   - `[TU-PROJECT-REF]` con la referencia de tu proyecto (ejemplo: `abcdefghijklmnop`)
   - `tu-clave-secreta-aleatoria-minimo-32-caracteres-aqui` con cualquier texto aleatorio largo

## Paso 3: Ejemplo de .env completo

```env
DATABASE_URL="postgresql://postgres:MiPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="este-es-un-secreto-super-aleatorio-y-largo-para-nextauth-2024"
NODE_ENV="development"
```

## 📝 Notas Importantes

- **NO compartas** tu archivo `.env` con nadie (contiene tu contraseña)
- El archivo `.env` ya está en `.gitignore` para protegerlo
- Si olvidas tu contraseña de Supabase, puedes resetearla en Project Settings > Database

## ✅ Verificar la Conexión

Una vez que hayas creado el archivo `.env`, ejecuta:

```bash
npm run prisma:generate
```

Si no hay errores, la conexión está correcta.

## 🆘 ¿Problemas?

Si ves errores de conexión:
1. Verifica que la contraseña sea correcta
2. Asegúrate de que no haya espacios extra en el `.env`
3. Verifica que la URL esté entre comillas dobles
4. Comprueba que tu proyecto de Supabase esté activo
