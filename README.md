# Dashboard B4OS - GitHub Classroom

Sistema para sincronizar y visualizar challenges de GitHub Classroom con temática épica LOTR.

## Características

- **Dashboard épico** con tema LOTR y usuarios anónimos
- **Avatares temáticos** (Elfos, Enanos, Hobbits, Rangers, Magos)
- **Identidades anónimas** consistentes y determinísticas
- **Auto-identificación** mediante búsqueda de username real

## Inicio Rápido

### Frontend
```bash
cd frontend
npm install
cp env.local.example .env.local  # Configurar Supabase
npm run dev
```

## Temática LOTR

### Sistema de Anonimización
- **Nombres épicos**: `ElfRivendell_Star42A`, `DwarfErebor_Fire88C`
- **Determinísticos**: Mismo username = mismo nombre anónimo
- **Únicos**: Cada usuario tiene identidad única
- **Búsqueda**: Los usuarios pueden encontrar su alias buscando su username real

### Avatares Temáticos
- 🧝‍♂️ **Elfos**: Azules etéreos y violetas místicos
- 🏔️ **Enanos**: Oros cálidos y rojos de forja  
- 🌿 **Hobbits**: Verdes naturales de la Comarca
- 👑 **Rangers**: Colores nobles y reales
- 🧙‍♂️ **Magos**: Púrpuras mágicos

## Configuración

### Variables de Entorno
```env
# Frontend (.env.local)
# IMPORTANTE: NO usar prefijo NEXT_PUBLIC_ para evitar exposición de credenciales
# Estas variables solo se usan en rutas de API del servidor
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon_aqui
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_nextauth_secret
```

### Base de Datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Configurar las tablas necesarias:
   - `students` (github_username, updated_at)
   - `assignments` (id, name, points_available, updated_at)
   - `grades` (id, github_username, assignment_name, points_awarded, updated_at)
   - `consolidated_grades` (vista consolidada)
   - `authorized_users` (github_username, role)
   - `user_privacy` (github_username, show_real_name, updated_at)

## Stack Tecnológico

**Frontend**: Next.js + TypeScript + Tailwind CSS  
**Base de Datos**: PostgreSQL (Supabase)

---

**Bitcoin 4 Open Source** - Programa gratuito de entrenamiento técnico en Bitcoin 🧡