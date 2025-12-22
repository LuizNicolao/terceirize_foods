const { executeQuery } = require('../../config/database');

/**
 * Controller para processamento e recálculo do calendário
 * Responsável por recalcular semanas de consumo baseado nos dias de consumo ativos
 */
class CalendarioProcessamentoController {
  
  /**
   * Recalcular semanas de consumo baseado nos dias de consumo ativos
   * Agrupa os dias por semana e recalcula semana_consumo baseado nos primeiros e últimos dias de consumo
   */
  static async recalcularSemanasConsumo(req, res) {
    try {
      const { ano } = req.body;

      if (!ano) {
        return res.status(400).json({
          success: false,
          message: 'Ano é obrigatório'
        });
      }

      // Buscar todas as semanas do ano (agrupadas por semana_numero e semana_ano)
      const semanas = await executeQuery(`
        SELECT DISTINCT
          semana_numero,
          semana_ano,
          MIN(CASE WHEN dia_consumo = 1 THEN data END) as primeiro_dia_consumo,
          MAX(CASE WHEN dia_consumo = 1 THEN data END) as ultimo_dia_consumo,
          MIN(data) as semana_inicio,
          MAX(data) as semana_fim
        FROM calendario
        WHERE ano = ?
        GROUP BY semana_numero, semana_ano
        ORDER BY semana_inicio ASC
      `, [ano]);

      let semanasAtualizadas = 0;
      let semanasSemConsumo = 0;

      // Processar cada semana
      for (const semana of semanas) {
        const { primeiro_dia_consumo, ultimo_dia_consumo, semana_inicio, semana_fim } = semana;

        // Se não há dias de consumo nesta semana, limpar semana_consumo
        if (!primeiro_dia_consumo || !ultimo_dia_consumo) {
          await executeQuery(`
            UPDATE calendario
            SET semana_consumo = NULL,
                semana_consumo_inicio = NULL,
                semana_consumo_fim = NULL
            WHERE ano = ? 
              AND semana_numero = ?
              AND semana_ano = ?
          `, [ano, semana.semana_numero, semana.semana_ano]);
          
          semanasSemConsumo++;
          continue;
        }

        // Formatar datas para o formato brasileiro
        const formatarData = (dataString) => {
          if (!dataString) return null;
          const [anoData, mes, dia] = dataString.split('-');
          return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}`;
        };

        const dataInicioFormatada = formatarData(primeiro_dia_consumo);
        const dataFimFormatada = formatarData(ultimo_dia_consumo);
        const anoFormatado = String(ano).slice(-2);

        // Criar string da semana de consumo no formato "(DD/MM a DD/MM/YY)"
        const semanaConsumoFormatada = `(${dataInicioFormatada} a ${dataFimFormatada}/${anoFormatado})`;

        // Atualizar todos os registros da semana com a nova semana_consumo
        await executeQuery(`
          UPDATE calendario
          SET semana_consumo = ?,
              semana_consumo_inicio = ?,
              semana_consumo_fim = ?
          WHERE ano = ? 
            AND semana_numero = ?
            AND semana_ano = ?
        `, [
          semanaConsumoFormatada,
          primeiro_dia_consumo,
          ultimo_dia_consumo,
          ano,
          semana.semana_numero,
          semana.semana_ano
        ]);

        semanasAtualizadas++;
      }

      res.json({
        success: true,
        message: `Semanas de consumo recalculadas com sucesso!`,
        data: {
          ano,
          semanasAtualizadas,
          semanasSemConsumo,
          totalSemanas: semanas.length
        }
      });

    } catch (error) {
      console.error('Erro ao recalcular semanas de consumo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao recalcular semanas de consumo'
      });
    }
  }
}

module.exports = CalendarioProcessamentoController;
