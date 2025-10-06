import api from './api';

const UnidadesEscolaresService = {
  // Listar todas as unidades escolares
  async getAll() {
    try {
      const response = await api.get('/unidades-escolares');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar unidades escolares:', error);
      throw error;
    }
  },

  // Método listar para compatibilidade com useBaseEntity
  async listar(params = {}) {
    try {
      const response = await api.get('/unidades-escolares', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar unidades escolares:', error);
      throw error;
    }
  },

  // Buscar unidade escolar por ID
  async getById(id) {
    try {
      const response = await api.get(`/unidades-escolares/${id}`);
      
      // Extrair dados da estrutura HATEOAS
      let unidade = null;
      
      if (response.data.data) {
        unidade = response.data.data;
      } else {
        unidade = response.data;
      }
      
      return {
        success: true,
        data: unidade
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar unidade escolar'
      };
    }
  },

  // Criar unidade escolar
  async create(data) {
    try {
      const response = await api.post('/unidades-escolares', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar unidade escolar:', error);
      throw error;
    }
  },

  // Método criar para compatibilidade com useBaseEntity
  async criar(data) {
    try {
      const response = await api.post('/unidades-escolares', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar unidade escolar:', error);
      throw error;
    }
  },

  // Atualizar unidade escolar
  async update(id, data) {
    try {
      const response = await api.put(`/unidades-escolares/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar unidade escolar:', error);
      throw error;
    }
  },

  // Método atualizar para compatibilidade com useBaseEntity
  async atualizar(id, data) {
    try {
      const response = await api.put(`/unidades-escolares/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar unidade escolar:', error);
      throw error;
    }
  },

  // Deletar unidade escolar
  async delete(id) {
    try {
      const response = await api.delete(`/unidades-escolares/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar unidade escolar:', error);
      throw error;
    }
  },

  // Método excluir para compatibilidade com useBaseEntity
  async excluir(id) {
    try {
      const response = await api.delete(`/unidades-escolares/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir unidade escolar:', error);
      throw error;
    }
  },

  // Buscar unidades escolares ativas
  async buscarAtivas() {
    try {
      const response = await api.get('/unidades-escolares/ativas/listar');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar unidades escolares ativas:', error);
      throw error;
    }
  },

  // Obter estatísticas
  async getStats() {
    try {
      const response = await api.get('/unidades-escolares/stats/geral');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas das unidades escolares:', error);
      throw error;
    }
  },

  // Buscar unidades escolares com filtros
  async search(filters = {}) {
    try {
      const response = await api.get('/unidades-escolares/search', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar unidades escolares:', error);
      throw error;
    }
  }
};

export default UnidadesEscolaresService;
