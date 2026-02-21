#!/bin/bash

# Script para iniciar el nodo de blockchain personalizado de Luxae
# Este script configura y ejecuta un nodo Geth personalizado con parámetros de gas y stake

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BLOCKCHAIN_DIR="$PROJECT_ROOT/blockchain"
DATA_DIR="$BLOCKCHAIN_DIR/data"
LOG_DIR="$PROJECT_ROOT/logs"

# Crear directorios si no existen
mkdir -p "$DATA_DIR"
mkdir -p "$LOG_DIR"

echo -e "${GREEN}🚀 Iniciando Luxae Blockchain Node...${NC}"

# Verificar si Geth está instalado
if ! command -v geth &> /dev/null; then
    echo -e "${YELLOW}⚠️  Geth no está instalado.${NC}"
    echo -e "${YELLOW}Instalando Geth...${NC}"
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Instalando Geth para Linux..."
        # Ubuntu/Debian
        sudo add-apt-repository -y ppa:ethereum/ethereum || true
        sudo apt-get update
        sudo apt-get install -y ethereum
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Instalando Geth para macOS..."
        if command -v brew &> /dev/null; then
            brew tap ethereum/ethereum
            brew install ethereum
        else
            echo -e "${RED}Error: Homebrew no está instalado. Instala Homebrew primero.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Error: Sistema operativo no soportado. Instala Geth manualmente.${NC}"
        exit 1
    fi
fi

GETH_VERSION=$(geth version | head -1)
echo -e "${GREEN}✓ Geth encontrado: $GETH_VERSION${NC}"

# Cargar configuración
if [ -f "$BLOCKCHAIN_DIR/config.json" ]; then
    echo -e "${GREEN}✓ Configuración cargada desde config.json${NC}"
    CHAIN_ID=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.chainId)")
    GAS_LIMIT=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.gasConfig.gasLimit)")
    BASE_FEE=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.gasConfig.baseFeePerGas)")
else
    echo -e "${YELLOW}⚠️  config.json no encontrado, usando valores por defecto${NC}"
    CHAIN_ID=1337
    GAS_LIMIT=30000000
    BASE_FEE=1000000000
fi

# Verificar si el genesis block existe
if [ ! -f "$BLOCKCHAIN_DIR/genesis.json" ]; then
    echo -e "${RED}Error: genesis.json no encontrado en $BLOCKCHAIN_DIR${NC}"
    exit 1
fi

# Inicializar blockchain si no está inicializada
if [ ! -d "$DATA_DIR/geth" ]; then
    echo -e "${YELLOW}Inicializando blockchain...${NC}"
    geth --datadir "$DATA_DIR" init "$BLOCKCHAIN_DIR/genesis.json"
    echo -e "${GREEN}✓ Blockchain inicializada${NC}"
fi

# Crear cuenta si no existe
if [ ! -f "$DATA_DIR/keystore" ] || [ -z "$(ls -A $DATA_DIR/keystore 2>/dev/null)" ]; then
    echo -e "${YELLOW}Creando cuenta inicial...${NC}"
    echo "" | geth --datadir "$DATA_DIR" account new 2>/dev/null || true
fi

# Obtener puertos de la configuración
RPC_PORT=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.network.rpcPort || 8545)" 2>/dev/null || echo "8545")
WS_PORT=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.network.wsPort || 8546)" 2>/dev/null || echo "8546")
P2P_PORT=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.network.p2pPort || 30303)" 2>/dev/null || echo "30303")
HOSTNAME=$(node -e "const config = require('$BLOCKCHAIN_DIR/config.json'); console.log(config.network.hostname || '0.0.0.0')" 2>/dev/null || echo "0.0.0.0")

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}Configuración de Luxae Blockchain:${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo "Chain ID: $CHAIN_ID"
echo "Gas Limit: $GAS_LIMIT"
echo "Base Fee: $BASE_FEE"
echo "RPC Port: $RPC_PORT"
echo "WS Port: $WS_PORT"
echo "P2P Port: $P2P_PORT"
echo "Data Dir: $DATA_DIR"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""

# Iniciar nodo Geth
echo -e "${GREEN}Iniciando nodo Geth...${NC}"
geth \
    --datadir "$DATA_DIR" \
    --networkid $CHAIN_ID \
    --http \
    --http.addr "$HOSTNAME" \
    --http.port $RPC_PORT \
    --http.api "eth,net,web3,personal,admin,miner,txpool" \
    --http.corsdomain "*" \
    --ws \
    --ws.addr "$HOSTNAME" \
    --ws.port $WS_PORT \
    --ws.api "eth,net,web3,personal,admin,miner,txpool" \
    --ws.origins "*" \
    --allow-insecure-unlock \
    --unlock "0" \
    --password <(echo "") \
    --mine \
    --miner.threads 1 \
    --miner.etherbase "0x0000000000000000000000000000000000000001" \
    --miner.gaslimit $GAS_LIMIT \
    --miner.gasprice $BASE_FEE \
    --nodiscover \
    --maxpeers 0 \
    --verbosity 3 \
    2>&1 | tee "$LOG_DIR/blockchain-node.log"
