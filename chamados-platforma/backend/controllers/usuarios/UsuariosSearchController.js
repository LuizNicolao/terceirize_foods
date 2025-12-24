/**
 * Controller de Busca de Usuários
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UsuariosSearchController {
  
  /**
   * Buscar usuários por tipo de acesso
   */
  static buscarPorTipoAcesso = asyncHandler(async (req, res) => {
    const { tipo } = req.params;

    try {
      // Query simples sem paginação
      const query = `
        SELECT 
          id, 
          nome, 
          email, 
          nivel_de_acesso, 
          tipo_de_acesso, 
          status, 
          criado_em, 
          atualizado_em 
        FROM usuarios 
        WHERE tipo_de_acesso = ? AND status = 'ativo'
        ORDER BY nome ASC
      `;
      
      const usuarios = await executeQuery(query, [tipo]);

      return successResponse(res, usuarios, `Usuários do tipo ${tipo} listados com sucesso`, STATUS_CODES.OK);
    } catch (error) {
      console.error(`Erro ao buscar usuários do tipo ${tipo}:`, error);
      throw error;
    }
  });

}

module.exports = UsuariosSearchController;
