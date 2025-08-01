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
    console.log('Detalhes da auditoria:', {
      userId,
      action,
      resource,
      details,
      ip
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não falhar a operação principal se a auditoria falhar
  }
};

// Middleware para auditoria automática
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(data) {
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
          details.resourceId = req.params.id || req.params.usuarioId;
        }
        
        await logAction(
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
    if (action === AUDIT_ACTIONS.UPDATE && (req.params.id || req.params.usuarioId)) {
      try {
        const { executeQuery } = require('../config/database');
        let tableName;
        switch (resource) {
          case 'usuarios':
            tableName = 'usuarios';
            break;
          case 'unidades':
            tableName = 'unidades_medida';
            break;
          case 'grupos':
            tableName = 'grupos';
            break;
          case 'subgrupos':
            tableName = 'subgrupos';
            break;
          case 'produtos':
            tableName = 'produtos';
            break;
          case 'fornecedores':
            tableName = 'fornecedores';
            break;
          case 'marcas':
            tableName = 'marcas';
            break;
          case 'classes':
            tableName = 'classes';
            break;
          case 'nome_generico_produto':
            tableName = 'nome_generico_produto';
            break;
          case 'permissoes':
            tableName = 'permissoes_usuario';
            break;
          default:
            tableName = resource;
        }
        
        const resourceId = req.params.id || req.params.usuarioId;
        const result = await executeQuery(
          `SELECT * FROM ${tableName} WHERE id = ?`,
          [resourceId]
        );
        
        if (result.length > 0) {
          originalData = result[0];
        }
      } catch (error) {
        console.error('Erro ao capturar dados originais:', error);
      }
    }
    
    const originalSend = res.send;
    
    res.send = async function(data) {
      // Registrar apenas se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const details = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent')
        };
        
        // Para UPDATE, comparar dados antigos com novos
        if (action === AUDIT_ACTIONS.UPDATE && (originalData || resource === 'permissoes')) {
          console.log('=== INÍCIO DA COMPARAÇÃO DE MUDANÇAS ===');
          console.log('Recurso:', resource);
          console.log('Dados originais:', originalData);
          console.log('Dados novos:', req.body);
          const sanitizedBody = { ...req.body };
          if (sanitizedBody.senha) {
            sanitizedBody.senha = '[REDACTED]';
          }
          
          // Identificar mudanças
          const changes = {};
          
          // Para permissões, comparar arrays de permissões
          if (resource === 'permissoes' && sanitizedBody.permissoes) {
            try {
              // Usar estado anterior enviado pelo frontend
              const estadoAnterior = sanitizedBody.estado_anterior || {};
              console.log('Estado anterior recebido:', estadoAnterior);
              console.log('Novas permissões:', sanitizedBody.permissoes);
              
              // Comparar com novas permissões
              sanitizedBody.permissoes.forEach(newPerm => {
                const originalPerm = estadoAnterior[newPerm.tela];
                console.log(`Comparando tela ${newPerm.tela}:`, {
                  original: originalPerm,
                  nova: newPerm
                });
                
                if (originalPerm) {
                  ['pode_visualizar', 'pode_criar', 'pode_editar', 'pode_excluir'].forEach(acao => {
                    const oldValue = originalPerm[acao];
                    const newValue = newPerm[acao];
                    console.log(`Comparando ${acao}: ${oldValue} vs ${newValue}`);
                    
                    if (oldValue !== newValue) {
                      changes[`${newPerm.tela}_${acao}`] = {
                        from: oldValue ? 'Sim' : 'Não',
                        to: newValue ? 'Sim' : 'Não'
                      };
                      console.log(`Mudança detectada: ${newPerm.tela}_${acao} = ${oldValue ? 'Sim' : 'Não'} → ${newValue ? 'Sim' : 'Não'}`);
                    }
                  });
                } else {
                  console.log(`Tela ${newPerm.tela} não encontrada no estado anterior`);
                }
              });
              
              console.log('Mudanças detectadas:', changes);
            } catch (error) {
              console.error('Erro ao comparar permissões:', error);
            }
          } else {
            // Para outros recursos, comparar campos simples
            Object.keys(sanitizedBody).forEach(key => {
              if (originalData[key] !== sanitizedBody[key]) {
                changes[key] = {
                  from: originalData[key],
                  to: sanitizedBody[key]
                };
              }
            });
          }
          
          details.requestBody = sanitizedBody;
          details.changes = changes;
          details.resourceId = req.params.id || req.params.usuarioId;
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
        
        await logAction(
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
    console.log('=== INÍCIO DA FUNÇÃO getAuditLogs ===');
    console.log('Filtros recebidos:', filters);
    
    // Query com filtros e JOIN com usuários
    const limit = parseInt(filters.limit) || 100;
    const offset = parseInt(filters.offset) || 0;
    
    let whereConditions = [];
    
    // Filtro por ação
    if (filters.acao && filters.acao !== 'todas') {
      whereConditions.push(`a.acao = '${filters.acao}'`);
    }
    
    // Filtro por recurso
    if (filters.recurso && filters.recurso !== 'todos') {
      whereConditions.push(`a.recurso = '${filters.recurso}'`);
    }
    
    // Filtro por período
    if (filters.data_inicio) {
      whereConditions.push(`DATE(a.timestamp) >= '${filters.data_inicio}'`);
      console.log('Filtro data_inicio adicionado:', filters.data_inicio);
    }
    
    if (filters.data_fim) {
      whereConditions.push(`DATE(a.timestamp) <= '${filters.data_fim}'`);
      console.log('Filtro data_fim adicionado:', filters.data_fim);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const query = `
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
      ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log('Query final:', query);
    console.log('Where conditions:', whereConditions);
    
    const logs = await executeQuery(query);
    console.log('Logs brutos encontrados:', logs.length);
    
    if (logs.length > 0) {
      console.log('Primeiro log:', {
        id: logs[0].id,
        usuario_id: logs[0].usuario_id,
        acao: logs[0].acao,
        recurso: logs[0].recurso,
        detalhes_type: typeof logs[0].detalhes,
        detalhes_length: logs[0].detalhes ? logs[0].detalhes.length : 0
      });
    }
    
    // Processar logs com tratamento de erro mais robusto
    const processedLogs = logs.map((log, index) => {
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
        console.error(`Erro ao processar log ${index}:`, parseError);
        console.error('Log problemático:', log);
        return {
          ...log,
          detalhes: null
        };
      }
    });
    
    console.log('Logs processados com sucesso:', processedLogs.length);
    return processedLogs;
    
  } catch (error) {
    console.error('=== ERRO NA FUNÇÃO getAuditLogs ===');
    console.error('Erro ao buscar logs de auditoria:', error);
    console.error('Stack trace:', error.stack);
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