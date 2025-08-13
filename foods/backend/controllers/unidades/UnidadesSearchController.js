/**
 * Controller de Busca de Unidades de Medida
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class UnidadesSearchController {
  
  /**
   * Buscar unidades ativas
   */
  static buscarUnidadesAtivas = asyncHandler(async (req, res) => {
    const unidades = await executeQuery(`
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em
      FROM unidades_medida 
      WHERE status = 1
      ORDER BY nome ASC
    `);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, unidades, 'Unidades ativas listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(unidades)._links
    });
  });

  /**
   * Buscar unidades por tipo (peso, volume, etc.)
   */
  static buscarUnidadesPorTipo = asyncHandler(async (req, res) => {
    const { tipo } = req.params;

    // Mapeamento de tipos para siglas comuns
    const tiposUnidades = {
      'peso': ['KG', 'G', 'TON', 'LB', 'OZ'],
      'volume': ['L', 'ML', 'M3', 'CM3', 'GAL'],
      'comprimento': ['M', 'CM', 'MM', 'KM', 'IN', 'FT'],
      'area': ['M2', 'CM2', 'KM2', 'HA', 'AC'],
      'tempo': ['H', 'MIN', 'S', 'DIA', 'SEM', 'MES', 'ANO'],
      'quantidade': ['UN', 'PCT', 'CX', 'KG', 'L']
    };

    const siglas = tiposUnidades[tipo.toLowerCase()] || [];

    if (siglas.length === 0) {
      return errorResponse(res, 'Tipo de unidade não reconhecido', STATUS_CODES.BAD_REQUEST);
    }

    const placeholders = siglas.map(() => '?').join(',');
    const query = `
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em
      FROM unidades_medida 
      WHERE sigla IN (${placeholders}) AND status = 1
      ORDER BY nome ASC
    `;

    const unidades = await executeQuery(query, siglas);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, unidades, 'Unidades por tipo listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(unidades)._links
    });
  });

  /**
   * Listar tipos de unidades disponíveis
   */
  static listarTiposUnidades = asyncHandler(async (req, res) => {
    const tipos = [
      { id: 'peso', nome: 'Peso', descricao: 'Unidades de peso (kg, g, ton, etc.)' },
      { id: 'volume', nome: 'Volume', descricao: 'Unidades de volume (l, ml, m³, etc.)' },
      { id: 'comprimento', nome: 'Comprimento', descricao: 'Unidades de comprimento (m, cm, mm, etc.)' },
      { id: 'area', nome: 'Área', descricao: 'Unidades de área (m², cm², ha, etc.)' },
      { id: 'tempo', nome: 'Tempo', descricao: 'Unidades de tempo (h, min, s, etc.)' },
      { id: 'quantidade', nome: 'Quantidade', descricao: 'Unidades de quantidade (un, pct, cx, etc.)' }
    ];

    return successResponse(res, tipos, 'Tipos de unidades listados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = UnidadesSearchController;
