/**
 * Controller de Busca de Tipo de Rota
 * Responsável por funcionalidades de busca e filtros
 */

const { executeQuery } = require('../../config/database');
const TipoRotaCRUDController = require('./TipoRotaCRUDController');

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
          f.filial as filial_nome
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        WHERE tr.filial_id = ? AND tr.status = 'ativo'
        ORDER BY tr.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, [filialId]);

      // Processar cada registro para parsear grupos_id
      const tipoRotas = await Promise.all(
        tipoRotasRaw.map(async (tr) => {
          // Parsear grupos_id da string
          const gruposIds = TipoRotaCRUDController.gruposToArray(tr.grupo_id);
          
          // Buscar nomes dos grupos se houver grupos
          let grupos = [];
          if (gruposIds.length > 0) {
            const gruposPlaceholders = gruposIds.map(() => '?').join(',');
            const gruposNomes = await executeQuery(
              `SELECT id, nome FROM grupos WHERE id IN (${gruposPlaceholders}) ORDER BY nome ASC`,
              gruposIds
            );
            grupos = gruposNomes.map(g => ({
              id: g.id,
              nome: g.nome
            }));
          }

          return {
            id: tr.id,
            nome: tr.nome,
            filial_id: tr.filial_id,
            filial_nome: tr.filial_nome,
            status: tr.status,
            grupos: grupos,
            grupos_id: gruposIds
          };
        })
      );

      // Ordenar por nome
      tipoRotas.sort((a, b) => a.nome.localeCompare(b.nome));

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
      const grupoIdNum = parseInt(grupoId);

      // Buscar tipos de rota onde grupo_id contém o ID procurado (usando FIND_IN_SET para string separada por vírgula)
      const query = `
        SELECT 
          tr.id, tr.nome, tr.status, tr.filial_id, tr.grupo_id,
          f.filial as filial_nome
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        WHERE FIND_IN_SET(?, tr.grupo_id) > 0 AND tr.status = 'ativo'
        ORDER BY tr.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, [grupoIdNum]);

      // Processar cada registro para parsear grupos_id
      const tipoRotas = await Promise.all(
        tipoRotasRaw.map(async (tr) => {
          // Parsear grupos_id da string
          const gruposIds = TipoRotaCRUDController.gruposToArray(tr.grupo_id);
          
          // Buscar nomes dos grupos se houver grupos
          let grupos = [];
          if (gruposIds.length > 0) {
            const gruposPlaceholders = gruposIds.map(() => '?').join(',');
            const gruposNomes = await executeQuery(
              `SELECT id, nome FROM grupos WHERE id IN (${gruposPlaceholders}) ORDER BY nome ASC`,
              gruposIds
            );
            grupos = gruposNomes.map(g => ({
              id: g.id,
              nome: g.nome
            }));
          }

          return {
            id: tr.id,
            nome: tr.nome,
            filial_id: tr.filial_id,
            filial_nome: tr.filial_nome,
            status: tr.status,
            grupos: grupos,
            grupos_id: gruposIds
          };
        })
      );

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

  // Buscar grupos disponíveis para uma filial (excluindo grupos já vinculados a outros tipos de rota)
  static async buscarGruposDisponiveisPorFilial(req, res) {
    try {
      const { filialId } = req.params;
      const { tipoRotaId } = req.query; // Opcional: se estiver editando, manter grupos do próprio tipo_rota

      // Buscar todos os grupos ativos
      const todosGruposQuery = `
        SELECT id, nome
        FROM grupos
        WHERE status = 'ativo'
        ORDER BY nome ASC
      `;
      const todosGrupos = await executeQuery(todosGruposQuery);

      // Se não há filial selecionada, retornar todos os grupos
      if (!filialId) {
        return res.json({
          success: true,
          data: todosGrupos
        });
      }

      // Buscar grupos já vinculados a outros tipos de rota na mesma filial
      const gruposVinculadosQuery = `
        SELECT DISTINCT tr.id as tipo_rota_id, tr.grupo_id
        FROM tipo_rota tr
        WHERE tr.filial_id = ?
      `;
      const tiposRotasComGrupos = await executeQuery(gruposVinculadosQuery, [filialId]);

      // Coletar todos os IDs de grupos vinculados
      const gruposVinculadosIds = new Set();
      
      tiposRotasComGrupos.forEach(tr => {
        // Parsear grupos_id da string (pode ser "15,7" ou apenas "15")
        const gruposIds = TipoRotaCRUDController.gruposToArray(tr.grupo_id);
        
        // Se estiver editando um tipo_rota, não excluir os grupos desse tipo_rota
        if (tipoRotaId && parseInt(tr.tipo_rota_id) === parseInt(tipoRotaId)) {
          // Não adicionar grupos deste tipo_rota ao conjunto de excluídos
          return;
        }
        
        // Adicionar todos os grupos deste tipo_rota aos excluídos
        gruposIds.forEach(grupoId => {
          gruposVinculadosIds.add(grupoId);
        });
      });

      // Filtrar grupos disponíveis (não vinculados)
      const gruposDisponiveis = todosGrupos.filter(grupo => 
        !gruposVinculadosIds.has(grupo.id)
      );

      res.json({
        success: true,
        data: gruposDisponiveis
      });

    } catch (error) {
      console.error('Erro ao buscar grupos disponíveis:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os grupos disponíveis'
      });
    }
  }
}

module.exports = TipoRotaSearchController;

