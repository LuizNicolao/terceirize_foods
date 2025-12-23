const { executeQuery } = require('../../config/database');

/**
 * Controller para operações de ajuste de necessidades
 */

// Salvar ajustes da nutricionista
const salvarAjustes = async (req, res) => {
  try {
    const { escola_id, grupo, periodo, itens } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !itens || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id e itens são obrigatórios'
      });
    }

    let updatedCount = 0;

    // Atualizar cada item
    for (const item of itens) {
      const { necessidade_id, ajuste_nutricionista } = item;

      if (!necessidade_id) continue;

      // Buscar registro atual incluindo o status
      const currentRecord = await executeQuery(`
        SELECT ajuste_nutricionista, ajuste, ajuste_conf_nutri, status FROM necessidades 
        WHERE id = ? AND escola_id = ? AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      `, [necessidade_id, escola_id]);

      if (currentRecord.length > 0) {
        const currentValue = currentRecord[0].ajuste_nutricionista;
        const currentAjusteConfNutri = currentRecord[0].ajuste_conf_nutri;
        // Normalizar vírgula para ponto antes de processar
        let newValue = ajuste_nutricionista || null;
        if (newValue !== null && typeof newValue === 'string') {
          newValue = newValue.replace(',', '.');
          newValue = parseFloat(newValue);
          if (isNaN(newValue)) {
            newValue = null;
          }
        }
        const currentStatus = currentRecord[0].status;
        
        // Determinar qual valor atual preservar em ajuste_anterior
        let valorAnterior = null;
        
        // Se status for CONF NUTRI, atualizar ajuste_conf_nutri também
        if (currentStatus === 'CONF NUTRI') {
          // Preservar o valor atual de ajuste_conf_nutri em ajuste_anterior
          valorAnterior = currentAjusteConfNutri ?? currentValue ?? currentRecord[0].ajuste;
          const valorFinal = newValue !== null ? newValue : currentValue;
          
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_conf_nutri = ?,
                ajuste_anterior = ?,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ? AND escola_id = ? AND status = 'CONF NUTRI'
          `, [valorFinal, valorAnterior, necessidade_id, escola_id]);
        } else {
          // Se status for NEC ou NEC NUTRI, atualizar apenas ajuste_nutricionista
          // Preservar o valor atual de ajuste_nutricionista em ajuste_anterior
          valorAnterior = currentValue ?? currentRecord[0].ajuste;
          
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_nutricionista = COALESCE(?, ajuste_nutricionista),
                ajuste_anterior = ?,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ? AND escola_id = ? AND status IN ('NEC', 'NEC NUTRI')
          `, [newValue, valorAnterior, necessidade_id, escola_id]);
        }
        
        updatedCount++;
      }
    }

    // Atualizar status do conjunto para 'NEC NUTRI' se houve atualizações
    if (updatedCount > 0) {
      // Se grupo foi fornecido, usar filtro por grupo
      if (grupo) {
      await executeQuery(`
        UPDATE necessidades 
        SET status = 'NEC NUTRI', data_atualizacao = CURRENT_TIMESTAMP
        WHERE escola_id = ? 
          AND status = 'NEC'
          AND produto_id IN (
            SELECT DISTINCT ppc.produto_id 
            FROM produtos_per_capita ppc
            WHERE ppc.grupo = ?
          )
      `, [escola_id, grupo]);
      }

      // Aplicar filtros de período se fornecidos
      if (periodo && periodo.consumo_de && periodo.consumo_ate) {
        await executeQuery(`
          UPDATE necessidades 
          SET status = 'NEC NUTRI', data_atualizacao = CURRENT_TIMESTAMP
          WHERE escola_id = ? 
            AND status = 'NEC'
            AND semana_consumo BETWEEN ? AND ?
        `, [escola_id, periodo.consumo_de, periodo.consumo_ate]);
      }
    }

    res.json({
      success: true,
      message: 'Ajustes salvos com sucesso',
      data: {
        updated: updatedCount,
        status: 'NEC NUTRI'
      }
    });
  } catch (error) {
    console.error('Erro ao salvar ajustes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao salvar ajustes'
    });
  }
};

// Incluir produto extra
const incluirProdutoExtra = async (req, res) => {
  try {
    const { escola_id, grupo, periodo, produto_id, quantidade, semana_consumo, semana_abastecimento } = req.body;

    // Validar dados obrigatórios
    if (!escola_id || !grupo || !produto_id) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'escola_id, grupo e produto_id são obrigatórios'
      });
    }

    // Verificar se o produto pertence ao grupo e buscar grupo_id
    // Primeiro tenta buscar em produtos_per_capita
    let produtoGrupo = await executeQuery(`
      SELECT ppc.produto_id, ppc.produto_nome, ppc.unidade_medida, ppc.produto_codigo, ppc.grupo, ppc.grupo_id
      FROM produtos_per_capita ppc
      WHERE ppc.produto_id = ? AND ppc.grupo COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci AND ppc.ativo = true
    `, [produto_id, grupo]);

    // Se não encontrou em produtos_per_capita, tenta buscar em necessidades (produtos excluídos)
    if (produtoGrupo.length === 0) {
      const produtoExcluido = await executeQuery(`
        SELECT DISTINCT
          n.produto_id,
          n.produto as produto_nome,
          n.produto_unidade as unidade_medida,
          n.grupo,
          n.grupo_id,
          COALESCE(ppc.produto_codigo, po.codigo, '') as produto_codigo
        FROM necessidades n
        LEFT JOIN produtos_per_capita ppc ON ppc.produto_id = n.produto_id 
          AND ppc.grupo COLLATE utf8mb4_unicode_ci = n.grupo COLLATE utf8mb4_unicode_ci
        LEFT JOIN foods_db.produto_origem po ON po.id = n.produto_id
        WHERE n.produto_id = ? 
          AND n.grupo COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
        LIMIT 1
      `, [produto_id, grupo]);

      if (produtoExcluido.length > 0) {
        // Usar dados do produto excluído
        produtoGrupo = [{
          produto_id: produtoExcluido[0].produto_id,
          produto_nome: produtoExcluido[0].produto_nome,
          unidade_medida: produtoExcluido[0].unidade_medida,
          produto_codigo: produtoExcluido[0].produto_codigo,
          grupo: produtoExcluido[0].grupo,
          grupo_id: produtoExcluido[0].grupo_id
        }];
      }
    }

    // Se ainda não encontrou, tenta buscar em foods_db.produto_origem
    if (produtoGrupo.length === 0) {
      const produtoOrigem = await executeQuery(`
        SELECT 
          po.id as produto_id,
          po.nome as produto_nome,
          po.codigo as produto_codigo,
          g.nome as grupo,
          g.id as grupo_id,
          COALESCE(um.sigla, um.nome, 'UN') as unidade_medida
        FROM foods_db.produto_origem po
        LEFT JOIN foods_db.grupos g ON po.grupo_id = g.id
        LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
        WHERE po.id = ? AND g.nome COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
        LIMIT 1
      `, [produto_id, grupo]);

      if (produtoOrigem.length > 0) {
        produtoGrupo = [{
          produto_id: produtoOrigem[0].produto_id,
          produto_nome: produtoOrigem[0].produto_nome,
          unidade_medida: produtoOrigem[0].unidade_medida,
          produto_codigo: produtoOrigem[0].produto_codigo,
          grupo: produtoOrigem[0].grupo,
          grupo_id: produtoOrigem[0].grupo_id
        }];
      }
    }

    if (produtoGrupo.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Produto inválido',
        message: 'Produto não pertence ao grupo especificado ou não foi encontrado'
      });
    }

    const produto = produtoGrupo[0];

    // Verificar se já existe necessidade para este produto/escola/período
    // Considerar apenas registros que não estão excluídos
    let whereClause = `escola_id = ? AND produto_id = ? AND status != 'EXCLUÍDO'`;
    const params = [escola_id, produto_id];

    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      whereClause += ` AND semana_consumo BETWEEN ? AND ?`;
      params.push(periodo.consumo_de, periodo.consumo_ate);
    } else if (semana_consumo) {
      whereClause += ` AND semana_consumo = ?`;
      params.push(semana_consumo);
    }

    const existing = await executeQuery(`
      SELECT id, status, semana_consumo, produto FROM necessidades WHERE ${whereClause}
    `, params);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Produto já incluído',
        message: 'Este produto já está incluído na necessidade'
      });
    }

    // Verificar se existe um registro excluído que pode ser reativado
    let whereClauseExcluido = `escola_id = ? AND produto_id = ? AND status = 'EXCLUÍDO'`;
    const paramsExcluido = [escola_id, produto_id];

    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      whereClauseExcluido += ` AND semana_consumo BETWEEN ? AND ?`;
      paramsExcluido.push(periodo.consumo_de, periodo.consumo_ate);
    } else if (semana_consumo) {
      whereClauseExcluido += ` AND semana_consumo = ?`;
      paramsExcluido.push(semana_consumo);
    }

    const existingExcluido = await executeQuery(`
      SELECT id, status, semana_consumo, produto FROM necessidades WHERE ${whereClauseExcluido}
      ORDER BY id DESC LIMIT 1
    `, paramsExcluido);

    // Se encontrou um registro excluído, vamos reativá-lo ao invés de criar novo
    let reativarRegistro = false;
    let registroIdParaReativar = null;

    if (existingExcluido.length > 0) {
      reativarRegistro = true;
      registroIdParaReativar = existingExcluido[0].id;
    }

    // Buscar dados da escola e necessidade_id das necessidades existentes
    // IMPORTANTE: Buscar também usuario_email e usuario_id para manter consistência
    // Usar semana_consumo e semana_abastecimento enviados pelo frontend
    const escolaExistente = await executeQuery(`
      SELECT escola, escola_rota, codigo_teknisa, necessidade_id, semana_consumo as semana_consumo_existente, semana_abastecimento as semana_abastecimento_existente, usuario_email, usuario_id, status
      FROM necessidades 
      WHERE escola_id = ? AND status != 'EXCLUÍDO'
      LIMIT 1
    `, [escola_id]);

    if (escolaExistente.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Escola não encontrada',
        message: 'Escola não encontrada'
      });
    }

    // Garantir que valores undefined sejam null (requisito do mysql2)
    const semanaConsumoFinal = semana_consumo || escolaExistente[0].semana_consumo_existente || null;
    const semanaAbastecimentoFinal = semana_abastecimento || escolaExistente[0].semana_abastecimento_existente || null;

    const escolaData = {
      nome_escola: escolaExistente[0].escola,
      rota: escolaExistente[0].escola_rota,
      codigo_teknisa: escolaExistente[0].codigo_teknisa,
      necessidade_id: escolaExistente[0].necessidade_id,
      semana_consumo: semanaConsumoFinal,
      semana_abastecimento: semanaAbastecimentoFinal,
      usuario_email: escolaExistente[0].usuario_email,
      usuario_id: escolaExistente[0].usuario_id
    };

    // Determinar status baseado no status atual do conjunto
    const statusConjunto = await executeQuery(`
      SELECT DISTINCT status FROM necessidades 
      WHERE escola_id = ? AND status IN ('NEC', 'NEC NUTRI', 'CONF NUTRI')
      LIMIT 1
    `, [escola_id]);

    // Manter o status atual ou usar NEC como padrão
    let novoStatus = 'NEC';
    if (statusConjunto.length > 0) {
      const statusAtual = statusConjunto[0].status;
      if (statusAtual === 'NEC NUTRI' || statusAtual === 'CONF NUTRI') {
        novoStatus = statusAtual;
      }
    }

    // Determinar em qual coluna salvar baseado no status
    const qtdFinal = quantidade || 0;
    let ajuste = 0;  // ajuste sempre deve ter um valor (NOT NULL)
    let ajuste_nutricionista = null;
    let ajuste_conf_nutri = null;

    if (novoStatus === 'NEC') {
      ajuste = qtdFinal;
    } else if (novoStatus === 'NEC NUTRI') {
      ajuste_nutricionista = qtdFinal;
    } else if (novoStatus === 'CONF NUTRI') {
      ajuste_conf_nutri = qtdFinal;
    }

    let resultId;

    if (reativarRegistro) {
      // Reativar registro excluído ao invés de criar novo
      await executeQuery(`
        UPDATE necessidades SET
          status = ?,
          ajuste = ?,
          ajuste_nutricionista = ?,
          ajuste_conf_nutri = ?,
          ajuste_conf_coord = NULL,
          semana_consumo = ?,
          semana_abastecimento = ?,
          observacoes = 'Produto extra reativado pela nutricionista',
          data_atualizacao = NOW()
        WHERE id = ?
      `, [
        novoStatus,
        ajuste,
        ajuste_nutricionista,
        ajuste_conf_nutri,
        escolaData.semana_consumo,
        escolaData.semana_abastecimento,
        registroIdParaReativar
      ]);
      resultId = registroIdParaReativar;
    } else {
      // Criar nova necessidade com o mesmo necessidade_id
      const result = await executeQuery(`
        INSERT INTO necessidades (
          usuario_email,
          usuario_id,
          produto_id,
          produto,
          produto_unidade,
          escola_id,
          escola,
          escola_rota,
          codigo_teknisa,
          ajuste,
          semana_consumo,
          semana_abastecimento,
          grupo,
          grupo_id,
          status,
          observacoes,
          necessidade_id,
          ajuste_nutricionista,
          ajuste_conf_nutri,
          ajuste_conf_coord
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        escolaData.usuario_email,
        escolaData.usuario_id,
        produto_id,
        produto.produto_nome,
        produto.unidade_medida,
        escola_id,
        escolaData.nome_escola,
        escolaData.rota ? String(escolaData.rota).substring(0, 255) : '', // Truncar para evitar erro de tamanho
        escolaData.codigo_teknisa || '',
        ajuste,
        escolaData.semana_consumo,
        escolaData.semana_abastecimento,
        produto.grupo,
        produto.grupo_id,
        novoStatus,
        'Produto extra incluído pela nutricionista',
        escolaData.necessidade_id, // Usar o mesmo necessidade_id
        ajuste_nutricionista,
        ajuste_conf_nutri,
        null // ajuste_conf_coord inicialmente null
      ]);
      resultId = result.insertId;
    }

    res.status(201).json({
      success: true,
      message: reativarRegistro ? 'Produto extra reativado com sucesso' : 'Produto extra incluído com sucesso',
      data: {
        id: resultId,
        produto_id: produto_id,
        produto: produto.produto_nome,
        produto_unidade: produto.unidade_medida,
        ajuste: novoStatus === 'NEC' ? ajuste : 0,
        ajuste_nutricionista: novoStatus === 'NEC NUTRI' ? ajuste_nutricionista : null,
        status: novoStatus
      }
    });
  } catch (error) {
    console.error('[incluirProdutoExtra] ❌ Erro ao incluir produto extra:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao incluir produto extra'
    });
  }
};

// Excluir produto de necessidade em ajuste
const excluirProdutoAjuste = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const tipo_usuario = req.user.tipo_de_acesso;

    // Verificar se o produto existe e tem status apropriado para exclusão
    const produto = await executeQuery(`
      SELECT 
        id, 
        status, 
        escola_id, 
        usuario_id, 
        produto,
        semana_consumo
      FROM necessidades 
      WHERE id = ? AND status NOT IN ('EXCLUÍDO', 'CONF')
    `, [id]);

    if (produto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado',
        message: 'Produto não encontrado ou não pode ser excluído'
      });
    }

    const produtoData = produto[0];

    // Verificar permissões baseado no tipo de usuário
    if (tipo_usuario === 'nutricionista') {
      // Nutricionista pode excluir produtos em status iniciais ou ajustados por ela
      if (!['NEC', 'NEC NUTRI', 'CONF NUTRI'].includes(produtoData.status)) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
          message: 'Produto não pode ser excluído neste status'
        });
      }
    } else if (tipo_usuario === 'coordenador' || tipo_usuario === 'supervisor' || tipo_usuario === 'administrador') {
      // Coordenador/supervisor/admin pode excluir produtos em NEC COORD, CONF COORD, etc.
      if (!['NEC', 'NEC NUTRI', 'NEC COORD', 'CONF NUTRI', 'CONF COORD'].includes(produtoData.status)) {
        return res.status(403).json({
          success: false,
          error: 'Sem permissão',
          message: 'Produto não pode ser excluído neste status'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão',
        message: 'Você não tem permissão para excluir produtos'
      });
    }

    // Alterar status para EXCLUÍDO (não deletar fisicamente)
    await executeQuery(`
      UPDATE necessidades 
      SET status = 'EXCLUÍDO', data_atualizacao = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
      data: {
        produto: produtoData.produto
      }
    });
  } catch (error) {
    console.error('Erro ao excluir produto em ajuste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir produto'
    });
  }
};

module.exports = {
  salvarAjustes,
  incluirProdutoExtra,
  excluirProdutoAjuste
};

