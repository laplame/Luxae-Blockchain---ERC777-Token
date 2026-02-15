# Luxae Blockchain - ERC777 Token

A P2P blockchain project based on Ethereum featuring the Luxae (LUXAE) ERC777 token for smart contracts.

## Overview

Luxae is an ERC777 token implementation that provides advanced features beyond standard ERC20 tokens:
- **Operator Management**: Authorize others to send tokens on your behalf
- **Hooks**: Receive notifications when tokens are sent or received
- **Backward Compatible**: Works with all ERC20 wallets and exchanges
- **Enhanced Security**: Built on OpenZeppelin's battle-tested contracts

## Features

- ✅ ERC777 token standard implementation
- ✅ Initial supply: 1 billion tokens (1,000,000,000 LUXAE)
- ✅ 18 decimal places
- ✅ Minting capability (owner only)
- ✅ Burning capability
- ✅ Operator authorization
- ✅ Comprehensive test suite

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install API dependencies:
```bash
cd api && npm install && cd ..
```

Or use the setup script:
```bash
npm run dev:setup
```

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

### Start Local Hardhat Node
```bash
npm run node
```

In a separate terminal, deploy to local network:
```bash
npm run deploy:local
```

### Start Frontend
```bash
npm run frontend
```

Then open `http://localhost:3000` in your browser.

### Start All Services (Development)
```bash
npm run dev
```

This will start all three services simultaneously:
- **Hardhat Node**: `http://localhost:8545` (yellow logs)
- **Frontend**: `http://localhost:3000` (blue logs)
- **API**: `http://localhost:3001` (green logs)

The output will be color-coded and prefixed with service names for easy identification.

**Note**: Make sure API dependencies are installed first:
```bash
cd api && npm install && cd ..
```

Press `Ctrl+C` to stop all services at once.

## Deployment

### Local Network
```bash
npm run deploy:local
```

### Sepolia Testnet
1. Create a `.env` file in the root directory:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy:
```bash
npm run deploy -- --network sepolia
```

### Mainnet
1. Update `.env` with mainnet RPC URL:
```env
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy:
```bash
npm run deploy -- --network mainnet
```

## About Ethereum and Sepolia

### Ethereum Blockchain
Ethereum is the foundational blockchain network that Luxae token is built on. It provides:
- **Smart Contract Platform**: The infrastructure for deploying and executing smart contracts
- **Network Security**: Proof-of-Stake consensus mechanism securing the network
- **EVM Compatibility**: Ethereum Virtual Machine compatibility ensures our ERC777 token works across all Ethereum-compatible networks
- **Ecosystem**: Access to wallets, DEXs, and DeFi protocols

### Sepolia Testnet
Sepolia is Ethereum's official testnet used for:
- **Testing**: Safe environment to test smart contracts without using real ETH
- **Development**: Free test ETH from faucets for development and testing
- **Validation**: Verify contract functionality before mainnet deployment
- **Cost-Free**: No real money at risk during development

**Sepolia vs Mainnet**:
- Sepolia: Test network, free test ETH, for development
- Mainnet: Production network, real ETH, real value

## Project Structure

```
block/
├── contracts/          # Smart contracts
│   ├── LuxaeToken.sol  # Main ERC777 token contract
│   └── ERC1820Registry.sol  # ERC1820 registry for local testing
├── scripts/            # Deployment scripts
│   └── deploy.js       # Contract deployment script
├── test/               # Test files
│   ├── LuxaeToken.test.js
│   └── setup.js        # Test setup utilities
├── frontend/           # Frontend application
│   ├── index.html      # Main frontend interface
│   ├── server.js       # Frontend HTTP server
│   ├── ethers.min.js   # Ethers.js library
│   └── README.md       # Frontend documentation
├── api/                # API server
│   ├── server.js       # Express API server
│   ├── data/           # JSON data storage
│   └── README.md       # API documentation
├── hardhat.config.js   # Hardhat configuration
├── package.json        # Project dependencies
└── README.md           # This file
```

## Smart Contract Details

### LuxaeToken.sol
- **Standard**: ERC777 (OpenZeppelin)
- **Initial Supply**: 1,000,000,000 LUXAE
- **Decimals**: 18
- **Owner**: Deployer address
- **Features**:
  - Minting (owner only)
  - Burning
  - Operator management
  - ERC20 compatibility

### ERC1820 Registry
Required by ERC777 standard for interface introspection. Automatically deployed on local networks.

## Frontend Features

The frontend (`http://localhost:3000`) provides:
- **Wallet Connection**: Connect MetaMask or other Web3 wallets
- **Token Information**: View token name, symbol, total supply, and decimals
- **Balance Display**: See your current LUXAE balance
- **Transfer Tokens**: Send tokens to any address
- **Mint Tokens**: Owner can mint new tokens
- **Burn Tokens**: Burn your own tokens
- **Operator Management**: Authorize/revoke operators
- **Network Status**: View network connection, Chain ID, current block, and gas prices
- **Gas Price in USD**: Real-time gas price conversion to USD
- **Coupon Management**: Create and manage coupons via API integration
- **Documentation**: View project documentation in-app

## API CRUD para Cupones

Un servidor API REST completo para gestionar cupones con valores estrictos y transferencia automática de tokens.

### Instalación de la API
```bash
cd api
npm install
```

### Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
PRIVATE_KEY=tu_clave_privada_aqui
PORT=3001
```

### Iniciar la API

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

O desde la raíz del proyecto:
```bash
npm run api:start
```

### Endpoints de la API

#### Health Check
```bash
GET /api/health
```

#### Crear Cupón
```bash
POST /api/coupons
Content-Type: application/json

{
  "numberOfCoupons": 10,
  "valuePerCoupon": 100,
  "tokenTransfer": true
}
```

**Validaciones estrictas**:
- `numberOfCoupons`: Debe ser un número entero entre 1 y 1000
- `valuePerCoupon`: Debe ser un número entero entre 1 y 1000000
- `tokenTransfer`: Debe ser `true` o `false` (booleano)

#### Listar Cupones
```bash
GET /api/coupons
```

#### Obtener Cupón por ID
```bash
GET /api/coupons/:id
```

#### Actualizar Cupón
```bash
PUT /api/coupons/:id
Content-Type: application/json

{
  "numberOfCoupons": 20,
  "valuePerCoupon": 200,
  "tokenTransfer": false
}
```

#### Eliminar Cupón
```bash
DELETE /api/coupons/:id
```

#### Canjear Cupón
```bash
POST /api/coupons/:id/redeem
Content-Type: application/json

{
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Validaciones**:
- `recipientAddress`: Debe ser una dirección Ethereum válida (42 caracteres, comienza con 0x)

#### Estadísticas
```bash
GET /api/stats
```

### Ejemplos de Uso

#### Crear un cupón con transferencia de tokens
```bash
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfCoupons": 5,
    "valuePerCoupon": 50,
    "tokenTransfer": true
  }'
```

#### Listar todos los cupones
```bash
curl http://localhost:3001/api/coupons
```

#### Canjear un cupón
```bash
curl -X POST http://localhost:3001/api/coupons/COUPON_ID/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Estructura de Datos

#### Cupón
```json
{
  "id": "uuid-v4",
  "numberOfCoupons": 10,
  "valuePerCoupon": 100,
  "tokenTransfer": true,
  "totalValue": 1000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "redeemedCoupons": 0,
  "pendingCoupons": 10
}
```

### Seguridad

- **Validación estricta**: Todos los inputs son validados con `express-validator`
- **Clave privada**: Nunca exponer la clave privada en el código
- **Variables de entorno**: Usar `.env` para configuración sensible
- **CORS**: Configurado para permitir solicitudes desde el frontend

### Notas Importantes

- La API requiere que el contrato LuxaeToken esté desplegado
- La clave privada debe tener suficientes tokens para las transferencias
- Los cupones se almacenan en `api/data/coupons.json`
- La transferencia de tokens solo ocurre si `tokenTransfer` es `true`

Ver `api/README.md` para más detalles.

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Token deployment
- Initial supply
- Minting functionality
- Burning functionality
- Operator management
- Access control

## Troubleshooting

### Contract deployment fails
- Ensure Hardhat node is running: `npm run node`
- Check that ERC1820 registry is deployed (automatic on local networks)
- Verify network configuration in `hardhat.config.js`

### Frontend can't connect
- Ensure frontend server is running: `npm run frontend`
- Check browser console for errors
- Verify MetaMask is connected to the correct network (Chain ID 31337 for local)

### API connection errors
- Ensure API server is running: `cd api && npm start`
- Check API health: `curl http://localhost:3001/api/health`
- Verify `.env` configuration in `api/` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Quick Start (All Services)

To start everything at once for development:

```bash
# Install all dependencies
npm install
cd api && npm install && cd ..

# Start all services
npm run dev
```

This will start:
- Hardhat node on port 8545
- Frontend on port 3000
- API on port 3001

Then:
1. Open `http://localhost:3000` in your browser
2. Deploy the contract: `npm run deploy:local` (in a new terminal)
3. The frontend will automatically load the contract configuration
