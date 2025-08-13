/**
 * Controller de Estatísticas de Filiais
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FiliaisStatsController {
  
  /**
   * Buscar estatísticas totais das filiais
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    // Query para buscar estatísticas totais
    const statsQuery = `
      SELECT 
        COUNT(*) as total_filiais,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as filiais_ativas,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as filiais_inativas,
        COUNT(DISTINCT estado) as total_estados,
        COUNT(DISTINCT supervisao) as total_supervisoes,
        COUNT(DISTINCT coordenacao) as total_coordenacoes,
        SUM(CASE WHEN cnpj IS NOT NULL AND cnpj != '' THEN 1 ELSE 0 END) as com_cnpj,
        SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as com_email
      FROM filiais
    `;
    
    const statsResult = await executeQuery(statsQuery);
    const estatisticas = statsResult[0];

    // Buscar distribuição por estado
    const estadosQuery = `
      SELECT 
        estado,
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativas
      FROM filiais 
      WHERE estado IS NOT NULL AND estado != ''
      GROUP BY estado 
      ORDER BY total DESC
    `;
    const estadosResult = await executeQuery(estadosQuery);
    estatisticas.distribuicao_estados = estadosResult;

    // Buscar distribuição por supervisão
    const supervisoesQuery = `
      SELECT 
        supervisao,
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativas
      FROM filiais 
      WHERE supervisao IS NOT NULL AND supervisao != ''
      GROUP BY supervisao 
      ORDER BY total DESC
    `;
    const supervisoesResult = await executeQuery(supervisoesQuery);
    estatisticas.distribuicao_supervisoes = supervisoesResult;

    // Buscar distribuição por coordenação
    const coordenacoesQuery = `
      SELECT 
        coordenacao,
        COUNT(*) as total,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ativas
      FROM filiais 
      WHERE coordenacao IS NOT NULL AND coordenacao != ''
      GROUP BY coordenacao 
      ORDER BY total DESC
    `;
    const coordenacoesResult = await executeQuery(coordenacoesQuery);
    estatisticas.distribuicao_coordenacoes = coordenacoesResult;

    return successResponse(res, estatisticas, 'Estatísticas carregadas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = FiliaisStatsController;
