const { query } = require('../config/database');

// Tipos de ações que podem ser auditadas
const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  PASSWORD_CHANGE: 'password_change',
  PERMISSION_CHANGE: 'permission_change',
  USER_STATUS_CHANGE: 'user_status_change'
};

// Função para registrar ação na auditoria
const logAction = async (userId, action, resource, details = null, ip = null) => {
  try {
    const queryText = `
      INSERT INTO auditoria_acoes 
      (usuario_id, acao, recurso, detalhes, ip_address, timestamp) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await query(queryText, [
      userId,
      action,
      resource,
      details ? JSON.stringify(details) : null,
      ip
    ]);
    
    console.log(`Auditoria registrada: ${action} em ${resource} por usuário ${userId}`);
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não falhar a operação principal se a auditoria falhar
  }
};

// Middleware para auditoria automática
const auditMiddleware = (action, resource = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(data) {
      // Registrar apenas se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const details = {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          params: req.params,
          query: req.query,
          userAgent: req.get('User-Agent')
        };

        const resourceName = resource || req.baseUrl + req.path;
        const userId = req.user?.id || req.userId || null;
        const ip = req.ip || req.connection.remoteAddress;

        await logAction(userId, action, resourceName, details, ip);
      }
      
      // Chamar o método original
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Função para auditoria manual
const auditLog = async (req, action, resource, details = null) => {
  const userId = req.user?.id || req.userId || null;
  const ip = req.ip || req.connection.remoteAddress;
  
  await logAction(userId, action, resource, details, ip);
};

// Função para registrar login
const logLogin = async (userId, success, ip, userAgent, details = null) => {
  const action = success ? AUDIT_ACTIONS.LOGIN : 'login_failed';
  const logDetails = {
    success,
    userAgent,
    ...details
  };
  
  await logAction(userId, action, 'auth', logDetails, ip);
};

// Função para registrar logout
const logLogout = async (userId, ip, userAgent) => {
  const details = {
    userAgent
  };
  
  await logAction(userId, AUDIT_ACTIONS.LOGOUT, 'auth', details, ip);
};

// Função para registrar mudança de senha
const logPasswordChange = async (userId, ip, userAgent, details = null) => {
  const logDetails = {
    userAgent,
    ...details
  };
  
  await logAction(userId, AUDIT_ACTIONS.PASSWORD_CHANGE, 'user', logDetails, ip);
};

// Função para registrar mudança de permissões
const logPermissionChange = async (userId, targetUserId, oldPermissions, newPermissions, ip, userAgent) => {
  const details = {
    targetUserId,
    oldPermissions,
    newPermissions,
    userAgent
  };
  
  await logAction(userId, AUDIT_ACTIONS.PERMISSION_CHANGE, 'user', details, ip);
};

// Função para registrar mudança de status do usuário
const logUserStatusChange = async (userId, targetUserId, oldStatus, newStatus, ip, userAgent) => {
  const details = {
    targetUserId,
    oldStatus,
    newStatus,
    userAgent
  };
  
  await logAction(userId, AUDIT_ACTIONS.USER_STATUS_CHANGE, 'user', details, ip);
};

// Função para obter histórico de auditoria de um usuário
const getUserAuditHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const queryText = `
      SELECT 
        aa.id,
        aa.acao,
        aa.recurso,
        aa.detalhes,
        aa.ip_address,
        aa.timestamp,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria_acoes aa
      LEFT JOIN usuarios u ON aa.usuario_id = u.id
      WHERE aa.usuario_id = ?
      ORDER BY aa.timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    const results = await query(queryText, [userId, limit, offset]);
    
    // Parsear detalhes JSON
    return results.map(row => ({
      ...row,
      detalhes: row.detalhes ? JSON.parse(row.detalhes) : null
    }));
  } catch (error) {
    console.error('Erro ao buscar histórico de auditoria:', error);
    throw error;
  }
};

// Função para obter auditoria por recurso
const getResourceAuditHistory = async (resource, limit = 50, offset = 0) => {
  try {
    const queryText = `
      SELECT 
        aa.id,
        aa.acao,
        aa.recurso,
        aa.detalhes,
        aa.ip_address,
        aa.timestamp,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria_acoes aa
      LEFT JOIN usuarios u ON aa.usuario_id = u.id
      WHERE aa.recurso LIKE ?
      ORDER BY aa.timestamp DESC
      LIMIT ? OFFSET ?
    `;
    
    const results = await query(queryText, [`%${resource}%`, limit, offset]);
    
    // Parsear detalhes JSON
    return results.map(row => ({
      ...row,
      detalhes: row.detalhes ? JSON.parse(row.detalhes) : null
    }));
  } catch (error) {
    console.error('Erro ao buscar auditoria por recurso:', error);
    throw error;
  }
};

// Função para obter estatísticas de auditoria
const getAuditStats = async (startDate = null, endDate = null) => {
  try {
    let whereClause = '';
    let params = [];
    
    if (startDate && endDate) {
      whereClause = 'WHERE DATE(timestamp) BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
    
    const queryText = `
      SELECT 
        acao,
        COUNT(*) as total,
        COUNT(DISTINCT usuario_id) as usuarios_unicos,
        DATE(timestamp) as data
      FROM auditoria_acoes
      ${whereClause}
      GROUP BY acao, DATE(timestamp)
      ORDER BY data DESC, total DESC
    `;
    
    return await query(queryText, params);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    throw error;
  }
};

module.exports = {
  AUDIT_ACTIONS,
  logAction,
  auditMiddleware,
  auditLog,
  logLogin,
  logLogout,
  logPasswordChange,
  logPermissionChange,
  logUserStatusChange,
  getUserAuditHistory,
  getResourceAuditHistory,
  getAuditStats
};
