/**
 * Controller de Estatísticas de Almoxarifado Estoque
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoEstoqueStatsController {
  
  /**
   * Buscar estatísticas gerais de estoque
   */
  static buscarEstatisticas = asyncHandler(async (req, res) => {
    const { almoxarifado_id, produto_generico_id } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (almoxarifado_id) {
      whereClause += ' AND ae.almoxarifado_id = ?';
      params.push(almoxarifado_id);
    }

    if (produto_generico_id) {
      whereClause += ' AND ae.produto_generico_id = ?';
      params.push(produto_generico_id);
    }

    // Estatísticas gerais
    const totalEstoques = await executeQuery(
      `SELECT COUNT(*) as total FROM almoxarifado_estoque ae ${whereClause}`,
      params
    );

    const estoquesAtivos = await executeQuery(
      `SELECT COUNT(*) as total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'ATIVO'`,
      params
    );

    const estoquesBloqueados = await executeQuery(
      `SELECT COUNT(*) as total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'BLOQUEADO'`,
      params
    );

    const estoquesInativos = await executeQuery(
      `SELECT COUNT(*) as total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'INATIVO'`,
      params
    );

    // Valor total do estoque
    const valorTotalEstoque = await executeQuery(
      `SELECT COALESCE(SUM(ae.valor_total), 0) as valor_total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'ATIVO'`,
      params
    );

    // Quantidade total
    const quantidadeTotal = await executeQuery(
      `SELECT COALESCE(SUM(ae.quantidade_atual), 0) as quantidade_total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'ATIVO'`,
      params
    );

    // Produtos abaixo do estoque mínimo
    const produtosAbaixoMinimo = await executeQuery(
      `SELECT COUNT(*) as total FROM almoxarifado_estoque ae ${whereClause} AND ae.status = 'ATIVO' AND ae.quantidade_atual < ae.estoque_minimo`,
      params
    );

    const estatisticas = {
      geral: {
        total_estoques: totalEstoques[0].total,
        estoques_ativos: estoquesAtivos[0].total,
        estoques_bloqueados: estoquesBloqueados[0].total,
        estoques_inativos: estoquesInativos[0].total,
        valor_total_estoque: parseFloat(valorTotalEstoque[0].valor_total || 0),
        quantidade_total: parseFloat(quantidadeTotal[0].quantidade_total || 0),
        produtos_abaixo_minimo: produtosAbaixoMinimo[0].total
      }
    };

    return successResponse(res, estatisticas, 'Estatísticas de estoque obtidas com sucesso', STATUS_CODES.OK);
  });
}

module.exports = AlmoxarifadoEstoqueStatsController;

