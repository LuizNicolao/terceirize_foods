const { executeQuery } = require('../../config/database');

class NecessidadesCoordenacaoController {
  // Listar necessidades para coordenação (status NEC COORD)
  static async listarParaCoordenacao(req, res) {
    try {
      const { 
        escola_id, 
        grupo,
        semana_consumo, 
        semana_abastecimento,
        nutricionista_id 
      } = req.query;

      let whereConditions = ["n.status IN ('NEC COORD','CONF COORD')"];
      let queryParams = [];

      if (escola_id) {
        whereConditions.push("n.escola_id = ?");
        queryParams.push(escola_id);
      }

      if (grupo) {
        // Usar filtro direto por grupo ou grupo_id (já salvos na tabela necessidades)
        // Tenta primeiro por grupo (nome) e depois por grupo_id (caso seja um ID)
        const grupoId = parseInt(grupo);
        if (!isNaN(grupoId)) {
          // Se grupo for um número, filtrar por grupo_id
          whereConditions.push("n.grupo_id = ?");
          queryParams.push(grupoId);
        } else {
          // Se grupo for texto, filtrar por grupo (nome)
          whereConditions.push("n.grupo = ?");
          queryParams.push(grupo);
        }
      }

      if (semana_consumo) {
        whereConditions.push("n.semana_consumo = ?");
        queryParams.push(semana_consumo);
      }

      if (semana_abastecimento) {
        whereConditions.push("n.semana_abastecimento = ?");
        queryParams.push(semana_abastecimento);
      }

      if (nutricionista_id) {
        whereConditions.push("n.usuario_id = ?");
        queryParams.push(nutricionista_id);
      }

      const query = `
        SELECT 
          n.id,
          n.escola_id,
          n.escola,
          n.escola_rota,
          n.codigo_teknisa,
          n.produto_id,
          n.produto,
          n.produto_unidade,
          n.ajuste,
          n.ajuste_nutricionista,
          n.ajuste_coordenacao,
          n.ajuste_logistica,
          n.ajuste_conf_nutri,
          n.ajuste_conf_coord,
          n.ajuste_anterior,
          n.semana_consumo,
          n.semana_abastecimento,
          n.status,
          n.necessidade_id,
          n.usuario_id as nutricionista_id,
          n.usuario_email as nutricionista_nome,
          n.data_preenchimento,
          n.data_atualizacao,
          COALESCE(ppc.produto_codigo, po.codigo, '') as produto_codigo
        FROM necessidades n
        LEFT JOIN produtos_per_capita ppc ON ppc.produto_id = n.produto_id 
          AND ppc.grupo COLLATE utf8mb4_unicode_ci = n.grupo COLLATE utf8mb4_unicode_ci
          AND ppc.ativo = true
        LEFT JOIN foods_db.produto_origem po ON po.id = n.produto_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY n.escola, n.produto
      `;

      const necessidades = await executeQuery(query, queryParams);

      res.json({
        success: true,
        data: necessidades,
        total: necessidades.length
      });

    } catch (error) {
      console.error('Erro ao listar necessidades para coordenação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Salvar ajustes da coordenação
  static async salvarAjustesCoordenacao(req, res) {
    try {
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de itens é obrigatória'
        });
      }

      let sucessos = 0;
      let erros = 0;

      for (const item of itens) {
        try {
          const { id, ajuste } = item;

          if (!id || ajuste === undefined) {
            erros++;
            continue;
          }

          // Buscar valor atual do ajuste_coordenacao e status
          const currentQuery = `
            SELECT ajuste_coordenacao, ajuste_conf_coord, status 
            FROM necessidades 
            WHERE id = ? AND status IN ('NEC COORD','CONF COORD')
          `;
          const currentResult = await executeQuery(currentQuery, [id]);
          
          if (currentResult.length === 0) {
            erros++;
            continue;
          }

          const currentValue = currentResult[0].ajuste_coordenacao;
          const currentAjusteConfCoord = currentResult[0].ajuste_conf_coord;
          const currentStatus = currentResult[0].status;
          // Normalizar vírgula para ponto antes de processar
          const ajusteNormalizado = String(ajuste).replace(',', '.');
          const newValue = parseFloat(ajusteNormalizado) || 0;
          
          // Determinar qual valor atual preservar em ajuste_anterior
          let valorAnterior = null;

          // Se status for CONF COORD, atualizar ajuste_conf_coord também
          if (currentStatus === 'CONF COORD') {
            // Preservar o valor atual de ajuste_conf_coord em ajuste_anterior
            valorAnterior = currentAjusteConfCoord ?? currentValue;
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_conf_coord = ?,
                  ajuste_anterior = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'CONF COORD'
            `;
            await executeQuery(updateQuery, [newValue, valorAnterior, id]);
          } else {
            // Se status for NEC COORD, atualizar apenas ajuste_coordenacao
            // Preservar o valor atual de ajuste_coordenacao em ajuste_anterior
            valorAnterior = currentValue;
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_coordenacao = ?,
                  ajuste_anterior = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'NEC COORD'
            `;
            await executeQuery(updateQuery, [newValue, valorAnterior, id]);
          }
          
          sucessos++;

        } catch (error) {
          console.error(`Erro ao salvar ajuste para item ${item.id}:`, error);
          erros++;
        }
      }

      res.json({
        success: true,
        message: `${sucessos} ajuste(s) salvo(s) com sucesso${erros > 0 ? `, ${erros} erro(s)` : ''}`,
        sucessos,
        erros
      });

    } catch (error) {
      console.error('Erro ao salvar ajustes da coordenação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Liberar para logística (mudar status para CONF)
  static async liberarParaLogistica(req, res) {
    try {
      const { necessidade_ids } = req.body;

      if (!necessidade_ids || !Array.isArray(necessidade_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de necessidade é obrigatória'
        });
      }

      if (necessidade_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum ID de necessidade fornecido'
        });
      }

      // Processar em blocos para evitar sobrecarga
      const TAMANHO_BLOCO = 50;
      let sucessos = 0;
      let erros = 0;

      // Processar em blocos
      for (let i = 0; i < necessidade_ids.length; i += TAMANHO_BLOCO) {
        const bloco = necessidade_ids.slice(i, i + TAMANHO_BLOCO);
        
        try {
          // Criar placeholders para o IN clause
          const placeholders = bloco.map(() => '?').join(',');
          
          // Primeiro: copiar ajuste_nutricionista para ajuste_coordenacao quando status = 'NEC COORD'
          // (só se ajuste_coordenacao estiver NULL)
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_coordenacao = COALESCE(ajuste_nutricionista, ajuste)
            WHERE necessidade_id IN (${placeholders})
              AND status = 'NEC COORD'
              AND (ajuste_coordenacao IS NULL OR ajuste_coordenacao = 0)
          `, bloco);

          // Segundo: atualizar status para NEC LOG
          const updateQuery = `
            UPDATE necessidades 
            SET status = 'NEC LOG', 
                data_atualizacao = NOW()
            WHERE necessidade_id IN (${placeholders}) AND status = 'NEC COORD'
          `;
          
          const result = await executeQuery(updateQuery, bloco);
          
          sucessos += result.affectedRows;
          erros += (bloco.length - result.affectedRows);

        } catch (error) {
          console.error(`Erro ao processar bloco de necessidades:`, error);
          erros += bloco.length;
        }
      }

      res.json({
        success: sucessos > 0,
        message: `Necessidades liberadas: ${sucessos} sucessos, ${erros} erros`,
        sucessos,
        erros,
        total: necessidade_ids.length
      });

    } catch (error) {
      console.error('Erro ao liberar para logística:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar produtos para modal (mesmo da nutricionista)
  static async buscarProdutosParaModal(req, res) {
    try {
      const { 
        grupo, 
        escola_id, 
        semana_consumo,
        semana_abastecimento, 
        search 
      } = req.query;

      if (!grupo || !escola_id) {
        return res.status(400).json({
          success: false,
          message: 'Grupo e escola são obrigatórios'
        });
      }

      // Buscar produtos já incluídos na necessidade
      // Se semana_consumo for fornecido, usa ele; senão, busca todos os produtos da escola
      let produtosExistentesQuery;
      let queryParams;

      if (semana_consumo && semana_abastecimento) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.semana_abastecimento = ?
            AND n.status IN ('NEC COORD', 'CONF COORD')
        `;
        queryParams = [escola_id, semana_consumo, semana_abastecimento];
      } else if (semana_consumo) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.status IN ('NEC COORD', 'CONF COORD')
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        // Se não tem semana_consumo, busca de todas as necessidades da escola
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.status IN ('NEC COORD', 'CONF COORD')
        `;
        queryParams = [escola_id];
      }
      
      const produtosExistentes = await executeQuery(produtosExistentesQuery, queryParams);
      const idsExistentes = produtosExistentes.map(p => p.produto_id);

      // Buscar produtos disponíveis
      let whereConditions = ["ppc.grupo = ?", "ppc.ativo = true"];
      let produtosQueryParams = [grupo];

      if (idsExistentes.length > 0) {
        whereConditions.push(`ppc.produto_id NOT IN (${idsExistentes.map(() => '?').join(',')})`);
        produtosQueryParams.push(...idsExistentes);
      }

      if (search) {
        whereConditions.push("(ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)");
        produtosQueryParams.push(`%${search}%`, `%${search}%`);
      }

      const query = `
        SELECT DISTINCT 
          ppc.produto_id, 
          ppc.produto_codigo, 
          ppc.produto_nome, 
          ppc.unidade_medida
        FROM produtos_per_capita ppc
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ppc.produto_nome ASC
      `;

      const produtos = await executeQuery(query, produtosQueryParams);

      res.json({
        success: true,
        data: produtos
      });

    } catch (error) {
      console.error('Erro ao buscar produtos para modal:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Incluir produto extra
  static async incluirProdutoExtra(req, res) {
    try {
      const { 
        escola_id, 
        grupo, 
        semana_consumo, 
        semana_abastecimento,
        produto_id,
        quantidade 
      } = req.body;

      if (!escola_id || !grupo || !produto_id) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Buscar dados da escola e produto
      // Se semana_consumo for fornecido, busca por escola e semana; senão, busca por escola
      let escolaQuery;
      let queryParams;

      if (semana_consumo) {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND semana_consumo = ? AND status IN ('NEC COORD', 'CONF COORD')
          LIMIT 1
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND status IN ('NEC COORD', 'CONF COORD')
          LIMIT 1
        `;
        queryParams = [escola_id];
      }
      
      const escolaData = await executeQuery(escolaQuery, queryParams);
      
      if (escolaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada para esta escola'
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

      // Verificar se já existe necessidade para este produto/escola/período (não excluído)
      let whereClause = `escola_id = ? AND produto_id = ? AND status != 'EXCLUÍDO'`;
      const params = [escola_id, produto_id];

      if (semana_consumo) {
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

      if (semana_consumo) {
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

      // Determinar o status baseado no status atual do conjunto
      const statusConjunto = await executeQuery(`
        SELECT DISTINCT status FROM necessidades 
        WHERE escola_id = ? AND status IN ('NEC COORD', 'CONF COORD')
        LIMIT 1
      `, [escola_id]);

      let novoStatus = 'NEC COORD';
      if (statusConjunto.length > 0 && statusConjunto[0].status === 'CONF COORD') {
        novoStatus = 'CONF COORD';
      }

      // Determinar em qual coluna salvar baseado no status
      const qtdFinal = quantidade || 0;
      let ajuste_coordenacao = null;
      let ajuste_conf_coord = null;

      if (novoStatus === 'NEC COORD') {
        ajuste_coordenacao = qtdFinal;
      } else if (novoStatus === 'CONF COORD') {
        ajuste_conf_coord = qtdFinal;
      }

      let resultId;

      if (reativarRegistro) {
        // Reativar registro excluído ao invés de criar novo
        await executeQuery(`
          UPDATE necessidades SET
            status = ?,
            ajuste = 0,
            ajuste_coordenacao = ?,
            ajuste_conf_coord = ?,
            semana_consumo = ?,
            semana_abastecimento = ?,
            observacoes = 'Produto extra reativado pela coordenação',
            data_atualizacao = NOW()
          WHERE id = ?
        `, [
          novoStatus,
          ajuste_coordenacao,
          ajuste_conf_coord,
          semana_consumo || escolaData[0].semana_consumo,
          semana_abastecimento || escolaData[0].semana_abastecimento,
          registroIdParaReativar
        ]);
        resultId = registroIdParaReativar;
      } else {
        // Inserir novo produto
        const insertQuery = `
          INSERT INTO necessidades (
            usuario_email, usuario_id, produto_id, produto, produto_unidade,
            escola_id, escola, escola_rota, codigo_teknisa, ajuste,
            semana_consumo, semana_abastecimento, grupo, grupo_id, status, necessidade_id,
            observacoes, data_preenchimento, ajuste_nutricionista, ajuste_coordenacao, ajuste_conf_nutri, ajuste_conf_coord
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
        `;

        // Truncar escola_rota para evitar erro de tamanho (limite de 255 caracteres)
        const escolaRotaTruncada = escolaData[0].escola_rota ? String(escolaData[0].escola_rota).substring(0, 255) : null;
        
        const values = [
          escolaData[0].usuario_email,
          escolaData[0].usuario_id,
          produto_id,
          produto.produto_nome,
          produto.unidade_medida,
          escola_id,
          escolaData[0].escola,
          escolaRotaTruncada,
          escolaData[0].codigo_teknisa,
          0, // ajuste sempre 0 para coordenação (NOT NULL)
          semana_consumo || escolaData[0].semana_consumo,
          semana_abastecimento || escolaData[0].semana_abastecimento,
          produto.grupo,
          produto.grupo_id,
          novoStatus,
          escolaData[0].necessidade_id,
          'Produto extra incluído pela coordenação',
          null, // ajuste_nutricionista null
          ajuste_coordenacao,
          null, // ajuste_conf_nutri null
          ajuste_conf_coord
        ];

        const result = await executeQuery(insertQuery, values);
        resultId = result.insertId;
      }

      res.json({
        success: true,
        message: reativarRegistro ? 'Produto extra reativado com sucesso' : 'Produto incluído com sucesso',
        data: {
          id: resultId,
          produto: produto.produto_nome,
          unidade: produto.unidade_medida
        }
      });

    } catch (error) {
      console.error('Erro ao incluir produto extra:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar nutricionistas para filtro
  static async listarNutricionistas(req, res) {
    try {
      const query = `
        SELECT DISTINCT 
          n.usuario_id as id,
          u.nome as nome,
          n.usuario_email as email
        FROM necessidades n
        LEFT JOIN usuarios u ON n.usuario_id = u.id
        WHERE n.status IN ('NEC COORD','CONF COORD')
        ORDER BY u.nome
      `;

      const nutricionistas = await executeQuery(query);

      res.json({
        success: true,
        data: nutricionistas
      });

    } catch (error) {
      console.error('Erro ao listar nutricionistas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

// Novos métodos de transição de status na coordenação
NecessidadesCoordenacaoController.confirmarNutri = async (req, res) => {
  try {
    const { escola_id, grupo, periodo } = req.body;

    if (!escola_id || !grupo) {
      return res.status(400).json({ success: false, message: 'escola_id e grupo são obrigatórios' });
    }

    // Atualiza NEC COORD -> CONF NUTRI para o conjunto da escola/grupo/período
    let query = `
      UPDATE necessidades
      SET status = 'CONF NUTRI', data_atualizacao = NOW()
      WHERE escola_id = ? 
        AND status = 'NEC COORD'
        AND produto_id IN (
          SELECT DISTINCT ppc.produto_id FROM produtos_per_capita ppc WHERE ppc.grupo = ?
        )
    `;
    const params = [escola_id, grupo];

    if (periodo && periodo.consumo_de && periodo.consumo_ate) {
      query += ` AND semana_consumo BETWEEN ? AND ?`;
      params.push(periodo.consumo_de, periodo.consumo_ate);
    }

    const result = await executeQuery(query, params);
    return res.json({ success: true, message: 'Enviado para Nutri (CONF NUTRI)', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Erro ao confirmar para Nutri:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

NecessidadesCoordenacaoController.confirmarFinal = async (req, res) => {
  try {
    const { necessidade_ids } = req.body;
    if (!necessidade_ids || !Array.isArray(necessidade_ids)) {
      return res.status(400).json({ success: false, message: 'Lista de IDs de necessidade é obrigatória' });
    }

    if (necessidade_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum ID de necessidade fornecido'
      });
    }

    // Processar em blocos para evitar sobrecarga
    const TAMANHO_BLOCO = 50;
    let sucessos = 0;
    let erros = 0;

    // Processar em blocos
    for (let i = 0; i < necessidade_ids.length; i += TAMANHO_BLOCO) {
      const bloco = necessidade_ids.slice(i, i + TAMANHO_BLOCO);
      
      try {
        // Criar placeholders para o IN clause
        const placeholders = bloco.map(() => '?').join(',');
        
        // Primeiro: copiar ajuste_conf_nutri para ajuste_conf_coord quando status = 'CONF COORD'
        // (só se ajuste_conf_coord estiver NULL)
        await executeQuery(`
          UPDATE necessidades
          SET ajuste_conf_coord = COALESCE(ajuste_conf_nutri, ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste)
          WHERE necessidade_id IN (${placeholders})
            AND status = 'CONF COORD'
            AND (ajuste_conf_coord IS NULL OR ajuste_conf_coord = 0)
        `, bloco);

        // Segundo: atualizar status para CONF
        const result = await executeQuery(`
          UPDATE necessidades
          SET status = 'CONF', data_atualizacao = NOW()
          WHERE necessidade_id IN (${placeholders}) AND status = 'CONF COORD'
        `, bloco);
        
        sucessos += result.affectedRows;
        erros += (bloco.length - result.affectedRows);
      } catch (error) {
        console.error(`Erro ao processar bloco de necessidades:`, error);
        erros += bloco.length;
      }
    }

    return res.json({ 
      success: sucessos > 0, 
      message: `Confirmadas: ${sucessos} sucesso(s), ${erros} erro(s)`, 
      sucessos, 
      erros,
      total: necessidade_ids.length
    });
  } catch (error) {
    console.error('Erro ao confirmar final:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

module.exports = NecessidadesCoordenacaoController;
