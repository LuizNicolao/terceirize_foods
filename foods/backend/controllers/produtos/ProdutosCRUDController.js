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
      codigo_produto, nome, codigo_barras, fator_conversao, referencia_interna, 
      referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id, 
      classe_id, nome_generico_id, marca_id, peso_liquido, peso_bruto, fabricante, 
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

    // Verificar se código do produto já existe
    if (codigo_produto) {
      const existingProduto = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_produto = ?',
        [codigo_produto]
      );

      if (existingProduto.length > 0) {
        return conflictResponse(res, 'Código do produto já cadastrado');
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
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se nome genérico existe (se fornecido)
    if (nome_generico_id) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [nome_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Nome genérico não encontrado', STATUS_CODES.BAD_REQUEST);
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

    // Verificar se embalagem secundária existe (se fornecida)
    if (embalagem_secundaria_id) {
      const embalagem = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [embalagem_secundaria_id]
      );

      if (embalagem.length === 0) {
        return errorResponse(res, 'Unidade de embalagem secundária não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir produto
    const insertQuery = `
      INSERT INTO produtos (
        codigo_produto, nome, codigo_barras, fator_conversao, referencia_interna,
        referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id,
        classe_id, nome_generico_id, marca_id, peso_liquido, peso_bruto, fabricante,
        informacoes_adicionais, foto_produto, prazo_validade, unidade_validade,
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura,
        altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn,
        aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status,
        tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem,
        usuario_criador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      codigo_produto, nome, codigo_barras, fator_conversao || 1.000, referencia_interna,
      referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id,
      classe_id, nome_generico_id, marca_id, peso_liquido, peso_bruto, fabricante,
      informacoes_adicionais, foto_produto, prazo_validade, unidade_validade,
      regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura,
      altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn,
      aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status || 1,
      tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem || 1,
      req.user.id
    ];

    const result = await executeQuery(insertQuery, insertParams);
    const produtoId = result.insertId;

    // Buscar produto criado com joins
    const produto = await executeQuery(`
      SELECT 
        p.*,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        uc.nome as usuario_criador_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN usuarios uc ON p.usuario_criador_id = uc.id
      WHERE p.id = ?
    `, [produtoId]);

    return successResponse(res, produto[0], 'Produto criado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar produto
   */
  static atualizarProduto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      codigo_produto, nome, codigo_barras, fator_conversao, referencia_interna, 
      referencia_externa, referencia_mercado, unidade_id, grupo_id, subgrupo_id, 
      classe_id, nome_generico_id, marca_id, peso_liquido, peso_bruto, fabricante, 
      informacoes_adicionais, foto_produto, prazo_validade, unidade_validade, 
      regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, 
      altura, volume, integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, 
      aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, status, 
      tipo_registro, embalagem_secundaria_id, fator_conversao_embalagem
    } = req.body;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    // Verificar se código de barras já existe (se estiver sendo alterado)
    if (codigo_barras) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?',
        [codigo_barras, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código de barras já cadastrado');
      }
    }

    // Verificar se código do produto já existe (se estiver sendo alterado)
    if (codigo_produto) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_produto = ? AND id != ?',
        [codigo_produto, id]
      );

      if (codigoCheck.length > 0) {
        return conflictResponse(res, 'Código do produto já cadastrado');
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
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se nome genérico existe (se fornecido)
    if (nome_generico_id) {
      const nomeGenerico = await executeQuery(
        'SELECT id FROM produto_generico WHERE id = ?',
        [nome_generico_id]
      );

      if (nomeGenerico.length === 0) {
        return errorResponse(res, 'Nome genérico não encontrado', STATUS_CODES.BAD_REQUEST);
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

    // Verificar se embalagem secundária existe (se fornecida)
    if (embalagem_secundaria_id) {
      const embalagem = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [embalagem_secundaria_id]
      );

      if (embalagem.length === 0) {
        return errorResponse(res, 'Unidade de embalagem secundária não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];

    if (codigo_produto !== undefined) {
      updateFields.push('codigo_produto = ?');
      updateParams.push(codigo_produto);
    }
    if (nome !== undefined) {
      updateFields.push('nome = ?');
      updateParams.push(nome);
    }
    if (codigo_barras !== undefined) {
      updateFields.push('codigo_barras = ?');
      updateParams.push(codigo_barras);
    }
    if (fator_conversao !== undefined) {
      updateFields.push('fator_conversao = ?');
      updateParams.push(fator_conversao);
    }
    if (referencia_interna !== undefined) {
      updateFields.push('referencia_interna = ?');
      updateParams.push(referencia_interna);
    }
    if (referencia_externa !== undefined) {
      updateFields.push('referencia_externa = ?');
      updateParams.push(referencia_externa);
    }
    if (referencia_mercado !== undefined) {
      updateFields.push('referencia_mercado = ?');
      updateParams.push(referencia_mercado);
    }
    if (unidade_id !== undefined) {
      updateFields.push('unidade_id = ?');
      updateParams.push(unidade_id);
    }
    if (grupo_id !== undefined) {
      updateFields.push('grupo_id = ?');
      updateParams.push(grupo_id);
    }
    if (subgrupo_id !== undefined) {
      updateFields.push('subgrupo_id = ?');
      updateParams.push(subgrupo_id);
    }
    if (classe_id !== undefined) {
      updateFields.push('classe_id = ?');
      updateParams.push(classe_id);
    }
    if (nome_generico_id !== undefined) {
      updateFields.push('nome_generico_id = ?');
      updateParams.push(nome_generico_id);
    }
    if (marca_id !== undefined) {
      updateFields.push('marca_id = ?');
      updateParams.push(marca_id);
    }
    if (peso_liquido !== undefined) {
      updateFields.push('peso_liquido = ?');
      updateParams.push(peso_liquido);
    }
    if (peso_bruto !== undefined) {
      updateFields.push('peso_bruto = ?');
      updateParams.push(peso_bruto);
    }
    if (fabricante !== undefined) {
      updateFields.push('fabricante = ?');
      updateParams.push(fabricante);
    }
    if (informacoes_adicionais !== undefined) {
      updateFields.push('informacoes_adicionais = ?');
      updateParams.push(informacoes_adicionais);
    }
    if (foto_produto !== undefined) {
      updateFields.push('foto_produto = ?');
      updateParams.push(foto_produto);
    }
    if (prazo_validade !== undefined) {
      updateFields.push('prazo_validade = ?');
      updateParams.push(prazo_validade);
    }
    if (unidade_validade !== undefined) {
      updateFields.push('unidade_validade = ?');
      updateParams.push(unidade_validade);
    }
    if (regra_palet_un !== undefined) {
      updateFields.push('regra_palet_un = ?');
      updateParams.push(regra_palet_un);
    }
    if (ficha_homologacao !== undefined) {
      updateFields.push('ficha_homologacao = ?');
      updateParams.push(ficha_homologacao);
    }
    if (registro_especifico !== undefined) {
      updateFields.push('registro_especifico = ?');
      updateParams.push(registro_especifico);
    }
    if (comprimento !== undefined) {
      updateFields.push('comprimento = ?');
      updateParams.push(comprimento);
    }
    if (largura !== undefined) {
      updateFields.push('largura = ?');
      updateParams.push(largura);
    }
    if (altura !== undefined) {
      updateFields.push('altura = ?');
      updateParams.push(altura);
    }
    if (volume !== undefined) {
      updateFields.push('volume = ?');
      updateParams.push(volume);
    }
    if (integracao_senior !== undefined) {
      updateFields.push('integracao_senior = ?');
      updateParams.push(integracao_senior);
    }
    if (ncm !== undefined) {
      updateFields.push('ncm = ?');
      updateParams.push(ncm);
    }
    if (cest !== undefined) {
      updateFields.push('cest = ?');
      updateParams.push(cest);
    }
    if (cfop !== undefined) {
      updateFields.push('cfop = ?');
      updateParams.push(cfop);
    }
    if (ean !== undefined) {
      updateFields.push('ean = ?');
      updateParams.push(ean);
    }
    if (cst_icms !== undefined) {
      updateFields.push('cst_icms = ?');
      updateParams.push(cst_icms);
    }
    if (csosn !== undefined) {
      updateFields.push('csosn = ?');
      updateParams.push(csosn);
    }
    if (aliquota_icms !== undefined) {
      updateFields.push('aliquota_icms = ?');
      updateParams.push(aliquota_icms);
    }
    if (aliquota_ipi !== undefined) {
      updateFields.push('aliquota_ipi = ?');
      updateParams.push(aliquota_ipi);
    }
    if (aliquota_pis !== undefined) {
      updateFields.push('aliquota_pis = ?');
      updateParams.push(aliquota_pis);
    }
    if (aliquota_cofins !== undefined) {
      updateFields.push('aliquota_cofins = ?');
      updateParams.push(aliquota_cofins);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }
    if (tipo_registro !== undefined) {
      updateFields.push('tipo_registro = ?');
      updateParams.push(tipo_registro);
    }
    if (embalagem_secundaria_id !== undefined) {
      updateFields.push('embalagem_secundaria_id = ?');
      updateParams.push(embalagem_secundaria_id);
    }
    if (fator_conversao_embalagem !== undefined) {
      updateFields.push('fator_conversao_embalagem = ?');
      updateParams.push(fator_conversao_embalagem);
    }

    // Adicionar campos de auditoria
    updateFields.push('usuario_atualizador_id = ?');
    updateParams.push(req.user.id);

    // Adicionar ID do produto
    updateParams.push(id);

    // Executar atualização
    const updateQuery = `
      UPDATE produtos 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(updateQuery, updateParams);

    // Buscar produto atualizado com joins
    const produto = await executeQuery(`
      SELECT 
        p.*,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        u.nome as unidade_nome,
        m.marca as marca_nome,
        ng.nome as nome_generico_nome,
        ue.nome as embalagem_secundaria_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produtos p
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN produto_generico ng ON p.nome_generico_id = ng.id
      LEFT JOIN unidades_medida ue ON p.embalagem_secundaria_id = ue.id
      LEFT JOIN usuarios uc ON p.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON p.usuario_atualizador_id = ua.id
      WHERE p.id = ?
    `, [id]);

    return successResponse(res, produto[0], 'Produto atualizado com sucesso');
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
