const { executeQuery } = require('../../config/database');

/**
 * Função auxiliar para buscar informações de escolas via API do Foods
 */
async function buscarInfoEscolas(escolaIds, authToken) {
  const axios = require('axios');
  const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
  const escolasMap = new Map();

  try {
    // Buscar todas as escolas de uma vez (ou em lotes se necessário)
    const response = await axios.get(`${foodsApiUrl}/unidades-escolares?limit=10000`, {
      headers: {
        'Authorization': `Bearer ${authToken?.replace('Bearer ', '') || ''}`
      },
      timeout: 5000
    });

    if (response.data && response.data.success) {
      const unidadesEscolares = response.data.data || [];
      unidadesEscolares.forEach(unidade => {
        if (escolaIds.includes(unidade.id)) {
          escolasMap.set(unidade.id, {
            id: unidade.id,
            nome_escola: unidade.nome_escola || unidade.nome || '',
            rota: unidade.rota_nome || unidade.rota || '',
            cidade: unidade.cidade || ''
          });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao buscar informações das escolas do Foods:', error);
  }

  return escolasMap;
}

/**
 * Controller de Listagem para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
class TipoAtendimentoEscolaListController {
  /**
   * Listar vínculos com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        search = '',
        escola_id,
        tipo_atendimento,
        ativo
      } = req.query;

      const userId = req.user.id;
      const userType = req.user.tipo_de_acesso;

      let whereClause = 'WHERE 1=1';
      let params = [];

      // Filtro de busca será aplicado após buscar dados das escolas

      // Filtro por escola
      if (escola_id) {
        whereClause += ' AND tae.escola_id = ?';
        params.push(escola_id);
      }

      // Filtro por tipo de atendimento
      if (tipo_atendimento) {
        whereClause += ' AND tae.tipo_atendimento = ?';
        params.push(tipo_atendimento);
      }

      // Filtro por status ativo
      if (ativo !== undefined) {
        whereClause += ' AND tae.ativo = ?';
        params.push(ativo === 'true' || ativo === '1' ? 1 : 0);
      }

      // Calcular paginação
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
      const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 50 : limitNum;
      const offset = (validPageNum - 1) * validLimitNum;

      // Query para buscar todos os vínculos (sem JOIN com escolas)
      const vinculosQuery = `
        SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em
        FROM tipos_atendimento_escola tae
        ${whereClause}
        ORDER BY tae.escola_id ASC, tae.tipo_atendimento ASC
      `;
      
      const todosVinculos = await executeQuery(vinculosQuery, params);
      
      // Buscar informações das escolas via API do Foods
      const escolaIds = [...new Set(todosVinculos.map(v => v.escola_id))];
      const authToken = req.headers.authorization;
      const escolasMap = await buscarInfoEscolas(escolaIds, authToken);
      
      // Enriquecer vínculos com informações das escolas
      let vinculosEnriquecidos = todosVinculos.map(vinculo => {
        const escolaInfo = escolasMap.get(vinculo.escola_id) || {};
        return {
          ...vinculo,
          nome_escola: escolaInfo.nome_escola || '',
          rota: escolaInfo.rota || '',
          cidade: escolaInfo.cidade || ''
        };
      });
      
      // Aplicar filtro de busca se fornecido
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        vinculosEnriquecidos = vinculosEnriquecidos.filter(v => 
          (v.nome_escola || '').toLowerCase().includes(searchTerm) ||
          (v.rota || '').toLowerCase().includes(searchTerm) ||
          (v.cidade || '').toLowerCase().includes(searchTerm)
        );
      }
      
      // Aplicar paginação
      const totalItems = vinculosEnriquecidos.length;
      const totalPages = Math.ceil(totalItems / validLimitNum);
      const vinculosPaginados = vinculosEnriquecidos.slice(offset, offset + validLimitNum);
      
      // Ordenar por nome da escola e tipo de atendimento
      vinculosPaginados.sort((a, b) => {
        const nomeA = (a.nome_escola || '').toLowerCase();
        const nomeB = (b.nome_escola || '').toLowerCase();
        if (nomeA !== nomeB) return nomeA.localeCompare(nomeB);
        return (a.tipo_atendimento || '').localeCompare(b.tipo_atendimento || '');
      });

      res.json({
        success: true,
        data: vinculosPaginados,
        pagination: {
          currentPage: validPageNum,
          totalPages,
          totalItems,
          itemsPerPage: validLimitNum,
          hasNextPage: validPageNum < totalPages,
          hasPrevPage: validPageNum > 1
        }
      });
    } catch (error) {
      console.error('Erro ao listar vínculos tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar vínculos tipo atendimento-escola'
      });
    }
  }

  /**
   * Buscar tipos de atendimento por escola
   */
  static async buscarPorEscola(req, res) {
    try {
      const { escola_id } = req.params;

      if (!escola_id) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro obrigatório',
          message: 'ID da escola é obrigatório'
        });
      }

      const tipos = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo
        FROM tipos_atendimento_escola tae
        WHERE tae.escola_id = ? AND tae.ativo = 1
        ORDER BY tae.tipo_atendimento ASC`,
        [escola_id]
      );

      // Buscar informações da escola via API do Foods
      const authToken = req.headers.authorization;
      const escolasMap = await buscarInfoEscolas([escola_id], authToken);
      const escolaInfo = escolasMap.get(parseInt(escola_id)) || {};

      // Enriquecer tipos com informações da escola
      const tiposEnriquecidos = tipos.map(tipo => ({
        ...tipo,
        nome_escola: escolaInfo.nome_escola || ''
      }));

      res.json({
        success: true,
        data: tiposEnriquecidos
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de atendimento por escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar tipos de atendimento por escola'
      });
    }
  }

  /**
   * Buscar escolas por tipo de atendimento
   */
  static async buscarEscolasPorTipo(req, res) {
    try {
      const { tipo_atendimento } = req.params;

      if (!tipo_atendimento) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro obrigatório',
          message: 'Tipo de atendimento é obrigatório'
        });
      }

      const vinculos = await executeQuery(
        `SELECT DISTINCT tae.escola_id
        FROM tipos_atendimento_escola tae
        WHERE tae.tipo_atendimento = ? AND tae.ativo = 1`,
        [tipo_atendimento]
      );

      // Buscar informações das escolas via API do Foods
      const escolaIds = vinculos.map(v => v.escola_id);
      const authToken = req.headers.authorization;
      const escolasMap = await buscarInfoEscolas(escolaIds, authToken);
      
      // Converter map para array e ordenar
      const escolas = Array.from(escolasMap.values()).sort((a, b) => 
        (a.nome_escola || '').localeCompare(b.nome_escola || '')
      );

      res.json({
        success: true,
        data: escolas
      });
    } catch (error) {
      console.error('Erro ao buscar escolas por tipo de atendimento:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar escolas por tipo de atendimento'
      });
    }
  }
}

module.exports = TipoAtendimentoEscolaListController;

