const { executeQuery } = require('../../config/database');

class NecessidadesLogisticaController {
  // Listar necessidades para logística (status NEC LOG)
  static async listarParaLogistica(req, res) {
    try {
      const { 
        escola_id, 
        semana_consumo, 
        semana_abastecimento,
        nutricionista_id,
        grupo
      } = req.query;

      let whereConditions = ["n.status = 'NEC LOG'"];
      let queryParams = [];

      if (escola_id) {
        whereConditions.push("n.escola_id = ?");
        queryParams.push(escola_id);
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

      if (grupo) {
        const grupoParsed = parseInt(grupo, 10);
        if (!isNaN(grupoParsed)) {
          // Se for ID numérico
          whereConditions.push("(n.grupo_id = ? OR n.grupo = ?)");
          queryParams.push(grupoParsed, grupo);
        } else {
          whereConditions.push("n.grupo = ?");
          queryParams.push(grupo);
        }
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
          n.grupo,
          n.grupo_id,
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
      console.error('Erro ao listar necessidades para logística:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Salvar ajustes da logística
  static async salvarAjustesLogistica(req, res) {
    try {
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de itens é obrigatória'
        });
      }

      // Validar e filtrar itens válidos
      const itensValidos = itens.filter(item => item.id && item.ajuste !== undefined);
      
      if (itensValidos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum item válido para salvar'
        });
          }

      // Buscar todos os valores atuais de uma vez (muito mais rápido que loop individual)
      const ids = itensValidos.map(item => item.id);
      const placeholders = ids.map(() => '?').join(',');
      
      const currentValues = await executeQuery(
        `
          SELECT id, ajuste_logistica 
            FROM necessidades 
          WHERE id IN (${placeholders}) AND status = 'NEC LOG'
        `,
        ids
      );

      // Criar mapa de valores atuais para acesso rápido
      const valoresAtuaisMap = {};
      currentValues.forEach(row => {
        valoresAtuaisMap[row.id] = row.ajuste_logistica;
      });

      // Preparar dados para update em lote usando CASE WHEN
      const casosAjuste = [];
      const casosAnterior = [];
      const paramsAjuste = [];
      const paramsAnterior = [];
      const idsParaAtualizar = [];

      itensValidos.forEach(item => {
        const id = item.id;
        
        // Verificar se o item existe e está no status correto
        if (!valoresAtuaisMap.hasOwnProperty(id)) {
          return; // Item não encontrado, pular
        }

        const valorAnterior = valoresAtuaisMap[id];
          // Normalizar vírgula para ponto antes de processar
        const ajusteNormalizado = String(item.ajuste).replace(',', '.');
          const newValue = parseFloat(ajusteNormalizado) || 0;
          
        casosAjuste.push(`WHEN id = ? THEN ?`);
        casosAnterior.push(`WHEN id = ? THEN ?`);
        paramsAjuste.push(id, newValue);
        paramsAnterior.push(id, valorAnterior);
        idsParaAtualizar.push(id);
      });

      if (idsParaAtualizar.length === 0) {
        return res.json({
          success: true,
          message: 'Nenhum item válido encontrado para atualizar',
          sucessos: 0,
          erros: itensValidos.length
        });
      }

      // Executar update em lote para todos os itens de uma vez
      const idsPlaceholders = idsParaAtualizar.map(() => '?').join(',');
          const updateQuery = `
            UPDATE necessidades 
        SET 
          ajuste_logistica = CASE ${casosAjuste.join(' ')} ELSE ajuste_logistica END,
          ajuste_anterior = CASE ${casosAnterior.join(' ')} ELSE ajuste_anterior END,
                data_atualizacao = NOW()
        WHERE id IN (${idsPlaceholders}) AND status = 'NEC LOG'
          `;
      
      await executeQuery(updateQuery, [...paramsAjuste, ...paramsAnterior, ...idsParaAtualizar]);

      const sucessos = idsParaAtualizar.length;
      const erros = itens.length - sucessos;

      res.json({
        success: true,
        message: `${sucessos} ajuste(s) salvo(s) com sucesso${erros > 0 ? `, ${erros} erro(s)` : ''}`,
        sucessos,
        erros
      });

    } catch (error) {
      console.error('Erro ao salvar ajustes da logística:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Enviar para confirmação da nutricionista (mudar status para CONF NUTRI)
  static async enviarParaNutricionista(req, res) {
    // Aceitar tanto necessidade_id único quanto array de necessidade_ids
    const { necessidade_id, necessidade_ids, escola_id } = req.body;
    
    // Normalizar para array
    let idsParaProcessar = [];
    if (necessidade_ids && Array.isArray(necessidade_ids)) {
      idsParaProcessar = necessidade_ids;
    } else if (necessidade_id) {
      idsParaProcessar = [necessidade_id];
    } else {
      return res.status(400).json({
        success: false,
        message: 'necessidade_id ou necessidade_ids é obrigatório'
      });
    }

    if (idsParaProcessar.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum ID de necessidade fornecido'
      });
    }

    // Processar em blocos para evitar sobrecarga
    const TAMANHO_BLOCO = 50;
    let sucessos = 0;
    let erros = 0;
    const errosDetalhes = [];

    // Função auxiliar para processar um bloco de IDs
    const processarBloco = async (idsBloco, maxTentativas = 5) => {
      let ultimoErro = null;
      const { pool } = require('../../config/database');
      
      for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
        const connection = await pool.getConnection();
        
        try {
          // Configurar timeout da transação
          await connection.query('SET SESSION innodb_lock_wait_timeout = 10');
          
          await connection.beginTransaction();

          // Criar placeholders para o IN clause
          const placeholders = idsBloco.map(() => '?').join(',');
          
          // Usar SELECT FOR UPDATE para lockar os registros em ordem consistente
          // Isso evita deadlocks ao garantir que todos os processos lockem na mesma ordem
          const [rows] = await connection.execute(`
            SELECT id, necessidade_id, ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste
            FROM necessidades
            WHERE necessidade_id IN (${placeholders}) AND status = 'NEC LOG'
            ORDER BY id ASC
            FOR UPDATE
          `, idsBloco);

          if (rows.length === 0) {
            await connection.rollback();
            connection.release();
            return { sucessos: 0, erros: idsBloco.length };
          }

          // Primeiro: se ajuste_logistica estiver NULL, copiar ajuste_coordenacao
          // Isso garante que o valor anterior seja preservado antes de enviar para nutri
          // IMPORTANTE: Copiar apenas para ajuste_logistica, NÃO para ajuste_conf_nutri
          await connection.execute(`
            UPDATE necessidades
            SET ajuste_logistica = COALESCE(ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste)
            WHERE necessidade_id IN (${placeholders}) AND status = 'NEC LOG'
              AND (ajuste_logistica IS NULL OR ajuste_logistica = 0)
          `, idsBloco);

          // Segundo: atualizar status para CONF NUTRI
          // NÃO copiar para ajuste_conf_nutri aqui - isso será feito quando nutri confirmar
          const [result] = await connection.execute(`
            UPDATE necessidades 
            SET status = 'CONF NUTRI',
                data_atualizacao = NOW()
            WHERE necessidade_id IN (${placeholders}) AND status = 'NEC LOG'
          `, idsBloco);

          await connection.commit();
          connection.release();
          
          return { sucessos: result.affectedRows, erros: idsBloco.length - result.affectedRows };
        } catch (error) {
          try {
            await connection.rollback();
          } catch (rollbackError) {
            console.error('Erro ao fazer rollback:', rollbackError);
          }
          connection.release();
          
          ultimoErro = error;
          
          // Se for deadlock e ainda temos tentativas, fazer retry
          if (error.code === 'ER_LOCK_DEADLOCK' && tentativa < maxTentativas - 1) {
            // Delay exponencial com jitter: 100ms, 200ms, 400ms, 800ms
            const baseDelay = 100 * Math.pow(2, tentativa);
            const jitter = Math.floor(Math.random() * 100);
            const delay = baseDelay + jitter;
            
            console.warn(`Deadlock detectado na tentativa ${tentativa + 1}/${maxTentativas}. Aguardando ${delay}ms antes de tentar novamente...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Se não for deadlock ou esgotaram as tentativas, lançar erro
          throw error;
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      throw ultimoErro || new Error('Falha ao executar operação após múltiplas tentativas');
    };

    try {
      // Processar em blocos
      for (let i = 0; i < idsParaProcessar.length; i += TAMANHO_BLOCO) {
        const bloco = idsParaProcessar.slice(i, i + TAMANHO_BLOCO);
        
        try {
          const resultado = await processarBloco(bloco);
          sucessos += resultado.sucessos;
          erros += resultado.erros;
        } catch (error) {
          console.error(`Erro ao processar bloco de IDs:`, error);
          erros += bloco.length;
          errosDetalhes.push({
            bloco: bloco,
            erro: error.message
          });
        }
      }

      res.json({
        success: sucessos > 0,
        message: `${sucessos} necessidade(s) enviada(s) para confirmação da nutricionista${erros > 0 ? `, ${erros} erro(s)` : ''}`,
        sucessos,
        erros,
        total: idsParaProcessar.length
      });

    } catch (error) {
      console.error('Erro ao enviar para nutricionista:', error);
      
      // Mensagem mais amigável para deadlock
      if (error.code === 'ER_LOCK_DEADLOCK') {
        return res.status(409).json({
          success: false,
          message: 'Conflito ao processar. Por favor, tente novamente em alguns instantes.',
          error: 'Deadlock detectado - operação pode ser tentada novamente',
          sucessos,
          erros
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
        sucessos,
        erros
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

      // Buscar dados da escola
      let escolaQuery;
      let queryParams;

      if (semana_consumo) {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND semana_consumo = ? AND status = 'NEC LOG'
          LIMIT 1
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND status = 'NEC LOG'
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

      const qtdFinal = quantidade || 0;
      let resultId;

      if (reativarRegistro) {
        // Reativar registro excluído ao invés de criar novo
        await executeQuery(`
          UPDATE necessidades SET
            status = 'NEC LOG',
            ajuste = 0,
            ajuste_logistica = ?,
            semana_consumo = ?,
            semana_abastecimento = ?,
            observacoes = 'Produto extra reativado pela logística',
            data_atualizacao = NOW()
          WHERE id = ?
        `, [
          qtdFinal,
          semana_consumo || escolaData[0].semana_consumo,
          semana_abastecimento || escolaData[0].semana_abastecimento,
          registroIdParaReativar
        ]);
        resultId = registroIdParaReativar;
      } else {
        // Inserir novo produto com status NEC LOG
        const insertQuery = `
          INSERT INTO necessidades (
            usuario_email, usuario_id, produto_id, produto, produto_unidade,
            escola_id, escola, escola_rota, codigo_teknisa, ajuste,
            semana_consumo, semana_abastecimento, grupo, grupo_id, status, necessidade_id,
            observacoes, data_preenchimento, ajuste_nutricionista, ajuste_coordenacao, ajuste_logistica, ajuste_conf_nutri, ajuste_conf_coord
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
        `;

        const values = [
          escolaData[0].usuario_email,
          escolaData[0].usuario_id,
          produto_id,
          produto.produto_nome,
          produto.unidade_medida,
          escola_id,
          escolaData[0].escola,
          escolaData[0].escola_rota,
          escolaData[0].codigo_teknisa,
          0, // ajuste sempre 0 para logística (NOT NULL)
          semana_consumo || escolaData[0].semana_consumo,
          semana_abastecimento || escolaData[0].semana_abastecimento,
          produto.grupo,
          produto.grupo_id,
          'NEC LOG',
          escolaData[0].necessidade_id,
          'Produto extra incluído pela logística',
          null, // ajuste_nutricionista null
          null, // ajuste_coordenacao null
          qtdFinal, // ajuste_logistica
          null, // ajuste_conf_nutri null
          null // ajuste_conf_coord null
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

  // Trocar produto origem (logística - atualiza diretamente na tabela necessidades)
  static async trocarProdutoOrigem(req, res) {
    try {
      const { necessidade_ids, novo_produto_id } = req.body;

      if (!necessidade_ids || !Array.isArray(necessidade_ids) || necessidade_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de necessidades é obrigatória'
        });
      }

      if (!novo_produto_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do novo produto é obrigatório'
        });
      }

      // Buscar informações do novo produto
      let [novoProduto] = await executeQuery(
        `
          SELECT 
            produto_id,
            produto_nome,
            unidade_medida,
            grupo
          FROM produtos_per_capita
          WHERE (produto_id = ? OR produto_origem_id = ?)
            AND ativo = 1
          LIMIT 1
        `,
        [novo_produto_id, novo_produto_id]
      );

      if (!novoProduto) {
        // Fallback para buscar diretamente no produto origem do Foods
        const [produtoOrigemFallback] = await executeQuery(
          `
            SELECT 
              po.id AS produto_id,
              po.nome AS produto_nome,
              COALESCE(um.sigla, um.nome, '') AS unidade_medida,
              g.nome AS grupo
            FROM foods_db.produto_origem po
            LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
            LEFT JOIN foods_db.grupos g ON po.grupo_id = g.id
            WHERE po.id = ?
            LIMIT 1
          `,
          [novo_produto_id]
        );

        if (!produtoOrigemFallback) {
          return res.status(404).json({
            success: false,
            message: 'Produto selecionado não encontrado.'
          });
        }

        novoProduto = produtoOrigemFallback;
      }

      // Buscar informações das necessidades para validar grupo
      const [necessidadeRef] = await executeQuery(
        `
          SELECT grupo, grupo_id
          FROM necessidades
          WHERE id = ?
            AND status = 'NEC LOG'
          LIMIT 1
        `,
        [necessidade_ids[0]]
      );

      if (!necessidadeRef) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada ou não está no status NEC LOG'
        });
      }

      // Verificar se o novo produto pertence ao mesmo grupo
      if (necessidadeRef.grupo && novoProduto.grupo && necessidadeRef.grupo !== novoProduto.grupo) {
        return res.status(400).json({
          success: false,
          message: 'O novo produto deve pertencer ao mesmo grupo.'
        });
      }

      // Atualizar diretamente na tabela necessidades (logística não usa necessidades_substituicoes)
      const placeholders = necessidade_ids.map(() => '?').join(',');
      await executeQuery(
        `
          UPDATE necessidades
          SET
            produto_id = ?,
            produto = ?,
            produto_unidade = ?,
            data_atualizacao = NOW()
          WHERE id IN (${placeholders})
            AND status = 'NEC LOG'
        `,
        [novoProduto.produto_id, novoProduto.produto_nome, novoProduto.unidade_medida, ...necessidade_ids]
      );

      res.json({
        success: true,
        message: 'Produto origem trocado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao trocar produto origem (logística):', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar produtos para modal (produtos disponíveis não incluídos)
  static async buscarProdutosParaModal(req, res) {
    try {
      const { escola_id, grupo, semana_consumo, semana_abastecimento } = req.query;

      if (!escola_id || !grupo) {
        return res.status(400).json({
          success: false,
          message: 'Escola e grupo são obrigatórios'
        });
      }

      // Buscar produtos já existentes para filtrar
      let produtosExistentesQuery;
      let queryParams;

      if (semana_consumo && semana_abastecimento) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.semana_abastecimento = ?
            AND n.status = 'NEC LOG'
        `;
        queryParams = [escola_id, semana_consumo, semana_abastecimento];
      } else if (semana_consumo) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.status = 'NEC LOG'
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.status = 'NEC LOG'
        `;
        queryParams = [escola_id];
      }
      
      const produtosExistentes = await executeQuery(produtosExistentesQuery, queryParams);
      const idsExistentes = produtosExistentes.map(p => p.produto_id);

      // Buscar produtos disponíveis
      let whereConditions = ["ppc.grupo = ?", "ppc.ativo = true"];
      let produtosQueryParams = [grupo];

      if (idsExistentes.length > 0) {
        whereConditions.push("ppc.produto_id NOT IN (?)");
        produtosQueryParams.push(idsExistentes);
      }

      const query = `
        SELECT 
          ppc.produto_id,
          ppc.produto_nome,
          ppc.produto_codigo,
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
}

module.exports = NecessidadesLogisticaController;
