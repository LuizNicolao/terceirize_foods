import api from './api';

/**
 * Serviço para gerenciar entregas agendadas
 */
class EntregasService {
  /**
   * Listar entregas de um agrupamento
   */
  static async listarEntregas(agrupamentoId, mes = null, ano = null) {
    
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (ano) params.append('ano', ano);

      const queryString = params.toString();
      const url = `/periodicidade/${agrupamentoId}/entregas${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao listar entregas:', error);
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Criar nova entrega
   */
  static async criarEntrega(agrupamentoId, dadosEntrega) {
    console.log('🔍 [DEBUG] EntregasService.criarEntrega - dadosEntrega:', dadosEntrega);
    console.log('🔍 [DEBUG] EntregasService.criarEntrega - data_entrega:', dadosEntrega.data_entrega);
    
    try {
      const response = await api.post(`/periodicidade/${agrupamentoId}/entregas`, dadosEntrega);
      console.log('🔍 [DEBUG] EntregasService.criarEntrega - resposta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar entrega:', error);
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Atualizar entrega existente
   */
  static async atualizarEntrega(entregaId, dadosEntrega) {
    
    try {
      const response = await api.put(`/periodicidade/entregas/${entregaId}`, dadosEntrega);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar entrega:', error);
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Excluir entrega
   */
  static async excluirEntrega(entregaId) {
    
    try {
      const response = await api.delete(`/periodicidade/entregas/${entregaId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao excluir entrega:', error);
      console.error('  - Status:', error.response?.status);
      console.error('  - Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Buscar entrega por ID
   */
  static async buscarEntregaPorId(entregaId) {
    try {
      const response = await api.get(`/periodicidade/entregas/${entregaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar entrega:', error);
      throw error;
    }
  }
}

export default EntregasService;
