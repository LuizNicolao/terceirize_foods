import api from './api';
import FoodsApiService from './FoodsApiService';

const escolasService = {
  // Listar escolas com filtros (busca do Foods com filtro por nutricionista)
  listar: async (filtros = {}, user = null) => {
    try {
      // Buscar todas as escolas do Foods primeiro
      const response = await FoodsApiService.getUnidadesEscolares({ ativo: true, ...filtros });
      
      if (!response.success) {
        return response;
      }
      
      let escolasData = response.data || [];
      
      // Se for nutricionista, filtrar pelas escolas das rotas nutricionistas
      if (user && user.tipo_de_acesso === 'nutricionista') {
        try {
          // Buscar rotas nutricionistas do Foods pelo email do usuário
          const rotasResponse = await FoodsApiService.getRotasNutricionistas({ 
            email: user.email, 
            status: 'ativo' 
          });
          
          if (rotasResponse.success && rotasResponse.data && rotasResponse.data.length > 0) {
            // Extrair IDs das escolas responsáveis de todas as rotas
            const escolasIds = [];
            rotasResponse.data.forEach(rota => {
              if (rota.escolas_responsaveis) {
                // escolas_responsaveis é uma string com IDs separados por vírgula
                const ids = rota.escolas_responsaveis
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id));
                escolasIds.push(...ids);
              }
            });
            
            // Filtrar apenas as escolas que a nutricionista é responsável
            if (escolasIds.length > 0) {
              const escolasIdsUnicos = [...new Set(escolasIds)];
              escolasData = escolasData.filter(escola => escolasIdsUnicos.includes(escola.id));
            } else {
              // Se nutricionista não tem escolas, retornar array vazio
              escolasData = [];
            }
          } else {
            // Se não encontrou rotas, nutricionista não vê nenhuma escola
            escolasData = [];
          }
        } catch (error) {
          console.error('Erro ao buscar rotas nutricionistas:', error);
          // Em caso de erro, nutricionista não vê escolas
          escolasData = [];
        }
      }
      
      // Mapear dados do Foods para o formato esperado
      const escolasFormatadas = escolasData.map(escola => ({
        id: escola.id,
        nome_escola: escola.nome_escola || escola.nome,
        rota: escola.rota_nome || escola.rota || '',
        codigo_teknisa: escola.codigo_teknisa || escola.codigo || '',
        cidade: escola.cidade || '',
        ativo: escola.ativo
      }));
      
      return {
        success: true,
        data: escolasFormatadas
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'Erro ao carregar escolas'
      };
    }
  },

  // Listar todas as escolas (com filtro por nutricionista se aplicável)
  listarTodas: async (filtros = {}, user = null) => {
    return await escolasService.listar(filtros, user);
  },

  // Buscar escola por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/escolas/${id}`);
    return response.data;
  },

  // Criar nova escola
  criar: async (dados) => {
    const response = await api.post('/escolas', dados);
    return response.data;
  },

  // Atualizar escola
  atualizar: async (id, dados) => {
    const response = await api.put(`/escolas/${id}`, dados);
    return response.data;
  },

  // Deletar escola
  deletar: async (id) => {
    const response = await api.delete(`/escolas/${id}`);
    return response.data;
  }
};

export default escolasService;
