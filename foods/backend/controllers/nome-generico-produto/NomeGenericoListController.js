/**
 * Controller de Listagem de Nomes Genéricos
 * Responsável por listar e buscar nomes genéricos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NomeGenericoListController {
  
  /**
   * Listar nomes genéricos com paginação, busca e HATEOAS
   */
  static listarNomesGenericos = asyncHandler(async (req, res) => {
    const { search = '', status, grupo_id, subgrupo_id, classe_id } = req.query;
    const pagination = req.pagination;

    // Query base com informações do grupo, subgrupo e classe
    let baseQuery = `
      SELECT 
        ngp.id, 
        ngp.nome, 
        ngp.grupo_id,
        ngp.subgrupo_id,
        ngp.classe_id,
        ngp.status, 
        ngp.data_cadastro as criado_em,
        ngp.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        COUNT(p.id) as total_produtos
      FROM nome_generico_produto ngp
      LEFT JOIN grupos g ON ngp.grupo_id = g.id
      LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
      LEFT JOIN classes c ON ngp.classe_id = c.id
      LEFT JOIN produtos p ON ngp.id = p.nome_generico_id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND ngp.nome LIKE ?';
      params.push(`%${search}%`);
    }

    if (status !== undefined) {
      baseQuery += ' AND ngp.status = ?';
      params.push(status);
    }

    if (grupo_id) {
      baseQuery += ' AND ngp.grupo_id = ?';
      params.push(grupo_id);
    }

    if (subgrupo_id) {
      baseQuery += ' AND ngp.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    if (classe_id) {
      baseQuery += ' AND ngp.classe_id = ?';
      params.push(classe_id);
    }

    baseQuery += ' GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome ORDER BY ngp.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nomesGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(DISTINCT ngp.id) as total FROM nome_generico_produto ngp WHERE 1=1${search ? ' AND ngp.nome LIKE ?' : ''}${status !== undefined ? ' AND ngp.status = ?' : ''}${grupo_id ? ' AND ngp.grupo_id = ?' : ''}${subgrupo_id ? ' AND ngp.subgrupo_id = ?' : ''}${classe_id ? ' AND ngp.classe_id = ?' : ''}`;
    const countParams = search ? [`%${search}%`] : [];
    if (status !== undefined) {
      countParams.push(status);
    }
    if (grupo_id) {
      countParams.push(grupo_id);
    }
    if (subgrupo_id) {
      countParams.push(subgrupo_id);
    }
    if (classe_id) {
      countParams.push(classe_id);
    }
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/nome-generico-produto', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nomesGenericos, 'Nomes genéricos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(nomesGenericos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar nome genérico por ID
   */
  static buscarNomeGenericoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const nomesGenericos = await executeQuery(
      `SELECT 
        ngp.id, 
        ngp.nome, 
        ngp.grupo_id,
        ngp.subgrupo_id,
        ngp.classe_id,
        ngp.status, 
        ngp.data_cadastro as criado_em,
        ngp.data_atualizacao as atualizado_em,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        COUNT(p.id) as total_produtos
       FROM nome_generico_produto ngp
       LEFT JOIN grupos g ON ngp.grupo_id = g.id
       LEFT JOIN subgrupos sg ON ngp.subgrupo_id = sg.id
       LEFT JOIN classes c ON ngp.classe_id = c.id
       LEFT JOIN produtos p ON ngp.id = p.nome_generico_id
       WHERE ngp.id = ?
       GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome`,
      [id]
    );

    if (nomesGenericos.length === 0) {
      return notFoundResponse(res, 'Nome genérico não encontrado');
    }

    const nomeGenerico = nomesGenericos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(nomeGenerico);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, nomeGenerico.id);

    return successResponse(res, data, 'Nome genérico encontrado com sucesso', STATUS_CODES.OK, {
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

module.exports = NomeGenericoListController;
