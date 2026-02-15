#!/bin/bash

# Script de setup inicial para nuevos clones del repositorio
# Uso: ./setup.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Setup de Luxae Blockchain${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo -e "${RED}   Asegúrate de estar en el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo -e "${YELLOW}   Instala Node.js desde: https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm no está instalado${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm: v$NPM_VERSION${NC}"

# Crear directorios necesarios
echo ""
echo -e "${YELLOW}📁 Creando directorios...${NC}"
mkdir -p logs
mkdir -p api/data
mkdir -p frontend
echo -e "${GREEN}✓ Directorios creados${NC}"

# Crear archivo .gitkeep en api/data si no existe
touch api/data/.gitkeep

# Copiar archivos de ejemplo de configuración
echo ""
echo -e "${YELLOW}📋 Configurando archivos de entorno...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env creado desde .env.example${NC}"
        echo -e "${YELLOW}   ⚠️  Edita .env con tus valores antes de continuar${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example no encontrado, creando .env vacío${NC}"
        touch .env
    fi
else
    echo -e "${GREEN}✓ .env ya existe${NC}"
fi

if [ ! -f "api/.env" ]; then
    if [ -f "api/.env.example" ]; then
        cp api/.env.example api/.env
        echo -e "${GREEN}✓ api/.env creado desde api/.env.example${NC}"
        echo -e "${YELLOW}   ⚠️  Edita api/.env con tus valores antes de continuar${NC}"
    else
        echo -e "${YELLOW}⚠️  api/.env.example no encontrado, creando api/.env vacío${NC}"
        touch api/.env
    fi
else
    echo -e "${GREEN}✓ api/.env ya existe${NC}"
fi

# Instalar dependencias principales
echo ""
echo -e "${YELLOW}📦 Instalando dependencias principales...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias principales instaladas${NC}"

# Instalar dependencias de la API
if [ -d "api" ] && [ -f "api/package.json" ]; then
    echo ""
    echo -e "${YELLOW}📦 Instalando dependencias de la API...${NC}"
    cd api && npm install && cd ..
    echo -e "${GREEN}✓ Dependencias de la API instaladas${NC}"
fi

# Verificar/descargar ethers.min.js
if [ ! -f "frontend/ethers.min.js" ]; then
    echo ""
    echo -e "${YELLOW}📥 Descargando ethers.min.js...${NC}"
    cd frontend
    if command -v curl &> /dev/null; then
        curl -L -o ethers.min.js https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js || {
            echo -e "${YELLOW}⚠️  No se pudo descargar con curl, intentando con wget...${NC}"
            wget -O ethers.min.js https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js || {
                echo -e "${RED}❌ Error: No se pudo descargar ethers.min.js${NC}"
                echo -e "${YELLOW}   Descárgalo manualmente desde:${NC}"
                echo -e "${YELLOW}   https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js${NC}"
                echo -e "${YELLOW}   Y guárdalo en: frontend/ethers.min.js${NC}"
            }
        }
    elif command -v wget &> /dev/null; then
        wget -O ethers.min.js https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js || {
            echo -e "${RED}❌ Error: No se pudo descargar ethers.min.js${NC}"
        }
    else
        echo -e "${YELLOW}⚠️  curl y wget no están disponibles${NC}"
        echo -e "${YELLOW}   Descarga manualmente ethers.min.js desde:${NC}"
        echo -e "${YELLOW}   https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js${NC}"
    fi
    cd ..
    if [ -f "frontend/ethers.min.js" ]; then
        echo -e "${GREEN}✓ ethers.min.js descargado${NC}"
    fi
fi

# Compilar contratos
echo ""
echo -e "${YELLOW}🔨 Compilando contratos...${NC}"
npm run compile || {
    echo -e "${YELLOW}⚠️  La compilación falló, pero puedes continuar${NC}"
    echo -e "${YELLOW}   Ejecuta 'npm run compile' manualmente más tarde${NC}"
}
echo -e "${GREEN}✓ Contratos compilados${NC}"

# Verificar PM2 (opcional)
echo ""
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo -e "${GREEN}✓ PM2 encontrado: v$PM2_VERSION${NC}"
else
    echo -e "${YELLOW}ℹ️  PM2 no está instalado${NC}"
    echo -e "${YELLOW}   Para producción, instala PM2: npm install -g pm2${NC}"
fi

# Resumen final
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup completado exitosamente!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo ""
echo -e "1. ${YELLOW}Configura las variables de entorno:${NC}"
echo -e "   - Edita ${BLUE}.env${NC} con tus valores"
echo -e "   - Edita ${BLUE}api/.env${NC} con tus valores"
echo ""
echo -e "2. ${YELLOW}Para desarrollo local:${NC}"
echo -e "   ${GREEN}npm run dev${NC}          # Inicia todos los servicios"
echo ""
echo -e "3. ${YELLOW}Para producción con PM2:${NC}"
echo -e "   ${GREEN}npm run deploy:pm2${NC}   # Despliega con PM2"
echo ""
echo -e "4. ${YELLOW}Desplegar el contrato:${NC}"
echo -e "   ${GREEN}npm run deploy:local${NC} # Despliega en red local"
echo ""
echo -e "${BLUE}📚 Documentación:${NC}"
echo -e "   - README.md          # Documentación general"
echo -e "   - DEPLOY.md          # Guía de despliegue"
echo -e "   - frontend/README.md # Documentación del frontend"
echo -e "   - api/README.md      # Documentación de la API"
echo ""
