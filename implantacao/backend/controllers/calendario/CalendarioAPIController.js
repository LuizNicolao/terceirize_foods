const { executeQuery } = require('../../config/database');

/**
 * Controller para API de integração do calendário
 */
class CalendarioAPIController {
  
  /**
   * Buscar semanas de consumo por ano
   */
  static async buscarSemanasConsumo(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const semanas = await executeQuery(`
        SELECT DISTINCT 
          semana_consumo,
          semana_consumo_inicio,
          semana_consumo_fim,
          mes_referencia
        FROM calendario 
        WHERE ano = ? AND semana_consumo IS NOT NULL AND semana_consumo != ''
        ORDER BY semana_consumo_inicio
      `, [ano]);

      // Manter o formato com parênteses e ano das semanas de consumo
      const semanasLimpas = semanas.map(semana => ({
        ...semana,
        semana_consumo: semana.semana_consumo
      }));

      res.json({
        success: true,
        data: semanasLimpas
      });

    } catch (error) {
      console.error('Erro ao buscar semanas de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar semanas de abastecimento por ano
   */
  static async buscarSemanasAbastecimento(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const semanas = await executeQuery(`
        SELECT DISTINCT 
          semana_abastecimento,
          semana_abastecimento_inicio,
          semana_abastecimento_fim
        FROM calendario 
        WHERE ano = ? AND semana_abastecimento IS NOT NULL AND semana_abastecimento != ''
        ORDER BY semana_abastecimento_inicio
      `, [ano]);

      res.json({
        success: true,
        data: semanas
      });

    } catch (error) {
      console.error('Erro ao buscar semanas de abastecimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias úteis por mês
   */
  static async buscarDiasUteis(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_util,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_util = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias úteis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias de abastecimento por mês
   */
  static async buscarDiasAbastecimento(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_abastecimento,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_abastecimento = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias de abastecimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar dias de consumo por mês
   */
  static async buscarDiasConsumo(req, res) {
    try {
      const { ano, mes } = req.params;

      if (!ano || !mes) {
        return res.status(400).json({
          success: false,
          message: 'Ano e mês são obrigatórios'
        });
      }

      const dias = await executeQuery(`
        SELECT 
          data,
          dia_semana_nome,
          dia_consumo,
          feriado,
          nome_feriado
        FROM calendario 
        WHERE ano = ? AND mes = ? AND dia_consumo = 1
        ORDER BY data
      `, [ano, mes]);

      res.json({
        success: true,
        data: dias
      });

    } catch (error) {
      console.error('Erro ao buscar dias de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar feriados por ano
   */
  static async buscarFeriados(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.params;

      const feriados = await executeQuery(`
        SELECT 
          data,
          nome_feriado,
          observacoes,
          dia_semana_nome
        FROM calendario 
        WHERE ano = ? AND feriado = 1
        ORDER BY data
      `, [ano]);

      res.json({
        success: true,
        data: feriados
      });

    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se uma data é feriado
   */
  static async verificarFeriado(req, res) {
    try {
      const { data } = req.params;

      const [dia] = await executeQuery(`
        SELECT 
          data,
          feriado,
          nome_feriado,
          dia_util,
          dia_abastecimento,
          dia_consumo
        FROM calendario 
        WHERE data = ?
      `, [data]);

      if (!dia) {
        return res.status(404).json({
          success: false,
          message: 'Data não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          data: dia.data,
          feriado: Boolean(dia.feriado),
          nome_feriado: dia.nome_feriado,
          dia_util: Boolean(dia.dia_util),
          dia_abastecimento: Boolean(dia.dia_abastecimento),
          dia_consumo: Boolean(dia.dia_consumo)
        }
      });

    } catch (error) {
      console.error('Erro ao verificar feriado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar semana por data de consumo
   */
  static async buscarSemanaPorDataConsumo(req, res) {
    try {
      const { data } = req.params;

      const [semana] = await executeQuery(`
        SELECT 
          semana_abastecimento,
          semana_abastecimento_inicio,
          semana_abastecimento_fim,
          semana_consumo,
          semana_consumo_inicio,
          semana_consumo_fim,
          mes_referencia
        FROM calendario 
        WHERE data = ?
      `, [data]);

      if (!semana) {
        return res.status(404).json({
          success: false,
          message: 'Data não encontrada'
        });
      }

      res.json({
        success: true,
        data: semana
      });

    } catch (error) {
      console.error('Erro ao buscar semana por data:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioAPIController;
