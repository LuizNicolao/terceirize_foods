/**
 * Controller de Listagem de Almoxarifado Estoque
 * Responsável por listar e buscar estoques
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoEstoqueListController {
  
  /**
   * Listar estoques com paginação, busca e HATEOAS
   */
  static listarEstoques = asyncHandler(async (req, res) => {
    const { search = '', status, almoxarifado_id, produto_generico_id, filial_id, grupo_id, subgrupo_id } = req.query;
    const pagination = req.pagination;

    // Query base com dados relacionados
    let baseQuery = `
      SELECT 
        ae.id,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo,
        ae.produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        COALESCE(ae.grupo_id, pg.grupo_id) as grupo_id,
        COALESCE(ae.grupo_nome, g.nome) as grupo_nome,
        pg.subgrupo_id,
        sg.nome as subgrupo_nome,
        ae.quantidade_atual,
        ae.quantidade_reservada,
        ae.quantidade_disponivel,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.estoque_minimo,
        ae.estoque_maximo,
        ae.lote,
        ae.data_validade,
        ae.status,
        ae.observacoes,
        ae.criado_em,
        ae.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM almoxarifado_estoque ae
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      LEFT JOIN grupos g ON COALESCE(ae.grupo_id, pg.grupo_id) = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN usuarios uc ON ae.usuario_cadastro_id = uc.id
      LEFT JOIN usuarios ua ON ae.usuario_atualizacao_id = ua.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== '') {
      baseQuery += ' AND ae.status = ?';
      params.push(status);
    }

    if (almoxarifado_id) {
      baseQuery += ' AND ae.almoxarifado_id = ?';
      params.push(almoxarifado_id);
    }

    if (produto_generico_id) {
      baseQuery += ' AND ae.produto_generico_id = ?';
      params.push(produto_generico_id);
    }

    if (filial_id) {
      baseQuery += ' AND a.filial_id = ?';
      params.push(filial_id);
    }

    if (grupo_id) {
      baseQuery += ' AND COALESCE(ae.grupo_id, pg.grupo_id) = ?';
      params.push(grupo_id);
    }

    if (subgrupo_id) {
      baseQuery += ' AND pg.subgrupo_id = ?';
      params.push(subgrupo_id);
    }

    baseQuery += ' ORDER BY pg.nome ASC, ae.almoxarifado_id ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const estoques = await executeQuery(query, params);

    // Contar total de registros
    let countQuery = `SELECT COUNT(*) as total FROM almoxarifado_estoque ae 
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ' AND (LOWER(pg.nome) LIKE ? OR LOWER(pg.codigo) LIKE ? OR LOWER(a.nome) LIKE ? OR LOWER(ae.lote) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status !== '') {
      countQuery += ' AND ae.status = ?';
      countParams.push(status);
    }
    
    if (almoxarifado_id) {
      countQuery += ' AND ae.almoxarifado_id = ?';
      countParams.push(almoxarifado_id);
    }
    
    if (produto_generico_id) {
      countQuery += ' AND ae.produto_generico_id = ?';
      countParams.push(produto_generico_id);
    }
    
    if (filial_id) {
      countQuery += ' AND a.filial_id = ?';
      countParams.push(filial_id);
    }
    
    if (grupo_id) {
      countQuery += ' AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) = ?';
      countParams.push(grupo_id);
    }

    if (subgrupo_id) {
      countQuery += ' AND (SELECT subgrupo_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      countParams.push(subgrupo_id);
    }
    
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Calcular estatísticas
    let statsQuery = `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN ae.status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
      SUM(CASE WHEN ae.status = 'BLOQUEADO' THEN 1 ELSE 0 END) as bloqueados,
      SUM(CASE WHEN ae.status = 'INATIVO' THEN 1 ELSE 0 END) as inativos,
      COALESCE(SUM(ae.quantidade_atual), 0) as total_quantidade,
      COALESCE(SUM(ae.valor_total), 0) as valor_total_estoque,
      SUM(CASE WHEN ae.status = 'ATIVO' AND ae.quantidade_atual < ae.estoque_minimo THEN 1 ELSE 0 END) as produtos_abaixo_minimo
      FROM almoxarifado_estoque ae
      LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
      LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
      WHERE 1=1`;
    let statsParams = [];
    
    if (search) {
      statsQuery += ' AND (LOWER((SELECT nome FROM produto_generico WHERE id = ae.produto_generico_id)) LIKE ? OR LOWER((SELECT nome FROM almoxarifado WHERE id = ae.almoxarifado_id)) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      statsParams.push(searchTerm, searchTerm);
    }
    
    if (status && status !== '') {
      statsQuery += ' AND ae.status = ?';
      statsParams.push(status);
    }
    
    if (almoxarifado_id) {
      statsQuery += ' AND ae.almoxarifado_id = ?';
      statsParams.push(almoxarifado_id);
    }
    
    if (produto_generico_id) {
      statsQuery += ' AND ae.produto_generico_id = ?';
      statsParams.push(produto_generico_id);
    }
    
    if (filial_id) {
      statsQuery += ' AND a.filial_id = ?';
      statsParams.push(filial_id);
    }
    
    if (grupo_id) {
      statsQuery += ' AND COALESCE(ae.grupo_id, (SELECT grupo_id FROM produto_generico WHERE id = ae.produto_generico_id)) = ?';
      statsParams.push(grupo_id);
    }

    if (subgrupo_id) {
      statsQuery += ' AND (SELECT subgrupo_id FROM produto_generico WHERE id = ae.produto_generico_id) = ?';
      statsParams.push(subgrupo_id);
    }
    
    const statsResult = await executeQuery(statsQuery, statsParams);
    const statistics = statsResult[0];

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/almoxarifado-estoque', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, estoques, 'Estoques listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      statistics,
      _links: res.addListLinks(estoques, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar estoque por ID
   */
  static buscarEstoquePorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const estoques = await executeQuery(
      `SELECT 
        ae.id,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo,
        ae.produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        ae.quantidade_atual,
        ae.quantidade_reservada,
        ae.quantidade_disponivel,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.estoque_minimo,
        ae.estoque_maximo,
        ae.lote,
        ae.data_validade,
        ae.status,
        ae.observacoes,
        ae.criado_em,
        ae.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado_estoque ae
       LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
       LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
       LEFT JOIN usuarios uc ON ae.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON ae.usuario_atualizacao_id = ua.id
       WHERE ae.id = ?`,
      [id]
    );

    if (estoques.length === 0) {
      return notFoundResponse(res, 'Estoque não encontrado');
    }

    const estoque = estoques[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(estoque);

    return successResponse(res, data, 'Estoque encontrado com sucesso', STATUS_CODES.OK);
  });
}

module.exports = AlmoxarifadoEstoqueListController;

