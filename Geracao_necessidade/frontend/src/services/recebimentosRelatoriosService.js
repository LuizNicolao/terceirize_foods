import api from './api';

const recebimentosRelatoriosService = {
  // Relatório de Pendências
  relatorioPendencias: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/recebimentos-escolas/relatorios/pendencias?${params.toString()}`);
    return response.data;
  },

  // Relatório de Completos
  relatorioCompletos: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/recebimentos-escolas/relatorios/completos?${params.toString()}`);
    return response.data;
  },

  // Dashboard de Relatórios
  dashboardRelatorios: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/recebimentos-escolas/relatorios/dashboard?${params.toString()}`);
    return response.data;
  }
};

export default recebimentosRelatoriosService;
