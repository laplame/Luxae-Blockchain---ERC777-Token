# Luxae Blockchain - ERC777 Token

A P2P blockchain project based on Ethereum featuring the Luxae (LUXAE) ERC777 token for smart contracts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

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

### Opción 1: Setup Automatizado (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repositorio-url>
cd block

# Ejecutar script de setup
chmod +x setup.sh
./setup.sh
```

O usando npm:
```bash
npm run setup
```

### Opción 2: Setup Manual

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

3. Configure environment variables:
```bash
cp .env.example .env
cp api/.env.example api/.env
# Edita los archivos .env con tus valores
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

### Testnet (Sepolia)
1. Create a `.env` file in the root directory:
```
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet
1. Update `.env` with mainnet configuration:
```
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Contract Details

### LuxaeToken

**Contract Address**: Deployed address will be shown after deployment

**Token Details**:
- Name: Luxae
- Symbol: LUXAE
- Decimals: 18
- Initial Supply: 1,000,000,000 LUXAE
- Standard: ERC777 (ERC20 compatible)

**Key Functions**:
- `mint(address to, uint256 amount, bytes userData, bytes operatorData)`: Mint new tokens (owner only)
- `burn(uint256 amount, bytes data)`: Burn tokens from your account
- `operatorBurn(address from, uint256 amount, bytes data, bytes operatorData)`: Burn tokens as an operator
- `authorizeOperator(address operator)`: Authorize an operator
- `revokeOperator(address operator)`: Revoke operator authorization

## ERC777 Advantages

1. **Operators**: Authorize trusted addresses to send tokens on your behalf
2. **Hooks**: Contracts can implement `tokensReceived` and `tokensToSend` hooks
3. **Batch Operations**: Send tokens to multiple addresses in one transaction
4. **Backward Compatible**: Works with all ERC20 interfaces

## Dependencia de Ethereum

### ¿El token Luxae depende de Ethereum?

**Sí, el token Luxae está completamente basado en la blockchain de Ethereum.** Esto significa:

1. **Ethereum como Base**: Luxae es un token ERC777 que se ejecuta sobre la red Ethereum. No es una blockchain independiente, sino un contrato inteligente que utiliza la infraestructura de Ethereum.

2. **Compatibilidad con Ethereum**:
   - Se despliega en la red Ethereum (mainnet, testnets, o redes locales)
   - Utiliza la máquina virtual de Ethereum (EVM) para ejecutarse
   - Usa ETH como moneda nativa para pagar las tarifas de gas
   - Es compatible con todas las herramientas y wallets de Ethereum (MetaMask, MyEtherWallet, etc.)

3. **Ventajas de estar en Ethereum**:
   - **Seguridad**: Beneficia de la seguridad y descentralización de la red Ethereum
   - **Interoperabilidad**: Puede interactuar con otros contratos y tokens en Ethereum
   - **Ecosistema**: Acceso a todo el ecosistema DeFi, exchanges, y herramientas existentes
   - **Estándar**: Sigue los estándares ERC777 y ERC20 reconocidos mundialmente

4. **¿Qué significa esto en la práctica?**:
   - Para crear/transferir/quemar tokens Luxae, necesitas ETH para pagar las tarifas de gas
   - El token existe como un contrato inteligente en la blockchain de Ethereum
   - Todas las transacciones se registran en la blockchain de Ethereum
   - Puedes ver el token en exploradores de bloques como Etherscan

### Sepolia Testnet

**Sepolia es una red de prueba (testnet) de Ethereum** utilizada para desarrollo y testing antes de desplegar en mainnet.

#### ¿Qué papel tiene Sepolia?

1. **Red de Pruebas**:
   - Sepolia es una de las testnets oficiales de Ethereum
   - Permite probar contratos inteligentes sin usar ETH real
   - Los tokens y transacciones en Sepolia no tienen valor real

2. **Para qué se usa**:
   - **Desarrollo**: Probar contratos antes de desplegarlos en mainnet
   - **Testing**: Verificar funcionalidades sin riesgo financiero
   - **Aprendizaje**: Entender cómo funcionan los contratos sin costo
   - **Integración**: Probar integraciones con otras aplicaciones

3. **Cómo obtener ETH de prueba en Sepolia**:
   - **Faucets de Sepolia**: Sitios web que regalan ETH de prueba gratis
     - [Sepolia Faucet](https://sepoliafaucet.com/)
     - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
     - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - Solo necesitas tu dirección de wallet y solicitar ETH de prueba

4. **Diferencias entre Sepolia y Mainnet**:
   - **Sepolia**: ETH sin valor, para pruebas, más rápido, menos seguro
   - **Mainnet**: ETH real, producción, más lento, completamente seguro

5. **Cuándo usar Sepolia vs Mainnet**:
   - **Usa Sepolia cuando**:
     - Estás desarrollando o probando
     - Quieres aprender sin riesgo
     - Necesitas probar funcionalidades nuevas
   - **Usa Mainnet cuando**:
     - Tu contrato está completamente probado
     - Estás listo para producción
     - Los usuarios usarán tokens con valor real

#### Configuración para Sepolia

Para desplegar en Sepolia:

1. Obtén ETH de prueba desde un faucet
2. Configura tu `.env`:
   ```
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=your_private_key_here
   ```
3. Despliega:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

**Nota**: Sepolia es ideal para probar Luxae Token antes de desplegarlo en Ethereum Mainnet donde tendrá valor real.

## Security

This project uses OpenZeppelin's audited contracts. However, always:
- Audit your contracts before mainnet deployment
- Test thoroughly on testnets
- Never share your private keys
- Use hardware wallets for mainnet deployments

## License

MIT

## Frontend

Una interfaz web completa está disponible en la carpeta `frontend/`. 

### Usar el Frontend

1. Abre `frontend/index.html` en tu navegador
2. Ingresa la dirección del contrato desplegado
3. Conecta tu wallet (MetaMask)
4. ¡Listo para interactuar con el token!

Ver `frontend/README.md` para más detalles.

## API CRUD para Cupones

Un servidor API REST completo para gestionar cupones con valores estrictos y transferencia automática de tokens.

### Instalación de la API

```bash
cd api
npm install
```

### Configuración

1. Copia el archivo de ejemplo de configuración:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:
```
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...  # Tu clave privada para firmar transacciones
PORT=3001
```

**⚠️ IMPORTANTE**: Nunca compartas tu `PRIVATE_KEY` en producción. Solo usa en desarrollo.

### Iniciar la API

```bash
npm start
# o en modo desarrollo
npm run dev
```

El servidor API estará disponible en `http://localhost:3001`

### Endpoints Disponibles

- **GET** `/api/coupons` - Listar todos los cupones
- **GET** `/api/coupons/:id` - Obtener un cupón específico
- **POST** `/api/coupons` - Crear nuevos cupones
- **PUT** `/api/coupons/:id` - Actualizar un cupón
- **DELETE** `/api/coupons/:id` - Eliminar un cupón
- **POST** `/api/coupons/:id/redeem` - Canjear cupón y transferir tokens
- **GET** `/api/stats` - Estadísticas de cupones
- **GET** `/api/health` - Estado del servidor

### Ejemplo de Uso

#### Crear 10 cupones de 100 tokens cada uno:

```bash
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfCoupons": 10,
    "valuePerCoupon": 100,
    "description": "Cupones promocionales"
  }'
```

#### Canjear un cupón:

```bash
curl -X POST http://localhost:3001/api/coupons/{coupon-id}/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Validaciones Estrictas

- **Número de cupones**: Entero entre 1 y 10,000
- **Valor por cupón**: Mayor a 0.000001 (precisión de 18 decimales)
- **Direcciones**: Deben ser direcciones Ethereum válidas
- **Estado**: Solo puede ser: `pending`, `redeemed`, `cancelled`

### Características

- ✅ Transferencia automática de tokens al canjear
- ✅ Generación de códigos únicos para cada cupón
- ✅ Base de datos JSON (fácil migrar a SQL)
- ✅ Validación de balance antes de transferir
- ✅ Estadísticas en tiempo real

Ver `api/README.md` para documentación completa de la API.

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

## Deployment

Para desplegar en producción con PM2, consulta la guía completa en [DEPLOY.md](./DEPLOY.md).

### Despliegue Rápido

```bash
# Setup inicial (primera vez)
./setup.sh

# Desplegar con PM2
./deploy.sh
# O
npm run deploy:pm2
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## License

MIT

## Support

Si encuentras problemas o tienes preguntas:
- Abre un [issue](https://github.com/tu-usuario/tu-repo/issues)
- Consulta la [documentación de despliegue](./DEPLOY.md)
- Revisa los logs: `pm2 logs`

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## License

MIT

## Support

Si encuentras problemas o tienes preguntas:
- Abre un [issue](https://github.com/tu-usuario/tu-repo/issues)
- Consulta la [documentación de despliegue](./DEPLOY.md)
- Revisa los logs: `pm2 logs`
