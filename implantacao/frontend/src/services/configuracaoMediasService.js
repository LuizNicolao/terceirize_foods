import api from './api';

const configuracaoMediasService = {
  obterConfiguracao: async (ano) => {
    const response = await api.get('/registros-diarios/configuracao-medias', {
      params: { ano }
    });
    return response.data;
  },

  salvarConfiguracao: async (ano, mesesAtivos) => {
    const response = await api.post('/registros-diarios/configuracao-medias', {
      ano,
      meses_ativos: mesesAtivos
    });
    return response.data;
  },

  recalcularMedias: async (escolaId = null) => {
    const url = escolaId 
      ? `/registros-diarios/configuracao-medias/recalcular?escola_id=${escolaId}`
      : '/registros-diarios/configuracao-medias/recalcular';
    const response = await api.post(url);
    return response.data;
  }
};

export default configuracaoMediasService;

