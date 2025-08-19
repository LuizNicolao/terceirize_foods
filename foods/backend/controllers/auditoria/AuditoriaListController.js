/**
 * Controller de Listagem de Auditoria
 * Responsável por listar logs de auditoria com filtros e paginação
 */

const { executeQuery } = require('../../config/database');
const { getAuditLogs } = require('../../utils/audit');
const { 
  successResponse, 
  errorResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class AuditoriaListController {
  // Listar logs de auditoria com filtros
  static listarLogs = asyncHandler(async (req, res) => {
    console.log('=== INÍCIO DA REQUISIÇÃO DE AUDITORIA ===');
    console.log('Usuário atual:', {
      id: req.user.id,
      nome: req.user.nome,
      tipo_de_acesso: req.user.tipo_de_acesso,
      nivel_de_acesso: req.user.nivel_de_acesso
    });

    // Verificar se usuário tem permissão para visualizar auditoria
    if (req.user.tipo_de_acesso !== 'administrador' && 
        !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
      return errorResponse(res, 'Acesso negado', 'Apenas administradores e coordenadores nível III podem visualizar logs de auditoria.', STATUS_CODES.FORBIDDEN);
    }

    console.log('Usuário tem permissão, buscando logs...');

    // Extrair parâmetros de filtro
    const { 
      data_inicio,
      data_fim,
      acao,
      recurso,
      usuario_id
    } = req.query;

    // Construir query base
    let baseQuery = `
      SELECT 
        aa.id,
        aa.usuario_id,
        aa.acao,
        aa.recurso,
        aa.detalhes,
        aa.timestamp,
        aa.ip_address,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria_acoes aa
      LEFT JOIN usuarios u ON aa.usuario_id = u.id
      WHERE 1=1
    `;
    
    let params = [];

    // Adicionar filtros
    if (data_inicio) {
      baseQuery += ' AND aa.timestamp >= ?';
      params.push(data_inicio);
    }
    
    if (data_fim) {
      baseQuery += ' AND aa.timestamp <= ?';
      params.push(data_fim);
    }
    
    if (acao) {
      baseQuery += ' AND aa.acao = ?';
      params.push(acao);
    }
    
    if (recurso) {
      baseQuery += ' AND aa.recurso = ?';
      params.push(recurso);
    }
    
    if (usuario_id) {
      baseQuery += ' AND aa.usuario_id = ?';
      params.push(parseInt(usuario_id));
    }

    baseQuery += ' ORDER BY aa.timestamp DESC';

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/auditoria');
    
    return successResponse(res, result.data, 'Logs de auditoria listados com sucesso', STATUS_CODES.OK, result.meta);
  });

  // Buscar estatísticas de auditoria
  static async buscarEstatisticas(req, res) {
    try {
      // Verificar permissão
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado'
        });
      }

      const { data_inicio, data_fim } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (data_inicio) {
        whereClause += ' AND timestamp >= ?';
        params.push(data_inicio);
      }
      if (data_fim) {
        whereClause += ' AND timestamp <= ?';
        params.push(data_fim);
      }

      // Estatísticas por ação
      const acoesQuery = `
        SELECT 
          acao,
          COUNT(*) as total
        FROM auditoria_acoes 
        ${whereClause}
        GROUP BY acao 
        ORDER BY total DESC
      `;
      
      const acoesResult = await executeQuery(acoesQuery, params);

      // Estatísticas por recurso
      const recursosQuery = `
        SELECT 
          recurso,
          COUNT(*) as total
        FROM auditoria_acoes 
        ${whereClause}
        GROUP BY recurso 
        ORDER BY total DESC
        LIMIT 10
      `;
      
      const recursosResult = await executeQuery(recursosQuery, params);

      // Total de logs
      const totalQuery = `SELECT COUNT(*) as total FROM auditoria_acoes ${whereClause}`;
      const totalResult = await executeQuery(totalQuery, params);

      // Logs por dia (últimos 30 dias)
      const logsPorDiaQuery = `
        SELECT 
          DATE(timestamp) as data,
          COUNT(*) as total
        FROM auditoria_acoes 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(timestamp)
        ORDER BY data DESC
      `;
      
      const logsPorDiaResult = await executeQuery(logsPorDiaQuery);

      res.json({
        success: true,
        data: {
          total: totalResult[0].total,
          acoes: acoesResult,
          recursos: recursosResult,
          logsPorDia: logsPorDiaResult
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AuditoriaListController;
