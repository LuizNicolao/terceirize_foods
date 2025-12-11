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
      // Aumentar timeout para operações que podem processar muitos itens
      const response = await api.put('/necessidades/logistica/ajustes', {
        itens: ajustes
      }, {
        timeout: 60000 // 60 segundos para salvar ajustes (pode processar muitos itens)
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar ajustes da logística:', error);
      throw error;
    }
  },

  // Enviar para confirmação da nutricionista
  // Aceita tanto necessidade_id único quanto array de necessidade_ids
  async enviarParaNutricionista(dados) {
    try {
      // Calcular timeout baseado no tamanho do bloco (mais tempo para blocos maiores)
      const quantidadeIds = Array.isArray(dados.necessidade_ids) ? dados.necessidade_ids.length : 1;
      const timeoutBase = 120000; // 120 segundos base
      const timeoutPorItem = 2000; // 2 segundos por item
      const timeout = Math.min(timeoutBase + (quantidadeIds * timeoutPorItem), 300000); // Máximo 5 minutos
      
      const response = await api.post('/necessidades/logistica/enviar-nutri', dados, {
        timeout: timeout
      });
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
  },

  // Trocar produto origem (logística - atualiza diretamente na tabela necessidades)
  async trocarProdutoOrigem(dados) {
    try {
      // Aumentar timeout para operações que podem processar muitos itens
      const response = await api.post('/necessidades/logistica/trocar-produto-origem', dados, {
        timeout: 45000 // 45 segundos para trocar produto origem (pode processar muitas necessidades)
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao trocar produto origem (logística):', error);
      throw error;
    }
  }
};

export default necessidadesLogisticaService;
