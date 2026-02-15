const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Normalizar la URL - remover query strings y hashes
  let urlPath = req.url.split('?')[0].split('#')[0];
  
  // Si es la raíz, servir index.html
  if (urlPath === '/') {
    urlPath = 'index.html';
  } else {
    // Remover el / inicial para que path.join funcione correctamente
    urlPath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
  }
  
  // Construir la ruta del archivo usando __dirname
  let filePath = path.join(__dirname, urlPath);
  
  // Normalizar la ruta para evitar problemas con ../
  filePath = path.normalize(filePath);
  
  // Asegurarse de que el archivo esté dentro del directorio frontend (seguridad)
  const resolvedPath = path.resolve(filePath);
  const frontendDir = path.resolve(__dirname);
  
  console.log(`Buscando archivo: ${filePath}`);
  console.log(`Ruta resuelta: ${resolvedPath}`);
  console.log(`Directorio frontend: ${frontendDir}`);
  
  if (!resolvedPath.startsWith(frontendDir)) {
    console.error(`Acceso denegado: ${resolvedPath} no está en ${frontendDir}`);
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>', 'utf-8');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Verificar si el archivo existe antes de leerlo
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Archivo no encontrado: ${filePath}`);
      console.error(`Error: ${err.message}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`<h1>404 - File Not Found</h1><p>Archivo: ${filePath}</p>`, 'utf-8');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error leyendo archivo: ${error.message}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
        console.log(`✓ Servido: ${urlPath}`);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Abre http://localhost:${PORT} en tu navegador`);
  console.log(`📂 Directorio del servidor: ${__dirname}`);
  console.log(`📄 Archivo index.html debería estar en: ${path.join(__dirname, 'index.html')}`);
  
  // Verificar que index.html existe
  const indexPath = path.join(__dirname, 'index.html');
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`❌ ERROR: index.html no encontrado en ${indexPath}`);
    } else {
      console.log(`✓ index.html encontrado correctamente`);
    }
  });
});
