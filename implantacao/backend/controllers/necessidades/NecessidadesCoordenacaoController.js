const { executeQuery } = require('../../config/database');

class NecessidadesCoordenacaoController {
  // Listar necessidades para coordenação (status NEC COORD)
  static async listarParaCoordenacao(req, res) {
    try {
      const { escola_id, grupo, semana_consumo, semana_abastecimento, nutricionista_id } = req.query;
      
      let whereConditions = ["n.status = 'NEC COORD'"];
      let queryParams = [];
      
      if (escola_id) {
        whereConditions.push("n.escola_id = ?");
        queryParams.push(escola_id);
      }
      
      if (grupo) {
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
        whereConditions.push("n.nutricionista_id = ?");
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
          n.nutricionista_id,
          n.nutricionista_nome,
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
      
      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de itens é obrigatória'
        });
      }
      
      const updates = [];
      
      for (const item of itens) {
        if (item.ajuste !== undefined && item.ajuste !== null && item.ajuste !== '') {
          const newValue = parseFloat(item.ajuste);
          
          if (!isNaN(newValue) && newValue >= 0) {
            // Buscar valor atual para evitar sobrescrever
            const currentQuery = `
              SELECT ajuste_coordenacao 
              FROM necessidades 
              WHERE id = ? AND status = 'NEC COORD'
            `;
            const currentResult = await executeQuery(currentQuery, [item.id]);
            
            if (currentResult.length > 0) {
              const currentValue = currentResult[0].ajuste_coordenacao;
              
              // Só atualizar se o valor for diferente
              if (currentValue !== newValue) {
                const updateQuery = `
                  UPDATE necessidades 
                  SET ajuste_coordenacao = ?, data_atualizacao = NOW() 
                  WHERE id = ? AND status = 'NEC COORD'
                `;
                updates.push(executeQuery(updateQuery, [newValue, item.id]));
              }
            }
          }
        }
      }
      
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      res.json({
        success: true,
        message: 'Ajustes da coordenação salvos com sucesso',
        itensAtualizados: updates.length
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
      
      if (!necessidade_ids || !Array.isArray(necessidade_ids) || necessidade_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de IDs de necessidade é obrigatória'
        });
      }
      
      const placeholders = necessidade_ids.map(() => '?').join(',');
      const query = `
        UPDATE necessidades 
        SET status = 'CONF', data_atualizacao = NOW() 
        WHERE necessidade_id IN (${placeholders}) AND status = 'NEC COORD'
      `;
      
      const result = await executeQuery(query, necessidade_ids);
      
      res.json({
        success: true,
        message: 'Necessidades liberadas para logística com sucesso',
        necessidadesAtualizadas: result.affectedRows
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
      const { grupo, escola_id, semana_consumo, search } = req.query;
      
      if (!grupo || !escola_id) {
        return res.status(400).json({
          success: false,
          message: 'Grupo e escola são obrigatórios'
        });
      }
      
      // Buscar produtos do grupo
      const produtoQuery = `
        SELECT DISTINCT ppc.produto_id, ppc.produto_codigo, ppc.produto_nome, ppc.unidade_medida
        FROM produtos_per_capita ppc
        WHERE ppc.grupo = ? AND ppc.ativo = true
        ${search ? 'AND (ppc.produto_nome LIKE ? OR ppc.produto_codigo LIKE ?)' : ''}
        ORDER BY ppc.produto_nome ASC
      `;
      
      let queryParams = [grupo];
      if (search) {
        queryParams.push(`%${search}%`, `%${search}%`);
      }
      
      const produtos = await executeQuery(produtoQuery, queryParams);
      
      // Buscar produtos já incluídos na necessidade
      const exclusaoQuery = `
        SELECT DISTINCT n.produto_id
        FROM necessidades n
        WHERE n.escola_id = ? AND n.status = 'NEC COORD'
        ${semana_consumo ? 'AND n.semana_consumo = ?' : ''}
      `;
      
      let exclusaoParams = [escola_id];
      if (semana_consumo) {
        exclusaoParams.push(semana_consumo);
      }
      
      const produtosExistentes = await executeQuery(exclusaoQuery, exclusaoParams);
      const idsExistentes = produtosExistentes.map(p => p.produto_id);
      
      // Filtrar produtos já incluídos
      const produtosDisponiveis = produtos.filter(p => !idsExistentes.includes(p.produto_id));
      
      res.json({
        success: true,
        data: produtosDisponiveis
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
      const { produto_id, escola_id, grupo, semana_consumo, semana_abastecimento } = req.body;
      
      if (!produto_id || !escola_id || !grupo) {
        return res.status(400).json({
          success: false,
          message: 'Produto, escola e grupo são obrigatórios'
        });
      }
      
      // Buscar dados do produto
      const produtoQuery = `
        SELECT ppc.produto_id, ppc.produto_nome, ppc.produto_codigo, ppc.unidade_medida
        FROM produtos_per_capita ppc
        WHERE ppc.produto_id = ? AND ppc.grupo = ?
      `;
      
      const produtoResult = await executeQuery(produtoQuery, [produto_id, grupo]);
      
      if (produtoResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado no grupo especificado'
        });
      }
      
      const produto = produtoResult[0];
      
      // Buscar dados da escola existente
      const escolaQuery = `
        SELECT escola, escola_rota, codigo_teknisa, necessidade_id, semana_consumo, semana_abastecimento
        FROM necessidades 
        WHERE escola_id = ? AND status = 'NEC COORD'
        LIMIT 1
      `;
      
      const escolaResult = await executeQuery(escolaQuery, [escola_id]);
      
      if (escolaResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma necessidade encontrada para esta escola'
        });
      }
      
      const escolaData = escolaResult[0];
      
      // Inserir novo produto
      const insertQuery = `
        INSERT INTO necessidades (
          usuario_email, usuario_id, produto_id, produto, produto_unidade,
          escola_id, escola, escola_rota, codigo_teknisa, ajuste,
          semana_consumo, semana_abastecimento, status, necessidade_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const insertParams = [
        req.user.email,
        req.user.id,
        produto.produto_id,
        produto.produto_nome,
        produto.unidade_medida,
        escola_id,
        escolaData.escola,
        escolaData.escola_rota,
        escolaData.codigo_teknisa,
        0, // ajuste inicial
        semana_consumo || escolaData.semana_consumo,
        semana_abastecimento || escolaData.semana_abastecimento,
        'NEC COORD',
        escolaData.necessidade_id
      ];
      
      const result = await executeQuery(insertQuery, insertParams);
      
      res.json({
        success: true,
        message: 'Produto incluído com sucesso',
        data: {
          id: result.insertId,
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
        SELECT DISTINCT nutricionista_id, nutricionista_nome
        FROM necessidades 
        WHERE nutricionista_id IS NOT NULL AND nutricionista_nome IS NOT NULL
        ORDER BY nutricionista_nome
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
