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

// ABI del contrato LuxaeToken (simplificado)
const CONTRACT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
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
    console.log(`   GET    /api/coupons - Listar todos los cupones`);
    console.log(`   GET    /api/coupons/:id - Obtener un cupón`);
    console.log(`   POST   /api/coupons - Crear cupones`);
    console.log(`   PUT    /api/coupons/:id - Actualizar cupón`);
    console.log(`   DELETE /api/coupons/:id - Eliminar cupón`);
    console.log(`   POST   /api/coupons/:id/redeem - Canjear cupón`);
    console.log(`   GET    /api/stats - Estadísticas`);
    console.log(`   GET    /api/health - Estado del servidor`);
  });
}

startServer().catch(console.error);
