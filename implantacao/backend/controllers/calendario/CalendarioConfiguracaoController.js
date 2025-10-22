const { executeQuery } = require('../../config/database');

/**
 * Controller para configuração do calendário
 */
class CalendarioConfiguracaoController {
  
  /**
   * Configurar dias úteis
   */
  static async configurarDiasUteis(req, res) {
    try {
      const { ano, dias_uteis } = req.body;

      if (!ano || !Array.isArray(dias_uteis)) {
        return res.status(400).json({
          success: false,
          message: 'Ano e dias úteis são obrigatórios'
        });
      }

      // Resetar todos os dias do ano
      await executeQuery(`
        UPDATE calendario 
        SET dia_util = 0 
        WHERE ano = ?
      `, [ano]);

      // Marcar dias selecionados como úteis
      if (dias_uteis.length > 0) {
        const placeholders = dias_uteis.map(() => '?').join(',');
        await executeQuery(`
          UPDATE calendario 
          SET dia_util = 1 
          WHERE ano = ? AND dia_semana_numero IN (${placeholders})
        `, [ano, ...dias_uteis]);
      }

      res.json({
        success: true,
        message: 'Dias úteis configurados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao configurar dias úteis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Configurar dias de abastecimento
   */
  static async configurarDiasAbastecimento(req, res) {
    try {
      const { ano, dias_abastecimento } = req.body;

      if (!ano || !Array.isArray(dias_abastecimento)) {
        return res.status(400).json({
          success: false,
          message: 'Ano e dias de abastecimento são obrigatórios'
        });
      }

      // Resetar todos os dias do ano
      await executeQuery(`
        UPDATE calendario 
        SET dia_abastecimento = 0 
        WHERE ano = ?
      `, [ano]);

      // Marcar dias selecionados como abastecimento
      if (dias_abastecimento.length > 0) {
        const placeholders = dias_abastecimento.map(() => '?').join(',');
        await executeQuery(`
          UPDATE calendario 
          SET dia_abastecimento = 1 
          WHERE ano = ? AND dia_semana_numero IN (${placeholders})
        `, [ano, ...dias_abastecimento]);
      }

      res.json({
        success: true,
        message: 'Dias de abastecimento configurados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao configurar dias de abastecimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Configurar dias de consumo
   */
  static async configurarDiasConsumo(req, res) {
    try {
      const { ano, dias_consumo } = req.body;

      if (!ano || !Array.isArray(dias_consumo)) {
        return res.status(400).json({
          success: false,
          message: 'Ano e dias de consumo são obrigatórios'
        });
      }

      // Resetar todos os dias do ano
      await executeQuery(`
        UPDATE calendario 
        SET dia_consumo = 0 
        WHERE ano = ?
      `, [ano]);

      // Marcar dias selecionados como consumo
      if (dias_consumo.length > 0) {
        const placeholders = dias_consumo.map(() => '?').join(',');
        await executeQuery(`
          UPDATE calendario 
          SET dia_consumo = 1 
          WHERE ano = ? AND dia_semana_numero IN (${placeholders})
        `, [ano, ...dias_consumo]);
      }

      res.json({
        success: true,
        message: 'Dias de consumo configurados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao configurar dias de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Adicionar feriado
   */
  static async adicionarFeriado(req, res) {
    try {
      const { data, nome_feriado, observacoes } = req.body;

      if (!data || !nome_feriado) {
        return res.status(400).json({
          success: false,
          message: 'Data e nome do feriado são obrigatórios'
        });
      }

      // Verificar se a data existe no calendário
      const [existe] = await executeQuery(`
        SELECT id FROM calendario WHERE data = ?
      `, [data]);

      if (!existe) {
        return res.status(404).json({
          success: false,
          message: 'Data não encontrada no calendário'
        });
      }

      // Atualizar como feriado
      await executeQuery(`
        UPDATE calendario 
        SET feriado = 1, nome_feriado = ?, observacoes = ?, dia_util = 0
        WHERE data = ?
      `, [nome_feriado, observacoes, data]);

      res.json({
        success: true,
        message: 'Feriado adicionado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao adicionar feriado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Remover feriado
   */
  static async removerFeriado(req, res) {
    try {
      const { data } = req.params;

      // Atualizar removendo feriado
      await executeQuery(`
        UPDATE calendario 
        SET feriado = 0, nome_feriado = NULL, observacoes = NULL, dia_util = 1
        WHERE data = ?
      `, [data]);

      res.json({
        success: true,
        message: 'Feriado removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter configuração atual
   */
  static async obterConfiguracao(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.query;

      // Dias úteis configurados
      const diasUteis = await executeQuery(`
        SELECT DISTINCT dia_semana_numero, dia_semana_nome
        FROM calendario 
        WHERE ano = ? AND dia_util = 1
        ORDER BY dia_semana_numero
      `, [ano]);

      // Dias de abastecimento configurados
      const diasAbastecimento = await executeQuery(`
        SELECT DISTINCT dia_semana_numero, dia_semana_nome
        FROM calendario 
        WHERE ano = ? AND dia_abastecimento = 1
        ORDER BY dia_semana_numero
      `, [ano]);

      // Dias de consumo configurados
      const diasConsumo = await executeQuery(`
        SELECT DISTINCT dia_semana_numero, dia_semana_nome
        FROM calendario 
        WHERE ano = ? AND dia_consumo = 1
        ORDER BY dia_semana_numero
      `, [ano]);

      // Feriados do ano
      const feriados = await executeQuery(`
        SELECT data, nome_feriado, observacoes
        FROM calendario 
        WHERE ano = ? AND feriado = 1
        ORDER BY data
      `, [ano]);

      res.json({
        success: true,
        data: {
          ano: parseInt(ano),
          dias_uteis: diasUteis,
          dias_abastecimento: diasAbastecimento,
          dias_consumo: diasConsumo,
          feriados: feriados
        }
      });

    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioConfiguracaoController;
