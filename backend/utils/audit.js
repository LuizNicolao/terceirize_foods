const { executeQuery } = require('../config/database');

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
    const query = `
      INSERT INTO auditoria_acoes 
      (usuario_id, acao, recurso, detalhes, ip_address, timestamp) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await executeQuery(query, [
      userId,
      action,
      resource,
      details ? JSON.stringify(details) : null,
      ip
    ]);
    
    console.log(`Auditoria: Usuário ${userId} executou ${action} em ${resource}`);
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não falhar a operação principal se a auditoria falhar
  }
};

// Middleware para auditoria automática
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Registrar apenas se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const details = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent')
        };
        
        // Adicionar dados relevantes baseados na ação
        if (action === AUDIT_ACTIONS.CREATE || action === AUDIT_ACTIONS.UPDATE) {
          // Remover senha dos logs por segurança
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.senha) {
            sanitizedBody.senha = '[REDACTED]';
          }
          details.requestBody = sanitizedBody;
        }
        
        // Para DELETE, adicionar ID do recurso
        if (action === AUDIT_ACTIONS.DELETE) {
          details.resourceId = req.params.id;
        }
        
        // Para UPDATE, adicionar ID do recurso
        if (action === AUDIT_ACTIONS.UPDATE) {
          details.resourceId = req.params.id;
        }
        
        logAction(
          req.user?.id,
          action,
          resource,
          details,
          req.ip
        );
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Função para buscar logs de auditoria
const getAuditLogs = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        a.id,
        a.usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        a.acao,
        a.recurso,
        a.detalhes,
        a.ip_address,
        a.timestamp
      FROM auditoria_acoes a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.usuario_id) {
      query += ' AND a.usuario_id = ?';
      params.push(filters.usuario_id);
    }
    
    if (filters.acao) {
      query += ' AND a.acao = ?';
      params.push(filters.acao);
    }
    
    if (filters.recurso) {
      query += ' AND a.recurso = ?';
      params.push(filters.recurso);
    }
    
    if (filters.data_inicio) {
      query += ' AND a.timestamp >= ?';
      params.push(filters.data_inicio);
    }
    
    if (filters.data_fim) {
      query += ' AND a.timestamp <= ?';
      params.push(filters.data_fim);
    }
    
    query += ' ORDER BY a.timestamp DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 100, filters.offset || 0);
    
    const logs = await executeQuery(query, params);
    
    return logs.map(log => ({
      ...log,
      detalhes: log.detalhes ? JSON.parse(log.detalhes) : null
    }));
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    throw error;
  }
};

module.exports = {
  AUDIT_ACTIONS,
  logAction,
  auditMiddleware,
  getAuditLogs
}; 