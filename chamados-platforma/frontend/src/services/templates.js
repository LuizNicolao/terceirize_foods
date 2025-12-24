import api from './api';

class TemplatesService {
  async listar(tipoChamado = null, categoria = null) {
    try {
      const params = {};
      if (tipoChamado) params.tipo_chamado = tipoChamado;
      if (categoria) params.categoria = categoria;
      
      const response = await api.get('/templates', { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao carregar templates'
      };
    }
  }

  async buscarPorId(id) {
    try {
      const response = await api.get(`/templates/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao buscar template'
      };
    }
  }

  async criar(template) {
    try {
      const response = await api.post('/templates', template);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Template criado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar template'
      };
    }
  }

  async atualizar(id, template) {
    try {
      const response = await api.put(`/templates/${id}`, template);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Template atualizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar template'
      };
    }
  }

  async excluir(id) {
    try {
      await api.delete(`/templates/${id}`);
      return {
        success: true,
        message: 'Template excluído com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao excluir template'
      };
    }
  }
}

export default new TemplatesService();

