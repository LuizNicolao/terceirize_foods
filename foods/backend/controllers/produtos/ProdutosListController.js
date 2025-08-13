/**
 * Controller de Listagem de Produtos
 * Responsável por listar e buscar produtos
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosListController {
  
  /**
   * Listar produtos com paginação, busca e HATEOAS
   */
  static listarProdutos = asyncHandler(async (req, res) => {
    const { search = '', grupo_id, fornecedor_id, status } = req.query;
    const pagination = req.pagination;

    // Query base com joins
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
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      baseQuery += ' AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.codigo_barras LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (grupo_id) {
      baseQuery += ' AND p.grupo_id = ?';
      params.push(grupo_id);
    }

    if (fornecedor_id) {
      baseQuery += ' AND p.fornecedor_id = ?';
      params.push(fornecedor_id);
    }

    if (status !== undefined) {
      baseQuery += ' AND p.status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação manualmente
    const limit = pagination.limit;
    const offset = pagination.offset;
    const query = `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar query paginada
    const produtos = await executeQuery(query, params);

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM produtos p WHERE 1=1${search ? ' AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.codigo_barras LIKE ?)' : ''}${grupo_id ? ' AND p.grupo_id = ?' : ''}${fornecedor_id ? ' AND p.fornecedor_id = ?' : ''}${status ? ' AND p.status = ?' : ''}`;
    const countParams = [...params];
    const totalResult = await executeQuery(countQuery, countParams);
    const totalItems = totalResult[0].total;

    // Gerar metadados de paginação
    const queryParams = { ...req.query };
    delete queryParams.page;
    delete queryParams.limit;
    
    const meta = pagination.generateMeta(totalItems, '/api/produtos', queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, produtos, 'Produtos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions,
      _links: res.addListLinks(produtos, meta.pagination, queryParams)._links
    });
  });

  /**
   * Buscar produto por ID
   */
  static buscarProdutoPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

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
        m.nome as marca_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       WHERE p.id = ?`,
      [id]
    );

    if (produtos.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    const produto = produtos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, produto.id);

    return successResponse(res, data, 'Produto encontrado com sucesso', STATUS_CODES.OK, {
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

module.exports = ProdutosListController;
