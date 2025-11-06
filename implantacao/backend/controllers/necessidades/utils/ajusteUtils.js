const axios = require('axios');

/**
 * Utilitários compartilhados para controllers de ajuste de necessidades
 */

/**
 * Retorna os status permitidos baseado na aba
 * @param {string} aba - 'nutricionista', 'coordenacao', 'logistica' ou null
 * @returns {string[]} Array de status permitidos
 */
const getStatusPermitidosPorAba = (aba) => {
  if (aba === 'nutricionista') {
    return ['NEC', 'NEC NUTRI', 'CONF NUTRI'];
  } else if (aba === 'coordenacao') {
    return ['NEC COORD', 'CONF COORD'];
  } else if (aba === 'logistica') {
    return ['NEC LOG'];
  } else {
    // Se não especificar aba, usar todos os status (comportamento padrão)
    return ['NEC', 'NEC NUTRI', 'CONF NUTRI', 'NEC COORD', 'CONF COORD', 'NEC LOG'];
  }
};

/**
 * Busca os IDs das escolas vinculadas às rotas da nutricionista
 * @param {string} userEmail - Email do usuário nutricionista
 * @param {string} authToken - Token de autenticação
 * @returns {Promise<number[]>} Array de IDs das escolas
 */
const buscarEscolasIdsDaNutricionista = async (userEmail, authToken) => {
  try {
    const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
    
    const response = await axios.get(
      `${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 5000
      }
    );

    if (response.data && response.data.success) {
      let rotas = response.data.data?.rotas || response.data.data || response.data || [];
      if (!Array.isArray(rotas)) {
        rotas = rotas.rotas || [];
      }
      
      const escolasIds = [];
      rotas.forEach(rota => {
        if (rota.escolas_responsaveis) {
          const ids = rota.escolas_responsaveis
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));
          escolasIds.push(...ids);
        }
      });

      return escolasIds;
    }
    
    return [];
  } catch (apiError) {
    console.error('Erro ao buscar rotas do foods:', apiError);
    return [];
  }
};

/**
 * Adiciona filtro de escolas da nutricionista à query se necessário
 * @param {string} tipoUsuario - Tipo de acesso do usuário
 * @param {string} userEmail - Email do usuário
 * @param {string} authToken - Token de autenticação
 * @param {string} query - Query SQL atual
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<{query: string, params: Array}>} Query e parâmetros atualizados
 */
const aplicarFiltroNutricionista = async (tipoUsuario, userEmail, authToken, query, params) => {
  if (tipoUsuario !== 'nutricionista') {
    return { query, params };
  }

  const escolasIds = await buscarEscolasIdsDaNutricionista(userEmail, authToken);

  if (escolasIds.length > 0) {
    query += ` AND n.escola_id IN (${escolasIds.map(() => '?').join(',')})`;
    params.push(...escolasIds);
  } else {
    query += ' AND 1=0';
  }

  return { query, params };
};

module.exports = {
  getStatusPermitidosPorAba,
  buscarEscolasIdsDaNutricionista,
  aplicarFiltroNutricionista
};

