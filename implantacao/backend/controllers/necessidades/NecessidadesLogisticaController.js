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
          n.data_atualizacao
        FROM necessidades n
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

      let sucessos = 0;
      let erros = 0;

      for (const item of itens) {
        try {
          const { id, ajuste } = item;

          if (!id || ajuste === undefined) {
            erros++;
            continue;
          }

          // Buscar valor atual do ajuste_logistica
          const currentQuery = `
            SELECT ajuste_logistica 
            FROM necessidades 
            WHERE id = ? AND status = 'NEC LOG'
          `;
          const currentResult = await executeQuery(currentQuery, [id]);
          
          if (currentResult.length === 0) {
            erros++;
            continue;
          }

          const currentValue = currentResult[0].ajuste_logistica;
          const newValue = parseFloat(ajuste) || 0;
          
          // Preservar o valor atual de ajuste_logistica em ajuste_anterior
          const valorAnterior = currentValue;

          // Para NEC LOG, atualizar ajuste_logistica
          const updateQuery = `
            UPDATE necessidades 
            SET ajuste_logistica = ?,
                ajuste_anterior = ?,
                data_atualizacao = NOW()
            WHERE id = ? AND status = 'NEC LOG'
          `;
          await executeQuery(updateQuery, [newValue, valorAnterior, id]);
          
          sucessos++;

        } catch (error) {
          console.error(`Erro ao salvar ajuste para item ${item.id}:`, error);
          erros++;
        }
      }

      res.json({
        success: true,
        message: `Ajustes salvos: ${sucessos} sucessos, ${erros} erros`,
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
    try {
      const { necessidade_id, escola_id } = req.body;

      if (!necessidade_id) {
        return res.status(400).json({
          success: false,
          message: 'necessidade_id é obrigatório'
        });
      }

      // Primeiro: se ajuste_logistica estiver NULL, copiar ajuste_coordenacao
      // Isso garante que o valor anterior seja preservado antes de enviar para nutri
      // IMPORTANTE: Copiar apenas para ajuste_logistica, NÃO para ajuste_conf_nutri
      await executeQuery(`
        UPDATE necessidades
        SET ajuste_logistica = COALESCE(ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste)
        WHERE necessidade_id = ? AND status = 'NEC LOG'
          AND (ajuste_logistica IS NULL OR ajuste_logistica = 0)
      `, [necessidade_id]);

      // Segundo: atualizar status para CONF NUTRI
      // NÃO copiar para ajuste_conf_nutri aqui - isso será feito quando nutri confirmar
      const updateQuery = `
        UPDATE necessidades 
        SET status = 'CONF NUTRI',
            data_atualizacao = NOW()
        WHERE necessidade_id = ? AND status = 'NEC LOG'
      `;
      
      await executeQuery(updateQuery, [necessidade_id]);

      res.json({
        success: true,
        message: 'Necessidade enviada para confirmação da nutricionista'
      });

    } catch (error) {
      console.error('Erro ao enviar para nutricionista:', error);
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

      const produtoQuery = `
        SELECT ppc.produto_nome, ppc.produto_codigo, ppc.unidade_medida, ppc.grupo, ppc.grupo_id
        FROM produtos_per_capita ppc
        WHERE ppc.produto_id = ? AND ppc.grupo = ?
      `;
      
      const produto = await executeQuery(produtoQuery, [produto_id, grupo]);
      
      if (produto.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Inserir novo produto com status NEC LOG
      const insertQuery = `
        INSERT INTO necessidades (
          usuario_email, usuario_id, produto_id, produto, produto_unidade,
          escola_id, escola, escola_rota, codigo_teknisa, ajuste,
          semana_consumo, semana_abastecimento, grupo, grupo_id, status, necessidade_id,
          observacoes, data_preenchimento, ajuste_nutricionista, ajuste_coordenacao, ajuste_logistica, ajuste_conf_nutri, ajuste_conf_coord
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
      `;

      const qtdFinal = quantidade || 0;

      const values = [
        escolaData[0].usuario_email,
        escolaData[0].usuario_id,
        produto_id,
        produto[0].produto_nome,
        produto[0].unidade_medida,
        escola_id,
        escolaData[0].escola,
        escolaData[0].escola_rota,
        escolaData[0].codigo_teknisa,
        0, // ajuste sempre 0 para logística (NOT NULL)
        semana_consumo || escolaData[0].semana_consumo,
        semana_abastecimento || escolaData[0].semana_abastecimento,
        produto[0].grupo,
        produto[0].grupo_id,
        'NEC LOG',
        escolaData[0].necessidade_id,
        'Produto extra incluído pela logística',
        null, // ajuste_nutricionista null
        null, // ajuste_coordenacao null
        qtdFinal, // ajuste_logistica
        null, // ajuste_conf_nutri null
        null // ajuste_conf_coord null
      ];

      await executeQuery(insertQuery, values);

      res.json({
        success: true,
        message: 'Produto incluído com sucesso',
        data: {
          produto: produto[0].produto_nome,
          unidade: produto[0].unidade_medida
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
