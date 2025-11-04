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
   * A semana de abastecimento deve ser a semana seguinte à data de entrega CD
   */
  static buscarSemanaAbastecimento = asyncHandler(async (req, res) => {
    const { data_entrega } = req.body;
    
    if (!data_entrega) {
      return errorResponse(res, 'Data de entrega é obrigatória', STATUS_CODES.BAD_REQUEST);
    }

    // Usar o método buscarSemanaAbastecimento que busca na tabela calendario
    // e calcula a semana seguinte
    const semana_abastecimento = await SolicitacoesComprasCRUDController.buscarSemanaAbastecimento(data_entrega);

    return successResponse(res, {
      semana_abastecimento,
      data_entrega
    }, 'Semana de abastecimento encontrada com sucesso');
  });
}

module.exports = SolicitacoesComprasIntegrationsController;

