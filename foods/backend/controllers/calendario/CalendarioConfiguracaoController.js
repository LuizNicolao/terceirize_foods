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

      await ensureDiasNaoUteisTable();

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
        LEFT JOIN filiais f ON d.filial_id = f.id
        LEFT JOIN unidades_escolares ue ON d.unidade_escolar_id = ue.id
        WHERE YEAR(d.data) = ?
        ORDER BY d.data ASC
      `, [ano]);

      res.json({
        success: true,
        data: {
          ano: parseInt(ano),
          dias_uteis: diasUteis,
          dias_abastecimento: diasAbastecimento,
          dias_consumo: diasConsumo,
          feriados: feriados,
          dias_nao_uteis: diasNaoUteis
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

  static async listarDiasNaoUteis(req, res) {
    try {
      const { ano = new Date().getFullYear() } = req.query;

      await ensureDiasNaoUteisTable();

      const dias = await executeQuery(`
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
        LEFT JOIN filiais f ON d.filial_id = f.id
        LEFT JOIN unidades_escolares ue ON d.unidade_escolar_id = ue.id
        WHERE YEAR(d.data) = ?
        ORDER BY d.data ASC
      `, [ano]);

      res.json({
        success: true,
        data: dias
      });
    } catch (error) {
      console.error('Erro ao listar dias não úteis personalizados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async adicionarDiaNaoUtil(req, res) {
    try {
      const { data, descricao, observacoes, tipo_destino = 'global', filial_id, unidade_escolar_id } = req.body;

      if (!data || !descricao) {
        return res.status(400).json({
          success: false,
          message: 'Data e descrição são obrigatórias'
        });
      }

      if (!['global', 'filial', 'unidade'].includes(tipo_destino)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de destino inválido'
        });
      }

      if (tipo_destino === 'filial' && !filial_id) {
        return res.status(400).json({
          success: false,
          message: 'Selecione a filial para o dia não útil'
        });
      }

      if (tipo_destino === 'unidade' && !unidade_escolar_id) {
        return res.status(400).json({
          success: false,
          message: 'Selecione a unidade escolar para o dia não útil'
        });
      }

      await ensureDiasNaoUteisTable();

      await executeQuery(`
        INSERT INTO calendario_dias_nao_uteis (
          data,
          descricao,
          observacoes,
          tipo_destino,
          filial_id,
          unidade_escolar_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        data,
        descricao,
        observacoes || null,
        tipo_destino,
        tipo_destino === 'filial' ? filial_id : null,
        tipo_destino === 'unidade' ? unidade_escolar_id : null
      ]);

      res.json({
        success: true,
        message: 'Dia não útil adicionado com sucesso'
      });
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Já existe um dia não útil cadastrado com esses critérios'
        });
      }
      console.error('Erro ao adicionar dia não útil personalizado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async removerDiaNaoUtil(req, res) {
    try {
      const { id } = req.params;

      await ensureDiasNaoUteisTable();

      await executeQuery(
        'DELETE FROM calendario_dias_nao_uteis WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Dia não útil removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover dia não útil personalizado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CalendarioConfiguracaoController;
