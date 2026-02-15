#!/bin/bash

# Script para reiniciar servicios con PM2
# Uso: ./scripts/pm2-restart.sh

set -e

echo "🔄 Reiniciando servicios Luxae..."

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "Error: PM2 no está instalado."
    exit 1
fi

# Reiniciar servicios
pm2 restart all

# Guardar configuración
pm2 save

echo "✅ Servicios reiniciados"
pm2 status
