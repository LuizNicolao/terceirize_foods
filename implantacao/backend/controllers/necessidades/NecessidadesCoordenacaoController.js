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

      if (!grupo) {
        return res.json({
          success: true,
          data: [],
          total: 0,
          message: 'Selecione um grupo para listar as necessidades da coordenação'
        });
      }

      let whereConditions = ["n.status IN ('NEC COORD','CONF COORD')"];
      let queryParams = [];

      if (escola_id) {
        whereConditions.push("n.escola_id = ?");
        queryParams.push(escola_id);
      }

      // Usar filtro direto por grupo (nome) ou grupo_id
      const grupoId = parseInt(grupo);
      if (!isNaN(grupoId)) {
        whereConditions.push("(n.grupo_id = ? OR n.grupo = ?)");
        queryParams.push(grupoId, grupo);
      } else {
        whereConditions.push("n.grupo = ?");
        queryParams.push(grupo);
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
            SELECT ajuste_coordenacao, status 
            FROM necessidades 
            WHERE id = ? AND status IN ('NEC COORD','CONF COORD')
          `;
          const currentResult = await executeQuery(currentQuery, [id]);
          
          if (currentResult.length === 0) {
            erros++;
            continue;
          }

          const currentValue = currentResult[0].ajuste_coordenacao;
          const currentStatus = currentResult[0].status;
          const newValue = parseFloat(ajuste) || 0;

          // Se status for CONF COORD, atualizar ajuste_conf_coord também
          if (currentStatus === 'CONF COORD') {
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_conf_coord = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'CONF COORD'
            `;
            await executeQuery(updateQuery, [newValue, id]);
          } else {
            // Se status for NEC COORD, atualizar apenas ajuste_coordenacao
            const updateQuery = `
              UPDATE necessidades 
              SET ajuste_coordenacao = ?,
                  data_atualizacao = NOW()
              WHERE id = ? AND status = 'NEC COORD'
            `;
            await executeQuery(updateQuery, [newValue, id]);
          }
          
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

      let sucessos = 0;
      let erros = 0;

      for (const necessidade_id of necessidade_ids) {
        try {
          // Primeiro: copiar ajuste_nutricionista para ajuste_coordenacao quando status = 'NEC COORD'
          // (só se ajuste_coordenacao estiver NULL)
          await executeQuery(`
            UPDATE necessidades 
            SET ajuste_coordenacao = COALESCE(ajuste_nutricionista, ajuste)
            WHERE necessidade_id = ? 
              AND status = 'NEC COORD'
              AND (ajuste_coordenacao IS NULL OR ajuste_coordenacao = 0)
          `, [necessidade_id]);

          // Segundo: atualizar status para NEC LOG
          const updateQuery = `
            UPDATE necessidades 
            SET status = 'NEC LOG', 
                data_atualizacao = NOW()
            WHERE necessidade_id = ? AND status = 'NEC COORD'
          `;
          
          const result = await executeQuery(updateQuery, [necessidade_id]);
          
          if (result.affectedRows > 0) {
            sucessos++;
          } else {
            erros++;
          }

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

      // Inserir novo produto
      const insertQuery = `
        INSERT INTO necessidades (
          usuario_email, usuario_id, produto_id, produto, produto_unidade,
          escola_id, escola, escola_rota, codigo_teknisa, ajuste,
          semana_consumo, semana_abastecimento, grupo, grupo_id, status, necessidade_id,
          observacoes, data_preenchimento, ajuste_nutricionista, ajuste_coordenacao, ajuste_conf_nutri, ajuste_conf_coord
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
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
        0, // ajuste sempre 0 para coordenação (NOT NULL)
        semana_consumo || escolaData[0].semana_consumo,
        semana_abastecimento || escolaData[0].semana_abastecimento,
        produto[0].grupo,
        produto[0].grupo_id,
        novoStatus,
        escolaData[0].necessidade_id,
        'Produto extra incluído pela coordenação',
        null, // ajuste_nutricionista null
        ajuste_coordenacao,
        null, // ajuste_conf_nutri null
        ajuste_conf_coord
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

    let sucessos = 0;
    let erros = 0;
    for (const necessidade_id of necessidade_ids) {
      try {
        // Primeiro: copiar ajuste_conf_nutri para ajuste_conf_coord quando status = 'CONF COORD'
        // (só se ajuste_conf_coord estiver NULL)
        await executeQuery(`
          UPDATE necessidades
          SET ajuste_conf_coord = COALESCE(ajuste_conf_nutri, ajuste_logistica, ajuste_coordenacao, ajuste_nutricionista, ajuste)
          WHERE necessidade_id = ? 
            AND status = 'CONF COORD'
            AND (ajuste_conf_coord IS NULL OR ajuste_conf_coord = 0)
        `, [necessidade_id]);

        // Segundo: atualizar status para CONF
        const result = await executeQuery(`
          UPDATE necessidades
          SET status = 'CONF', data_atualizacao = NOW()
          WHERE necessidade_id = ? AND status = 'CONF COORD'
        `, [necessidade_id]);
        if (result.affectedRows > 0) sucessos++; else erros++;
      } catch (e) { erros++; }
    }

    return res.json({ success: true, message: `Confirmadas: ${sucessos} sucesso(s), ${erros} erro(s)`, sucessos, erros });
  } catch (error) {
    console.error('Erro ao confirmar final:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

module.exports = NecessidadesCoordenacaoController;
