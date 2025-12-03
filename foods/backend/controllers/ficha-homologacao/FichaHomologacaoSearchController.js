/**
 * Controller de Busca para Ficha Homologação
 * Responsável por operações de busca específicas
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class FichaHomologacaoSearchController {
  
  /**
   * Buscar fichas de homologação similares
   */
  static buscarFichasHomologacaoSimilares = asyncHandler(async (req, res) => {
    const { search, limit = 10 } = req.query;

    if (!search || search.trim() === '') {
      return errorResponse(res, 'Termo de busca é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    const fichasHomologacao = await executeQuery(
      `SELECT 
        fh.*,
        ng.nome as nome_generico_nome,
        ng.codigo as nome_generico_codigo,
        f.razao_social as fornecedor_nome,
        f.nome_fantasia as fornecedor_nome_fantasia,
        um.nome as unidade_medida_nome,
        um.sigla as unidade_medida_sigla,
        u.nome as avaliador_nome
      FROM ficha_homologacao fh
      LEFT JOIN produto_generico ng ON fh.produto_generico_id = ng.id
      LEFT JOIN fornecedores f ON fh.fornecedor_id = f.id
      LEFT JOIN unidades_medida um ON fh.unidade_medida_id = um.id
      LEFT JOIN usuarios u ON fh.avaliador_id = u.id
      WHERE (
        ng.nome LIKE ? OR 
        ng.codigo LIKE ? OR 
        f.nome LIKE ? OR 
        fh.marca LIKE ? OR
        fh.fabricante LIKE ?
      ) AND fh.status = 'ativo'
      ORDER BY fh.data_analise DESC
      LIMIT ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, parseInt(limit)]
    );

    successResponse(res, fichasHomologacao, 'Fichas de homologação similares encontradas');
  });
}

module.exports = FichaHomologacaoSearchController;

