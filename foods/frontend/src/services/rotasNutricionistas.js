import api from './api';

const RotasNutricionistasService = {
  /**
   * Listar rotas nutricionistas com filtros e paginação
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/rotas-nutricionistas', { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erro ao listar rotas nutricionistas:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Buscar rota nutricionista por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/rotas-nutricionistas/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erro ao buscar rota nutricionista:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Criar nova rota nutricionista
   */
  async criar(data) {
    try {
      const response = await api.post('/rotas-nutricionistas', data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erro ao criar rota nutricionista:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        validationErrors: error.response?.data?.validationErrors || null
      };
    }
  },

  /**
   * Atualizar rota nutricionista existente
   */
  async atualizar(id, data) {
    try {
      const response = await api.put(`/rotas-nutricionistas/${id}`, data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erro ao atualizar rota nutricionista:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        validationErrors: error.response?.data?.validationErrors || null
      };
    }
  },

  /**
   * Excluir rota nutricionista
   */
  async excluir(id) {
    try {
      const response = await api.delete(`/rotas-nutricionistas/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Erro ao excluir rota nutricionista:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Buscar usuários (nutricionistas, supervisores, coordenadores)
   */
  async buscarUsuarios() {
    try {
      // Buscar usuários por tipo usando o endpoint correto
      const [usuariosResponse, supervisoresResponse, coordenadoresResponse] = await Promise.all([
        api.get('/usuarios/tipo/nutricionista'),
        api.get('/usuarios/tipo/supervisor'),
        api.get('/usuarios/tipo/coordenador')
      ]);
      
      // Extrair dados das respostas
      const getUsuariosFromResponse = (response) => {
        if (response.data && response.data.success && response.data.data) {
          return Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      };
      
      const usuarios = getUsuariosFromResponse(usuariosResponse);
      const supervisores = getUsuariosFromResponse(supervisoresResponse);
      const coordenadores = getUsuariosFromResponse(coordenadoresResponse);
      
      return {
        success: true,
        data: {
          usuarios,
          supervisores,
          coordenadores
        }
      };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: {
          usuarios: [],
          supervisores: [],
          coordenadores: []
        }
      };
    }
  },

  /**
   * Buscar usuários por tipo e filial específica
   */
  async buscarUsuariosPorTipoEFilial(tipo, filialId) {
    try {
      const response = await api.get(`/usuarios/tipo/${tipo}/filiais/${filialId}`);
      
      const getUsuariosFromResponse = (response) => {
        if (response.data && response.data.success && response.data.data) {
          return Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      };
      
      return {
        success: true,
        data: getUsuariosFromResponse(response)
      };
    } catch (error) {
      console.error(`Erro ao buscar usuários do tipo ${tipo} na filial ${filialId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  /**
   * Buscar unidades escolares por filial
   */
  async buscarUnidadesEscolaresPorFilial(filialId) {
    try {
      const response = await api.get(`/unidades-escolares/filial/${filialId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: Array.isArray(response.data.data) ? response.data.data : []
        };
      }
      
      return {
        success: false,
        error: 'Resposta inválida do servidor',
        data: []
      };
    } catch (error) {
      console.error(`Erro ao buscar unidades escolares da filial ${filialId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  /**
   * Buscar filiais do usuário
   */
  async buscarFiliaisUsuario(usuarioId) {
    try {
      const response = await api.get(`/usuarios/${usuarioId}/filiais`);
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: Array.isArray(response.data.data) ? response.data.data : []
        };
      }
      
      return {
        success: false,
        error: 'Resposta inválida do servidor',
        data: []
      };
    } catch (error) {
      console.error(`Erro ao buscar filiais do usuário ${usuarioId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  /**
   * Exportar rotas nutricionistas para XLSX
   */
  async exportarXLSX(params = {}) {
    try {
      const response = await api.get('/rotas-nutricionistas/export/xlsx', {
        params,
        responseType: 'blob'
      });

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rotas-nutricionistas-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: 'Arquivo baixado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Buscar unidades escolares com paginação
   */
  async buscarUnidadesEscolares(params = {}) {
    try {
      const response = await api.get('/unidades-escolares', { params });
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      } else if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Erro ao buscar unidades escolares:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: []
      };
    }
  },

  /**
   * Exportar rotas nutricionistas para PDF
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/rotas-nutricionistas/export/pdf', {
        params,
        responseType: 'blob'
      });

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rotas-nutricionistas-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        data: 'Arquivo baixado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

export default RotasNutricionistasService;
