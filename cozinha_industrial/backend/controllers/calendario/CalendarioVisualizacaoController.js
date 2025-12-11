const { executeQuery } = require('../../config/database');

const ensureDiasNaoUteisTable = async () => {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS calendario_dias_nao_uteis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      data DATE NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      observacoes TEXT NULL,
      tipo_destino ENUM('global', 'filial', 'unidade') NOT NULL DEFAULT 'global',
      filial_id INT NULL,
      unidade_escolar_id INT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_calendario_dia_destino (data, tipo_destino, filial_id, unidade_escolar_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `);
};

/**
 * Controller para visualização do calendário
 */
class CalendarioVisualizacaoController {
  
  /**
   * Listar calendário com filtros
   */
  static async listar(req, res) {
    try {
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
      if (mes && mes !== '' && mes !== 'undefined') {
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
      
      await ensureDiasNaoUteisTable();

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

      const diasNaoUteis = await executeQuery(`
        SELECT 
          d.id,
          d.data,
          d.descricao,
          d.observacoes,
          d.tipo_destino,
          d.filial_id,
          d.unidade_escolar_id,
          f.filial AS filial_nome,
          f.cidade AS filial_cidade,
          ue.nome_escola AS unidade_nome,
          ue.cidade AS unidade_cidade
        FROM calendario_dias_nao_uteis d
        LEFT JOIN foods_db.filiais f ON d.filial_id = f.id
        LEFT JOIN foods_db.unidades_escolares ue ON d.unidade_escolar_id = ue.id
        WHERE YEAR(d.data) = ? AND MONTH(d.data) = ?
        ORDER BY d.data ASC
      `, [ano, mes]);

      const mapaDiasNaoUteis = {};
      diasNaoUteis.forEach((item) => {
        const dataKey = item.data instanceof Date
          ? item.data.toISOString().split('T')[0]
          : new Date(`${item.data}T00:00:00`).toISOString().split('T')[0];

        if (!mapaDiasNaoUteis[dataKey]) {
          mapaDiasNaoUteis[dataKey] = [];
        }

        mapaDiasNaoUteis[dataKey].push(item);
      });

      // Organizar por semanas
      const semanas = {};
      dados.forEach(dia => {
        const dataKey = dia.data instanceof Date
          ? dia.data.toISOString().split('T')[0]
          : new Date(`${dia.data}T00:00:00`).toISOString().split('T')[0];

        dia.excecoes = mapaDiasNaoUteis[dataKey] || [];

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
