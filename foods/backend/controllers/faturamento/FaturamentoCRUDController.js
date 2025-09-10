/**
 * Controller CRUD para Faturamento
 * Implementa operações de criação, atualização e exclusão
 */

const { executeQuery, pool } = require('../../config/database');

class FaturamentoCRUDController {
  /**
   * Criar novo faturamento
   */
  static async criarFaturamento(req, res) {
    try {
      const { 
        unidade_escolar_id, 
        mes, 
        ano, 
        dados_faturamento, 
        observacoes 
      } = req.body;

      // Verificar se a unidade escolar existe
      const [unidade] = await executeQuery(
        'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
        [unidade_escolar_id]
      );

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade escolar não encontrada'
        });
      }

      // Verificar se já existe faturamento para esta unidade no período
      const [faturamentoExistente] = await executeQuery(
        'SELECT id FROM faturamento WHERE unidade_escolar_id = ? AND mes = ? AND ano = ?',
        [unidade_escolar_id, mes, ano]
      );

      if (faturamentoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe faturamento para esta unidade escolar neste período'
        });
      }

      // Usar uma conexão para transação manual
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        // Criar registro principal do faturamento
        const [result] = await connection.execute(
          `INSERT INTO faturamento 
           (unidade_escolar_id, mes, ano, observacoes, criado_por, criado_em) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [unidade_escolar_id, mes, ano, observacoes, req.user.id]
        );

        const faturamentoId = result.insertId;

        // Inserir dados de faturamento por dia
        for (const dado of dados_faturamento) {
          await connection.execute(
            `INSERT INTO faturamento_detalhes 
             (faturamento_id, dia, desjejum, lanche_matutino, almoco, lanche_vespertino, noturno) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              faturamentoId,
              dado.dia,
              dado.desjejum || 0,
              dado.lanche_matutino || 0,
              dado.almoco || 0,
              dado.lanche_vespertino || 0,
              dado.noturno || 0
            ]
          );
        }

        await connection.commit();

        // Buscar o faturamento criado com detalhes
        const [faturamentoCriado] = await executeQuery(
          `SELECT 
             f.id,
             f.unidade_escolar_id,
             f.mes,
             f.ano,
             f.observacoes,
             f.criado_em,
             ue.nome_escola,
             ue.codigo_teknisa
           FROM faturamento f
           INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
           WHERE f.id = ?`,
          [faturamentoId]
        );

        // Buscar detalhes do faturamento
        const detalhes = await executeQuery(
          'SELECT * FROM faturamento_detalhes WHERE faturamento_id = ? ORDER BY dia',
          [faturamentoId]
        );

        faturamentoCriado.dados_faturamento = detalhes;

        res.status(201).json({
          success: true,
          data: faturamentoCriado,
          message: 'Faturamento criado com sucesso!'
        });

      } catch (error) {
        // Reverter transação em caso de erro
        await connection.rollback();
        throw error;
      } finally {
        // Liberar conexão
        connection.release();
      }

    } catch (error) {
      console.error('Erro ao criar faturamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar faturamento para unidade escolar específica
   */
  static async criarFaturamentoPorUnidade(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { mes, ano, dados_faturamento, observacoes } = req.body;

      // Adicionar unidade_escolar_id ao body para reutilizar a função principal
      req.body.unidade_escolar_id = parseInt(unidade_escolar_id);
      
      // Chamar a função principal de criação
      return await this.criarFaturamento(req, res);

    } catch (error) {
      console.error('Erro ao criar faturamento por unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar faturamento existente
   */
  static async atualizarFaturamento(req, res) {
    try {
      const { id } = req.params;
      const { dados_faturamento, observacoes } = req.body;

      // Verificar se o faturamento existe
      const [faturamentoExistente] = await executeQuery(
        'SELECT id FROM faturamento WHERE id = ?',
        [id]
      );

      if (!faturamentoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Faturamento não encontrado'
        });
      }

      // Usar uma conexão para transação manual
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        // Atualizar dados principais do faturamento
        if (observacoes !== undefined) {
          await connection.execute(
            'UPDATE faturamento SET observacoes = ?, atualizado_por = ?, atualizado_em = NOW() WHERE id = ?',
            [observacoes, req.user.id, id]
          );
        }

        // Atualizar dados de faturamento por dia
        if (dados_faturamento && dados_faturamento.length > 0) {
          // Remover dados antigos
          await connection.execute(
            'DELETE FROM faturamento_detalhes WHERE faturamento_id = ?',
            [id]
          );

          // Inserir novos dados
          for (const dado of dados_faturamento) {
            await connection.execute(
              `INSERT INTO faturamento_detalhes 
               (faturamento_id, dia, desjejum, lanche_matutino, almoco, lanche_vespertino, noturno) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                dado.dia,
                dado.desjejum || 0,
                dado.lanche_matutino || 0,
                dado.almoco || 0,
                dado.lanche_vespertino || 0,
                dado.noturno || 0
              ]
            );
          }
        }

        await connection.commit();

        // Buscar o faturamento atualizado
        const [faturamentoAtualizado] = await executeQuery(
          `SELECT 
             f.id,
             f.unidade_escolar_id,
             f.mes,
             f.ano,
             f.observacoes,
             f.atualizado_em,
             ue.nome_escola,
             ue.codigo_teknisa
           FROM faturamento f
           INNER JOIN unidades_escolares ue ON f.unidade_escolar_id = ue.id
           WHERE f.id = ?`,
          [id]
        );

        // Buscar detalhes do faturamento
        const detalhes = await executeQuery(
          'SELECT * FROM faturamento_detalhes WHERE faturamento_id = ? ORDER BY dia',
          [id]
        );

        faturamentoAtualizado.dados_faturamento = detalhes;

        res.json({
          success: true,
          data: faturamentoAtualizado,
          message: 'Faturamento atualizado com sucesso!'
        });

      } catch (error) {
        // Reverter transação em caso de erro
        await connection.rollback();
        throw error;
      } finally {
        // Liberar conexão
        connection.release();
      }

    } catch (error) {
      console.error('Erro ao atualizar faturamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir faturamento
   */
  static async excluirFaturamento(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o faturamento existe
      const [faturamentoExistente] = await executeQuery(
        'SELECT id FROM faturamento WHERE id = ?',
        [id]
      );

      if (!faturamentoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Faturamento não encontrado'
        });
      }

      // Usar uma conexão para transação manual
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        // Excluir detalhes do faturamento
        await connection.execute(
          'DELETE FROM faturamento_detalhes WHERE faturamento_id = ?',
          [id]
        );

        // Excluir faturamento principal
        await connection.execute(
          'DELETE FROM faturamento WHERE id = ?',
          [id]
        );

        await connection.commit();

        res.json({
          success: true,
          message: 'Faturamento excluído com sucesso!'
        });

      } catch (error) {
        // Reverter transação em caso de erro
        await connection.rollback();
        throw error;
      } finally {
        // Liberar conexão
        connection.release();
      }

    } catch (error) {
      console.error('Erro ao excluir faturamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = FaturamentoCRUDController;
