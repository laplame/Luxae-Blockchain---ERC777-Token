# Luxae Blockchain - Blockchain Personalizada con Control de Gas y Staking

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

Una blockchain personalizada basada en Ethereum con control total sobre gas, sistema de staking Proof-of-Stake, y ecosistema completo de tokens ERC777.

## 🎯 Visión General

Luxae Blockchain es una blockchain independiente que ofrece:

- ✅ **Control Total de Gas**: Configuración personalizada de precios, límites y dinámica
- ✅ **Sistema de Staking**: Proof-of-Stake con validadores y delegadores
- ✅ **Token ERC777**: Token avanzado con operadores y hooks
- ✅ **API Completa**: Endpoints para contratos, cupones, tokens, swaps y transferencias
- ✅ **Frontend Interactivo**: Interfaz web para gestionar tokens y staking
- ✅ **Compatibilidad EVM**: Contratos Solidity funcionan sin modificaciones

## 🏗️ Arquitectura Tecnológica

### Stack Tecnológico

**Blockchain Layer:**
- **Geth (Go-Ethereum)**: Cliente de blockchain modificado con parámetros personalizados
- **Hardhat**: Framework de desarrollo para contratos inteligentes
- **Solidity 0.8.20**: Lenguaje de programación para contratos
- **EVM (Ethereum Virtual Machine)**: Máquina virtual compatible con Ethereum

**Smart Contracts:**
- **LuxaeToken (ERC777)**: Token principal con características avanzadas
- **StakingContract**: Sistema de staking Proof-of-Stake
- **ERC1820Registry**: Registro para compatibilidad ERC777

**Backend:**
- **Node.js + Express**: Servidor API REST
- **Ethers.js**: Biblioteca para interactuar con blockchain
- **PM2**: Gestión de procesos en producción

**Frontend:**
- **HTML/CSS/JavaScript**: Interfaz web moderna
- **Ethers.js**: Conexión con wallets y contratos
- **MetaMask**: Integración con wallets

### ¿Cómo Funciona la Blockchain?

Luxae Blockchain utiliza una arquitectura híbrida:

1. **Nodo Blockchain Personalizado**: 
   - Basado en Geth (cliente oficial de Ethereum)
   - Parámetros de consenso personalizados
   - Control de gas y límites configurables
   - Genesis block personalizado

2. **Consenso Proof-of-Stake**:
   - Validadores hacen stake de tokens LUXAE
   - Delegadores pueden delegar su stake
   - Recompensas distribuidas proporcionalmente
   - Período de unbonding para seguridad

3. **Compatibilidad EVM**:
   - Todos los contratos Solidity funcionan
   - Herramientas de Ethereum compatibles
   - Wallets estándar (MetaMask, etc.)

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** v16 o superior
- **npm** v7 o superior
- **Git**
- **Geth** (se instala automáticamente con el script)

### Instalación

#### Opción 1: Setup Automatizado (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/laplame/Luxae-Blockchain---ERC777-Token.git
cd Luxae-Blockchain---ERC777-Token

# Ejecutar setup completo
chmod +x setup.sh
./setup.sh
```

El script realizará:
- ✅ Verificación de Node.js y npm
- ✅ Instalación de dependencias
- ✅ Configuración de archivos `.env`
- ✅ Descarga de `ethers.min.js`
- ✅ Compilación de contratos

#### Opción 2: Setup Manual

```bash
# 1. Instalar dependencias principales
npm install

# 2. Instalar dependencias de la API
cd api && npm install && cd ..

# 3. Configurar variables de entorno
cp .env.example .env
cp api/.env.example api/.env
# Edita los archivos .env con tus valores

# 4. Compilar contratos
npm run compile
```

## 🔧 Levantar los Nodos

### Desarrollo Local (Hardhat Network)

Para desarrollo y testing rápido:

```bash
# Iniciar nodo Hardhat (red local)
npm run node
```

Esto iniciará un nodo local en `http://localhost:8545` con:
- Chain ID: 1337
- Gas gratuito (para desarrollo)
- Cuentas pre-fundadas con ETH de prueba

### Producción (Geth Personalizado)

Para una blockchain independiente con control total:

```bash
# Opción 1: Script automatizado
npm run blockchain:start

# Opción 2: Manual
./blockchain/start-node.sh
```

El script:
- ✅ Verifica/instala Geth automáticamente
- ✅ Inicializa la blockchain con genesis block personalizado
- ✅ Configura gas según `blockchain/config.json`
- ✅ Inicia minería automática
- ✅ Expone RPC en puerto 8545

### Configuración del Nodo

Edita `blockchain/config.json` para personalizar:

```json
{
  "chainId": 1337,
  "gasConfig": {
    "baseFeePerGas": "1000000000",    // 1 gwei
    "gasLimit": "30000000",            // 30M
    "minGasPrice": "1000000000",       // Precio mínimo
    "maxGasPrice": "100000000000"      // Precio máximo
  },
  "staking": {
    "minStakeAmount": "1000000000000000000000",  // 1000 LUXAE
    "validatorReward": "0.05",         // 5%
    "delegatorReward": "0.02"          // 2%
  }
}
```

## 📦 Desplegar Contratos

### 1. Desplegar Token LUXAE

```bash
# En una terminal separada (con el nodo corriendo)
npm run deploy:local
```

Esto desplegará:
- **LuxaeToken**: Token ERC777 con 1 billón de tokens iniciales
- **ERC1820Registry**: Registro necesario para ERC777

### 2. Desplegar Contrato de Staking

```bash
npm run deploy:staking
```

Esto desplegará:
- **StakingContract**: Sistema de staking con validadores y delegadores

Los contratos se guardan automáticamente en `frontend/contract-config.json` para uso del frontend.

## 🌐 Iniciar Todos los Servicios

### Desarrollo (Todos los Servicios)

```bash
npm run dev
```

Esto inicia simultáneamente:
- 🟡 **Hardhat Node**: `http://localhost:8545` (yellow logs)
- 🔵 **Frontend**: `http://localhost:3000` (blue logs)
- 🟢 **API**: `http://localhost:3001` (green logs)

Presiona `Ctrl+C` para detener todos los servicios.

### Producción (PM2)

```bash
# Desplegar con PM2
npm run deploy:pm2

# Ver estado
npm run pm2:status

# Ver logs
npm run pm2:logs
```

## 📡 API - Endpoints Disponibles

La API proporciona endpoints completos para gestionar contratos, cupones, tokens, swaps y transferencias.

### Base URL
```
http://localhost:3001/api
```

### Endpoints de Contratos

#### `GET /api/contracts`
Obtener información de todos los contratos desplegados

**Respuesta:**
```json
{
  "success": true,
  "contracts": [
    {
      "address": "0x...",
      "name": "LuxaeToken",
      "type": "ERC777",
      "deployedAt": "2024-01-01T00:00:00.000Z",
      "totalSupply": "1000000000000000000000000000",
      "decimals": 18
    }
  ]
}
```

#### `GET /api/contracts/:address`
Obtener información detallada de un contrato específico

### Endpoints de Cupones

#### `GET /api/coupons`
Listar todos los cupones (con filtro opcional `?status=pending`)

#### `POST /api/coupons`
Crear nuevos cupones

**Body:**
```json
{
  "numberOfCoupons": 10,
  "valuePerCoupon": 100,
  "description": "Cupones promocionales"
}
```

#### `POST /api/coupons/:id/redeem`
Canjear un cupón y transferir tokens

**Body:**
```json
{
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

#### `GET /api/stats`
Estadísticas de cupones (total, pendientes, canjeados, valor total)

### Endpoints de Tokens

#### `GET /api/tokens`
Obtener información del token LUXAE

**Respuesta:**
```json
{
  "success": true,
  "token": {
    "name": "Luxae",
    "symbol": "LUXAE",
    "decimals": 18,
    "totalSupply": "1000000000000000000000000000",
    "contractAddress": "0x...",
    "holders": 150,
    "transactions": 1250
  }
}
```

#### `GET /api/tokens/balance/:address`
Obtener balance de tokens de una dirección

#### `GET /api/tokens/holders`
Listar top holders de tokens

### Endpoints de Transferencias

#### `GET /api/transfers`
Obtener historial de transferencias

**Query Parameters:**
- `from`: Dirección del remitente (opcional)
- `to`: Dirección del destinatario (opcional)
- `limit`: Número de resultados (default: 50)
- `offset`: Offset para paginación (default: 0)

**Respuesta:**
```json
{
  "success": true,
  "transfers": [
    {
      "txHash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "amount": "1000000000000000000",
      "amountFormatted": "1.0",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "blockNumber": 12345
    }
  ],
  "total": 1250,
  "limit": 50,
  "offset": 0
}
```

#### `GET /api/transfers/stats`
Estadísticas de transferencias

**Respuesta:**
```json
{
  "success": true,
  "stats": {
    "totalTransfers": 1250,
    "totalVolume": "5000000000000000000000",
    "uniqueSenders": 120,
    "uniqueReceivers": 150,
    "averageTransfer": "4000000000000000000",
    "last24Hours": {
      "count": 45,
      "volume": "180000000000000000000"
    }
  }
}
```

### Endpoints de Swaps

#### `GET /api/swaps`
Obtener historial de swaps (preparado para futuros DEX)

**Respuesta:**
```json
{
  "success": true,
  "swaps": [],
  "message": "Sistema de swaps en desarrollo"
}
```

#### `GET /api/swaps/stats`
Estadísticas de swaps

### Endpoints Generales

#### `GET /api/health`
Estado del servidor y conexión al contrato

#### `GET /api/network`
Información de la red blockchain

**Respuesta:**
```json
{
  "success": true,
  "network": {
    "chainId": 1337,
    "name": "Luxae Blockchain",
    "rpcUrl": "http://localhost:8545",
    "blockNumber": 12345,
    "gasPrice": "20000000000",
    "gasPriceFormatted": "20 gwei"
  }
}
```

## 🔍 Ejemplos de Uso de la API

### Obtener información del token

```bash
curl http://localhost:3001/api/tokens
```

### Obtener historial de transferencias

```bash
curl "http://localhost:3001/api/transfers?limit=10"
```

### Obtener estadísticas de transferencias

```bash
curl http://localhost:3001/api/transfers/stats
```

### Crear cupones

```bash
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfCoupons": 5,
    "valuePerCoupon": 100,
    "description": "Cupones promocionales"
  }'
```

## 💻 Frontend

El frontend está disponible en `http://localhost:3000` después de iniciar el servidor.

### Características del Frontend

- 🔗 **Conexión de Wallet**: MetaMask y otros wallets compatibles
- 💰 **Gestión de Tokens**: Ver balance, transferir, mintear, quemar
- 👥 **Operadores**: Autorizar/revocar operadores ERC777
- 🌐 **Estado de Red**: Chain ID, bloque actual, precio de gas
- 📊 **Cupones**: Crear y gestionar cupones
- 📖 **Documentación**: Ver documentación integrada

### Iniciar Frontend

```bash
npm run frontend
```

O como parte de todos los servicios:

```bash
npm run dev
```

## 🏛️ Sistema de Staking

### Registrar Validador

```javascript
// Desde el frontend o mediante contrato
await stakingContract.registerValidator(
  ethers.parseEther("1000") // Mínimo 1000 LUXAE
);
```

### Delegar Stake

```javascript
await stakingContract.delegateStake(
  validatorAddress,
  ethers.parseEther("500")
);
```

### Retirar Stake

```javascript
// 1. Iniciar unbonding
await stakingContract.startUnbonding(validatorAddress);

// 2. Esperar período de unbonding (24 horas por defecto)

// 3. Retirar
await stakingContract.withdrawStake(validatorAddress);
```

## 🔐 Seguridad

- ✅ Contratos auditados de OpenZeppelin
- ✅ Validación estricta en API
- ✅ ReentrancyGuard en contratos de staking
- ✅ Período de unbonding para prevenir ataques
- ✅ Límites de gas configurables

**⚠️ IMPORTANTE**: 
- Nunca compartas tus claves privadas
- Usa `.env` para configuración sensible
- Audita contratos antes de producción
- Prueba exhaustivamente en testnet

## 📚 Documentación Adicional

- **[DEPLOY.md](./DEPLOY.md)**: Guía completa de despliegue con PM2
- **[BLOCKCHAIN.md](./BLOCKCHAIN.md)**: Documentación técnica de la blockchain
- **[GITHUB.md](./GITHUB.md)**: Guía para GitHub
- **[api/README.md](./api/README.md)**: Documentación completa de la API
- **[frontend/README.md](./frontend/README.md)**: Documentación del frontend

## 🛠️ Comandos Útiles

```bash
# Compilar contratos
npm run compile

# Ejecutar tests
npm test

# Iniciar nodo Hardhat
npm run node

# Desplegar contratos localmente
npm run deploy:local

# Desplegar contrato de staking
npm run deploy:staking

# Iniciar blockchain personalizada
npm run blockchain:start

# Iniciar todos los servicios (desarrollo)
npm run dev

# Desplegar con PM2 (producción)
npm run deploy:pm2

# Ver logs de PM2
npm run pm2:logs

# Ver estado de PM2
npm run pm2:status
```

## 🗂️ Estructura del Proyecto

```
block/
├── blockchain/          # Configuración de blockchain personalizada
│   ├── config.json      # Configuración de gas y staking
│   ├── genesis.json     # Bloque génesis
│   └── start-node.sh    # Script para iniciar nodo
├── contracts/           # Contratos inteligentes
│   ├── LuxaeToken.sol   # Token ERC777
│   ├── StakingContract.sol  # Contrato de staking
│   └── ERC1820Registry.sol   # Registro ERC1820
├── scripts/             # Scripts de despliegue
│   ├── deploy.js        # Desplegar token
│   └── deploy-staking.js    # Desplegar staking
├── test/                # Tests
├── api/                 # Servidor API REST
│   ├── server.js        # Servidor Express
│   └── data/            # Datos (cupones, etc.)
├── frontend/            # Interfaz web
│   ├── index.html       # Frontend principal
│   └── server.js        # Servidor HTTP
├── ecosystem.config.js  # Configuración PM2
├── hardhat.config.js    # Configuración Hardhat
└── package.json         # Dependencias
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para más detalles

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `npm run pm2:logs` o `tail -f logs/*.log`
2. Verifica la configuración: `cat .env` y `cat api/.env`
3. Consulta la documentación en los archivos README.md
4. Abre un [issue](https://github.com/laplame/Luxae-Blockchain---ERC777-Token/issues)

---

**Desarrollado con ❤️ para la comunidad blockchain**
