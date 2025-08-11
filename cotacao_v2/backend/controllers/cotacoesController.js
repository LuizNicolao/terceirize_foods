const { executeQuery, executeTransaction } = require('../config/database');

class CotacoesController {
  // Listar todas as cotações
  async getCotacoes(req, res) {
    try {
      const { status, comprador, tipoCompra, dataInicio, dataFim } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      // Filtros
      if (status) {
        whereClause += ' AND c.status = ?';
        params.push(status);
      }

      if (comprador) {
        whereClause += ' AND c.comprador LIKE ?';
        params.push(`%${comprador}%`);
      }

      if (tipoCompra) {
        whereClause += ' AND c.tipo_compra = ?';
        params.push(tipoCompra);
      }

      if (dataInicio) {
        whereClause += ' AND DATE(c.data_criacao) >= ?';
        params.push(dataInicio);
      }

      if (dataFim) {
        whereClause += ' AND DATE(c.data_criacao) <= ?';
        params.push(dataFim);
      }

      const query = `
        SELECT 
          c.id,
          c.comprador,
          c.local_entrega,
          c.tipo_compra,
          c.motivo_emergencial,
          c.justificativa,
          c.motivo_final,
          c.status,
          c.data_criacao,
          c.data_atualizacao,
          c.economia_total
        FROM cotacoes c
        ${whereClause}
        ORDER BY c.data_criacao DESC
      `;

      const cotacoes = await executeQuery(query, params);

      res.json({
        success: true,
        data: cotacoes,
        message: 'Cotações carregadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar cotação por ID
  async getCotacaoById(req, res) {
    try {
      const { id } = req.params;

      const cotacao = await executeQuery(`
        SELECT 
          c.*,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', p.id,
              'nome', p.nome,
              'qtde', p.qtde,
              'un', p.un,
              'prazo_entrega', p.prazo_entrega,
              'ult_valor_aprovado', p.ult_valor_aprovado,
              'ult_fornecedor_aprovado', p.ult_fornecedor_aprovado,
              'valor_anterior', p.valor_anterior,
              'valor_unitario', p.valor_unitario,
              'difal', p.difal,
              'ipi', p.ipi,
              'data_entrega_fn', p.data_entrega_fn,
              'total', p.total
            )
          ) as produtos
        FROM cotacoes c
        LEFT JOIN produtos p ON c.id = p.cotacao_id
        WHERE c.id = ?
        GROUP BY c.id
      `, [id]);

      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        data: cotacao[0],
        message: 'Cotação carregada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar nova cotação
  async createCotacao(req, res) {
    try {
      const {
        comprador,
        local_entrega,
        tipo_compra,
        motivo_emergencial,
        justificativa,
        produtos
      } = req.body;

      // Validar dados obrigatórios
      if (!comprador || !local_entrega || !tipo_compra) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios não fornecidos'
        });
      }

      // Inserir cotação
      const cotacaoResult = await executeQuery(`
        INSERT INTO cotacoes (
          comprador, local_entrega, tipo_compra, 
          motivo_emergencial, justificativa, status, 
          data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, 'pendente', NOW(), NOW())
      `, [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa]);

      const cotacaoId = cotacaoResult.insertId;

      // Inserir produtos
      if (produtos && produtos.length > 0) {
        for (const produto of produtos) {
          await executeQuery(`
            INSERT INTO produtos (
              cotacao_id, nome, qtde, un, prazo_entrega,
              ult_valor_aprovado, ult_fornecedor_aprovado,
              valor_anterior, valor_unitario, difal, ipi,
              data_entrega_fn, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            cotacaoId, produto.nome, produto.qtde, produto.un,
            produto.prazo_entrega, produto.ult_valor_aprovado,
            produto.ult_fornecedor_aprovado, produto.valor_anterior,
            produto.valor_unitario, produto.difal, produto.ipi,
            produto.data_entrega_fn, produto.total
          ]);
        }
      }

      res.status(201).json({
        success: true,
        data: { id: cotacaoId },
        message: 'Cotação criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar cotação
  async updateCotacao(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se a cotação existe
      const cotacao = await executeQuery('SELECT * FROM cotacoes WHERE id = ?', [id]);
      
      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      // Atualizar cotação
      await executeQuery(`
        UPDATE cotacoes SET 
          comprador = ?, local_entrega = ?, tipo_compra = ?,
          motivo_emergencial = ?, justificativa = ?, data_atualizacao = NOW()
        WHERE id = ?
      `, [
        updateData.comprador, updateData.local_entrega, updateData.tipo_compra,
        updateData.motivo_emergencial, updateData.justificativa, id
      ]);

      res.json({
        success: true,
        message: 'Cotação atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Excluir cotação
  async deleteCotacao(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a cotação existe
      const cotacao = await executeQuery('SELECT * FROM cotacoes WHERE id = ?', [id]);
      
      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      // Excluir produtos primeiro
      await executeQuery('DELETE FROM produtos WHERE cotacao_id = ?', [id]);

      // Excluir cotação
      await executeQuery('DELETE FROM cotacoes WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Cotação excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Enviar para supervisor
  async enviarParaSupervisor(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a cotação existe e está pendente
      const cotacao = await executeQuery('SELECT * FROM cotacoes WHERE id = ?', [id]);
      
      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      if (cotacao[0].status !== 'pendente') {
        return res.status(400).json({
          success: false,
          message: 'Apenas cotações pendentes podem ser enviadas para supervisor'
        });
      }

      // Atualizar status
      await executeQuery(`
        UPDATE cotacoes SET 
          status = 'em_analise', 
          data_atualizacao = NOW()
        WHERE id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'Cotação enviada para supervisor com sucesso'
      });
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Aprovar cotação
  async aprovarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { dadosAprovacao } = req.body;

      // Verificar se a cotação existe
      const cotacao = await executeQuery('SELECT * FROM cotacoes WHERE id = ?', [id]);
      
      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      // Atualizar status e dados de aprovação
      await executeQuery(`
        UPDATE cotacoes SET 
          status = 'aprovada',
          motivo_final = ?,
          economia_total = ?,
          data_atualizacao = NOW()
        WHERE id = ?
      `, [dadosAprovacao.motivo, dadosAprovacao.economiaTotal, id]);

      res.json({
        success: true,
        message: 'Cotação aprovada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Rejeitar cotação
  async rejeitarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      // Verificar se a cotação existe
      const cotacao = await executeQuery('SELECT * FROM cotacoes WHERE id = ?', [id]);
      
      if (cotacao.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      // Atualizar status
      await executeQuery(`
        UPDATE cotacoes SET 
          status = 'rejeitada',
          motivo_final = ?,
          data_atualizacao = NOW()
        WHERE id = ?
      `, [motivo, id]);

      res.json({
        success: true,
        message: 'Cotação rejeitada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar estatísticas
  async getStats(req, res) {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
          SUM(CASE WHEN status = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
          SUM(CASE WHEN status = 'rejeitada' THEN 1 ELSE 0 END) as rejeitadas,
          SUM(CASE WHEN status = 'em_analise' THEN 1 ELSE 0 END) as em_analise,
          COALESCE(SUM(economia_total), 0) as economia_total
        FROM cotacoes
      `);

      res.json({
        success: true,
        data: stats[0],
        message: 'Estatísticas carregadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = new CotacoesController();
