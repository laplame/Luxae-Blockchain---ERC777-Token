#!/bin/bash

# Script para detener servicios con PM2
# Uso: ./scripts/pm2-stop.sh

set -e

echo "🛑 Deteniendo servicios Luxae..."

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "Error: PM2 no está instalado."
    exit 1
fi

# Detener servicios
pm2 stop all

echo "✅ Servicios detenidos"
