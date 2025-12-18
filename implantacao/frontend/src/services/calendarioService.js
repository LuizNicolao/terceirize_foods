import api from './api';

const calendarioService = {
  // ===== DASHBOARD =====
  obterEstatisticas: async (ano) => {
    const response = await api.get('/calendario/dashboard/estatisticas', {
      params: { ano }
    });
    return response.data;
  },

  obterResumo: async (ano, mes) => {
    const response = await api.get('/calendario/dashboard/resumo', {
      params: { ano, mes }
    });
    return response.data;
  },

  // ===== VISUALIZAÇÃO =====
  listar: async (filtros) => {
    const response = await api.get('/calendario', { params: filtros });
    return response.data;
  },

  obterPorMes: async (ano, mes) => {
    const response = await api.get('/calendario/mes', {
      params: { ano, mes }
    });
    return response.data;
  },

  buscarPorData: async (data) => {
    const response = await api.get(`/calendario/data/${data}`);
    return response.data;
  },

  // ===== CONFIGURAÇÃO =====
  configurarDiasUteis: async (dados) => {
    const response = await api.post('/calendario/configuracao/dias-uteis', dados);
    return response.data;
  },

  configurarDiasAbastecimento: async (dados) => {
    const response = await api.post('/calendario/configuracao/dias-abastecimento', dados);
    return response.data;
  },

  configurarDiasConsumo: async (dados) => {
    const response = await api.post('/calendario/configuracao/dias-consumo', dados);
    return response.data;
  },

  adicionarFeriado: async (dados) => {
    const response = await api.post('/calendario/configuracao/feriados', dados);
    return response.data;
  },

  removerFeriado: async (data) => {
    const response = await api.delete(`/calendario/configuracao/feriados/${data}`);
    return response.data;
  },

  obterConfiguracao: async (ano) => {
    const response = await api.get('/calendario/configuracao', {
      params: { ano }
    });
    return response.data;
  },

  // ===== API DE INTEGRAÇÃO =====
  // Semanas
  buscarSemanasConsumo: async (ano, mes = null) => {
    const params = {};
    if (mes !== null && mes !== undefined && mes !== '') {
      params.mes = mes;
    }
    const response = await api.get(`/calendario/api/semanas-consumo/${ano}`, { params });
    return response.data;
  },

  buscarSemanasAbastecimento: async (ano) => {
    const response = await api.get(`/calendario/api/semanas-abastecimento/${ano}`);
    return response.data;
  },

  // Dias
  buscarDiasUteis: async (ano, mes) => {
    const response = await api.get(`/calendario/api/dias-uteis/${ano}/${mes}`);
    return response.data;
  },

  buscarDiasAbastecimento: async (ano, mes) => {
    const response = await api.get(`/calendario/api/dias-abastecimento/${ano}/${mes}`);
    return response.data;
  },

  buscarDiasConsumo: async (ano, mes) => {
    const response = await api.get(`/calendario/api/dias-consumo/${ano}/${mes}`);
    return response.data;
  },

  // Feriados
  buscarFeriados: async (ano) => {
    const response = await api.get(`/calendario/api/feriados/${ano}`);
    return response.data;
  },

  verificarFeriado: async (data) => {
    const response = await api.get(`/calendario/api/verificar-feriado/${data}`);
    return response.data;
  },

  // Semana por data
  buscarSemanaPorData: async (data) => {
    const response = await api.get(`/calendario/api/semana-por-data/${data}`);
    return response.data;
  },

  // Semana de consumo por semana de abastecimento
  buscarSemanaPorAbastecimento: async (semanaAbast, ano) => {
    try {
      // Buscar todas as semanas de abastecimento e encontrar a relacionada
      const response = await api.get(`/calendario/api/semanas-abastecimento/${ano}`);
      if (response.data && response.data.success) {
        const semana = response.data.data.find(s => s.semana_abastecimento === semanaAbast);
        return semana ? { success: true, data: semana } : { success: false, data: null };
      }
      return { success: false, data: null };
    } catch (error) {
      console.error('Erro ao buscar semana por abastecimento:', error);
      return { success: false, data: null };
    }
  },

  // Buscar grupos com per capita
  buscarGruposComPercapita: async () => {
    try {
      const response = await api.get('/produtos-per-capita/grupos-com-percapita');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return { success: false, data: [] };
    }
  }
};

export default calendarioService;
