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

// Middleware para auditoria com comparação de mudanças
const auditChangesMiddleware = (action, resource) => {
  return async (req, res, next) => {
    let originalData = null;
    
    // Capturar dados originais antes da modificação
    if (action === AUDIT_ACTIONS.UPDATE && req.params.id) {
      try {
        const { executeQuery } = require('../config/database');
        const tableName = resource === 'usuarios' ? 'usuarios' : resource;
        
        const result = await executeQuery(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [req.params.id]
        );
        
        if (result.length > 0) {
          originalData = result[0];
        }
      } catch (error) {
        console.error('Erro ao capturar dados originais:', error);
      }
    }
    
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
        
        // Para UPDATE, comparar dados antigos com novos
        if (action === AUDIT_ACTIONS.UPDATE && originalData) {
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.senha) {
            sanitizedBody.senha = '[REDACTED]';
          }
          
          // Identificar mudanças
          const changes = {};
          Object.keys(sanitizedBody).forEach(key => {
            if (originalData[key] !== sanitizedBody[key]) {
              changes[key] = {
                from: originalData[key],
                to: sanitizedBody[key]
              };
            }
          });
          
          details.requestBody = sanitizedBody;
          details.changes = changes;
          details.resourceId = req.params.id;
        }
        
        // Para CREATE
        if (action === AUDIT_ACTIONS.CREATE) {
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.senha) {
            sanitizedBody.senha = '[REDACTED]';
          }
          details.requestBody = sanitizedBody;
        }
        
        // Para DELETE
        if (action === AUDIT_ACTIONS.DELETE) {
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
    const { executeQuery } = require('../config/database');
    
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
      query += ' AND DATE(a.timestamp) >= ?';
      params.push(filters.data_inicio);
    }
    
    if (filters.data_fim) {
      query += ' AND DATE(a.timestamp) <= ?';
      params.push(filters.data_fim);
    }
    
    query += ' ORDER BY a.timestamp DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 100, filters.offset || 0);
    
    const logs = await executeQuery(query, params);
    
    const processedLogs = logs.map(log => {
      try {
        let detalhes = null;
        if (log.detalhes) {
          if (typeof log.detalhes === 'string') {
            detalhes = JSON.parse(log.detalhes);
          } else {
            detalhes = log.detalhes;
          }
        }
        
        return {
          ...log,
          detalhes: detalhes
        };
      } catch (parseError) {
        return {
          ...log,
          detalhes: null
        };
      }
    });
    
    return processedLogs;
    
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    throw error;
  }
};

module.exports = {
  AUDIT_ACTIONS,
  logAction,
  auditMiddleware,
  auditChangesMiddleware,
  getAuditLogs
}; 