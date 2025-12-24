import api from './api';

class NotificacoesService {
  async listar(params = {}) {
    try {
      const response = await api.get('/notificacoes', { params });
      
      let notificacoes = [];
      let pagination = null;
      
      if (response.data.data) {
        if (response.data.data.items) {
          notificacoes = response.data.data.items;
          pagination = response.data.data._meta?.pagination;
        } else {
          notificacoes = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        notificacoes = response.data;
      }
      
      return {
        success: true,
        data: notificacoes,
        pagination: pagination || response.data.pagination,
        naoLidas: response.data.naoLidas || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar notificações',
        data: []
      };
    }
  }

  async contarNaoLidas() {
    try {
      const response = await api.get('/notificacoes/contar');
      return {
        success: true,
        total: response.data.data?.total || 0
      };
    } catch (error) {
      return {
        success: false,
        total: 0
      };
    }
  }

  async marcarComoLida(id) {
    try {
      await api.put(`/notificacoes/${id}/lida`);
      return {
        success: true,
        message: 'Notificação marcada como lida'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao marcar notificação como lida'
      };
    }
  }

  async marcarTodasComoLidas() {
    try {
      await api.put('/notificacoes/marcar-todas');
      return {
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao marcar notificações como lidas'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/notificacoes/${id}`);
      return {
        success: true,
        message: 'Notificação excluída com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir notificação'
      };
    }
  }
}

export default new NotificacoesService();

