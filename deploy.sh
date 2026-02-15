#!/bin/bash

# Script de deploy para producción con PM2
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy de Luxae Blockchain..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm no está instalado.${NC}"
    exit 1
fi

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 no está instalado. Instalando PM2 globalmente...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 instalado${NC}"
else
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓ PM2 encontrado: v$PM2_VERSION${NC}"
fi

# Crear directorio de logs si no existe
mkdir -p logs
echo -e "${GREEN}✓ Directorio de logs creado${NC}"

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Instalar dependencias de la API
if [ -d "api" ]; then
    echo -e "${YELLOW}Instalando dependencias de la API...${NC}"
    cd api && npm install && cd ..
    echo -e "${GREEN}✓ Dependencias de la API instaladas${NC}"
fi

# Compilar contratos
echo -e "${YELLOW}Compilando contratos...${NC}"
npm run compile
echo -e "${GREEN}✓ Contratos compilados${NC}"

# Verificar que ethers.min.js existe en frontend
if [ ! -f "frontend/ethers.min.js" ]; then
    echo -e "${YELLOW}Descargando ethers.min.js...${NC}"
    cd frontend
    curl -o ethers.min.js https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js || {
        echo -e "${RED}Error: No se pudo descargar ethers.min.js${NC}"
        exit 1
    }
    cd ..
    echo -e "${GREEN}✓ ethers.min.js descargado${NC}"
fi

# Detener procesos PM2 existentes si están corriendo
echo -e "${YELLOW}Deteniendo procesos PM2 existentes...${NC}"
pm2 delete all 2>/dev/null || true
echo -e "${GREEN}✓ Procesos anteriores detenidos${NC}"

# Iniciar servicios con PM2
echo -e "${YELLOW}Iniciando servicios con PM2...${NC}"
pm2 start ecosystem.config.js
echo -e "${GREEN}✓ Servicios iniciados${NC}"

# Guardar configuración de PM2
pm2 save
echo -e "${GREEN}✓ Configuración de PM2 guardada${NC}"

# Configurar PM2 para iniciar al arrancar el sistema
echo -e "${YELLOW}Configurando PM2 para iniciar al arrancar el sistema...${NC}"
pm2 startup | tail -1 | sudo bash || {
    echo -e "${YELLOW}Nota: Si el comando anterior falló, ejecuta manualmente:${NC}"
    echo "pm2 startup"
}
echo -e "${GREEN}✓ PM2 configurado para iniciar al arrancar${NC}"

# Mostrar estado
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Estado de los servicios:"
pm2 status
echo ""
echo "Para ver los logs:"
echo "  pm2 logs luxae-frontend"
echo "  pm2 logs luxae-hardhat-node"
echo ""
echo "Para reiniciar los servicios:"
echo "  pm2 restart all"
echo ""
echo "Para detener los servicios:"
echo "  pm2 stop all"
echo ""
echo "Frontend disponible en: http://localhost:3000"
echo "API disponible en: http://localhost:3001"
echo "Hardhat Node disponible en: http://localhost:8545"
echo ""
echo "Para ver los logs de todos los servicios:"
echo "  pm2 logs"
echo ""
echo "Para ver logs de un servicio específico:"
echo "  pm2 logs luxae-frontend"
echo "  pm2 logs luxae-api"
echo "  pm2 logs luxae-hardhat-node"
echo ""