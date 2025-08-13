/**
 * Controller de Estatísticas de Motoristas
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class MotoristasStatsController {
  // Buscar motoristas com CNH vencendo em breve
  static async buscarMotoristasCnhVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + parseInt(dias));

      const query = `
        SELECT 
          m.id, m.nome, m.cpf, m.cnh, m.categoria_cnh, m.telefone, m.email, 
          m.status, m.filial_id, m.cnh_validade,
          f.filial as filial_nome,
          DATEDIFF(m.cnh_validade, CURDATE()) as dias_para_vencimento
        FROM motoristas m
        LEFT JOIN filiais f ON m.filial_id = f.id
        WHERE m.cnh_validade IS NOT NULL 
          AND m.cnh_validade <= ? 
          AND m.cnh_validade >= CURDATE()
          AND m.status = 'ativo'
        ORDER BY m.cnh_validade ASC
      `;

      const motoristas = await executeQuery(query, [dataLimite]);

      res.json({
        success: true,
        data: motoristas
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas com CNH vencendo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os motoristas com CNH vencendo'
      });
    }
  }
}

module.exports = MotoristasStatsController;
