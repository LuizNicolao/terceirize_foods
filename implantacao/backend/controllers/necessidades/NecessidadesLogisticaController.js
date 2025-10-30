const { executeQuery } = require('../../config/database');

class NecessidadesLogisticaController {
  // Listar necessidades para logística (status NEC LOG)
  static async listarParaLogistica(req, res) {
    try {
      const { 
        escola_id, 
        semana_consumo, 
        semana_abastecimento,
        nutricionista_id 
      } = req.query;

      let whereConditions = ["n.status IN ('NEC LOG','CONF NUTRI')"];
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
      const necessidade_ids = new Set();

      for (const item of itens) {
        try {
          const { id, ajuste } = item;

          if (!id || ajuste === undefined) {
            erros++;
            continue;
          }

          // Buscar valor atual do ajuste_logistica e status
          const currentQuery = `
            SELECT ajuste_logistica, status, necessidade_id 
            FROM necessidades 
            WHERE id = ? AND status IN ('NEC LOG','CONF NUTRI')
          `;
          const currentResult = await executeQuery(currentQuery, [id]);
          
          if (currentResult.length === 0) {
            erros++;
            continue;
          }

          const currentValue = currentResult[0].ajuste_logistica;
          const currentStatus = currentResult[0].status;
          const newValue = parseFloat(ajuste) || 0;
          
          if (currentResult[0].necessidade_id) {
            necessidade_ids.add(currentResult[0].necessidade_id);
          }

          // Se status for CONF NUTRI, atualizar ajuste_conf_nutri
          if (currentStatus === 'CONF NUTRI') {
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_conf_nutri = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'CONF NUTRI'
            `;
            await executeQuery(updateQuery, [newValue, id]);
          } else {
            // Se status for NEC LOG, atualizar apenas ajuste_logistica
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_logistica = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'NEC LOG'
            `;
            await executeQuery(updateQuery, [newValue, id]);
          }
          
          sucessos++;

        } catch (error) {
          console.error(`Erro ao salvar ajuste para item ${item.id}:`, error);
          erros++;
        }
      }

      // Não mudar status automaticamente aqui
      // A transição NEC LOG → CONF NUTRI deve ser feita via botão "Liberar para Nutri"

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

  // Liberar para nutri confirmar (mudar de NEC LOG para CONF NUTRI)
  static async liberarParaNutriConfirma(req, res) {
    try {
      const { necessidade_ids } = req.body;

      if (!necessidade_ids || !Array.isArray(necessidade_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de necessidade é obrigatória'
        });
      }

      let sucessos = 0;
      let erros = 0;

      for (const necessidade_id of necessidade_ids) {
        try {
          // Verificar quantos produtos precisam ser atualizados
          const countQuery = `
            SELECT COUNT(*) as total
            FROM necessidades
            WHERE necessidade_id = ? AND status = 'NEC LOG'
          `;
          const countResult = await executeQuery(countQuery, [necessidade_id]);

          if (countResult[0].total === 0) {
            erros++;
            continue;
          }

          // Atualizar status de NEC LOG para CONF NUTRI
          // E copiar ajuste_logistica para ajuste_conf_nutri
          const updateQuery = `
            UPDATE necessidades 
            SET status = 'CONF NUTRI', 
                ajuste_conf_nutri = COALESCE(ajuste_logistica, ajuste_conf_nutri),
                data_atualizacao = NOW()
            WHERE necessidade_id = ? AND status = 'NEC LOG'
          `;
          
          const result = await executeQuery(updateQuery, [necessidade_id]);
          if (result.affectedRows > 0) sucessos++; else erros++;

        } catch (error) {
          console.error(`Erro ao liberar necessidade ${necessidade_id}:`, error);
          erros++;
        }
      }

      res.json({
        success: true,
        message: `Necessidades liberadas: ${sucessos} sucessos, ${erros} erros`,
        sucessos,
        erros
      });

    } catch (error) {
      console.error('Erro ao liberar para nutri confirmar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Confirmar para coordenação (mudar de CONF NUTRI para CONF COORD)
  static async confirmarParaCoordenacao(req, res) {
    try {
      const { necessidade_ids } = req.body;

      if (!necessidade_ids || !Array.isArray(necessidade_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de necessidade é obrigatória'
        });
      }

      let sucessos = 0;
      let erros = 0;

      for (const necessidade_id of necessidade_ids) {
        try {
          // Verificar quantos produtos precisam ser atualizados
          const countQuery = `
            SELECT COUNT(*) as total
            FROM necessidades
            WHERE necessidade_id = ? AND status = 'CONF NUTRI'
          `;
          const countResult = await executeQuery(countQuery, [necessidade_id]);

          if (countResult[0].total === 0) {
            erros++;
            continue;
          }

          // Atualizar status de CONF NUTRI para CONF COORD
          // E copiar ajuste_conf_nutri para ajuste_conf_coord
          const updateQuery = `
            UPDATE necessidades 
            SET status = 'CONF COORD', 
                ajuste_conf_coord = COALESCE(ajuste_conf_nutri, ajuste_conf_coord),
                data_atualizacao = NOW()
            WHERE necessidade_id = ? AND status = 'CONF NUTRI'
          `;
          
          const result = await executeQuery(updateQuery, [necessidade_id]);
          if (result.affectedRows > 0) sucessos++; else erros++;

        } catch (error) {
          console.error(`Erro ao confirmar necessidade ${necessidade_id}:`, error);
          erros++;
        }
      }

      res.json({
        success: true,
        message: `Necessidades confirmadas: ${sucessos} sucessos, ${erros} erros`,
        sucessos,
        erros
      });

    } catch (error) {
      console.error('Erro ao confirmar para coordenação:', error);
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
      let escolaQuery;
      let queryParams;

      if (semana_consumo) {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND semana_consumo = ? AND status IN ('NEC LOG', 'CONF NUTRI')
          LIMIT 1
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        escolaQuery = `
          SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email, semana_consumo, semana_abastecimento
          FROM necessidades 
          WHERE escola_id = ? AND status IN ('NEC LOG', 'CONF NUTRI')
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

      // Determinar o status baseado no status atual do conjunto
      const statusConjunto = await executeQuery(`
        SELECT DISTINCT status FROM necessidades 
        WHERE escola_id = ? AND status IN ('NEC LOG', 'CONF NUTRI')
        LIMIT 1
      `, [escola_id]);

      let novoStatus = 'NEC LOG';
      if (statusConjunto.length > 0 && statusConjunto[0].status === 'CONF NUTRI') {
        novoStatus = 'CONF NUTRI';
      }

      // Determinar em qual coluna salvar baseado no status
      const qtdFinal = quantidade || 0;
      let ajuste_logistica = null;
      let ajuste_conf_nutri = null;

      if (novoStatus === 'NEC LOG') {
        ajuste_logistica = qtdFinal;
      } else if (novoStatus === 'CONF NUTRI') {
        ajuste_conf_nutri = qtdFinal;
      }

      // Inserir novo produto
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
        novoStatus,
        escolaData[0].necessidade_id,
        'Produto extra incluído pela logística',
        null, // ajuste_nutricionista null
        null, // ajuste_coordenacao null
        ajuste_logistica,
        ajuste_conf_nutri,
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

  // Buscar produtos para modal
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
      let produtosExistentesQuery;
      let queryParams;

      if (semana_consumo && semana_abastecimento) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.semana_abastecimento = ?
            AND n.status IN ('NEC LOG', 'CONF NUTRI')
        `;
        queryParams = [escola_id, semana_consumo, semana_abastecimento];
      } else if (semana_consumo) {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.semana_consumo = ?
            AND n.status IN ('NEC LOG', 'CONF NUTRI')
        `;
        queryParams = [escola_id, semana_consumo];
      } else {
        produtosExistentesQuery = `
          SELECT DISTINCT n.produto_id
          FROM necessidades n
          WHERE n.escola_id = ? 
            AND n.status IN ('NEC LOG', 'CONF NUTRI')
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
        WHERE n.status IN ('NEC LOG','CONF NUTRI')
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

module.exports = NecessidadesLogisticaController;

