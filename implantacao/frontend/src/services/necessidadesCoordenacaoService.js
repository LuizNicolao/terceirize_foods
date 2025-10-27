import api from './api';

const necessidadesCoordenacaoService = {
  // Listar necessidades para coordenação
  async listarParaCoordenacao(filtros) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
      if (filtros.grupo) params.append('grupo', filtros.grupo);
      if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
      if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
      if (filtros.nutricionista_id) params.append('nutricionista_id', filtros.nutricionista_id);

      const response = await api.get(`/necessidades/coordenacao?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar necessidades para coordenação:', error);
      throw error;
    }
  },

  // Salvar ajustes da coordenação
  async salvarAjustesCoordenacao(ajustes) {
    try {
      const response = await api.put('/necessidades/coordenacao/ajustes', {
        itens: ajustes
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar ajustes da coordenação:', error);
      throw error;
    }
  },

  // Liberar para logística
  async liberarParaLogistica(necessidadeIds) {
    try {
      const response = await api.post('/necessidades/coordenacao/liberar-logistica', {
        necessidade_ids: necessidadeIds
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao liberar para logística:', error);
      throw error;
    }
  },

  // Buscar produtos para modal
  async buscarProdutosParaModal(filtros) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.grupo) params.append('grupo', filtros.grupo);
      if (filtros.escola_id) params.append('escola_id', filtros.escola_id);
      if (filtros.semana_consumo) params.append('semana_consumo', filtros.semana_consumo);
      if (filtros.semana_abastecimento) params.append('semana_abastecimento', filtros.semana_abastecimento);
      if (filtros.search) params.append('search', filtros.search);

      const response = await api.get(`/necessidades/coordenacao/produtos-modal?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos para modal:', error);
      throw error;
    }
  },

  // Incluir produto extra
  async incluirProdutoExtra(dados) {
    try {
      const response = await api.post('/necessidades/coordenacao/produto-extra', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao incluir produto extra:', error);
      throw error;
    }
  },

  // Listar nutricionistas
  async listarNutricionistas() {
    try {
      const response = await api.get('/necessidades/coordenacao/nutricionistas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar nutricionistas:', error);
      throw error;
    }
  },

  // Exportar para XLSX
  async exportarXLSX(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
          params.append(key, filtros[key]);
        }
      });
      params.append('aba', 'coordenacao');
      
      const response = await api.get(`/necessidades/exportar/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `necessidades_coordenacao_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      throw error;
    }
  },

  // Exportar para PDF
  async exportarPDF(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '' && filtros[key] !== null) {
          params.append(key, filtros[key]);
        }
      });
      params.append('aba', 'coordenacao');
      
      const response = await api.get(`/necessidades/exportar/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        filename: `necessidades_coordenacao_${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  }
};

export default necessidadesCoordenacaoService;
