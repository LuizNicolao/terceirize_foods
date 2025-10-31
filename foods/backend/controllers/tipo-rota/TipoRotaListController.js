/**
 * Controller de Listagem de Tipo de Rota
 * Responsável por listar e buscar tipos de rota
 */

const { executeQuery } = require('../../config/database');
const TipoRotaCRUDController = require('./TipoRotaCRUDController');

class TipoRotaListController {
  // Listar tipos de rota com paginação, busca e filtros
  static async listarTipoRotas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        grupo_id,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(tr.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('tr.status = ?');
        params.push(status);
      }

      // Filtro por grupo (usando FIND_IN_SET para buscar em string separada por vírgula)
      if (grupo_id) {
        const grupoIdNum = parseInt(grupo_id);
        whereConditions.push('FIND_IN_SET(?, tr.grupo_id) > 0');
        params.push(grupoIdNum);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('tr.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal - buscar todos os registros (grupo_id agora é string)
      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY tr.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

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
            created_at: tr.created_at,
            updated_at: tr.updated_at,
            grupos: grupos,
            grupos_id: gruposIds,
            total_unidades: tr.total_unidades || 0
          };
        })
      );

      // Ordenar por nome
      tipoRotas.sort((a, b) => a.nome.localeCompare(b.nome));

      // Aplicar paginação
      const totalRegistros = tipoRotas.length;
      const tipoRotasPaginados = tipoRotas.slice(offset, offset + Number(limit));

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: tipoRotasPaginados,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          grupo_id: grupo_id || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar tipos de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de rota'
      });
    }
  }

  // Buscar tipo de rota por ID (retorna todos os grupos vinculados)
  static async buscarTipoRotaPorId(req, res) {
    try {
      const { id } = req.params;

      // Buscar o registro específico
      const registroInicial = await executeQuery(
        'SELECT * FROM tipo_rota WHERE id = ?',
        [id]
      );

      if (registroInicial.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado no sistema'
        });
      }

      const registro = registroInicial[0];

      // Buscar dados do registro
      const query = `
        SELECT 
          tr.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id AND ue.status = 'ativo') as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        WHERE tr.id = ?
      `;

      const tipoRotas = await executeQuery(query, [id]);

      if (tipoRotas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado no sistema'
        });
      }

      const tr = tipoRotas[0];

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

      const data = {
        id: tr.id,
        nome: tr.nome,
        filial_id: tr.filial_id,
        filial_nome: tr.filial_nome,
        status: tr.status,
        created_at: tr.created_at,
        updated_at: tr.updated_at,
        grupos: grupos,
        grupos_id: gruposIds,
        total_unidades: tr.total_unidades || 0
      };

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('Erro ao buscar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o tipo de rota'
      });
    }
  }
}

module.exports = TipoRotaListController;

