/**
 * Controller de Busca de Produtos
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosSearchController {
  
  /**
   * Buscar produtos ativos
   */
  static buscarProdutosAtivos = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.referencia,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.quantidade,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.marca_id,
        p.agrupamento_n3,
        p.agrupamento_n4,
        p.peso_liquido,
        p.peso_bruto,
        p.marca,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.fornecedor_id,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.fator_conversao,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.status = 'ativo'
    `;
    
    let params = [];
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/produtos/ativos', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, produtos, 'Produtos ativos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(produtos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar produtos por grupo
   */
  static buscarProdutosPorGrupo = asyncHandler(async (req, res) => {
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

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.referencia,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.quantidade,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.marca_id,
        p.agrupamento_n3,
        p.agrupamento_n4,
        p.peso_liquido,
        p.peso_bruto,
        p.marca,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.fornecedor_id,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.fator_conversao,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.grupo_id = ? AND p.status = 'ativo'
    `;
    
    let params = [grupo_id];
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE grupo_id = ? AND status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, [grupo_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/produtos/grupo/${grupo_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, produtos, `Produtos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(produtos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar produtos por fornecedor
   */
  static buscarProdutosPorFornecedor = asyncHandler(async (req, res) => {
    const { fornecedor_id } = req.params;
    const pagination = req.pagination;

    // Verificar se fornecedor existe
    const fornecedor = await executeQuery(
      'SELECT id, razao_social FROM fornecedores WHERE id = ? AND status = 1',
      [fornecedor_id]
    );

    if (fornecedor.length === 0) {
      return notFoundResponse(res, 'Fornecedor não encontrado ou inativo');
    }

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.referencia,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.quantidade,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.marca_id,
        p.agrupamento_n3,
        p.agrupamento_n4,
        p.peso_liquido,
        p.peso_bruto,
        p.marca,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.fornecedor_id,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.fator_conversao,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.fornecedor_id = ? AND p.status = 'ativo'
    `;
    
    let params = [fornecedor_id];
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE fornecedor_id = ? AND status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, [fornecedor_id]);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, `/api/produtos/fornecedor/${fornecedor_id}`, queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, produtos, `Produtos do fornecedor ${fornecedor[0].razao_social} listados com sucesso`, STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(produtos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar produtos por código de barras
   */
  static buscarProdutosPorCodigoBarras = asyncHandler(async (req, res) => {
    const { codigo_barras } = req.params;

    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.referencia,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.quantidade,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.marca_id,
        p.agrupamento_n3,
        p.agrupamento_n4,
        p.peso_liquido,
        p.peso_bruto,
        p.marca,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.fornecedor_id,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.fator_conversao,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       WHERE p.codigo_barras = ?`,
      [codigo_barras]
    );

    if (produtos.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    const produto = produtos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produto);

    return successResponse(res, data, 'Produto encontrado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar produtos com estoque baixo
   */
  static buscarProdutosEstoqueBaixo = asyncHandler(async (req, res) => {
    const pagination = req.pagination;

    // Query base
    let baseQuery = `
      SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.referencia,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.quantidade,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.marca_id,
        p.agrupamento_n3,
        p.agrupamento_n4,
        p.peso_liquido,
        p.peso_bruto,
        p.marca,
        p.fabricante,
        p.informacoes_adicionais,
        p.foto_produto,
        p.prazo_validade,
        p.unidade_validade,
        p.regra_palet_un,
        p.ficha_homologacao,
        p.registro_especifico,
        p.comprimento,
        p.largura,
        p.altura,
        p.volume,
        p.integracao_senior,
        p.ncm,
        p.cest,
        p.cfop,
        p.ean,
        p.cst_icms,
        p.csosn,
        p.aliquota_icms,
        p.aliquota_ipi,
        p.aliquota_pis,
        p.aliquota_cofins,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.fornecedor_id,
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.fator_conversao,
        f.razao_social as fornecedor_nome,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.estoque_atual <= p.estoque_minimo AND p.status = 'ativo'
    `;
    
    let params = [];
    baseQuery += ' ORDER BY (p.estoque_minimo - p.estoque_atual) DESC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE estoque_atual <= estoque_minimo AND status = 'ativo'`;
    const totalResult = await executeQuery(countQuery, []);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/produtos/estoque-baixo', queryParams);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, produtos, 'Produtos com estoque baixo listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      _links: res.addListLinks(produtos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Listar grupos disponíveis
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, nome, descricao, status, criado_em, atualizado_em
      FROM grupos 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `;

    const grupos = await executeQuery(query);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, grupos, 'Grupos listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(grupos)._links
    });
  });

  /**
   * Listar subgrupos disponíveis
   */
  static listarSubgrupos = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, nome, descricao, grupo_id, status, criado_em, atualizado_em
      FROM subgrupos 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `;

    const subgrupos = await executeQuery(query);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, subgrupos, 'Subgrupos listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(subgrupos)._links
    });
  });

  /**
   * Listar classes disponíveis
   */
  static listarClasses = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, nome, descricao, status, criado_em, atualizado_em
      FROM classes 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `;

    const classes = await executeQuery(query);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, classes, 'Classes listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(classes)._links
    });
  });

  /**
   * Listar unidades de medida disponíveis
   */
  static listarUnidades = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, nome, sigla, descricao, status, criado_em, atualizado_em
      FROM unidades_medida 
      WHERE status = 'ativo'
      ORDER BY nome ASC
    `;

    const unidades = await executeQuery(query);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, unidades, 'Unidades de medida listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(unidades)._links
    });
  });

  /**
   * Listar marcas disponíveis
   */
  static listarMarcas = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, marca, fabricante, status, criado_em, atualizado_em
      FROM marcas 
      WHERE status = 1
      ORDER BY marca ASC
    `;

    const marcas = await executeQuery(query);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, marcas, 'Marcas listadas com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(marcas)._links
    });
  });
}

module.exports = ProdutosSearchController;
