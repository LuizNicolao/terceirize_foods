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
const { gerarCodigoProduto } = require('../../utils/codigoGenerator');

class ProdutosCRUDController {
  
  /**
   * Criar novo produto
   */
  static criarProduto = asyncHandler(async (req, res) => {
    const {
      codigo_produto, nome, codigo_barras, fator_conversao, referencia_interna, 
      referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id, 
      classe_id, nome_generico_id, produto_origem_id, marca_id, peso_liquido, peso_bruto, fabricante, 
      informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
      regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
      altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
      aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status, 
      tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem
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

    // Verificar se produto genérico existe (se fornecido)
    if (nome_generico_id) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [nome_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Produto genérico não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se produto origem existe (se fornecido)
    if (produto_origem_id) {
      const produtoOrigem = await executeQuery(
        'SELECT id FROM produto_origem WHERE id = ?',
        [produto_origem_id]
      );

      if (produtoOrigem.length === 0) {
        return errorResponse(res, 'Produto origem não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se embalagem secundária existe (se fornecida)
    if (embalagem_secundaria_id) {
      const embalagemSecundaria = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [embalagem_secundaria_id]
      );

      if (embalagemSecundaria.length === 0) {
        return errorResponse(res, 'Embalagem secundária não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir produto
    const result = await executeQuery(
      `INSERT INTO produtos (
        codigo_produto, nome, codigo_barras, fator_conversao, referencia_interna, 
        referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id, 
        classe_id, nome_generico_id, produto_origem_id, marca_id, peso_liquido, peso_bruto, fabricante, 
        informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
        altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
        aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status, 
        tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem, usuario_criador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_produto, nome, codigo_barras, fator_conversao || 1.000, referencia_interna, 
        referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id, 
        classe_id, nome_generico_id, produto_origem_id, marca_id, peso_liquido, peso_bruto, fabricante, 
        informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
        altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
        aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status || 1, 
        tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem || 1, req.user.id
      ]
    );

    const produtoId = result.insertId;

    // Buscar produto criado
    const produto = await executeQuery(
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
        po.nome as produto_origem_nome,
        ue.nome as embalagem_secundaria_nome
       FROM produtos p
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
       LEFT JOIN produto_origem po ON p.produto_origem_id = po.id
       LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
       WHERE p.id = ?`,
      [produtoId]
    );

    const produtoCriado = produto[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(produtoCriado);

    return successResponse(res, data, 'Produto criado com sucesso', STATUS_CODES.CREATED);
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

    // Verificação de fornecedor removida pois a tabela não possui fornecedor_id

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

    // Verificar se produto genérico existe (se fornecido)
    if (updateData.nome_generico_id) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [updateData.nome_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Produto genérico não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se produto origem existe (se fornecido)
    if (updateData.produto_origem_id) {
      const produtoOrigem = await executeQuery(
        'SELECT id FROM produto_origem WHERE id = ?',
        [updateData.produto_origem_id]
      );

      if (produtoOrigem.length === 0) {
        return errorResponse(res, 'Produto origem não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se embalagem secundária existe (se fornecida)
    if (updateData.embalagem_secundaria_id) {
      const embalagemSecundaria = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [updateData.embalagem_secundaria_id]
      );

      if (embalagemSecundaria.length === 0) {
        return errorResponse(res, 'Embalagem secundária não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = [
      'codigo_produto', 'nome', 'codigo_barras', 'fator_conversao', 'referencia_interna', 
      'referencia_externa', 'referencia_mercado', 'unidade_id', 'grupo_id', 'subgrupo_id', 
      'classe_id', 'nome_generico_id', 'produto_origem_id', 'marca_id', 'peso_liquido', 'peso_bruto', 'fabricante', 
      'informacoes_adicionais', 'foto_produto', 'prazo_validade', 'unidade_validade', 
      'regra_palet_un', 'ficha_homologacao', 'registro_especifico', 'comprimento', 
      'largura', 'altura', 'volume', 'integracao_senior', 'ncm', 'cest', 'cfop', 
      'ean', 'cst_icms', 'csosn', 'aliquota_icms', 'aliquota_ipi', 'aliquota_pis', 
      'aliquota_cofins', 'status', 'tipo_registro', 'embalagem_secundaria_id', 'fator_conversao_embalagem'
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
    updateFields.push('usuario_atualizador_id = ?');
    updateParams.push(req.user.id);
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
        po.nome as produto_origem_nome,
        ue.nome as embalagem_secundaria_nome
       FROM produtos p

       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN unidades_medida u ON p.unidade_id = u.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
       LEFT JOIN produto_origem po ON p.produto_origem_id = po.id
       LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
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
   * Obter próximo código disponível
   */
  static obterProximoCodigo = asyncHandler(async (req, res) => {
    // Buscar o maior ID atual e adicionar 1
    const maxIdResult = await executeQuery(
      'SELECT MAX(id) as maxId FROM produtos'
    );
    
    const maxId = maxIdResult[0]?.maxId || 0;
    const proximoId = maxId + 1;
    const proximoCodigo = gerarCodigoProduto(proximoId);

    return successResponse(res, {
      proximoId,
      proximoCodigo
    }, 'Próximo código obtido com sucesso', STATUS_CODES.OK);
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

    // Verificação de relacionamentos removida - tabela almoxarifado_itens foi removida

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
