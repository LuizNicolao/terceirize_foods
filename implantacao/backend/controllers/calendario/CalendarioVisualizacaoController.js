const { executeQuery } = require('../../config/database');

/**
 * Controller para visualização do calendário
 */
class CalendarioVisualizacaoController {
  
  /**
   * Listar calendário com filtros
   */
  static async listar(req, res) {
    try {
      console.log('=== CALENDARIO LISTAR ===');
      console.log('Query params recebidos:', req.query);
      
      const { 
        ano = new Date().getFullYear(), 
        mes, 
        data_inicio, 
        data_fim,
        dia_semana,
        tipo_dia,
        feriado,
        limit = 100,
        offset = 0
      } = req.query;

      let whereClause = 'WHERE 1=1';
      const params = [];

      // Filtro por ano
      if (ano && ano !== '' && ano !== null && ano !== undefined) {
        whereClause += ' AND ano = ?';
        params.push(parseInt(ano));
      }

      // Filtro por mês
      if (mes && mes !== '' && mes !== null && mes !== undefined) {
        whereClause += ' AND mes = ?';
        params.push(parseInt(mes));
      }

      // Filtro por período
      if (data_inicio && data_inicio !== '') {
        whereClause += ' AND data >= ?';
        params.push(data_inicio);
      }

      if (data_fim && data_fim !== '') {
        whereClause += ' AND data <= ?';
        params.push(data_fim);
      }

      // Filtro por dia da semana
      if (dia_semana && dia_semana !== '') {
        whereClause += ' AND dia_semana_numero = ?';
        params.push(dia_semana);
      }

      // Filtro por tipo de dia
      if (tipo_dia) {
        switch (tipo_dia) {
          case 'util':
            whereClause += ' AND dia_util = 1';
            break;
          case 'abastecimento':
            whereClause += ' AND dia_abastecimento = 1';
            break;
          case 'consumo':
            whereClause += ' AND dia_consumo = 1';
            break;
          case 'feriado':
            whereClause += ' AND feriado = 1';
            break;
        }
      }

      // Filtro por feriado
      if (feriado !== undefined && feriado !== '') {
        whereClause += ' AND feriado = ?';
        params.push(feriado);
      }

      // Buscar dados
      const queryParams = [...params, parseInt(limit), parseInt(offset)];
      
      // Debug: verificar se os parâmetros estão corretos
      console.log('=== DEBUG CALENDARIO ===');
      console.log('Where clause:', whereClause);
      console.log('Params array:', params);
      console.log('QueryParams array:', queryParams);
      console.log('Params length:', params.length);
      console.log('QueryParams length:', queryParams.length);
      console.log('Limit:', limit, 'Offset:', offset);
      console.log('========================');
      
      const dados = await executeQuery(`
        SELECT 
          id,
          data,
          dia_semana_numero,
          dia_semana_nome,
          ano,
          mes,
          dia,
          semana_numero,
          semana_abastecimento,
          semana_consumo,
          mes_referencia,
          feriado,
          nome_feriado,
          dia_util,
          dia_abastecimento,
          dia_consumo,
          observacoes
        FROM calendario 
        ${whereClause}
        ORDER BY data ASC
        LIMIT ? OFFSET ?
      `, queryParams);

      // Contar total para paginação
      const [total] = await executeQuery(`
        SELECT COUNT(*) as total
        FROM calendario 
        ${whereClause}
      `, params);

      res.json({
        success: true,
        data: dados,
        pagination: {
          total: total.total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total.total / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar calendário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter calendário por mês (grid)
   */
  static async obterPorMes(req, res) {
    try {
      const { ano = new Date().getFullYear(), mes } = req.query;

      if (!mes) {
        return res.status(400).json({
          success: false,
          message: 'Mês é obrigatório'
        });
      }

      const dados = await executeQuery(`
        SELECT 
          id,
          data,
          dia_semana_numero,
          dia_semana_nome,
          dia,
          semana_numero,
          semana_abastecimento,
          semana_consumo,
          mes_referencia,
          feriado,
          nome_feriado,
          dia_util,
          dia_abastecimento,
          dia_consumo,
          observacoes
        FROM calendario 
        WHERE ano = ? AND mes = ?
        ORDER BY data ASC
      `, [ano, mes]);

      // Organizar por semanas
      const semanas = {};
      dados.forEach(dia => {
        if (!semanas[dia.semana_numero]) {
          semanas[dia.semana_numero] = {
            numero: dia.semana_numero,
            abastecimento: dia.semana_abastecimento,
            consumo: dia.semana_consumo,
            mes_referencia: dia.mes_referencia,
            dias: []
          };
        }
        semanas[dia.semana_numero].dias.push(dia);
      });

      res.json({
        success: true,
        data: {
          ano: parseInt(ano),
          mes: parseInt(mes),
          semanas: Object.values(semanas)
        }
      });

    } catch (error) {
      console.error('Erro ao obter calendário por mês:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar por data específica
   */
  static async buscarPorData(req, res) {
    try {
      const { data } = req.params;

      const [dia] = await executeQuery(`
        SELECT 
          id,
          data,
          dia_semana_numero,
          dia_semana_nome,
          ano,
          mes,
          dia,
          semana_numero,
          semana_abastecimento,
          semana_consumo,
          mes_referencia,
          feriado,
          nome_feriado,
          dia_util,
          dia_abastecimento,
          dia_consumo,
          observacoes
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
        data: dia
      });

    } catch (error) {
      console.error('Erro ao buscar data:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioVisualizacaoController;
