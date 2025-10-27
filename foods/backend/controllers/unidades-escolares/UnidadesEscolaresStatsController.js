/**
 * Controller de Estatísticas de Unidades Escolares
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresStatsController {
  // Buscar estatísticas das unidades escolares (com filtros opcionais)
  static async buscarEstatisticas(req, res) {
    try {
      const { 
        search = '', 
        status,
        estado,
        cidade,
        centro_distribuicao,
        rota_id,
        filial_id
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        // Filtro 1: Apenas unidades escolares das filiais que o nutricionista tem acesso
        whereConditions.push(`
          ue.filial_id IN (
            SELECT uf.filial_id 
            FROM usuarios_filiais uf 
            WHERE uf.usuario_id = ?
          )
        `);
        params.push(req.user.id);

        // Filtro 2: Apenas unidades escolares vinculadas ao nutricionista nas rotas nutricionistas
        whereConditions.push(`
          ue.id IN (
            SELECT DISTINCT CAST(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(rn.escolas_responsaveis, ',', numbers.n), ',', -1)) AS UNSIGNED) as escola_id
            FROM rotas_nutricionistas rn
            CROSS JOIN (
              SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION 
              SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
              SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
              SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
            ) numbers
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
              AND rn.escolas_responsaveis IS NOT NULL 
              AND rn.escolas_responsaveis != ''
              AND CHAR_LENGTH(rn.escolas_responsaveis) - CHAR_LENGTH(REPLACE(rn.escolas_responsaveis, ',', '')) >= numbers.n - 1
              AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(rn.escolas_responsaveis, ',', numbers.n), ',', -1)) != ''
          )
        `);
        params.push(req.user.id);
      }

      // Filtro de busca
      if (search) {
        whereConditions.push('(ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ? OR ue.codigo_teknisa LIKE ? OR ue.centro_distribuicao LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('ue.status = ?');
        params.push(status);
      }

      // Filtro por estado
      if (estado) {
        whereConditions.push('ue.estado = ?');
        params.push(estado);
      }

      // Filtro por cidade
      if (cidade) {
        whereConditions.push('ue.cidade LIKE ?');
        params.push(`%${cidade}%`);
      }

      // Filtro por centro de distribuição
      if (centro_distribuicao) {
        whereConditions.push('ue.centro_distribuicao LIKE ?');
        params.push(`%${centro_distribuicao}%`);
      }

      // Filtro por rota
      if (rota_id) {
        whereConditions.push('ue.rota_id = ?');
        params.push(rota_id);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Query para buscar estatísticas com filtros aplicados
      const statsQuery = `
        SELECT 
          COUNT(*) as total_unidades,
          SUM(CASE WHEN ue.status = 'ativo' THEN 1 ELSE 0 END) as unidades_ativas,
          COUNT(DISTINCT ue.estado) as total_estados,
          COUNT(DISTINCT ue.cidade) as total_cidades
        FROM unidades_escolares ue
        WHERE ${whereConditions.join(' AND ')}
      `;
      
      const statsResult = await executeQuery(statsQuery, params);
      const estatisticas = statsResult[0];

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas'
      });
    }
  }
}

module.exports = UnidadesEscolaresStatsController;
