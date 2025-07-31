/**
 * Controller de Produtos
 * Implementa todas as operações CRUD com padrões RESTful, HATEOAS e paginação
 */

const { executeQuery } = require('../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  conflictResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../middleware/responseHandler');
const { asyncHandler } = require('../middleware/responseHandler');

class ProdutosController {
  
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
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN unidades u ON p.unidade_id = u.id
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

    if (status) {
      baseQuery += ' AND p.status = ?';
      params.push(status);
    }

    baseQuery += ' ORDER BY p.nome ASC';

    // Aplicar paginação
    const { query, params: paginatedParams } = pagination.applyPagination(baseQuery, params);
    
    // Executar query paginada
    const produtos = await executeQuery(query, paginatedParams);

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

    // Adicionar links HATEOAS
    const data = res.addListLinks(produtos, meta.pagination, queryParams);

    // Gerar links de ações baseado nas permissões do usuário
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions);

    return successResponse(res, data, 'Produtos listados com sucesso', STATUS_CODES.OK, {
      ...meta,
      actions
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
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN unidades u ON p.unidade_id = u.id
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
   * Criar novo produto
   */
  static criarProduto = asyncHandler(async (req, res) => {
    const {
      nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, 
      estoque_atual, estoque_minimo, fornecedor_id, grupo_id, subgrupo_id, unidade_id, status
    } = req.body;

    // Verificar se código de barras já existe
    if (codigo_barras) {
      const existingProduto = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_barras = ?',
        [codigo_barras]
      );

      if (existingProduto.length > 0) {
        return conflictResponse(res, 'Código de barras já cadastrado');
      }
    }

    // Verificar se fornecedor existe (se fornecido)
    if (fornecedor_id) {
      const fornecedor = await executeQuery(
        'SELECT id FROM fornecedores WHERE id = ? AND status = 1',
        [fornecedor_id]
      );

      if (fornecedor.length === 0) {
        return errorResponse(res, 'Fornecedor não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se grupo existe (se fornecido)
    if (grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se subgrupo existe (se fornecido)
    if (subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return errorResponse(res, 'Subgrupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade existe (se fornecida)
    if (unidade_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades WHERE id = ?',
        [unidade_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir produto
    const result = await executeQuery(
      `INSERT INTO produtos (nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, 
                            estoque_atual, estoque_minimo, fornecedor_id, grupo_id, subgrupo_id, unidade_id, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, estoque_atual, estoque_minimo, 
       fornecedor_id, grupo_id, subgrupo_id, unidade_id, status || 'ativo']
    );

    const novoProdutoId = result.insertId;

    // Buscar produto criado
    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN unidades u ON p.unidade_id = u.id
       WHERE p.id = ?`,
      [novoProdutoId]
    );

    const produto = produtos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, produto.id);

    return successResponse(res, data, 'Produto criado com sucesso', STATUS_CODES.CREATED, {
      actions
    });
  });

  /**
   * Atualizar produto
   */
  static atualizarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    // Verificar se código de barras já existe (se estiver sendo alterado)
    if (updateData.codigo_barras) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?',
        [updateData.codigo_barras, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código de barras já cadastrado');
      }
    }

    // Verificar se fornecedor existe (se fornecido)
    if (updateData.fornecedor_id) {
      const fornecedor = await executeQuery(
        'SELECT id FROM fornecedores WHERE id = ? AND status = 1',
        [updateData.fornecedor_id]
      );

      if (fornecedor.length === 0) {
        return errorResponse(res, 'Fornecedor não encontrado ou inativo', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se grupo existe (se fornecido)
    if (updateData.grupo_id) {
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [updateData.grupo_id]
      );

      if (grupo.length === 0) {
        return errorResponse(res, 'Grupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se subgrupo existe (se fornecido)
    if (updateData.subgrupo_id) {
      const subgrupo = await executeQuery(
        'SELECT id FROM subgrupos WHERE id = ?',
        [updateData.subgrupo_id]
      );

      if (subgrupo.length === 0) {
        return errorResponse(res, 'Subgrupo não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade existe (se fornecida)
    if (updateData.unidade_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades WHERE id = ?',
        [updateData.unidade_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateParams.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE produtos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar produto atualizado
    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN unidades u ON p.unidade_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    const produto = produtos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produto);

    // Gerar links de ações
    const userPermissions = req.user ? this.getUserPermissions(req.user) : [];
    const actions = res.generateActionLinks(userPermissions, produto.id);

    return successResponse(res, data, 'Produto atualizado com sucesso', STATUS_CODES.OK, {
      actions
    });
  });

  /**
   * Excluir produto
   */
  static excluirProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    // Verificar se produto está sendo usado em alguma tabela relacionada
    const hasRelations = await executeQuery(
      'SELECT COUNT(*) as count FROM almoxarifado_itens WHERE produto_id = ?',
      [id]
    );

    if (hasRelations[0].count > 0) {
      return errorResponse(res, 'Produto não pode ser excluído pois está sendo usado em almoxarifado', STATUS_CODES.BAD_REQUEST);
    }

    // Excluir produto (soft delete - alterar status para inativo)
    await executeQuery(
      'UPDATE produtos SET status = "inativo", atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Produto excluído com sucesso', STATUS_CODES.NO_CONTENT);
  });

  /**
   * Buscar produtos por grupo
   */
  static buscarPorGrupo = asyncHandler(async (req, res) => {
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
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN unidades u ON p.unidade_id = u.id
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

    // Adicionar links HATEOAS
    const data = res.addListLinks(produtos, meta.pagination, queryParams);

    return successResponse(res, data, `Produtos do grupo ${grupo[0].nome} listados com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Buscar produtos por fornecedor
   */
  static buscarPorFornecedor = asyncHandler(async (req, res) => {
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
        p.nome,
        p.descricao,
        p.codigo_barras,
        p.fator_conversao,
        p.preco_custo,
        p.preco_venda,
        p.estoque_atual,
        p.estoque_minimo,
        p.status,
        p.criado_em,
        p.atualizado_em,
        f.id as fornecedor_id,
        f.razao_social as fornecedor_nome,
        g.id as grupo_id,
        g.nome as grupo_nome,
        sg.id as subgrupo_id,
        sg.nome as subgrupo_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN unidades u ON p.unidade_id = u.id
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

    // Adicionar links HATEOAS
    const data = res.addListLinks(produtos, meta.pagination, queryParams);

    return successResponse(res, data, `Produtos do fornecedor ${fornecedor[0].razao_social} listados com sucesso`, STATUS_CODES.OK, meta);
  });

  /**
   * Atualizar estoque do produto
   */
  static atualizarEstoque = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { estoque_atual, estoque_minimo } = req.body;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id, nome FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (estoque_atual !== undefined) {
      updateFields.push('estoque_atual = ?');
      updateParams.push(estoque_atual);
    }

    if (estoque_minimo !== undefined) {
      updateFields.push('estoque_minimo = ?');
      updateParams.push(estoque_minimo);
    }

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo de estoque para atualizar', STATUS_CODES.BAD_REQUEST);
    }

    updateFields.push('atualizado_em = NOW()');
    updateParams.push(id);

    // Executar atualização
    await executeQuery(
      `UPDATE produtos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar produto atualizado
    const produtos = await executeQuery(
      `SELECT 
        p.id,
        p.nome,
        p.estoque_atual,
        p.estoque_minimo,
        p.atualizado_em
       FROM produtos p
       WHERE p.id = ?`,
      [id]
    );

    const produto = produtos[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produto);

    return successResponse(res, data, 'Estoque atualizado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Obter permissões do usuário atual
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

module.exports = ProdutosController; 