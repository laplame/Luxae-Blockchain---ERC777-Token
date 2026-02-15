# Guía de Despliegue - Luxae Blockchain

Esta guía te ayudará a desplegar Luxae Blockchain en un servidor de producción usando PM2.

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **npm** v7 o superior
- **PM2** (se instalará automáticamente si no está presente)
- **Git** (para clonar el repositorio)
- **Ubuntu/Debian** (recomendado) o cualquier distribución Linux

## 🚀 Opción 1: Setup Inicial (Primera Vez)

Si acabas de clonar el repositorio desde GitHub:

```bash
# Clonar el repositorio
git clone <tu-repositorio-url>
cd block

# Ejecutar script de setup
chmod +x setup.sh
./setup.sh
```

El script `setup.sh` realizará:
- ✅ Verificación de Node.js y npm
- ✅ Creación de directorios necesarios
- ✅ Instalación de todas las dependencias
- ✅ Configuración de archivos `.env` desde ejemplos
- ✅ Descarga de `ethers.min.js` si no existe
- ✅ Compilación de contratos

## 🔧 Opción 2: Configuración Manual

### 1. Instalar Dependencias

```bash
# Dependencias principales
npm install

# Dependencias de la API
cd api && npm install && cd ..
```

### 2. Configurar Variables de Entorno

**Raíz del proyecto** (`.env`):
```env
# Opcional: Para redes externas (Sepolia, Mainnet)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

**API** (`api/.env`):
```env
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545
PRIVATE_KEY=tu_clave_privada_aqui
PORT=3001
```

⚠️ **IMPORTANTE**: Nunca compartas tus claves privadas. Los archivos `.env` están en `.gitignore` y no se subirán a GitHub.

### 3. Compilar Contratos

```bash
npm run compile
```

## 🎯 Despliegue con PM2

### Método Rápido (Script Automatizado)

```bash
chmod +x deploy.sh
./deploy.sh
```

O usando npm:

```bash
npm run deploy:ubuntu
```

### Método Manual

#### 1. Instalar PM2 Globalmente (si no está instalado)

```bash
npm install -g pm2
```

#### 2. Crear Directorio de Logs

```bash
mkdir -p logs
```

#### 3. Iniciar Servicios con PM2

```bash
# Iniciar todos los servicios
pm2 start ecosystem.config.js

# O usando npm
npm run pm2:start
```

Esto iniciará:
- **luxae-frontend** en puerto 3000
- **luxae-api** en puerto 3001
- **luxae-hardhat-node** en puerto 8545

#### 4. Guardar Configuración de PM2

```bash
pm2 save
```

Esto guarda la configuración actual para que PM2 la restaure después de reiniciar.

#### 5. Configurar PM2 para Iniciar al Arrancar el Sistema

```bash
pm2 startup
```

Ejecuta el comando que PM2 te muestre (generalmente requiere `sudo`).

## 📊 Gestión de Servicios

### Ver Estado de los Servicios

```bash
pm2 status
# O
npm run pm2:status
```

### Ver Logs

```bash
# Todos los servicios
pm2 logs
# O
npm run pm2:logs

# Servicio específico
pm2 logs luxae-frontend
pm2 logs luxae-api
pm2 logs luxae-hardhat-node
```

### Reiniciar Servicios

```bash
# Todos
pm2 restart all
# O
npm run pm2:restart

# Servicio específico
pm2 restart luxae-frontend
```

### Detener Servicios

```bash
# Todos
pm2 stop all
# O
npm run pm2:stop

# Servicio específico
pm2 stop luxae-frontend
```

### Eliminar Servicios

```bash
# Todos
pm2 delete all

# Servicio específico
pm2 delete luxae-frontend
```

## 🔄 Actualización del Código

Cuando actualices el código desde GitHub:

```bash
# 1. Detener servicios
pm2 stop all

# 2. Actualizar código
git pull origin main

# 3. Reinstalar dependencias (si hay cambios)
npm install
cd api && npm install && cd ..

# 4. Recompilar contratos (si hay cambios)
npm run compile

# 5. Reiniciar servicios
pm2 restart all
```

## 🌐 Desplegar el Contrato

### Red Local (Hardhat Node)

```bash
npm run deploy:local
```

Esto desplegará el contrato en el nodo Hardhat local y guardará la configuración en `frontend/contract-config.json`.

### Red Sepolia (Testnet)

1. Configura `.env` con tu RPC URL y clave privada
2. Obtén ETH de prueba desde un faucet de Sepolia
3. Despliega:

```bash
npm run deploy -- --network sepolia
```

### Red Mainnet

⚠️ **ADVERTENCIA**: Solo despliega en mainnet después de pruebas exhaustivas.

1. Configura `.env` con tu RPC URL y clave privada
2. Asegúrate de tener suficiente ETH para gas
3. Despliega:

```bash
npm run deploy -- --network mainnet
```

## 🔍 Verificación del Despliegue

### Verificar que los Servicios Están Corriendo

```bash
pm2 status
```

Deberías ver los tres servicios con estado `online`.

### Verificar Puertos

```bash
# Frontend
curl http://localhost:3000

# API
curl http://localhost:3001/api/health

# Hardhat Node
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Verificar Logs

```bash
pm2 logs --lines 50
```

## 🛠️ Solución de Problemas

### Los servicios no inician

1. Verifica los logs:
   ```bash
   pm2 logs
   ```

2. Verifica que los puertos no estén en uso:
   ```bash
   netstat -tulpn | grep -E '3000|3001|8545'
   ```

3. Verifica las variables de entorno:
   ```bash
   cat .env
   cat api/.env
   ```

### Error: "Port already in use"

Detén el proceso que está usando el puerto:

```bash
# Encontrar proceso
lsof -i :3000
lsof -i :3001
lsof -i :8545

# Matar proceso (reemplaza PID con el número del proceso)
kill -9 PID
```

### Error: "Cannot find module"

Reinstala las dependencias:

```bash
rm -rf node_modules package-lock.json
npm install
cd api && rm -rf node_modules package-lock.json && npm install && cd ..
```

### PM2 no inicia al arrancar el sistema

```bash
# Regenerar script de startup
pm2 unstartup
pm2 startup
# Ejecutar el comando que PM2 muestre
pm2 save
```

## 📝 Estructura de Archivos Importantes

```
block/
├── ecosystem.config.js    # Configuración de PM2
├── setup.sh              # Script de setup inicial
├── deploy.sh             # Script de deploy automatizado
├── .env                  # Variables de entorno (raíz)
├── api/
│   ├── .env             # Variables de entorno de la API
│   └── data/            # Datos de la API (JSON)
├── frontend/
│   └── contract-config.json  # Configuración del contrato (generado)
└── logs/                # Logs de PM2
    ├── frontend-error.log
    ├── frontend-out.log
    ├── api-error.log
    ├── api-out.log
    ├── hardhat-error.log
    └── hardhat-out.log
```

## 🔐 Seguridad

- ✅ Nunca subas archivos `.env` a GitHub
- ✅ Usa claves privadas diferentes para desarrollo y producción
- ✅ Configura firewall para proteger los puertos
- ✅ Usa HTTPS en producción (considera usar nginx como reverse proxy)
- ✅ Mantén Node.js y las dependencias actualizadas

## 📚 Recursos Adicionales

- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentación de Hardhat](https://hardhat.org/docs)
- [Documentación de OpenZeppelin](https://docs.openzeppelin.com/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `pm2 logs`
2. Verifica la configuración: `pm2 show <nombre-servicio>`
3. Consulta la documentación en `README.md`
4. Abre un issue en GitHub

---

**Última actualización**: Febrero 2026
