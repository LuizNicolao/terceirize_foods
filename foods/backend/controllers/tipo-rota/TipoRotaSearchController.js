/**
 * Controller de Busca de Tipo de Rota
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');

class TipoRotaSearchController {
  // Buscar tipos de rota ativos
  static async buscarTipoRotasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome,
          g.nome as grupo_nome
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE tr.status = 'ativo'
        ORDER BY tr.nome ASC
      `;

      const tipoRotas = await executeQuery(query);

      // Buscar total de unidades para cada tipo de rota
      const tipoRotasComUnidades = await Promise.all(
        tipoRotas.map(async (tipoRota) => {
          try {
            const unidadesQuery = `
              SELECT COUNT(*) as total_unidades 
              FROM unidades_escolares 
              WHERE tipo_rota_id = ? AND status = 'ativo'
            `;
            const unidadesResult = await executeQuery(unidadesQuery, [tipoRota.id]);
            return {
              ...tipoRota,
              total_unidades: unidadesResult[0]?.total_unidades || 0
            };
          } catch (error) {
            console.error(`Erro ao buscar unidades para tipo de rota ${tipoRota.id}:`, error);
            return {
              ...tipoRota,
              total_unidades: 0
            };
          }
        })
      );

      res.json({
        success: true,
        data: tipoRotasComUnidades
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de rota ativos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de rota ativos'
      });
    }
  }

  // Buscar tipos de rota por filial
  static async buscarTipoRotasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome,
          g.nome as grupo_nome
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE tr.filial_id = ? AND tr.status = 'ativo'
        ORDER BY tr.nome ASC
      `;

      const tipoRotas = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: tipoRotas
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de rota por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de rota por filial'
      });
    }
  }

  // Buscar tipos de rota por grupo
  static async buscarTipoRotasPorGrupo(req, res) {
    try {
      const { grupoId } = req.params;

      const query = `
        SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome,
          g.nome as grupo_nome
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        WHERE tr.grupo_id = ? AND tr.status = 'ativo'
        ORDER BY tr.nome ASC
      `;

      const tipoRotas = await executeQuery(query, [grupoId]);

      res.json({
        success: true,
        data: tipoRotas
      });

    } catch (error) {
      console.error('Erro ao buscar tipos de rota por grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os tipos de rota por grupo'
      });
    }
  }

  // Buscar unidades escolares de um tipo de rota
  static async buscarUnidadesEscolaresTipoRota(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado,
          ue.endereco, ue.ordem_entrega, ue.status
        FROM unidades_escolares ue
        WHERE ue.tipo_rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: {
          unidades: unidades,
          total: unidades.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares do tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares do tipo de rota'
      });
    }
  }

  // Buscar unidades escolares disponíveis por filial e grupo (não vinculadas ao mesmo grupo)
  static async buscarUnidadesEscolaresDisponiveis(req, res) {
    try {
      const { filialId, grupoId } = req.params;
      const tipoRotaId = req.query.tipoRotaId || null;

      // Buscar unidades que não estão vinculadas a nenhuma rota do mesmo grupo
      // Regra: Uma escola só pode estar em uma rota por grupo
      // Se tipoRotaId for fornecido (modo edição), incluir unidades já vinculadas a esse tipo de rota
      let query = `
        SELECT 
          ue.id,
          ue.codigo_teknisa,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.endereco,
          ue.numero,
          ue.bairro,
          ue.centro_distribuicao
        FROM unidades_escolares ue
        WHERE ue.filial_id = ? 
          AND ue.status = 'ativo'
          AND (
            ue.tipo_rota_id IS NULL
            OR NOT EXISTS (
              SELECT 1 
              FROM tipo_rota tr 
              WHERE tr.id = ue.tipo_rota_id 
                AND tr.grupo_id = ?
      `;

      const params = [filialId, grupoId];

      // Se estiver editando, permitir unidades já vinculadas a este tipo de rota
      if (tipoRotaId) {
        query += `
                AND tr.id != ?
            )
            OR ue.tipo_rota_id = ?
        `;
        params.push(tipoRotaId, tipoRotaId);
      } else {
        query += `
            )
        `;
      }

      query += `
          )
        ORDER BY ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, params);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares disponíveis:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares disponíveis'
      });
    }
  }
}

module.exports = TipoRotaSearchController;

