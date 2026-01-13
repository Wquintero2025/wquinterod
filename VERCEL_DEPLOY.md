# 🚀 Guía de Despliegue en Vercel - Paso a Paso

## ✅ PASO 1: Subir el Código a GitHub

### 1.1 Agregar todos los archivos
Abre PowerShell en la carpeta del proyecto y ejecuta:

```bash
git add .
```

### 1.2 Hacer commit
```bash
git commit -m "Church Management System - Complete implementation"
```

### 1.3 Subir a GitHub
```bash
git push origin main
```

**✅ Listo:** Tu código ahora está en GitHub en: https://github.com/Wquintero2025/wquinterod

---

## ✅ PASO 2: Preparar Supabase

### 2.1 Obtener tu Connection String

1. Ve a: **https://app.supabase.com/**
2. Abre tu proyecto
3. Click en **"Project Settings"** (⚙️ icono de engranaje en el menú lateral)
4. Click en **"Database"**
5. Busca la sección **"Connection string"**
6. Selecciona la pestaña **"URI"**
7. **COPIA** la cadena completa (se ve así):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
8. **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con tu contraseña real

**Ejemplo de cómo se ve:**
```
postgresql://postgres.abcdef:MiPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**📋 Guarda esta cadena en un lugar seguro** (la necesitarás en el siguiente paso)

---

## ✅ PASO 3: Desplegar en Vercel

### 3.1 Crear cuenta en Vercel

1. Ve a: **https://vercel.com/**
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tu GitHub

### 3.2 Importar tu proyecto

1. En el dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio: **"wquinterod"**
3. Click en **"Import"**

### 3.3 Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Next.js. Ahora configura las variables de entorno:

1. Busca la sección **"Environment Variables"**
2. Agrega estas 3 variables (una por una):

**Variable 1:**
- **Name:** `DATABASE_URL`
- **Value:** Tu connection string de Supabase (la que copiaste en el Paso 2)
- Click en **"Add"**

**Variable 2:**
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://tu-proyecto.vercel.app` (Vercel te mostrará la URL, o usa cualquier nombre temporal)
- Click en **"Add"**

**Variable 3:**
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `mi-secreto-super-aleatorio-para-produccion-2024-seguro-minimo-32-caracteres`
- Click en **"Add"**

### 3.4 Desplegar

1. Click en **"Deploy"**
2. **Espera 2-3 minutos** mientras Vercel:
   - Instala las dependencias
   - Ejecuta Prisma
   - Construye el proyecto
   - Lo despliega

### 3.5 Ver tu aplicación

1. Cuando termine, verás **"Congratulations!"** 🎉
2. Click en **"Visit"** o en la URL que aparece
3. Tu aplicación estará en: `https://wquinterod.vercel.app` (o similar)

---

## ✅ PASO 4: Configurar la Base de Datos

**IMPORTANTE:** Después del primer deploy, necesitas ejecutar las migraciones de Prisma.

### Opción A: Desde Vercel (Más fácil)

1. En tu proyecto de Vercel, ve a **"Settings"** → **"Functions"**
2. Agrega un script de build personalizado (Vercel ejecutará Prisma automáticamente)

### Opción B: Desde tu computadora (Si ya tienes Node.js)

```bash
# Instalar dependencias
npm install

# Crear archivo .env local con tu DATABASE_URL
# Luego ejecutar:
npx prisma migrate deploy
npx prisma db seed
```

### Opción C: Desde Supabase SQL Editor (Más directo)

1. Ve a Supabase → **"SQL Editor"**
2. Copia el contenido del archivo `prisma/migrations/` y ejecútalo
3. Luego ejecuta el seed manualmente

---

## ✅ PASO 5: Probar tu Aplicación

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver la página de login
3. **Credenciales de prueba:**
   - Email: `admin@church.com`
   - Password: `password`

**⚠️ NOTA:** Si ves errores de base de datos, es porque faltan las migraciones. Sigue el Paso 4.

---

## 🎯 Resumen de URLs Importantes

- **Tu App:** https://wquinterod.vercel.app (o la que Vercel te asigne)
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com/
- **GitHub Repo:** https://github.com/Wquintero2025/wquinterod

---

## 🆘 Solución de Problemas

### Error: "Database connection failed"
- Verifica que el `DATABASE_URL` en Vercel sea correcto
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Revisa que tu proyecto de Supabase esté activo

### Error: "Table does not exist"
- Necesitas ejecutar las migraciones de Prisma (ver Paso 4)

### Error: "Invalid credentials" al hacer login
- Necesitas ejecutar el seed de la base de datos (ver Paso 4, Opción B)

### La página no carga
- Espera unos minutos, Vercel puede tardar en propagar los cambios
- Revisa los logs en Vercel Dashboard → tu proyecto → "Deployments" → click en el deployment → "Logs"

---

## 📞 Siguiente Paso

**Empieza por el PASO 1** (subir código a GitHub) y avísame cuando lo hayas completado para continuar con el siguiente paso.

¿Listo para empezar? 🚀
