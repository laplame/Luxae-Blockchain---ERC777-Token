require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'coupons.json');

// Middleware
app.use(cors());
app.use(express.json());

// Crear directorio de datos si no existe
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Inicializar archivo de datos si no existe
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ coupons: [] }, null, 2));
}

// Cargar datos
function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { coupons: [] };
  }
}

// Guardar datos
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Configuración del contrato (debe configurarse en .env o variables de entorno)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// ABI del contrato LuxaeToken (completo)
const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function owner() view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

let provider, contract, signer;

// Inicializar conexión con el contrato
async function initContract() {
  try {
    if (!CONTRACT_ADDRESS) {
      console.warn('⚠️  CONTRACT_ADDRESS no configurado. Algunas funciones no estarán disponibles.');
      return;
    }

    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    if (PRIVATE_KEY) {
      signer = new ethers.Wallet(PRIVATE_KEY, provider);
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } else {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }

    console.log('✅ Contrato conectado:', CONTRACT_ADDRESS);
  } catch (error) {
    console.error('❌ Error conectando al contrato:', error.message);
  }
}

// Validaciones estrictas
const couponValidation = [
  body('numberOfCoupons')
    .isInt({ min: 1, max: 10000 })
    .withMessage('El número de cupones debe ser un entero entre 1 y 10000'),
  
  body('valuePerCoupon')
    .isFloat({ min: 0.000001 })
    .withMessage('El valor por cupón debe ser mayor a 0.000001'),
  
  body('recipientAddress')
    .optional()
    .isEthereumAddress()
    .withMessage('La dirección del destinatario debe ser una dirección Ethereum válida'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

// ==================== ENDPOINTS CRUD ====================

// GET /api/coupons - Obtener todos los cupones (con filtro opcional)
app.get('/api/coupons', (req, res) => {
  try {
    const data = loadData();
    let coupons = data.coupons;

    // Filtrar por estado si se proporciona
    if (req.query.status) {
      coupons = coupons.filter(c => c.status === req.query.status);
    }

    res.json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cargar cupones',
      message: error.message
    });
  }
});

// GET /api/coupons/:id - Obtener un cupón por ID
app.get('/api/coupons/:id', (req, res) => {
  try {
    const data = loadData();
    const coupon = data.coupons.find(c => c.id === req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }
    
    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener cupón',
      message: error.message
    });
  }
});

// POST /api/coupons - Crear nuevos cupones
app.post('/api/coupons', couponValidation, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { numberOfCoupons, valuePerCoupon, recipientAddress, description } = req.body;
    
    // Validaciones adicionales estrictas
    if (!Number.isInteger(Number(numberOfCoupons)) || numberOfCoupons < 1 || numberOfCoupons > 10000) {
      return res.status(400).json({
        success: false,
        error: 'El número de cupones debe ser un entero entre 1 y 10000'
      });
    }

    if (isNaN(valuePerCoupon) || valuePerCoupon <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El valor por cupón debe ser un número mayor a 0'
      });
    }

    const data = loadData();
    const coupons = [];
    const totalValue = numberOfCoupons * valuePerCoupon;

    // Generar cupones
    for (let i = 0; i < numberOfCoupons; i++) {
      const coupon = {
        id: uuidv4(),
        code: `LUXAE-${Date.now()}-${i + 1}`,
        value: parseFloat(valuePerCoupon.toFixed(18)), // Precisión de 18 decimales
        recipientAddress: recipientAddress || null,
        description: description || '',
        status: 'pending', // pending, redeemed, cancelled
        createdAt: new Date().toISOString(),
        redeemedAt: null,
        redeemedBy: null
      };
      coupons.push(coupon);
    }

    // Agregar cupones a la base de datos
    data.coupons.push(...coupons);
    saveData(data);

    res.status(201).json({
      success: true,
      message: `${numberOfCoupons} cupones creados exitosamente`,
      totalValue: totalValue.toFixed(18),
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        value: c.value,
        status: c.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al crear cupones',
      message: error.message
    });
  }
});

// PUT /api/coupons/:id - Actualizar un cupón
app.put('/api/coupons/:id', [
  body('status')
    .optional()
    .isIn(['pending', 'redeemed', 'cancelled'])
    .withMessage('El estado debe ser: pending, redeemed o cancelled'),
  
  body('recipientAddress')
    .optional()
    .isEthereumAddress()
    .withMessage('La dirección del destinatario debe ser una dirección Ethereum válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const data = loadData();
    const couponIndex = data.coupons.findIndex(c => c.id === req.params.id);
    
    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    const coupon = data.coupons[couponIndex];
    const { status, recipientAddress, description } = req.body;

    // Actualizar campos permitidos
    if (status !== undefined) {
      coupon.status = status;
      if (status === 'redeemed') {
        coupon.redeemedAt = new Date().toISOString();
      }
    }
    
    if (recipientAddress !== undefined) {
      coupon.recipientAddress = recipientAddress;
    }
    
    if (description !== undefined) {
      coupon.description = description;
    }

    data.coupons[couponIndex] = coupon;
    saveData(data);

    res.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar cupón',
      message: error.message
    });
  }
});

// DELETE /api/coupons/:id - Eliminar un cupón
app.delete('/api/coupons/:id', (req, res) => {
  try {
    const data = loadData();
    const couponIndex = data.coupons.findIndex(c => c.id === req.params.id);
    
    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    const coupon = data.coupons[couponIndex];
    
    // Solo permitir eliminar cupones pendientes o cancelados
    if (coupon.status === 'redeemed') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un cupón ya canjeado'
      });
    }

    data.coupons.splice(couponIndex, 1);
    saveData(data);

    res.json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cupón',
      message: error.message
    });
  }
});

// POST /api/coupons/:id/redeem - Canjear un cupón y transferir tokens
app.post('/api/coupons/:id/redeem', [
  body('recipientAddress')
    .isEthereumAddress()
    .withMessage('La dirección del destinatario es requerida y debe ser válida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (!contract || !signer) {
      return res.status(503).json({
        success: false,
        error: 'El contrato no está configurado. Verifica CONTRACT_ADDRESS y PRIVATE_KEY en las variables de entorno.'
      });
    }

    const data = loadData();
    const couponIndex = data.coupons.findIndex(c => c.id === req.params.id);
    
    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    const coupon = data.coupons[couponIndex];

    // Validar que el cupón esté pendiente
    if (coupon.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `El cupón ya ha sido ${coupon.status === 'redeemed' ? 'canjeado' : 'cancelado'}`
      });
    }

    const { recipientAddress } = req.body;
    const decimals = await contract.decimals();
    const amount = ethers.utils.parseUnits(coupon.value.toString(), decimals);

    // Verificar balance del contrato
    const contractBalance = await contract.balanceOf(await signer.getAddress());
    if (contractBalance.lt(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Balance insuficiente en el contrato para transferir tokens'
      });
    }

    // Transferir tokens
    const tx = await contract.transfer(recipientAddress, amount);
    await tx.wait();

    // Actualizar cupón
    coupon.status = 'redeemed';
    coupon.redeemedAt = new Date().toISOString();
    coupon.redeemedBy = recipientAddress;
    coupon.transactionHash = tx.hash;

    data.coupons[couponIndex] = coupon;
    saveData(data);

    res.json({
      success: true,
      message: 'Cupón canjeado y tokens transferidos exitosamente',
      transactionHash: tx.hash,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        value: coupon.value,
        recipientAddress,
        status: coupon.status,
        redeemedAt: coupon.redeemedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al canjear cupón',
      message: error.message
    });
  }
});

// GET /api/stats - Estadísticas de cupones
app.get('/api/stats', (req, res) => {
  try {
    const data = loadData();
    const coupons = data.coupons;

    const stats = {
      total: coupons.length,
      pending: coupons.filter(c => c.status === 'pending').length,
      redeemed: coupons.filter(c => c.status === 'redeemed').length,
      cancelled: coupons.filter(c => c.status === 'cancelled').length,
      totalValue: coupons.reduce((sum, c) => sum + c.value, 0).toFixed(18),
      redeemedValue: coupons
        .filter(c => c.status === 'redeemed')
        .reduce((sum, c) => sum + c.value, 0)
        .toFixed(18)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message
    });
  }
});

// ==================== ENDPOINTS DE CONTRATOS ====================

// GET /api/contracts - Obtener información de todos los contratos
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = [];
    
    if (CONTRACT_ADDRESS && contract) {
      try {
        const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
          contract.owner().catch(() => null)
        ]);

        // Cargar configuración de despliegue si existe
        const contractConfigPath = path.join(__dirname, '../frontend/contract-config.json');
        let deployedAt = null;
        if (fs.existsSync(contractConfigPath)) {
          const config = JSON.parse(fs.readFileSync(contractConfigPath, 'utf8'));
          deployedAt = config.deployedAt || null;
        }

        contracts.push({
          address: CONTRACT_ADDRESS,
          name: name,
          type: 'ERC777',
          deployedAt: deployedAt,
          totalSupply: totalSupply.toString(),
          totalSupplyFormatted: ethers.utils.formatUnits(totalSupply, decimals),
          decimals: decimals,
          owner: owner,
          network: 'Luxae Blockchain',
          chainId: 1337
        });
      } catch (error) {
        console.error('Error obteniendo información del contrato:', error.message);
      }
    }

    res.json({
      success: true,
      contracts: contracts,
      count: contracts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener contratos',
      message: error.message
    });
  }
});

// GET /api/contracts/:address - Obtener información detallada de un contrato
app.get('/api/contracts/:address', async (req, res) => {
  try {
    const address = req.params.address;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección de contrato inválida'
      });
    }

    if (address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return res.status(404).json({
        success: false,
        error: 'Contrato no encontrado'
      });
    }

    if (!contract) {
      return res.status(503).json({
        success: false,
        error: 'Contrato no configurado'
      });
    }

    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.owner().catch(() => null)
    ]);

    res.json({
      success: true,
      contract: {
        address: address,
        name: name,
        symbol: symbol,
        type: 'ERC777',
        decimals: decimals,
        totalSupply: totalSupply.toString(),
        totalSupplyFormatted: ethers.utils.formatUnits(totalSupply, decimals),
        owner: owner,
        network: 'Luxae Blockchain',
        chainId: 1337
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del contrato',
      message: error.message
    });
  }
});

// ==================== ENDPOINTS DE TOKENS ====================

// GET /api/tokens - Obtener información del token LUXAE
app.get('/api/tokens', async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({
        success: false,
        error: 'Contrato no configurado'
      });
    }

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    // Obtener información de red
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();

    res.json({
      success: true,
      token: {
        name: name,
        symbol: symbol,
        decimals: decimals,
        totalSupply: totalSupply.toString(),
        totalSupplyFormatted: ethers.utils.formatUnits(totalSupply, decimals),
        contractAddress: CONTRACT_ADDRESS,
        network: {
          chainId: (await provider.getNetwork()).chainId,
          name: (await provider.getNetwork()).name,
          blockNumber: blockNumber,
          gasPrice: gasPrice.toString(),
          gasPriceFormatted: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del token',
      message: error.message
    });
  }
});

// GET /api/tokens/balance/:address - Obtener balance de una dirección
app.get('/api/tokens/balance/:address', async (req, res) => {
  try {
    const address = req.params.address;
    
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección inválida'
      });
    }

    if (!contract) {
      return res.status(503).json({
        success: false,
        error: 'Contrato no configurado'
      });
    }

    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals()
    ]);

    res.json({
      success: true,
      address: address,
      balance: balance.toString(),
      balanceFormatted: ethers.utils.formatUnits(balance, decimals),
      symbol: await contract.symbol()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener balance',
      message: error.message
    });
  }
});

// GET /api/tokens/holders - Listar top holders (preparado para futura implementación)
app.get('/api/tokens/holders', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Endpoint de holders en desarrollo. Requiere indexación de eventos.',
      holders: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ENDPOINTS DE TRANSFERENCIAS ====================

// GET /api/transfers - Obtener historial de transferencias
app.get('/api/transfers', async (req, res) => {
  try {
    if (!contract || !provider) {
      return res.status(503).json({
        success: false,
        error: 'Contrato o proveedor no configurado'
      });
    }

    const from = req.query.from;
    const to = req.query.to;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Validar direcciones si se proporcionan
    if (from && !ethers.utils.isAddress(from)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección "from" inválida'
      });
    }
    if (to && !ethers.utils.isAddress(to)) {
      return res.status(400).json({
        success: false,
        error: 'Dirección "to" inválida'
      });
    }

    // Obtener eventos de Transfer
    const filter = contract.filters.Transfer(from || null, to || null);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Últimos 10000 bloques

    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    
    // Procesar eventos
    const transfers = events.slice(offset, offset + limit).map(event => ({
      txHash: event.transactionHash,
      from: event.args.from,
      to: event.args.to,
      amount: event.args.value.toString(),
      blockNumber: event.blockNumber,
      blockHash: event.blockHash,
      logIndex: event.logIndex
    }));

    // Obtener información adicional de bloques
    const transfersWithDetails = await Promise.all(transfers.map(async (transfer) => {
      try {
        const block = await provider.getBlock(transfer.blockNumber);
        const decimals = await contract.decimals();
        return {
          ...transfer,
          amountFormatted: ethers.utils.formatUnits(transfer.amount, decimals),
          timestamp: new Date(block.timestamp * 1000).toISOString()
        };
      } catch (error) {
        return {
          ...transfer,
          amountFormatted: 'N/A',
          timestamp: null
        };
      }
    }));

    res.json({
      success: true,
      transfers: transfersWithDetails,
      total: events.length,
      limit: limit,
      offset: offset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener transferencias',
      message: error.message
    });
  }
});

// GET /api/transfers/stats - Estadísticas de transferencias
app.get('/api/transfers/stats', async (req, res) => {
  try {
    if (!contract || !provider) {
      return res.status(503).json({
        success: false,
        error: 'Contrato o proveedor no configurado'
      });
    }

    const filter = contract.filters.Transfer();
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000);

    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    const decimals = await contract.decimals();

    // Calcular estadísticas
    const totalTransfers = events.length;
    const totalVolume = events.reduce((sum, event) => sum.add(event.args.value), ethers.BigNumber.from(0));
    const uniqueSenders = new Set(events.map(e => e.args.from.toLowerCase())).size;
    const uniqueReceivers = new Set(events.map(e => e.args.to.toLowerCase())).size;
    const averageTransfer = totalTransfers > 0 ? totalVolume.div(totalTransfers) : ethers.BigNumber.from(0);

    // Transferencias últimas 24 horas
    const oneDayAgo = Math.max(0, currentBlock - 7200); // Aproximadamente 24 horas (5 seg/bloque)
    const recentEvents = events.filter(e => e.blockNumber >= oneDayAgo);
    const last24HoursVolume = recentEvents.reduce((sum, event) => sum.add(event.args.value), ethers.BigNumber.from(0));

    res.json({
      success: true,
      stats: {
        totalTransfers: totalTransfers,
        totalVolume: totalVolume.toString(),
        totalVolumeFormatted: ethers.utils.formatUnits(totalVolume, decimals),
        uniqueSenders: uniqueSenders,
        uniqueReceivers: uniqueReceivers,
        averageTransfer: averageTransfer.toString(),
        averageTransferFormatted: ethers.utils.formatUnits(averageTransfer, decimals),
        last24Hours: {
          count: recentEvents.length,
          volume: last24HoursVolume.toString(),
          volumeFormatted: ethers.utils.formatUnits(last24HoursVolume, decimals)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de transferencias',
      message: error.message
    });
  }
});

// ==================== ENDPOINTS DE SWAPS ====================

// GET /api/swaps - Obtener historial de swaps (preparado para futuro)
app.get('/api/swaps', async (req, res) => {
  try {
    res.json({
      success: true,
      swaps: [],
      message: 'Sistema de swaps en desarrollo. Este endpoint estará disponible cuando se implemente un DEX.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/swaps/stats - Estadísticas de swaps
app.get('/api/swaps/stats', async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalSwaps: 0,
        totalVolume: "0",
        message: 'Sistema de swaps en desarrollo'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ENDPOINTS DE RED ====================

// GET /api/network - Información de la red blockchain
app.get('/api/network', async (req, res) => {
  try {
    if (!provider) {
      return res.status(503).json({
        success: false,
        error: 'Proveedor no configurado'
      });
    }

    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const gasPrice = await provider.getGasPrice();
    const block = await provider.getBlock(blockNumber);

    res.json({
      success: true,
      network: {
        chainId: network.chainId,
        name: network.name || 'Luxae Blockchain',
        rpcUrl: RPC_URL,
        blockNumber: blockNumber,
        gasPrice: gasPrice.toString(),
        gasPriceFormatted: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
        blockTime: block ? new Date(block.timestamp * 1000).toISOString() : null,
        contractAddress: CONTRACT_ADDRESS || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de la red',
      message: error.message
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    let contractStatus = 'not_configured';
    if (contract) {
      try {
        const decimals = await contract.decimals();
        contractStatus = 'connected';
      } catch (error) {
        contractStatus = 'error';
      }
    }

    res.json({
      success: true,
      status: 'ok',
      contract: contractStatus,
      contractAddress: CONTRACT_ADDRESS || 'not_set'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
async function startServer() {
  await initContract();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API ejecutándose en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`\n📦 Contratos:`);
    console.log(`   GET    /api/contracts - Listar contratos`);
    console.log(`   GET    /api/contracts/:address - Información de contrato`);
    console.log(`\n🪙 Tokens:`);
    console.log(`   GET    /api/tokens - Información del token`);
    console.log(`   GET    /api/tokens/balance/:address - Balance de dirección`);
    console.log(`   GET    /api/tokens/holders - Top holders`);
    console.log(`\n💸 Transferencias:`);
    console.log(`   GET    /api/transfers - Historial de transferencias`);
    console.log(`   GET    /api/transfers/stats - Estadísticas de transferencias`);
    console.log(`\n🔄 Swaps:`);
    console.log(`   GET    /api/swaps - Historial de swaps`);
    console.log(`   GET    /api/swaps/stats - Estadísticas de swaps`);
    console.log(`\n🎫 Cupones:`);
    console.log(`   GET    /api/coupons - Listar cupones`);
    console.log(`   GET    /api/coupons/:id - Obtener cupón`);
    console.log(`   POST   /api/coupons - Crear cupones`);
    console.log(`   PUT    /api/coupons/:id - Actualizar cupón`);
    console.log(`   DELETE /api/coupons/:id - Eliminar cupón`);
    console.log(`   POST   /api/coupons/:id/redeem - Canjear cupón`);
    console.log(`   GET    /api/stats - Estadísticas de cupones`);
    console.log(`\n🌐 Red:`);
    console.log(`   GET    /api/network - Información de la red`);
    console.log(`   GET    /api/health - Estado del servidor`);
  });
}

startServer().catch(console.error);
