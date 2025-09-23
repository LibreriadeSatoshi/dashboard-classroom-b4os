# Dashboard B4OS - GitHub Classroom

Sistema para sincronizar y visualizar challenges de GitHub Classroom con temática épica LOTR.

## Características

- **Sincronización automática** desde GitHub Classroom
- **Dashboard épico** con tema LOTR y usuarios anónimos
- **Avatares temáticos** (Elfos, Enanos, Hobbits, Rangers, Magos)
- **Identidades anónimas** consistentes y determinísticas
- **Auto-identificación** mediante búsqueda de username real

## Inicio Rápido

### Backend
```bash
pip3 install -r requirements.txt
cp env.example .env  # Configurar Supabase
python3 backend/download_grades_supabase.py
```

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
# Backend (.env)
CLASSROOM_NAME=B4OS-Dev-2025
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_anon_aqui

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### Base de Datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `setup_database.sql` en el SQL Editor

## Stack Tecnológico

**Backend**: Python + Supabase + GitHub CLI  
**Frontend**: Next.js + TypeScript + Tailwind CSS  
**Base de Datos**: PostgreSQL (Supabase)

---

**Bitcoin 4 Open Source** - Programa gratuito de entrenamiento técnico en Bitcoin 🧡