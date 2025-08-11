const { executeQuery, executeTransaction } = require('../config/database');
const { applyPagination, getPaginationMeta } = require('../middleware/pagination');

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

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cotacoes c
        ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal com paginação
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

      const paginatedQuery = applyPagination(query, req);
      const cotacoes = await executeQuery(paginatedQuery, params);
      const paginationMeta = getPaginationMeta(total, req);

      res.success(cotacoes, 'Cotações carregadas com sucesso', 200, paginationMeta);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      res.error('Erro interno do servidor', 500);
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
        return res.notFound('Cotação não encontrada');
      }

      res.success(cotacao[0], 'Cotação carregada com sucesso');
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      res.error('Erro interno do servidor', 500);
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

      const result = await executeTransaction(async (connection) => {
        // Inserir cotação
        const cotacaoResult = await connection.execute(`
          INSERT INTO cotacoes (comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa)
          VALUES (?, ?, ?, ?, ?)
        `, [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa]);

        const cotacaoId = cotacaoResult.insertId;

        // Inserir produtos se fornecidos
        if (produtos && Array.isArray(produtos)) {
          for (const produto of produtos) {
            await connection.execute(`
              INSERT INTO produtos (cotacao_id, nome, qtde, un, valor_unitario)
              VALUES (?, ?, ?, ?, ?)
            `, [cotacaoId, produto.nome, produto.qtde, produto.un, produto.valor_unitario]);
          }
        }

        return cotacaoId;
      });

      res.created({ id: result }, 'Cotação criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Atualizar cotação
  async updateCotacao(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const allowedFields = ['comprador', 'local_entrega', 'tipo_compra', 'motivo_emergencial', 'justificativa'];
      const fieldsToUpdate = Object.keys(updateData).filter(field => allowedFields.includes(field));

      if (fieldsToUpdate.length === 0) {
        return res.badRequest('Nenhum campo válido para atualização');
      }

      const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
      const values = fieldsToUpdate.map(field => updateData[field]);
      values.push(id);

      await executeQuery(`
        UPDATE cotacoes 
        SET ${setClause}, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);

      res.success(null, 'Cotação atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Excluir cotação
  async deleteCotacao(req, res) {
    try {
      const { id } = req.params;

      const result = await executeQuery('DELETE FROM cotacoes WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.notFound('Cotação não encontrada');
      }

      res.success(null, 'Cotação excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir cotação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Enviar para supervisor
  async enviarParaSupervisor(req, res) {
    try {
      const { id } = req.params;

      const result = await executeQuery(`
        UPDATE cotacoes 
        SET status = 'em_analise', data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);

      if (result.affectedRows === 0) {
        return res.notFound('Cotação não encontrada');
      }

      res.success(null, 'Cotação enviada para supervisor com sucesso');
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Aprovar cotação
  async aprovarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { dadosAprovacao } = req.body;

      const result = await executeQuery(`
        UPDATE cotacoes 
        SET status = 'aprovada', 
            motivo_final = ?, 
            economia_total = ?,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [dadosAprovacao.motivo, dadosAprovacao.economiaTotal || 0, id]);

      if (result.affectedRows === 0) {
        return res.notFound('Cotação não encontrada');
      }

      res.success(null, 'Cotação aprovada com sucesso');
    } catch (error) {
      console.error('Erro ao aprovar cotação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Rejeitar cotação
  async rejeitarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const result = await executeQuery(`
        UPDATE cotacoes 
        SET status = 'rejeitada', 
            motivo_final = ?,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [motivo, id]);

      if (result.affectedRows === 0) {
        return res.notFound('Cotação não encontrada');
      }

      res.success(null, 'Cotação rejeitada com sucesso');
    } catch (error) {
      console.error('Erro ao rejeitar cotação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Buscar estatísticas
  async getStats(req, res) {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_cotacoes,
          COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
          COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as aprovadas,
          COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as rejeitadas,
          COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as em_analise,
          SUM(CASE WHEN economia_total IS NOT NULL THEN economia_total ELSE 0 END) as economia_total
        FROM cotacoes
      `);

      res.success(stats[0], 'Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Buscar cotações pendentes para supervisor
  async getCotacoesPendentesSupervisor(req, res) {
    try {
      const cotacoes = await executeQuery(`
        SELECT 
          c.id,
          c.comprador,
          c.local_entrega,
          c.tipo_compra,
          c.justificativa,
          c.status,
          c.data_criacao,
          COUNT(p.id) as total_produtos
        FROM cotacoes c
        LEFT JOIN produtos p ON c.id = p.cotacao_id
        WHERE c.status = 'em_analise'
        GROUP BY c.id
        ORDER BY c.data_criacao DESC
      `);

      res.success(cotacoes, 'Cotações pendentes carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao buscar cotações pendentes:', error);
      res.error('Erro interno do servidor', 500);
    }
  }

  // Buscar cotações para aprovação
  async getCotacoesAprovacao(req, res) {
    try {
      const cotacoes = await executeQuery(`
        SELECT 
          c.id,
          c.comprador,
          c.local_entrega,
          c.tipo_compra,
          c.justificativa,
          c.status,
          c.data_criacao,
          c.economia_total,
          COUNT(p.id) as total_produtos
        FROM cotacoes c
        LEFT JOIN produtos p ON c.id = p.cotacao_id
        WHERE c.status IN ('em_analise', 'aguardando_aprovacao')
        GROUP BY c.id
        ORDER BY c.data_criacao DESC
      `);

      res.success(cotacoes, 'Cotações para aprovação carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao buscar cotações para aprovação:', error);
      res.error('Erro interno do servidor', 500);
    }
  }
}

module.exports = new CotacoesController();
