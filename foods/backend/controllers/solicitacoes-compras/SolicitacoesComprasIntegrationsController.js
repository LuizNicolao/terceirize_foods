/**
 * Controller de Integrações de Solicitações de Compras
 * Responsável por APIs auxiliares e integrações
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const SolicitacoesComprasCRUDController = require('./SolicitacoesComprasCRUDController');

class SolicitacoesComprasIntegrationsController {
  
  /**
   * Buscar semana de abastecimento baseado na data de entrega
   */
  static buscarSemanaAbastecimento = asyncHandler(async (req, res) => {
    const { data_entrega } = req.body;
    
    if (!data_entrega) {
      return errorResponse(res, 'Data de entrega é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    // Buscar se já existe
    const [existente] = await executeQuery(
      `SELECT semana_abastecimento 
       FROM solicitacoes_compras 
       WHERE data_entrega_cd = ? 
         AND semana_abastecimento IS NOT NULL 
       LIMIT 1`,
      [data_entrega]
    );

    let semana_abastecimento;
    if (existente && existente.semana_abastecimento) {
      semana_abastecimento = existente.semana_abastecimento;
    } else {
      // Calcular nova
      semana_abastecimento = SolicitacoesComprasCRUDController.calcularSemanaAbastecimento(data_entrega);
    }

    return successResponse(res, {
      semana_abastecimento,
      data_entrega
    }, 'Semana de abastecimento encontrada com sucesso');
  });
}

module.exports = SolicitacoesComprasIntegrationsController;

