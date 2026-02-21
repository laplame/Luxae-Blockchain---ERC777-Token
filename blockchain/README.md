# Luxae Blockchain - Blockchain Personalizada

Esta es la implementación de la blockchain personalizada de Luxae con control total sobre gas y staking.

## 🎯 Características

- ✅ **Control de Gas**: Configuración personalizada de precios de gas, límites y dinámica
- ✅ **Sistema de Staking**: Proof-of-Stake con validadores y delegadores
- ✅ **Compatibilidad EVM**: Compatible con contratos Solidity existentes
- ✅ **Configuración Flexible**: Parámetros ajustables según necesidades

## 📋 Arquitectura

### Opción 1: Geth Modificado (Recomendado para producción)

Usa un nodo Geth (Go-Ethereum) modificado con parámetros personalizados.

**Ventajas:**
- Máxima compatibilidad con Ethereum
- Contratos Solidity funcionan sin cambios
- Herramientas existentes funcionan (MetaMask, Hardhat, etc.)
- Control total sobre parámetros de consenso

**Desventajas:**
- Requiere compilar Geth desde fuente
- Más complejo de mantener

### Opción 2: Hardhat Network Personalizado (Desarrollo)

Usa Hardhat Network con configuración personalizada.

**Ventajas:**
- Fácil de configurar
- Ideal para desarrollo y testing
- No requiere compilar código fuente

**Desventajas:**
- Limitado a desarrollo local
- No es una blockchain independiente

## 🚀 Configuración

### 1. Configuración de Gas

Edita `blockchain/config.json`:

```json
{
  "gasConfig": {
    "baseFeePerGas": "1000000000",      // Precio base de gas (1 gwei)
    "gasLimit": "30000000",              // Límite de gas por bloque
    "gasPrice": "20000000000",           // Precio de gas (20 gwei)
    "minGasPrice": "1000000000",         // Precio mínimo
    "maxGasPrice": "100000000000",       // Precio máximo
    "dynamicGasPricing": true             // Precios dinámicos según demanda
  }
}
```

### 2. Configuración de Staking

```json
{
  "staking": {
    "enabled": true,
    "minStakeAmount": "1000000000000000000000",  // 1000 LUXAE mínimo
    "stakeToken": "LUXAE",
    "validatorReward": "0.05",                   // 5% para validadores
    "delegatorReward": "0.02",                  // 2% para delegadores
    "unbondingPeriod": 86400,                    // 24 horas
    "maxValidators": 100,
    "consensus": "proof-of-stake"
  }
}
```

## 🔧 Uso

### Iniciar Nodo Blockchain

```bash
# Opción 1: Script automatizado
./blockchain/start-node.sh

# Opción 2: Manual con Geth
geth --datadir ./blockchain/data \
     --networkid 1337 \
     --http --http.port 8545 \
     --http.api "eth,net,web3,personal,admin" \
     --mine --miner.threads 1
```

### Desplegar Contrato de Staking

```bash
npm run compile
npx hardhat run scripts/deploy-staking.js --network localhost
```

### Configurar Hardhat

Actualiza `hardhat.config.js` para usar tu blockchain:

```javascript
networks: {
  luxae: {
    url: "http://localhost:8545",
    chainId: 1337,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
  }
}
```

## 📊 Sistema de Staking

El contrato `StakingContract.sol` implementa:

1. **Validadores**: Hacen stake mínimo y validan transacciones
2. **Delegadores**: Delegan su stake a validadores
3. **Recompensas**: Distribuidas proporcionalmente
4. **Unbonding**: Período de espera antes de retirar stake

### Funciones Principales

- `registerValidator(uint256 stakeAmount)`: Registrar como validador
- `delegateStake(address validator, uint256 amount)`: Delegar stake
- `startUnbonding(address validator)`: Iniciar retiro de stake
- `withdrawStake(address validator)`: Retirar después del período
- `distributeRewards(address validator)`: Distribuir recompensas

## 🔐 Seguridad

- ✅ ReentrancyGuard en contratos de staking
- ✅ Validación de montos mínimos
- ✅ Período de unbonding para prevenir ataques
- ✅ Límite de validadores

## 📝 Próximos Pasos

1. **Implementar Consenso PoS Completo**: 
   - Selección de validadores
   - Finalización de bloques
   - Slashing por comportamiento malicioso

2. **Mejorar Sistema de Recompensas**:
   - Distribución automática
   - Cálculo basado en participación

3. **Governance**:
   - Votación de cambios de parámetros
   - Propuestas de mejora

## 🆘 Troubleshooting

### Error: "Geth not found"
Instala Geth según tu sistema operativo (ver `start-node.sh`)

### Error: "Genesis block invalid"
Verifica que `genesis.json` tenga formato correcto

### Error: "Port already in use"
Cambia los puertos en `config.json`

## 📚 Referencias

- [Geth Documentation](https://geth.ethereum.org/docs)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)
- [Proof of Stake Explained](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/)
