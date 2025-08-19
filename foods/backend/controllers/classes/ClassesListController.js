/**
 * Controller de Listagem de Classes
 * Responsável por listar e buscar classes
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');
const { paginatedResponse } = require('../../middleware/pagination');

class ClassesListController {
  
  /**
   * Listar classes com paginação, busca e HATEOAS
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const { search = '', status, subgrupo_id } = req.query;

    // Query base com informações do subgrupo e grupo
    let baseQuery = `
      SELECT 
        c.id, 
        c.nome, 
        c.codigo,
        c.descricao,
        c.subgrupo_id,
        c.status, 
        c.data_cadastro as criado_em,
        c.data_atualizacao as atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produtos p ON c.id = p.classe_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND c.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND c.status = ?';
      params.push(status);
    }

    if (subgrupo_id) {
      baseQuery += ' AND c.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    baseQuery += ' GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome ORDER BY c.nome ASC';

    // Usar a função padronizada de paginação
    const result = await paginatedResponse(req, res, baseQuery, params, '/api/classes');
    
    // Adicionar links HATEOAS
    const data = res.addListLinks(result.data, result.meta.pagination, req.query);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Classes listadas com sucesso', STATUS_CODES.OK, {
      ...result.meta,
      actions
    });
  });

  /**
   * Buscar classe por ID
   */
  static buscarClassePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const classes = await executeQuery(
      `SELECT 
        c.id, 
        c.nome, 
        c.codigo,
        c.descricao,
        c.subgrupo_id,
        c.status, 
        c.data_cadastro as criado_em,
        c.data_atualizacao as atualizado_em,
        s.nome as subgrupo_nome,
        g.nome as grupo_nome,
        COUNT(p.id) as total_produtos
       FROM classes c
       LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
       LEFT JOIN grupos g ON s.grupo_id = g.id
       LEFT JOIN produtos p ON c.id = p.classe_id
       WHERE c.id = ?
       GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome`,
      [id]
    );

    if (classes.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, classe.id);

    return successResponse(res, data, 'Classe encontrada com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = ClassesListController;
