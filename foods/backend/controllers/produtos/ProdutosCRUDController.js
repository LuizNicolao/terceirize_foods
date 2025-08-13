/**
 * Controller CRUD de Produtos
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutosCRUDController {
  
  /**
   * Criar novo produto
   */
  static criarProduto = asyncHandler(async (req, res) => {
    const {
      nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, 
      estoque_atual, estoque_minimo, fornecedor_id, grupo_id, subgrupo_id, classe_id, unidade_id, status
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

    // Verificar se classe existe (se fornecida)
    if (classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [classe_id]
      );

      if (classe.length === 0) {
        return errorResponse(res, 'Classe não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade existe (se fornecida)
    if (unidade_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir produto
    const result = await executeQuery(
      `INSERT INTO produtos (nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, 
                            estoque_atual, estoque_minimo, fornecedor_id, grupo_id, subgrupo_id, classe_id, unidade_id, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nome, 
        descricao && descricao.trim() ? descricao.trim() : null,
        codigo_barras && codigo_barras.trim() ? codigo_barras.trim() : null,
        fator_conversao || 1.000,
        preco_custo || null,
        preco_venda || null,
        estoque_atual || 0,
        estoque_minimo || 0,
        fornecedor_id || null,
        grupo_id || null,
        subgrupo_id || null,
        classe_id || null,
        unidade_id || null,
        status || 1
      ]
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
        c.id as classe_id,
        c.nome as classe_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
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

    // Verificar se classe existe (se fornecida)
    if (updateData.classe_id) {
      const classe = await executeQuery(
        'SELECT id FROM classes WHERE id = ?',
        [updateData.classe_id]
      );

      if (classe.length === 0) {
        return errorResponse(res, 'Classe não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se unidade existe (se fornecida)
    if (updateData.unidade_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [updateData.unidade_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = [
      'nome', 'descricao', 'codigo_barras', 'fator_conversao', 'preco_custo', 
      'preco_venda', 'estoque_atual', 'estoque_minimo', 'fornecedor_id', 
      'grupo_id', 'subgrupo_id', 'classe_id', 'unidade_id', 'status'
    ];

    Object.keys(updateData).forEach(key => {
      if (camposValidos.includes(key) && updateData[key] !== undefined) {
        let value = updateData[key];
        
        // Tratar valores vazios ou undefined
        if (value === '' || value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value === '') {
            value = null;
          }
        }
        
        updateFields.push(`${key} = ?`);
        updateParams.push(value);
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
        c.id as classe_id,
        c.nome as classe_nome,
        u.id as unidade_id,
        u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
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
      'UPDATE produtos SET status = 0, atualizado_em = NOW() WHERE id = ?',
      [id]
    );

    return successResponse(res, null, 'Produto excluído com sucesso', STATUS_CODES.NO_CONTENT);
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

module.exports = ProdutosCRUDController;
