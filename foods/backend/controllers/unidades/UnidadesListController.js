/**
 * Controller de Listagem de Unidades de Medida
 * Responsável por listar e buscar unidades
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class UnidadesListController {
  
  /**
   * Listar unidades com paginação, busca e HATEOAS
   */
  static listarUnidades = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;

    // Query base
    let baseQuery = `
      SELECT 
        id, nome, sigla, status, 
        criado_em, atualizado_em 
      FROM unidades_medida 
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtro de busca
    if (search) {
      baseQuery += ' AND (nome LIKE ? OR sigla LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Aplicar filtro por status
    if (status !== undefined && status !== '') {
      baseQuery += ' AND status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY nome ASC';

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/unidades');
    
    // Adicionar links HATEOAS
    const data = res.addListLinks(result.data, result.meta.pagination, req.query);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Unidades listadas com sucesso', STATUS_CODES.OK, {
      ...result.meta,
      actions
    });
  });

  /**
   * Buscar unidade por ID
   */
  static buscarUnidadePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const unidades = await executeQuery(
      'SELECT id, nome, sigla, status, criado_em, atualizado_em FROM unidades_medida WHERE id = ?',
      [id]
    );

    if (unidades.length === 0) {
      return notFoundResponse(res, 'Unidade não encontrada');
    }

    // Buscar produtos que usam esta unidade
    const produtosQuery = `
      SELECT id, nome, codigo_barras, status
      FROM produtos 
      WHERE unidade_id = ?
      ORDER BY nome ASC
    `;
    const produtos = await executeQuery(produtosQuery, [id]);

    const unidade = unidades[0];
    unidade.produtos = produtos;
    unidade.total_produtos = produtos.length;

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(unidade);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, unidade.id);

    return successResponse(res, data, 'Unidade encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    const accessLevels = {
      'I': ['visualizar'],
      'II': ['visualizar', 'criar', 'editar'],
      'III': ['visualizar', 'criar', 'editar', 'excluir']
    };

    if (user.tipo_de_acesso === 'administrador') {
      return ['visualizar', 'criar', 'editar', 'excluir'];
    }

    return accessLevels[user.nivel_de_acesso] || [];
  }
}

module.exports = UnidadesListController;
