/**
 * Controller CRUD para Cotações
 * Responsável pelas operações de Create, Read, Update, Delete
 */

const { executeQuery } = require('../../config/database');

class CotacoesCRUDController {
  // POST /api/cotacoes - Criar nova cotação
  static async criarCotacao(req, res) {
    try {
      const {
        comprador,
        local_entrega,
        tipo_compra,
        motivo_emergencial,
        justificativa,
        produtos
      } = req.body;
      
      // Inserir cotação
      const [result] = await executeQuery(`
        INSERT INTO cotacoes (
          comprador, local_entrega, tipo_compra, motivo_emergencial, 
          justificativa, status, usuario_id, data_criacao
        ) VALUES (?, ?, ?, ?, ?, 'pendente', ?, NOW())
      `, [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, req.user.id]);
      
      const cotacaoId = result.insertId;
      
      // Inserir produtos
      for (const produto of produtos) {
        await executeQuery(`
          INSERT INTO produtos_cotacao (
            cotacao_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado,
            ult_fornecedor_aprovado, valor_anterior, valor_unitario, difal, ipi,
            data_entrega_fn, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          cotacaoId, produto.nome, produto.qtde, produto.un, produto.prazoEntrega,
          produto.ultValorAprovado, produto.ultFornecedorAprovado, produto.valorAnterior,
          produto.valorUnitario, produto.difal, produto.ipi, produto.dataEntregaFn, produto.total
        ]);
      }
      
      res.status(201).json({
        success: true,
        message: 'Cotação criada com sucesso',
        cotacaoId
      });
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // PUT /api/cotacoes/:id - Atualizar cotação
  static async atualizarCotacao(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a cotação existe e pode ser editada
      const [cotacoes] = await executeQuery(`
        SELECT status FROM cotacoes WHERE id = ?
      `, [id]);
      
      if (cotacoes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cotação não encontrada' 
        });
      }
      
      const cotacao = cotacoes[0];
      if (!['pendente', 'renegociacao'].includes(cotacao.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Apenas cotações pendentes ou em renegociação podem ser editadas' 
        });
      }
      
      const {
        comprador,
        local_entrega,
        tipo_compra,
        motivo_emergencial,
        justificativa,
        produtos
      } = req.body;
      
      // Atualizar cotação
      await executeQuery(`
        UPDATE cotacoes SET 
          comprador = ?, local_entrega = ?, tipo_compra = ?, 
          motivo_emergencial = ?, justificativa = ?, data_atualizacao = NOW()
        WHERE id = ?
      `, [comprador, local_entrega, tipo_compra, motivo_emergencial, justificativa, id]);
      
      // Remover produtos antigos
      await executeQuery(`
        DELETE FROM produtos_cotacao WHERE cotacao_id = ?
      `, [id]);
      
      // Inserir novos produtos
      for (const produto of produtos) {
        await executeQuery(`
          INSERT INTO produtos_cotacao (
            cotacao_id, nome, qtde, un, prazo_entrega, ult_valor_aprovado,
            ult_fornecedor_aprovado, valor_anterior, valor_unitario, difal, ipi,
            data_entrega_fn, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id, produto.nome, produto.qtde, produto.un, produto.prazoEntrega,
          produto.ultValorAprovado, produto.ultFornecedorAprovado, produto.valorAnterior,
          produto.valorUnitario, produto.difal, produto.ipi, produto.dataEntregaFn, produto.total
        ]);
      }
      
      res.json({
        success: true,
        message: 'Cotação atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // DELETE /api/cotacoes/:id - Deletar cotação
  static async excluirCotacao(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a cotação existe
      const [cotacoes] = await executeQuery(`
        SELECT status FROM cotacoes WHERE id = ?
      `, [id]);
      
      if (cotacoes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cotação não encontrada' 
        });
      }
      
      // Deletar produtos primeiro
      await executeQuery(`
        DELETE FROM produtos_cotacao WHERE cotacao_id = ?
      `, [id]);
      
      // Deletar cotação
      await executeQuery(`
        DELETE FROM cotacoes WHERE id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Cotação deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar cotação:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // POST /api/cotacoes/:id/enviar-supervisor - Enviar para supervisor
  static async enviarParaSupervisor(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a cotação existe e pode ser enviada
      const [cotacoes] = await executeQuery(`
        SELECT status FROM cotacoes WHERE id = ?
      `, [id]);
      
      if (cotacoes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cotação não encontrada' 
        });
      }
      
      const cotacao = cotacoes[0];
      if (!['pendente', 'renegociacao'].includes(cotacao.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Apenas cotações pendentes ou em renegociação podem ser enviadas para supervisor' 
        });
      }
      
      // Atualizar status
      await executeQuery(`
        UPDATE cotacoes SET 
          status = 'aguardando_aprovacao', 
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
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = CotacoesCRUDController;
