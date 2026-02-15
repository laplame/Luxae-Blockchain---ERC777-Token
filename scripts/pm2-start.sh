#!/bin/bash

# Script para iniciar servicios con PM2
# Uso: ./scripts/pm2-start.sh

set -e

echo "🚀 Iniciando servicios Luxae con PM2..."

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "Error: PM2 no está instalado. Ejecuta: npm install -g pm2"
    exit 1
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar servicios
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

echo "✅ Servicios iniciados"
pm2 status
