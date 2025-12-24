/**
 * Utilitários de SLA
 */

class SLAService {
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

  /**
   * Formatar tempo restante
   */
  static formatarTempoRestante(dataLimite) {
    if (!dataLimite) return 'Sem prazo';

    const agora = new Date();
    const limite = new Date(dataLimite);
    const diffMs = limite - agora;

    if (diffMs < 0) return 'Vencido';

    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 24) {
      const dias = Math.floor(horas / 24);
      return `${dias}d ${horas % 24}h`;
    }
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  }
}

export default SLAService;

