const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  asyncHandler 
} = require('../../middleware/responseHandler');

class DashboardStatsController {
  // Buscar estatísticas por status
  static async getStatusStats() {
    const stats = {
      pendentes: 0,
      aguardando_supervisor: 0,
      aprovadas: 0,
      rejeitadas: 0,
      renegociacao: 0,
      em_analise: 0
    };

    try {
      const statusQuery = "SELECT status, COUNT(*) as total FROM cotacoes GROUP BY status";
      const statusResult = await executeQuery(statusQuery);
      
      statusResult.forEach(row => {
        const status = row.status;
        const total = parseInt(row.total);
        
        switch (status) {
          case 'aguardando_aprovacao':
            stats.pendentes = total;
            break;
          case 'aguardando_aprovacao_supervisor':
            stats.aguardando_supervisor = total;
            break;
          case 'aprovada':
            stats.aprovadas = total;
            break;
          case 'rejeitada':
            stats.rejeitadas = total;
            break;
          case 'renegociacao':
            stats.renegociacao = total;
            break;
          case 'em_analise':
            stats.em_analise = total;
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas por status:', error.message);
    }

    return stats;
  }

  // Buscar estatísticas por tipo
  static async getTypeStats() {
    const stats = {
      programadas: 0,
      emergenciais: 0
    };

    try {
      const tipoQuery = "SELECT tipo_compra, COUNT(*) as total FROM cotacoes GROUP BY tipo_compra";
      const tipoResult = await executeQuery(tipoQuery);
      
      tipoResult.forEach(row => {
        const tipo = row.tipo_compra;
        const total = parseInt(row.total);
        
        if (tipo === 'programada') {
          stats.programadas = total;
        } else if (tipo === 'emergencial') {
          stats.emergenciais = total;
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas por tipo:', error.message);
    }

    return stats;
  }

  // Buscar estatísticas de usuários
  static async getUserStats() {
    try {
      const usuariosQuery = "SELECT COUNT(*) as usuarios_ativos FROM users WHERE status = 'ativo'";
      const usuariosResult = await executeQuery(usuariosQuery);
      return parseInt(usuariosResult[0]?.usuarios_ativos || 0);
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error.message);
      return 0;
    }
  }

  // Buscar estatísticas do Saving
  static async getSavingStats() {
    const stats = {
      economia_total: 0,
      economia_percentual: 0,
      total_negociado: 0,
      total_aprovado: 0,
      total_rodadas: 0
    };

    try {
      // Verificar se a tabela saving existe
      const tableExistsQuery = "SHOW TABLES LIKE 'saving'";
      const tableExists = await executeQuery(tableExistsQuery);
      
      if (tableExists.length > 0) {
        const savingQuery = `
          SELECT 
            SUM(valor_total_inicial - valor_total_final) as economia_total,
            SUM(valor_total_inicial) as total_negociado,
            SUM(valor_total_final) as total_aprovado,
            SUM(rodadas) as total_rodadas
          FROM saving
        `;
        const savingResult = await executeQuery(savingQuery);
        const savingData = savingResult[0];
        
        stats.economia_total = parseFloat(savingData?.economia_total || 0);
        stats.total_negociado = parseFloat(savingData?.total_negociado || 0);
        stats.total_aprovado = parseFloat(savingData?.total_aprovado || 0);
        stats.total_rodadas = parseInt(savingData?.total_rodadas || 0);
        
        // Calcular economia percentual
        if (stats.total_negociado > 0) {
          stats.economia_percentual = (stats.economia_total / stats.total_negociado) * 100;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do saving:', error.message);
    }

    return stats;
  }
}

module.exports = DashboardStatsController;
