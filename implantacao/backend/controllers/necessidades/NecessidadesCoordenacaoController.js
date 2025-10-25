const { executeQuery } = require('../../config/database');

class NecessidadesCoordenacaoController {
  // Listar necessidades para coordenação (status NEC COORD)
  static async listarParaCoordenacao(req, res) {
    try {
      const { 
        escola_id, 
        semana_consumo, 
        semana_abastecimento,
        nutricionista_id 
      } = req.query;

      let whereConditions = ["n.status = 'NEC COORD'"];
      let queryParams = [];

      if (escola_id) {
        whereConditions.push("n.escola_id = ?");
        queryParams.push(escola_id);
      }

      // Nota: A tabela necessidades não possui coluna 'grupo'
      // O filtro por grupo deve ser aplicado via produtos_per_capita se necessário

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

          // Buscar valor atual do ajuste_coordenacao
          const currentQuery = `
            SELECT ajuste_coordenacao 
            FROM necessidades 
            WHERE id = ? AND status = 'NEC COORD'
          `;
          const currentResult = await executeQuery(currentQuery, [id]);
          
          if (currentResult.length === 0) {
            erros++;
            continue;
          }

          const currentValue = currentResult[0].ajuste_coordenacao;
          const newValue = parseFloat(ajuste) || 0;

          // Sempre atualizar (não verificar se mudou para permitir atualização de NULL)
          const updateQuery = `
            UPDATE necessidades 
            SET ajuste_coordenacao = ?, 
                data_atualizacao = NOW()
            WHERE id = ? AND status = 'NEC COORD'
          `;
          
          await executeQuery(updateQuery, [newValue, id]);
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
          const updateQuery = `
            UPDATE necessidades 
            SET status = 'CONF', 
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
        search 
      } = req.query;

      if (!grupo || !escola_id) {
        return res.status(400).json({
          success: false,
          message: 'Grupo e escola são obrigatórios'
        });
      }

      // Buscar produtos já incluídos na necessidade
      const produtosExistentesQuery = `
        SELECT DISTINCT n.produto_id
        FROM necessidades n
        WHERE n.escola_id = ? 
          AND n.semana_consumo = ?
          AND n.status = 'NEC COORD'
      `;
      
      const produtosExistentes = await executeQuery(produtosExistentesQuery, [escola_id, semana_consumo]);
      const idsExistentes = produtosExistentes.map(p => p.produto_id);

      // Buscar produtos disponíveis
      let whereConditions = ["ppc.grupo = ?", "ppc.ativo = true"];
      let queryParams = [grupo];

      if (idsExistentes.length > 0) {
        whereConditions.push(`ppc.produto_id NOT IN (${idsExistentes.map(() => '?').join(',')})`);
        queryParams.push(...idsExistentes);
      }

      if (search) {
        whereConditions.push("(ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)");
        queryParams.push(`%${search}%`, `%${search}%`);
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

      const produtos = await executeQuery(query, queryParams);

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
        produto_id 
      } = req.body;

      if (!escola_id || !grupo || !semana_consumo || !produto_id) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Buscar dados da escola e produto
      const escolaQuery = `
        SELECT escola, escola_rota, codigo_teknisa, necessidade_id, usuario_id, usuario_email
        FROM necessidades 
        WHERE escola_id = ? AND semana_consumo = ? AND status = 'NEC COORD'
        LIMIT 1
      `;
      
      const escolaData = await executeQuery(escolaQuery, [escola_id, semana_consumo]);
      
      if (escolaData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Necessidade não encontrada para esta escola e semana'
        });
      }

      const produtoQuery = `
        SELECT ppc.produto_nome, ppc.produto_codigo, ppc.unidade_medida
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

      // Inserir novo produto
      const insertQuery = `
        INSERT INTO necessidades (
          usuario_email, usuario_id, produto_id, produto, produto_unidade,
          escola_id, escola, escola_rota, codigo_teknisa, ajuste,
          semana_consumo, semana_abastecimento, status, necessidade_id,
          data_preenchimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = [
        req.user.email,
        req.user.id,
        produto_id,
        produto[0].produto_nome,
        produto[0].unidade_medida,
        escola_id,
        escolaData[0].escola,
        escolaData[0].escola_rota,
        escolaData[0].codigo_teknisa,
        0, // ajuste inicial
        semana_consumo,
        semana_abastecimento || escolaData[0].semana_abastecimento,
        'NEC COORD',
        escolaData[0].necessidade_id
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
        WHERE n.status = 'NEC COORD'
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

module.exports = NecessidadesCoordenacaoController;
