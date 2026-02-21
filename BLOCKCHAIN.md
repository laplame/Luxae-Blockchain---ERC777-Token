# Luxae Blockchain - Guía de Blockchain Personalizada

## 🎯 Visión General

Luxae Blockchain es una blockchain personalizada basada en Ethereum con control total sobre:
- **Gas**: Precios, límites y dinámica personalizables
- **Staking**: Sistema Proof-of-Stake con validadores y delegadores
- **Consenso**: Parámetros ajustables según necesidades

## 🏗️ Arquitectura

### Componentes Principales

1. **Nodo Blockchain** (`blockchain/`)
   - Configuración de red personalizada
   - Genesis block personalizado
   - Scripts de inicio

2. **Contrato de Staking** (`contracts/StakingContract.sol`)
   - Sistema de validadores
   - Delegación de stake
   - Distribución de recompensas

3. **Configuración de Gas** (`blockchain/config.json`)
   - Precios de gas personalizados
   - Límites configurables
   - Precios dinámicos

## ⚙️ Configuración de Gas

### Parámetros Disponibles

Edita `blockchain/config.json`:

```json
{
  "gasConfig": {
    "baseFeePerGas": "1000000000",        // 1 gwei - precio base
    "gasLimit": "30000000",                // 30M - límite por bloque
    "gasPrice": "20000000000",             // 20 gwei - precio estándar
    "minGasPrice": "1000000000",           // 1 gwei - precio mínimo
    "maxGasPrice": "100000000000",         // 100 gwei - precio máximo
    "gasPriceMultiplier": 1.0,             // Multiplicador dinámico
    "dynamicGasPricing": true              // Habilitar precios dinámicos
  }
}
```

### Cómo Funciona

- **baseFeePerGas**: Precio base que todos deben pagar
- **gasLimit**: Máximo gas por bloque (afecta tamaño de bloques)
- **gasPrice**: Precio estándar para transacciones normales
- **minGasPrice**: Precio mínimo aceptado (previene spam)
- **maxGasPrice**: Precio máximo (previene abusos)
- **dynamicGasPricing**: Ajusta precios según demanda de red

### Ejemplo de Uso

Para transacciones de bajo costo:
```javascript
const tx = await contract.transfer(to, amount, {
  gasPrice: ethers.parseUnits("1", "gwei") // 1 gwei mínimo
});
```

Para transacciones urgentes:
```javascript
const tx = await contract.transfer(to, amount, {
  gasPrice: ethers.parseUnits("50", "gwei") // 50 gwei para prioridad
});
```

## 💎 Sistema de Staking

### Configuración

```json
{
  "staking": {
    "enabled": true,
    "minStakeAmount": "1000000000000000000000",  // 1000 LUXAE
    "stakeToken": "LUXAE",
    "validatorReward": "0.05",                   // 5% para validadores
    "delegatorReward": "0.02",                  // 2% para delegadores
    "unbondingPeriod": 86400,                    // 24 horas
    "maxValidators": 100,
    "consensus": "proof-of-stake"
  }
}
```

### Roles

#### Validadores
- Hacen stake mínimo (1000 LUXAE por defecto)
- Validan transacciones y crean bloques
- Reciben 5% de recompensas
- Pueden recibir delegaciones

#### Delegadores
- Delegan su stake a validadores
- Reciben 2% de recompensas proporcionales
- Pueden retirar después del período de unbonding

### Flujo de Staking

1. **Registrar Validador**:
   ```javascript
   await stakingContract.registerValidator(
     ethers.parseEther("1000") // Mínimo 1000 LUXAE
   );
   ```

2. **Delegar Stake**:
   ```javascript
   await stakingContract.delegateStake(
     validatorAddress,
     ethers.parseEther("500") // 500 LUXAE
   );
   ```

3. **Retirar Stake**:
   ```javascript
   // Iniciar unbonding
   await stakingContract.startUnbonding(validatorAddress);
   
   // Esperar período de unbonding (24 horas)
   // Luego retirar
   await stakingContract.withdrawStake(validatorAddress);
   ```

## 🚀 Inicio Rápido

### 1. Configurar Blockchain

```bash
# Editar configuración
nano blockchain/config.json
```

### 2. Iniciar Nodo

```bash
# Opción A: Script automatizado
npm run blockchain:start

# Opción B: Manual
./blockchain/start-node.sh
```

### 3. Desplegar Contratos

```bash
# Desplegar token LUXAE
npm run deploy:local

# Desplegar contrato de staking
npm run deploy:staking
```

### 4. Conectar Frontend

El frontend se conectará automáticamente a `http://localhost:8545`

## 🔧 Personalización Avanzada

### Modificar Precios de Gas

1. Edita `blockchain/config.json`
2. Reinicia el nodo
3. Los cambios se aplican inmediatamente

### Modificar Parámetros de Staking

1. Edita `blockchain/config.json` → `staking`
2. Despliega nuevo contrato: `npm run deploy:staking`
3. O actualiza contrato existente (si tiene función `updateConfig`)

### Cambiar Chain ID

1. Edita `blockchain/config.json` → `chainId`
2. Edita `blockchain/genesis.json` → `config.chainId`
3. Edita `hardhat.config.js` → `networks.luxae.chainId`
4. Reinicia todo

## 📊 Monitoreo

### Ver Estado del Nodo

```bash
# Logs del nodo
tail -f logs/blockchain-node.log

# Estado de PM2
pm2 status luxae-hardhat-node
```

### Ver Estadísticas de Staking

```javascript
// Obtener validadores activos
const validators = await stakingContract.getActiveValidators();

// Información de validador
const info = await stakingContract.getValidatorInfo(validatorAddress);
console.log("Total Staked:", info.totalStaked);
console.log("Self Staked:", info.selfStaked);
console.log("Delegator Staked:", info.delegatorStaked);
```

## 🔐 Seguridad

### Mejores Prácticas

1. **Gas Prices**:
   - Establece límites mínimos y máximos
   - Monitorea precios dinámicos
   - Previene spam con precios mínimos

2. **Staking**:
   - Período de unbonding suficiente (24h+)
   - Límite de validadores para descentralización
   - Recompensas balanceadas

3. **Nodo**:
   - Firewall configurado
   - Solo puertos necesarios abiertos
   - Monitoreo de logs

## 🆘 Troubleshooting

### Error: "Gas price too low"
Aumenta `minGasPrice` en `config.json` o usa precio más alto en transacción

### Error: "Validator limit reached"
Aumenta `maxValidators` en configuración o despliega nuevo contrato

### Error: "Unbonding period not finished"
Espera el período completo antes de retirar

### Nodo no inicia
- Verifica que puertos no estén en uso
- Revisa logs en `logs/blockchain-node.log`
- Verifica permisos de `blockchain/data/`

## 📚 Recursos

- [Documentación de Geth](https://geth.ethereum.org/docs)
- [Ethereum Gas Explained](https://ethereum.org/en/developers/docs/gas/)
- [Proof of Stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/)

## 🎯 Próximos Pasos

1. ✅ Configuración de gas personalizada
2. ✅ Sistema de staking básico
3. 🔄 Consenso PoS completo (en desarrollo)
4. 🔄 Governance on-chain
5. 🔄 Slashing por comportamiento malicioso

---

**Nota**: Esta es una implementación básica. Para producción, considera:
- Auditoría de contratos
- Testing exhaustivo
- Red de múltiples nodos
- Monitoreo avanzado
