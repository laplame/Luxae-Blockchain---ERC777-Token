# Guía para GitHub - Luxae Blockchain

Esta guía te ayudará a preparar y subir el proyecto a GitHub.

## 📋 Preparación Pre-GitHub

### 1. Verificar Archivos Sensibles

Asegúrate de que los siguientes archivos NO se suban a GitHub (ya están en `.gitignore`):
- `.env`
- `api/.env`
- `api/data/coupons.json` (datos de producción)
- `node_modules/`
- `logs/`
- `.pm2/`

### 2. Archivos que SÍ deben estar en GitHub

- ✅ `setup.sh` - Script de setup inicial
- ✅ `deploy.sh` - Script de deploy
- ✅ `.env.example` - Ejemplo de configuración
- ✅ `api/.env.example` - Ejemplo de configuración de API
- ✅ `ecosystem.config.js` - Configuración de PM2
- ✅ `package.json` y `package-lock.json`
- ✅ Todo el código fuente
- ✅ Documentación (README.md, DEPLOY.md, etc.)

## 🚀 Subir a GitHub

### Opción 1: Repositorio Nuevo

```bash
# 1. Inicializar git (si no está inicializado)
git init

# 2. Agregar todos los archivos
git add .

# 3. Commit inicial
git commit -m "Initial commit: Luxae Blockchain ERC777 Token"

# 4. Crear repositorio en GitHub y agregar remote
git remote add origin https://github.com/tu-usuario/tu-repositorio.git

# 5. Push al repositorio
git branch -M main
git push -u origin main
```

### Opción 2: Repositorio Existente

```bash
# 1. Verificar estado
git status

# 2. Agregar cambios
git add .

# 3. Commit
git commit -m "Add PM2 deployment configuration and GitHub setup"

# 4. Push
git push origin main
```

## ✅ Verificación Post-GitHub

Después de subir, verifica que:

1. ✅ Los archivos `.env` NO están en el repositorio
2. ✅ Los archivos de ejemplo SÍ están (`.env.example`)
3. ✅ Los scripts son ejecutables (`setup.sh`, `deploy.sh`)
4. ✅ La documentación está completa

## 🔄 Clonar y Configurar desde GitHub

Cuando alguien clone el repositorio:

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

# 2. Ejecutar setup
chmod +x setup.sh
./setup.sh

# 3. Configurar variables de entorno
cp .env.example .env
cp api/.env.example api/.env
# Editar los archivos .env con valores reales

# 4. Desplegar
./deploy.sh
```

## 📝 Estructura Recomendada del Repositorio

```
block/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml          # CI/CD
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── api/
│   ├── .env.example
│   ├── data/
│   │   └── .gitkeep
│   ├── package.json
│   ├── README.md
│   └── server.js
├── contracts/
│   ├── ERC1820Registry.sol
│   └── LuxaeToken.sol
├── frontend/
│   ├── contract-config.json    # Generado automáticamente
│   ├── ethers.min.js
│   ├── index.html
│   ├── README.md
│   └── server.js
├── scripts/
│   ├── deploy.js
│   └── ...
├── test/
│   ├── LuxaeToken.test.js
│   └── setup.js
├── .env.example
├── .gitignore
├── DEPLOY.md
├── ecosystem.config.js
├── GITHUB.md                  # Este archivo
├── hardhat.config.js
├── package.json
├── README.md
├── deploy.sh
└── setup.sh
```

## 🔐 Seguridad

### Variables de Entorno

NUNCA subas archivos `.env` con valores reales. Siempre usa `.env.example` como plantilla.

### Secrets en GitHub

Si necesitas usar secrets en GitHub Actions:
1. Ve a Settings → Secrets and variables → Actions
2. Agrega los secrets necesarios
3. Úsalos en los workflows con `${{ secrets.NOMBRE_SECRET }}`

## 📚 Documentación en GitHub

Asegúrate de tener:
- ✅ README.md completo y actualizado
- ✅ DEPLOY.md con instrucciones de despliegue
- ✅ Licencia (MIT)
- ✅ Badges de estado (opcional)
- ✅ Descripción del repositorio

## 🎯 GitHub Actions

El proyecto incluye un workflow básico de CI/CD (`.github/workflows/deploy.yml`) que:
- Ejecuta tests en cada push
- Compila los contratos
- Verifica que todo funciona

Puedes extenderlo para:
- Deploy automático
- Notificaciones
- Code quality checks

## 🆘 Troubleshooting

### Error: "Permission denied" al ejecutar scripts

```bash
chmod +x setup.sh deploy.sh
```

### Error: Archivos .env en el repositorio

```bash
# Remover del tracking
git rm --cached .env api/.env

# Agregar al .gitignore (ya está)
# Commit
git commit -m "Remove .env files from tracking"
```

### Error: Archivos grandes (ethers.min.js)

Si `ethers.min.js` es muy grande, considera usar Git LFS:

```bash
git lfs install
git lfs track "frontend/ethers.min.js"
git add .gitattributes
git commit -m "Add ethers.min.js to LFS"
```

---

**Nota**: Este archivo puede eliminarse después de configurar GitHub, o mantenerse como referencia.
