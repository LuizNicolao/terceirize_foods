/**
 * Controller de CRUD para Produto Genérico
 * Responsável por operações de criação, atualização e exclusão
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class ProdutoGenericoCRUDController {
  
  /**
   * Gerenciar vínculo automático entre Produto Genérico e Produto Origem
   */
  static async gerenciarVinculoProdutoOrigem(produtoGenericoId, produtoOrigemId, produtoPadrao, isUpdate = false, oldProdutoPadrao = null) {
    console.log('🔍 Debug - Gerenciando vínculo:', {
      produtoGenericoId,
      produtoOrigemId,
      produtoPadrao,
      isUpdate,
      oldProdutoPadrao
    });

    // Se produto_padrao = "Sim" e tem produto_origem_id
    if (produtoPadrao === 'Sim' && produtoOrigemId) {
      console.log('✅ Criando vínculo - Produto Padrão = Sim');
      
      // Verificar se já existe outro produto genérico padrão vinculado a este produto origem
      const vinculoExistente = await executeQuery(
        `SELECT pg.id, pg.nome, pg.codigo 
         FROM produto_generico pg 
         WHERE pg.produto_origem_id = ? AND pg.produto_padrao = 'Sim' AND pg.id != ?`,
        [produtoOrigemId, produtoGenericoId]
      );

      if (vinculoExistente.length > 0) {
        const produtoExistente = vinculoExistente[0];
        throw new Error(`Este Produto Origem já está vinculado ao Produto Genérico "${produtoExistente.nome}" (${produtoExistente.codigo}) como padrão. Um Produto Origem só pode ter um Produto Genérico padrão por vez.`);
      }

      // Atualizar produto_origem com o novo produto genérico padrão
      await executeQuery(
        'UPDATE produto_origem SET produto_generico_padrao_id = ? WHERE id = ?',
        [produtoGenericoId, produtoOrigemId]
      );
      
      console.log('✅ Vínculo criado com sucesso');
    }
    // Se produto_padrao = "Não" ou não tem produto_origem_id
    else {
      console.log('❌ Removendo vínculo - Produto Padrão = Não');
      
      // Se é uma atualização e o produto_padrao mudou de "Sim" para "Não"
      if (isUpdate && oldProdutoPadrao === 'Sim' && produtoPadrao === 'Não') {
        console.log('🔄 Mudança detectada: Sim → Não, removendo vínculo');
        
        // Remover vínculo do produto origem
        const result = await executeQuery(
          'UPDATE produto_origem SET produto_generico_padrao_id = NULL WHERE produto_generico_padrao_id = ?',
          [produtoGenericoId]
        );
        
        console.log('✅ Vínculo removido. Linhas afetadas:', result.affectedRows);
      }
      // Se não tem produto_origem_id, remover qualquer vínculo existente
      else if (!produtoOrigemId) {
        console.log('🔄 Sem produto origem, removendo vínculo existente');
        
        const result = await executeQuery(
          'UPDATE produto_origem SET produto_generico_padrao_id = NULL WHERE produto_generico_padrao_id = ?',
          [produtoGenericoId]
        );
        
        console.log('✅ Vínculo removido. Linhas afetadas:', result.affectedRows);
      }
      // Se produto_padrao = "Não" mas tem produto_origem_id, também remover vínculo
      else if (produtoPadrao === 'Não' && produtoOrigemId) {
        console.log('🔄 Produto Padrão = Não com produto origem, removendo vínculo');
        
        const result = await executeQuery(
          'UPDATE produto_origem SET produto_generico_padrao_id = NULL WHERE produto_generico_padrao_id = ?',
          [produtoGenericoId]
        );
        
        console.log('✅ Vínculo removido. Linhas afetadas:', result.affectedRows);
      }
    }
  }

  /**
   * Criar novo produto genérico
   */
  static criarProdutoGenerico = asyncHandler(async (req, res) => {
    const {
      codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
      unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
      regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
      registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
      integracao_senior, status
    } = req.body;

    // Verificar se código já existe
    const codigoExistente = await executeQuery(
      'SELECT id FROM produto_generico WHERE codigo = ?',
      [codigo]
    );

    if (codigoExistente.length > 0) {
      return conflictResponse(res, 'Código já existe');
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

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Inserir novo produto genérico
    const novoProdutoGenerico = await executeQuery(
      `INSERT INTO produto_generico (
        codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
        unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
        regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
        registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
        integracao_senior, status, usuario_criador_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo, nome, produto_origem_id, fator_conversao || 1.000, grupo_id, subgrupo_id, classe_id,
        unidade_medida_id, referencia_mercado, produto_padrao || 'Não', peso_liquido, peso_bruto,
        regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
        registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
        integracao_senior, status !== undefined ? status : 1, req.user.id
      ]
    );

    // Gerenciar vínculo automático com produto origem
    try {
      await ProdutoGenericoCRUDController.gerenciarVinculoProdutoOrigem(
        novoProdutoGenerico.insertId, 
        produto_origem_id, 
        produto_padrao || 'Não'
      );
    } catch (error) {
      // Se houve erro no vínculo, excluir o produto genérico criado
      await executeQuery('DELETE FROM produto_generico WHERE id = ?', [novoProdutoGenerico.insertId]);
      return errorResponse(res, error.message, STATUS_CODES.CONFLICT);
    }

    // Buscar produto genérico criado
    const produtoGenericoCriado = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
      WHERE pg.id = ?`,
      [novoProdutoGenerico.insertId]
    );

    successResponse(res, produtoGenericoCriado[0], 'Produto genérico criado com sucesso');
  });

  /**
   * Atualizar produto genérico
   */
  static atualizarProdutoGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
      unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
      regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
      registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
      integracao_senior, status
    } = req.body;

    // Verificar se produto genérico existe e buscar dados atuais
    const produtoGenerico = await executeQuery(
      'SELECT id, nome, produto_padrao, produto_origem_id FROM produto_generico WHERE id = ?',
      [id]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    const produtoAtual = produtoGenerico[0];

    // Verificar se código já existe (se foi alterado)
    if (codigo) {
      const codigoExistente = await executeQuery(
        'SELECT id FROM produto_generico WHERE codigo = ? AND id != ?',
        [codigo, id]
      );

      if (codigoExistente.length > 0) {
        return conflictResponse(res, 'Código já existe');
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

    // Verificar se unidade de medida existe (se fornecida)
    if (unidade_medida_id) {
      const unidade = await executeQuery(
        'SELECT id FROM unidades_medida WHERE id = ?',
        [unidade_medida_id]
      );

      if (unidade.length === 0) {
        return errorResponse(res, 'Unidade de medida não encontrada', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Gerenciar vínculo automático com produto origem ANTES da atualização
    try {
      await ProdutoGenericoCRUDController.gerenciarVinculoProdutoOrigem(
        id, 
        produto_origem_id, 
        produto_padrao, 
        true, 
        produtoAtual.produto_padrao
      );
    } catch (error) {
      return errorResponse(res, error.message, STATUS_CODES.CONFLICT);
    }

    // Atualizar produto genérico
    await executeQuery(
      `UPDATE produto_generico SET 
        codigo = ?, nome = ?, produto_origem_id = ?, fator_conversao = ?, 
        grupo_id = ?, subgrupo_id = ?, classe_id = ?, unidade_medida_id = ?, 
        referencia_mercado = ?, produto_padrao = ?, peso_liquido = ?, peso_bruto = ?,
        regra_palet = ?, informacoes_adicionais = ?, referencia_interna = ?, 
        referencia_externa = ?, registro_especifico = ?, tipo_registro = ?,
        prazo_validade_padrao = ?, unidade_validade = ?, integracao_senior = ?, 
        status = ?, usuario_atualizador_id = ?
      WHERE id = ?`,
      [
        codigo, nome, produto_origem_id, fator_conversao, grupo_id, subgrupo_id, classe_id,
        unidade_medida_id, referencia_mercado, produto_padrao, peso_liquido, peso_bruto,
        regra_palet, informacoes_adicionais, referencia_interna, referencia_externa,
        registro_especifico, tipo_registro, prazo_validade_padrao, unidade_validade,
        integracao_senior, status, req.user.id, id
      ]
    );

    // Buscar produto genérico atualizado
    const produtoGenericoAtualizado = await executeQuery(
      `SELECT 
        pg.*,
        po.nome as produto_origem_nome,
        po.codigo as produto_origem_codigo,
        g.nome as grupo_nome,
        sg.nome as subgrupo_nome,
        c.nome as classe_nome,
        um.nome as unidade_medida_nome,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
      FROM produto_generico pg
      LEFT JOIN produto_origem po ON pg.produto_origem_id = po.id
      LEFT JOIN grupos g ON pg.grupo_id = g.id
      LEFT JOIN subgrupos sg ON pg.subgrupo_id = sg.id
      LEFT JOIN classes c ON pg.classe_id = c.id
      LEFT JOIN unidades_medida um ON pg.unidade_medida_id = um.id
      LEFT JOIN usuarios uc ON pg.usuario_criador_id = uc.id
      LEFT JOIN usuarios ua ON pg.usuario_atualizador_id = ua.id
      WHERE pg.id = ?`,
      [id]
    );

    successResponse(res, produtoGenericoAtualizado[0], 'Produto genérico atualizado com sucesso');
  });

  /**
   * Excluir produto genérico (soft delete)
   */
  static excluirProdutoGenerico = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se produto genérico existe
    const produtoGenerico = await executeQuery(
      'SELECT id, nome FROM produto_generico WHERE id = ?',
      [id]
    );

    if (produtoGenerico.length === 0) {
      return notFoundResponse(res, 'Produto genérico não encontrado');
    }

    // Remover vínculo do produto origem antes de excluir
    await executeQuery(
      'UPDATE produto_origem SET produto_generico_padrao_id = NULL WHERE produto_generico_padrao_id = ?',
      [id]
    );

    // Soft delete - apenas desativar
    await executeQuery(
      'UPDATE produto_generico SET status = 0, usuario_atualizador_id = ? WHERE id = ?',
      [req.user.id, id]
    );

    successResponse(res, { id, nome: produtoGenerico[0].nome }, 'Produto genérico excluído com sucesso');
  });
}

module.exports = ProdutoGenericoCRUDController;
