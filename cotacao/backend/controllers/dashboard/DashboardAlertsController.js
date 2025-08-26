const { executeQuery } = require('../../config/database');

class DashboardAlertsController {
  // Buscar alertas do sistema
  static async getAlerts() {
    const alertas = [];

    // Alerta para cotações pendentes há mais de 3 dias
    try {
      const pendentesQuery = `
        SELECT COUNT(*) as total 
        FROM cotacoes 
        WHERE status = 'aguardando_aprovacao' 
        AND data_criacao < DATE_SUB(NOW(), INTERVAL 3 DAY)
      `;
      const pendentesResult = await executeQuery(pendentesQuery);
      const pendentesAntigas = parseInt(pendentesResult[0]?.total || 0);
      
      if (pendentesAntigas > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `Existem ${pendentesAntigas} cotações aguardando aprovação há mais de 3 dias.`,
          icone: 'exclamation-triangle'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar cotações pendentes antigas:', error.message);
    }

    // Alerta para economia significativa
    try {
      const economiaQuery = `
        SELECT 
          SUM(valor_total_inicial - valor_total_final) as economia_total,
          SUM(valor_total_inicial) as total_negociado
        FROM saving
      `;
      const economiaResult = await executeQuery(economiaQuery);
      const economiaData = economiaResult[0];
      
      if (economiaData?.total_negociado > 0) {
        const economiaPercentual = (economiaData.economia_total / economiaData.total_negociado) * 100;
        
        if (economiaPercentual > 15) {
          alertas.push({
            tipo: 'success',
            mensagem: `Economia significativa de ${economiaPercentual.toFixed(2)}% nas negociações.`,
            icone: 'chart-line'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar economia:', error.message);
    }

    // Alerta para cotações emergenciais
    try {
      const emergenciaisQuery = `
        SELECT COUNT(*) as total 
        FROM cotacoes 
        WHERE tipo_compra = 'emergencial' 
        AND status IN ('pendente', 'aguardando_aprovacao')
      `;
      const emergenciaisResult = await executeQuery(emergenciaisQuery);
      const emergenciaisPendentes = parseInt(emergenciaisResult[0]?.total || 0);
      
      if (emergenciaisPendentes > 0) {
        alertas.push({
          tipo: 'danger',
          mensagem: `Existem ${emergenciaisPendentes} cotações emergenciais pendentes de aprovação.`,
          icone: 'exclamation-circle'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar cotações emergenciais:', error.message);
    }

    return alertas;
  }
}

module.exports = DashboardAlertsController;
