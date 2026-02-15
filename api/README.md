# API CRUD para Cupones Luxae

API REST para gestionar cupones con valores estrictos y transferencia de tokens Luxae.

## Características

- ✅ CRUD completo para cupones
- ✅ Validación estricta de valores
- ✅ Generación de múltiples cupones
- ✅ Transferencia automática de tokens al canjear
- ✅ Estadísticas de cupones
- ✅ Base de datos JSON (fácil de migrar a SQL)

## Instalación

```bash
cd api
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:
```
CONTRACT_ADDRESS=0x...  # Dirección del contrato LuxaeToken
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...  # Clave privada para firmar transacciones
PORT=3001
```

## Uso

### Iniciar servidor

```bash
npm start
# o en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Endpoints

### GET /api/coupons
Obtener todos los cupones

**Respuesta:**
```json
{
  "success": true,
  "count": 10,
  "coupons": [...]
}
```

### GET /api/coupons/:id
Obtener un cupón específico

### POST /api/coupons
Crear nuevos cupones

**Body:**
```json
{
  "numberOfCoupons": 10,
  "valuePerCoupon": 100.5,
  "recipientAddress": "0x...",  // Opcional
  "description": "Cupones promocionales"  // Opcional
}
```

**Validaciones:**
- `numberOfCoupons`: Entero entre 1 y 10000
- `valuePerCoupon`: Número mayor a 0.000001
- `recipientAddress`: Dirección Ethereum válida (opcional)
- `description`: Máximo 500 caracteres (opcional)

**Respuesta:**
```json
{
  "success": true,
  "message": "10 cupones creados exitosamente",
  "totalValue": "1005.000000000000000000",
  "coupons": [...]
}
```

### PUT /api/coupons/:id
Actualizar un cupón

**Body:**
```json
{
  "status": "redeemed",  // pending, redeemed, cancelled
  "recipientAddress": "0x...",  // Opcional
  "description": "Nueva descripción"  // Opcional
}
```

### DELETE /api/coupons/:id
Eliminar un cupón (solo si está pendiente o cancelado)

### POST /api/coupons/:id/redeem
Canjear un cupón y transferir tokens

**Body:**
```json
{
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cupón canjeado y tokens transferidos exitosamente",
  "transactionHash": "0x...",
  "coupon": {...}
}
```

### GET /api/stats
Obtener estadísticas de cupones

**Respuesta:**
```json
{
  "success": true,
  "stats": {
    "total": 100,
    "pending": 50,
    "redeemed": 40,
    "cancelled": 10,
    "totalValue": "10000.000000000000000000",
    "redeemedValue": "4000.000000000000000000"
  }
}
```

### GET /api/health
Estado del servidor y conexión al contrato

## Ejemplos de Uso

### Crear 5 cupones de 100 tokens cada uno

```bash
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "numberOfCoupons": 5,
    "valuePerCoupon": 100,
    "description": "Cupones promocionales"
  }'
```

### Canjear un cupón

```bash
curl -X POST http://localhost:3001/api/coupons/{coupon-id}/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Obtener estadísticas

```bash
curl http://localhost:3001/api/stats
```

## Estructura de Datos

### Cupón
```json
{
  "id": "uuid",
  "code": "LUXAE-1234567890-1",
  "value": 100.5,
  "recipientAddress": "0x...",
  "description": "Descripción del cupón",
  "status": "pending",  // pending, redeemed, cancelled
  "createdAt": "2024-01-01T00:00:00.000Z",
  "redeemedAt": null,
  "redeemedBy": null,
  "transactionHash": null
}
```

## Validaciones Estrictas

1. **Número de cupones**: Debe ser un entero entre 1 y 10,000
2. **Valor por cupón**: Debe ser mayor a 0.000001 (precisión de 18 decimales)
3. **Direcciones**: Deben ser direcciones Ethereum válidas
4. **Estado**: Solo puede ser: `pending`, `redeemed`, `cancelled`
5. **Eliminación**: Solo se pueden eliminar cupones pendientes o cancelados

## Seguridad

- ⚠️ **IMPORTANTE**: Nunca compartas tu `PRIVATE_KEY` en producción
- Usa variables de entorno para configuración sensible
- En producción, usa un wallet seguro o servicio de gestión de claves
- Valida todas las entradas del usuario
- Implementa rate limiting en producción

## Base de Datos

Por defecto usa un archivo JSON (`data/coupons.json`). Para producción, considera migrar a:
- SQLite
- PostgreSQL
- MongoDB

## Integración con Frontend

El frontend puede consumir esta API para:
- Generar cupones desde la interfaz
- Mostrar lista de cupones
- Canjear cupones con un clic
- Ver estadísticas en tiempo real
