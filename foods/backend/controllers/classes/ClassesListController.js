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

class ClassesListController {
  
  /**
   * Listar classes com paginação, busca e HATEOAS
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const { search = '', status, subgrupo_id } = req.query;
    const pagination = req.pagination;

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
        COUNT(DISTINCT po.id) as total_produtos_origem,
        COUNT(DISTINCT pg.id) as total_produtos_genericos,
        COUNT(DISTINCT p.id) as total_produtos_finais
      FROM classes c
      LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
      LEFT JOIN grupos g ON s.grupo_id = g.id
      LEFT JOIN produto_origem po ON c.id = po.classe_id
      LEFT JOIN produto_generico pg ON c.id = pg.classe_id
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

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM classes c WHERE 1=1${search ? ' AND c.nome LIKE ?' : ''}${status !== undefined ? ' AND c.status = ?' : ''}${subgrupo_id ? ' AND c.subgrupo_id = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    const statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN c.status = 'ativo' THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN c.status = 'inativo' THEN 1 ELSE 0 END) as inativos
      FROM classes c WHERE 1=1${search ? ' AND c.nome LIKE ?' : ''}${status !== undefined ? ' AND c.status = ?' : ''}${subgrupo_id ? ' AND c.subgrupo_id = ?' : ''}`;
    const statsParams = [...params];
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/classes', queryParams);

    // Adicionar links HATEOAS
    const data = res.addListLinks(classes, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, classes, 'Classes listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      actions,
      _links: res.addListLinks(classes, meta.pagination, queryParams)._links
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
