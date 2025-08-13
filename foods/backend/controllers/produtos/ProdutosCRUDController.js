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
      codigo_produto, nome, descricao, codigo_barras, referencia, referencia_externa, 
      referencia_mercado, unidade_id, quantidade, grupo_id, subgrupo_id, classe_id, 
      marca_id, agrupamento_n3, agrupamento_n4, peso_liquido, peso_bruto, marca, 
      fabricante, informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
      regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
      altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
      aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, preco_custo, 
      preco_venda, estoque_atual, estoque_minimo, fornecedor_id, status, fator_conversao
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

    // Verificar se marca existe (se fornecida)
    if (marca_id) {
      const marca = await executeQuery(
        'SELECT id FROM marcas WHERE id = ?',
        [marca_id]
      );

      if (marca.length === 0) {
        return errorResponse(res, 'Marca não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir produto
    const result = await executeQuery(
      `INSERT INTO produtos (
        codigo_produto, nome, descricao, codigo_barras, referencia, referencia_externa, 
        referencia_mercado, unidade_id, quantidade, grupo_id, subgrupo_id, classe_id, 
        marca_id, agrupamento_n3, agrupamento_n4, peso_liquido, peso_bruto, marca, 
        fabricante, informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
        altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
        aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, preco_custo, 
        preco_venda, estoque_atual, estoque_minimo, fornecedor_id, status, fator_conversao, 
        usuario_criador_id, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        codigo_produto && codigo_produto.trim() ? codigo_produto.trim() : null,
        nome, 
        descricao && descricao.trim() ? descricao.trim() : null,
        codigo_barras && codigo_barras.trim() ? codigo_barras.trim() : null,
        referencia && referencia.trim() ? referencia.trim() : null,
        referencia_externa && referencia_externa.trim() ? referencia_externa.trim() : null,
        referencia_mercado && referencia_mercado.trim() ? referencia_mercado.trim() : null,
        unidade_id || null,
        quantidade || 1.000,
        grupo_id || null,
        subgrupo_id || null,
        classe_id || null,
        marca_id || null,
        agrupamento_n3 && agrupamento_n3.trim() ? agrupamento_n3.trim() : null,
        agrupamento_n4 && agrupamento_n4.trim() ? agrupamento_n4.trim() : null,
        peso_liquido || null,
        peso_bruto || null,
        marca && marca.trim() ? marca.trim() : null,
        fabricante && fabricante.trim() ? fabricante.trim() : null,
        informacoes_adicionais && informacoes_adicionais.trim() ? informacoes_adicionais.trim() : null,
        foto_produto && foto_produto.trim() ? foto_produto.trim() : null,
        prazo_validade || null,
        unidade_validade || null,
        regra_palet_un || null,
        ficha_homologacao && ficha_homologacao.trim() ? ficha_homologacao.trim() : null,
        registro_especifico && registro_especifico.trim() ? registro_especifico.trim() : null,
        comprimento || null,
        largura || null,
        altura || null,
        volume || null,
        integracao_senior && integracao_senior.trim() ? integracao_senior.trim() : null,
        ncm && ncm.trim() ? ncm.trim() : null,
        cest && cest.trim() ? cest.trim() : null,
        cfop && cfop.trim() ? cfop.trim() : null,
        ean && ean.trim() ? ean.trim() : null,
        cst_icms && cst_icms.trim() ? cst_icms.trim() : null,
        csosn && csosn.trim() ? csosn.trim() : null,
        aliquota_icms || null,
        aliquota_ipi || null,
        aliquota_pis || null,
        aliquota_cofins || null,
        preco_custo || null,
        preco_venda || null,
        estoque_atual || 0,
        estoque_minimo || 0,
        fornecedor_id || null,
        status || 1,
        fator_conversao || 1.000,
        req.user ? req.user.id : null
      ]
    );

    const novoProdutoId = result.insertId;

    // Buscar produto criado
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

    // Verificar se marca existe (se fornecida)
    if (updateData.marca_id) {
      const marca = await executeQuery(
        'SELECT id FROM marcas WHERE id = ?',
        [updateData.marca_id]
      );

      if (marca.length === 0) {
        return errorResponse(res, 'Marca não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = [
      'codigo_produto', 'nome', 'descricao', 'codigo_barras', 'referencia', 
      'referencia_externa', 'referencia_mercado', 'unidade_id', 'quantidade', 
      'grupo_id', 'subgrupo_id', 'classe_id', 'marca_id', 'agrupamento_n3', 
      'agrupamento_n4', 'peso_liquido', 'peso_bruto', 'marca', 'fabricante', 
      'informacoes_adicionais', 'foto_produto', 'prazo_validade', 'unidade_validade', 
      'regra_palet_un', 'ficha_homologacao', 'registro_especifico', 'comprimento', 
      'largura', 'altura', 'volume', 'integracao_senior', 'ncm', 'cest', 'cfop', 
      'ean', 'cst_icms', 'csosn', 'aliquota_icms', 'aliquota_ipi', 'aliquota_pis', 
      'aliquota_cofins', 'preco_custo', 'preco_venda', 'estoque_atual', 
      'estoque_minimo', 'fornecedor_id', 'status', 'fator_conversao'
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
   * Obter permissões do usuário (método auxiliar)
   */
  static getUserPermissions(user) {
    // Implementar lógica de permissões baseada no usuário
    // Por enquanto, retorna permissões básicas
    return ['visualizar', 'criar', 'editar', 'excluir'];
  }
}

module.exports = ProdutosCRUDController;
