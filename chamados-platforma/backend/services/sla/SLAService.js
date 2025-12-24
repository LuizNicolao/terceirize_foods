/**
 * Service de SLA
 * Responsável pela lógica de SLA e tempo de resposta
 */

const { executeQuery } = require('../../config/database');

class SLAService {
  
  /**
   * Calcular prazo de resolução baseado na prioridade
   */
  static calcularPrazoResolucao(prioridade) {
    const prazos = {
      'critica': 4,    // 4 horas
      'alta': 24,      // 24 horas (1 dia)
      'media': 72,     // 72 horas (3 dias)
      'baixa': 168     // 168 horas (7 dias)
    };
    
    return prazos[prioridade] || 72;
  }

  /**
   * Atualizar data limite de resolução
   */
  static async atualizarDataLimite(chamadoId, prioridade) {
    const prazoHoras = this.calcularPrazoResolucao(prioridade);
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() + prazoHoras);

    await executeQuery(
      `UPDATE chamados 
       SET prazo_resolucao_horas = ?, 
           data_limite_resolucao = ? 
       WHERE id = ?`,
      [prazoHoras, dataLimite, chamadoId]
    );

    return dataLimite;
  }

  /**
   * Registrar primeira resposta
   */
  static async registrarPrimeiraResposta(chamadoId) {
    // Verificar se já tem primeira resposta
    const chamado = await executeQuery(
      'SELECT data_abertura, data_primeira_resposta FROM chamados WHERE id = ?',
      [chamadoId]
    );

    if (chamado.length === 0) return;

    // Se já tem primeira resposta, não atualizar
    if (chamado[0].data_primeira_resposta) return;

    // Calcular tempo de resposta
    const dataAbertura = new Date(chamado[0].data_abertura);
    const agora = new Date();
    const tempoRespostaMinutos = Math.floor((agora - dataAbertura) / (1000 * 60));

    await executeQuery(
      `UPDATE chamados 
       SET data_primeira_resposta = NOW(), 
           tempo_resposta_minutos = ? 
       WHERE id = ?`,
      [tempoRespostaMinutos, chamadoId]
    );
  }

  /**
   * Verificar chamados com SLA em risco
   */
  static async verificarSLAEmRisco() {
    const agora = new Date();
    const umaHoraDepois = new Date(agora.getTime() + 60 * 60 * 1000);

    const chamados = await executeQuery(
      `SELECT id, titulo, prioridade, data_limite_resolucao, status
       FROM chamados 
       WHERE ativo = 1 
       AND status NOT IN ('concluido', 'fechado')
       AND data_limite_resolucao IS NOT NULL
       AND data_limite_resolucao <= ?
       AND data_limite_resolucao > ?`,
      [umaHoraDepois, agora]
    );

    return chamados;
  }

  /**
   * Verificar chamados com SLA vencido
   */
  static async verificarSLAVencido() {
    const agora = new Date();

    const chamados = await executeQuery(
      `SELECT id, titulo, prioridade, data_limite_resolucao, status
       FROM chamados 
       WHERE ativo = 1 
       AND status NOT IN ('concluido', 'fechado')
       AND data_limite_resolucao IS NOT NULL
       AND data_limite_resolucao < ?`,
      [agora]
    );

    return chamados;
  }

  /**
   * Obter status do SLA
   */
  static obterStatusSLA(dataLimite) {
    if (!dataLimite) return 'sem_prazo';

    const agora = new Date();
    const limite = new Date(dataLimite);
    const diffHoras = (limite - agora) / (1000 * 60 * 60);

    if (diffHoras < 0) return 'vencido';
    if (diffHoras < 2) return 'critico';
    if (diffHoras < 24) return 'atencao';
    return 'ok';
  }

  /**
   * Obter cor do status SLA
   */
  static obterCorSLA(status) {
    const cores = {
      'ok': 'text-green-600 bg-green-50',
      'atencao': 'text-yellow-600 bg-yellow-50',
      'critico': 'text-orange-600 bg-orange-50',
      'vencido': 'text-red-600 bg-red-50',
      'sem_prazo': 'text-gray-600 bg-gray-50'
    };
    return cores[status] || cores['sem_prazo'];
  }
}

module.exports = SLAService;

