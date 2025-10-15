const { getAuditLogs } = require('../../utils/audit');

/**
 * Controller de Auditoria para Registros Diários
 */
class RegistrosDiariosAuditController {
  
  /**
   * Buscar histórico de auditoria de uma escola
   */
  static async buscarHistoricoPorEscola(req, res) {
    try {
      const { escola_id } = req.params;
      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;
      
      // Buscar logs de auditoria filtrados por recurso
      const logs = await getAuditLogs({
        recurso: 'registros_diarios',
        limit: 100,
        offset: 0
      });
      
      // Filtrar logs por escola_id nos detalhes
      let logsEscola = logs.filter(log => {
        if (log.detalhes && log.detalhes.escola_id) {
          return log.detalhes.escola_id === parseInt(escola_id);
        }
        return false;
      });
      
      // Se for nutricionista, filtrar apenas seus registros
      if (userType === 'nutricionista') {
        logsEscola = logsEscola.filter(log => log.usuario_id === userId);
      }
      
      // Formatar logs para o frontend
      const historicoFormatado = logsEscola.map(log => {
        const detalhes = log.detalhes || {};
        
        return {
          id: log.id,
          acao: log.acao,
          data_acao: log.timestamp,
          escola_id: detalhes.escola_id,
          escola_nome: detalhes.escola_nome,
          data: detalhes.data,
          nutricionista_id: log.usuario_id,
          usuario_nome: log.usuario_nome,
          valores: detalhes.quantidades || {},
          valores_anteriores: detalhes.valores_anteriores || null,
          ip_address: log.ip_address
        };
      });
      
      res.json({
        success: true,
        data: historicoFormatado
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar histórico'
      });
    }
  }
}

module.exports = RegistrosDiariosAuditController;

