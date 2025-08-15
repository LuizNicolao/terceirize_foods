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
        p.codigo_barras,
        p.fator_conversao,
        p.referencia_interna,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.nome_generico_id,
        p.produto_origem_id,
        p.marca_id,
        p.peso_liquido,
        p.peso_bruto,
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
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        po.nome as produto_origem_nome
      FROM produtos p

      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN produto_origem po ON p.produto_origem_id = po.id
      WHERE p.status = 1
    `;
    
    let params = [];
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE status = 1`;
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
        p.codigo_barras,
        p.fator_conversao,
        p.referencia_interna,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.nome_generico_id,
        p.produto_origem_id,
        p.marca_id,
        p.peso_liquido,
        p.peso_bruto,
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
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        po.nome as produto_origem_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN produto_origem po ON p.produto_origem_id = po.id
      WHERE p.grupo_id = ? AND p.status = 1
    `;
    
    let params = [grupo_id];
    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos WHERE grupo_id = ? AND status = 1`;
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
   * Buscar produtos por código de barras
   */
  static buscarProdutosPorCodigoBarras = asyncHandler(async (req, res) => {
    const { codigo_barras } = req.params;

    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.codigo_produto,
        p.nome,
        p.codigo_barras,
        p.fator_conversao,
        p.referencia_interna,
        p.referencia_externa,
        p.referencia_mercado,
        p.unidade_id,
        p.grupo_id,
        p.subgrupo_id,
        p.classe_id,
        p.nome_generico_id,
        p.produto_origem_id,
        p.marca_id,
        p.peso_liquido,
        p.peso_bruto,
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
        p.status,
        p.criado_em,
        p.atualizado_em,
        p.usuario_criador_id,
        p.usuario_atualizador_id,
        p.tipo_registro,
        p.embalagem_secundaria_id,
        p.fator_conversao_embalagem,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        po.nome as produto_origem_nome
       FROM produtos p
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
       LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
       LEFT JOIN produto_origem po ON p.produto_origem_id = po.id
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
   * Listar grupos disponíveis
   */
  static listarGrupos = asyncHandler(async (req, res) => {
    const query = `
      SELECT id, nome, descricao, status, criado_em, atualizado_em
      FROM grupos 
      WHERE status = 1
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
      WHERE status = 1
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
      WHERE status = 1
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
      SELECT id, nome, sigla, status, criado_em, atualizado_em
      FROM unidades_medida 
      WHERE status = 1
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