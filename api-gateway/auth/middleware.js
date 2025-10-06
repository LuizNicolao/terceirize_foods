/**
 * Middleware para validação de IP interno
 * Permite acesso apenas de redes internas (Docker, local, etc.)
 */

const net = require('net');

/**
 * Verifica se um IP está em uma rede CIDR
 */
function isIPInCIDR(ip, cidr) {
  const [network, prefixLength] = cidr.split('/');
  const mask = -1 << (32 - parseInt(prefixLength));
  
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);
  
  return (ipNum & mask) === (networkNum & mask);
}

/**
 * Converte IP para número
 */
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}

/**
 * Extrai IP real do cliente (considerando proxies)
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

/**
 * Middleware para validar IP interno
 */
const validateInternalIP = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  // Redes permitidas
  const allowedNetworks = [
    '172.16.0.0/12',    // Docker networks
    '10.0.0.0/8',       // Internal networks
    '192.168.0.0/16',   // Local networks
    '127.0.0.0/8',      // Localhost
    '::1/128'           // IPv6 localhost
  ];
  
  // Verificar se IP está em alguma rede permitida
  const isAllowed = allowedNetworks.some(network => {
    if (network.includes('::')) {
      // IPv6 - simplificado
      return clientIP === '::1';
    } else {
      // IPv4
      return isIPInCIDR(clientIP, network);
    }
  });
  
  if (isAllowed) {
    console.log(`✅ IP autorizado: ${clientIP}`);
    next();
  } else {
    console.log(`❌ IP negado: ${clientIP}`);
    res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Apenas redes internas são permitidas',
      clientIP: clientIP
    });
  }
};

/**
 * Middleware para log de acesso
 */
const logAccess = (req, res, next) => {
  const clientIP = getClientIP(req);
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${clientIP}`);
  next();
};

module.exports = {
  validateInternalIP,
  logAccess,
  getClientIP,
  isIPInCIDR
};
