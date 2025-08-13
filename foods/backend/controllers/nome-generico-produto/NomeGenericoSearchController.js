/**
 * Controller de Busca de Nomes Genéricos
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NomeGenericoSearchController {
  
  /**
   * Buscar nomes genéricos ativos
   */
  static buscarNomesGenericosAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
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
      WHERE ngp.status = 1
      GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome
    `;
    
    let params = [];
    baseQuery += ' ORDER BY ngp.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nomesGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM nome_generico_produto WHERE status = 1`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/nome-generico-produto/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nomesGenericos, 'Nomes genéricos ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(nomesGenericos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar nomes genéricos por grupo
   */
  static buscarNomesGenericosPorGrupo = asyncHandler(async (req, res) => {
    const { grupo_id } = req.params;
    const pagination = req.pagination;

    // Verificar se grupo existe
    const grupo = await executeQuery(
      'SELECT id, nome FROM grupos WHERE id = ?',
      [grupo_id]
    );

    if (grupo.length === 0) {
      return notFoundResponse(res, 'Grupo não encontrado');
    }

    // Query base para nomes genéricos do grupo
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
      WHERE ngp.grupo_id = ? AND ngp.status = 1
      GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome
    `;
    
    let params = [grupo_id];
    baseQuery += ' ORDER BY ngp.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nomesGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM nome_generico_produto WHERE grupo_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [grupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/nome-generico-produto/grupo/${grupo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nomesGenericos, `Nomes genéricos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(nomesGenericos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar nomes genéricos por subgrupo
   */
  static buscarNomesGenericosPorSubgrupo = asyncHandler(async (req, res) => {
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

    // Query base para nomes genéricos do subgrupo
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
      WHERE ngp.subgrupo_id = ? AND ngp.status = 1
      GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome
    `;
    
    let params = [subgrupo_id];
    baseQuery += ' ORDER BY ngp.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nomesGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM nome_generico_produto WHERE subgrupo_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [subgrupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/nome-generico-produto/subgrupo/${subgrupo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nomesGenericos, `Nomes genéricos do subgrupo ${subgrupo[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(nomesGenericos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar nomes genéricos por classe
   */
  static buscarNomesGenericosPorClasse = asyncHandler(async (req, res) => {
    const { classe_id } = req.params;
    const pagination = req.pagination;

    // Verificar se classe existe
    const classe = await executeQuery(
      'SELECT id, nome FROM classes WHERE id = ?',
      [classe_id]
    );

    if (classe.length === 0) {
      return notFoundResponse(res, 'Classe não encontrada');
    }

    // Query base para nomes genéricos da classe
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
      WHERE ngp.classe_id = ? AND ngp.status = 1
      GROUP BY ngp.id, ngp.nome, ngp.grupo_id, ngp.subgrupo_id, ngp.classe_id, ngp.status, ngp.data_cadastro, ngp.data_atualizacao, g.nome, sg.nome, c.nome
    `;
    
    let params = [classe_id];
    baseQuery += ' ORDER BY ngp.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const nomesGenericos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM nome_generico_produto WHERE classe_id = ? AND status = 1`;
    const totalResult = await executeQuery(countQuery, [classe_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/nome-generico-produto/classe/${classe_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, nomesGenericos, `Nomes genéricos da classe ${classe[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(nomesGenericos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar produtos de um nome genérico
   */
  static buscarProdutosNomeGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se nome genérico existe
    const nomeGenerico = await executeQuery(
      'SELECT id, nome FROM nome_generico_produto WHERE id = ?',
      [id]
    );

    if (nomeGenerico.length === 0) {
      return notFoundResponse(res, 'Nome genérico não encontrado');
    }

    const produtos = await executeQuery(
      `SELECT 
        p.id, p.nome, p.codigo, p.descricao, p.status,
        f.nome as fornecedor_nome,
        m.marca as marca_nome,
        u.sigla as unidade_sigla
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       WHERE p.nome_generico_id = ? AND p.status = 1
       ORDER BY p.nome ASC`,
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addListLinks(produtos);

    return successResponse(res, data, `Produtos do nome genérico ${nomeGenerico[0].nome} listados com sucesso`, STATUS_CODES.OK);
  });
}

module.exports = NomeGenericoSearchController;
