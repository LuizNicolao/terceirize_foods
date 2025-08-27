/**
 * Controller de Listagem de Auditoria
 * Responsável por listar logs de auditoria com filtros e paginação
 */

const { executeQuery } = require('../../config/database');
const { getAuditLogs } = require('../../utils/audit');
const { successResponse, errorResponse } = require('../../middleware/responseHandler');

class AuditoriaListController {
  // Listar logs de auditoria com filtros
  static async listarLogs(req, res) {
    try {
      console.log('=== INÍCIO DA REQUISIÇÃO DE AUDITORIA ===');
      console.log('Usuário atual:', {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      });

      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.role !== 'administrador') {
        return errorResponse(res, 'Apenas administradores podem visualizar logs de auditoria.', 403);
      }

      console.log('Usuário tem permissão, buscando logs...');

      // Buscar logs com todos os filtros disponíveis
      const { 
        page = 1,
        limit = 100, 
        offset = 0,
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id
      } = req.query;

      const actualOffset = offset || (page - 1) * limit;
      
      const filters = {
        limit: parseInt(limit),
        offset: parseInt(actualOffset)
      };

      // Adicionar filtros opcionais
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      console.log('Buscando logs de auditoria com filtros:', filters);
      const logs = await getAuditLogs(filters);
      console.log('Logs encontrados:', logs.length);

      // Buscar total de registros para paginação
      let totalCount = 0;
      try {
        const countQuery = `
          SELECT COUNT(*) as total
          FROM auditoria_acoes aa
          LEFT JOIN usuarios u ON aa.usuario_id = u.id
          WHERE 1=1
          ${data_inicio ? 'AND aa.timestamp >= ?' : ''}
          ${data_fim ? 'AND aa.timestamp <= ?' : ''}
          ${acao ? 'AND aa.acao = ?' : ''}
          ${recurso ? 'AND aa.recurso = ?' : ''}
          ${usuario_id ? 'AND aa.usuario_id = ?' : ''}
        `;
        
        const countParams = [];
        if (data_inicio) countParams.push(data_inicio);
        if (data_fim) countParams.push(data_fim);
        if (acao) countParams.push(acao);
        if (recurso) countParams.push(recurso);
        if (usuario_id) countParams.push(parseInt(usuario_id));

        const countResult = await executeQuery(countQuery, countParams);
        totalCount = countResult[0].total;
      } catch (error) {
        console.error('Erro ao contar total de logs:', error);
      }

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const meta = {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };

      return successResponse(res, logs, 'Logs de auditoria carregados com sucesso', 200, meta);

    } catch (error) {
      console.error('Erro ao listar logs de auditoria:', error);
      return errorResponse(res, 'Não foi possível carregar os logs de auditoria', 500);
    }
  }

  // Buscar estatísticas de auditoria
  static async buscarEstatisticas(req, res) {
    try {
      // Verificar permissão
      if (req.user.role !== 'administrador') {
        return errorResponse(res, 'Apenas administradores podem visualizar estatísticas de auditoria.', 403);
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

      const estatisticas = {
        total: totalResult[0].total,
        acoes: acoesResult,
        recursos: recursosResult,
        logsPorDia: logsPorDiaResult
      };

      return successResponse(res, estatisticas, 'Estatísticas de auditoria carregadas com sucesso');

    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error);
      return errorResponse(res, 'Erro interno do servidor', 500);
    }
  }
}

module.exports = AuditoriaListController;
