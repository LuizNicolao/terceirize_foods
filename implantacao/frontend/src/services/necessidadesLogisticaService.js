import api from './api';

const necessidadesLogisticaService = {
  // Listar necessidades para logística
  async listarParaLogistica(filtros) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
      if (filtros.grupo) params.append('grupo', filtros.grupo);
      if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
      if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
      if (filtros.nutricionista_id) params.append('nutricionista_id', filtros.nutricionista_id);

      const response = await api.get(`/necessidades/logistica?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar necessidades para logística:', error);
      throw error;
    }
  },

  // Salvar ajustes da logística
  async salvarAjustesLogistica(ajustes) {
    try {
      const response = await api.put('/necessidades/logistica/ajustes', {
        itens: ajustes
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar ajustes da logística:', error);
      throw error;
    }
  },

  // Enviar para confirmação da nutricionista
  async enviarParaNutricionista(dados) {
    try {
      const response = await api.post('/necessidades/logistica/enviar-nutri', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar para nutricionista:', error);
      throw error;
    }
  },

  // Buscar produtos para modal
  async buscarProdutosParaModal(filtros) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
      if (filtros.grupo) params.append('grupo', filtros.grupo);
      if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
      if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);

      const response = await api.get(`/necessidades/logistica/produtos-modal?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos para modal logística:', error);
      throw error;
    }
  },

  // Incluir produto extra
  async incluirProdutoExtra(dados) {
    try {
      const response = await api.post('/necessidades/logistica/produto-extra', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao incluir produto extra logística:', error);
      throw error;
    }
  },

  // Deletar produto de necessidade em ajuste
  async deletarProdutoAjuste(id) {
    try {
      const response = await api.delete(`/necessidades/ajuste/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto de ajuste:', error);
      throw error;
    }
  }
};

export default necessidadesLogisticaService;
