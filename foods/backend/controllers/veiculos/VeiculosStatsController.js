/**
 * Controller de Estatísticas de Veículos
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class VeiculosStatsController {
  // Buscar veículos com documentação vencendo
  static async buscarVeiculosDocumentacaoVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;

      const query = `
        SELECT 
          v.id, v.placa, v.modelo, v.marca, v.tipo_veiculo,
          v.vencimento_licenciamento, v.proxima_inspecao_veicular,
          v.vencimento_ipva, v.status,
          f.filial as filial_nome
        FROM veiculos v
        LEFT JOIN filiais f ON v.filial_id = f.id
        WHERE (
          (v.vencimento_licenciamento IS NOT NULL AND v.vencimento_licenciamento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
          (v.proxima_inspecao_veicular IS NOT NULL AND v.proxima_inspecao_veicular <= DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
          (v.vencimento_ipva IS NOT NULL AND v.vencimento_ipva <= DATE_ADD(CURDATE(), INTERVAL ? DAY))
        )
        ORDER BY v.vencimento_licenciamento ASC, v.proxima_inspecao_veicular ASC, v.vencimento_ipva ASC
      `;

      const veiculos = await executeQuery(query, [dias, dias, dias]);

      res.json({
        success: true,
        data: veiculos
      });

    } catch (error) {
      console.error('Erro ao buscar veículos com documentação vencendo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os veículos com documentação vencendo'
      });
    }
  }
}

module.exports = VeiculosStatsController;
