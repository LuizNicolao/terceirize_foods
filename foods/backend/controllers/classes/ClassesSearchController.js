/**
 * Controller de Busca de Classes
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ClassesSearchController {
  
  /**
   * Buscar classes ativas
   */
  static buscarClassesAtivas = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
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
      WHERE c.status = 'ativo'
      GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome
    `;
    
    let params = [];
    baseQuery += ' ORDER BY c.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM classes WHERE status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/classes/ativas', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, classes, 'Classes ativas listadas com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(classes, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar classes por subgrupo
   */
  static buscarClassesPorSubgrupo = asyncHandler(async (req, res) => {
    const { subgrupo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se subgrupo existe
    const subgrupo = await executeQuery(
      'SELECT id, nome FROM subgrupos WHERE id = ?',
      [subgrupo_id]
    );

    if (subgrupo.length === 0) {
      return notFoundResponse(res, 'Subgrupo não encontrado');
    }

    // Query base para classes do subgrupo
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
      WHERE c.subgrupo_id = ?
      GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome
    `;
    
    let params = [subgrupo_id];
    baseQuery += ' ORDER BY c.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const classes = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM classes WHERE subgrupo_id = ?`;
    const totalResult = await executeQuery(countQuery, [subgrupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/classes/subgrupo/${subgrupo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, classes, `Classes do subgrupo ${subgrupo[0].nome} listadas com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(classes, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar classes por código
   */
  static buscarClassesPorCodigo = asyncHandler(async (req, res) => {
    const { codigo } = req.params;

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
       WHERE c.codigo = ?
       GROUP BY c.id, c.nome, c.codigo, c.descricao, c.subgrupo_id, c.status, c.data_cadastro, c.data_atualizacao, s.nome, g.nome`,
      [codigo]
    );

    if (classes.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    const classe = classes[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(classe);

    return successResponse(res, data, 'Classe encontrada com sucesso', STATUS_CODES.OK);
  });

  /**
   * Listar subgrupos para select
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const subgrupos = await executeQuery(
      `SELECT s.id, s.nome, g.nome as grupo_nome
       FROM subgrupos s
       LEFT JOIN grupos g ON s.grupo_id = g.id
       WHERE s.status = 'ativo'
       ORDER BY g.nome, s.nome`
    );

    // Adicionar links HATEOAS
    const data = res.addListLinks(subgrupos);

    return successResponse(res, data, 'Subgrupos listados com sucesso', STATUS_CODES.OK);
  });
}

module.exports = ClassesSearchController;
