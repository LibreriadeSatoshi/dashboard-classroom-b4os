#!/bin/bash

echo "🚀 Configurando Dashboard B4OS - GitHub Classroom + Supabase"
echo "============================================================"

# Verificar dependencias
echo "📋 Verificando dependencias..."

# Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

echo "✅ Dependencias verificadas"

# Configurar Frontend
echo "⚛️  Configurando frontend..."
cd frontend

if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cp env.local.example .env.local
    echo "⚠️  Por favor edita .env.local con tus credenciales de Supabase"
fi

npm install

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tus credenciales en frontend/.env.local"
echo "2. Ejecuta setup_database.sql en Supabase"
echo "3. Ejecuta: cd frontend && npm run dev"
echo ""
echo "🌐 Dashboard: http://localhost:3000"
echo "📊 Base de datos: b4os-alumni-results"
