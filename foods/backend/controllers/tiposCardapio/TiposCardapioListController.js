/**
 * Controller de Listagem de Tipos de Cardápio
 * Responsável por listar e buscar tipos de cardápio
 */

const { executeQuery } = require('../../config/database');

class TiposCardapioListController {
  // Listar tipos de cardápio com paginação, busca e filtros
  static async listarTiposCardapio(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        filial_id
      } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let whereConditions = ['1=1'];
      let params = [];

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      if (isNutricionista) {
        // Filtro: Apenas tipos de cardápio das filiais que o nutricionista tem acesso
        whereConditions.push(`
          tc.id IN (
            SELECT tcf.tipo_cardapio_id 
            FROM tipos_cardapio_filiais tcf
            WHERE tcf.filial_id IN (
              SELECT uf.filial_id 
              FROM usuarios_filiais uf 
              WHERE uf.usuario_id = ?
            )
          )
        `);
        params.push(req.user.id);
      }

      // Filtro de busca
      if (search) {
        whereConditions.push('(tc.nome LIKE ? OR tc.codigo LIKE ? OR tc.descricao LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('tc.status = ?');
        params.push(status);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('tc.id IN (SELECT tipo_cardapio_id FROM tipos_cardapio_filiais WHERE filial_id = ?)');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tipos_cardapio tc
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          tc.id, tc.nome, tc.codigo, tc.descricao, tc.status, tc.observacoes, 
          tc.created_at, tc.updated_at,
          COUNT(tcf.filial_id) as total_filiais,
          GROUP_CONCAT(f.filial ORDER BY f.filial SEPARATOR ', ') as filiais_nomes
        FROM tipos_cardapio tc
        LEFT JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        LEFT JOIN filiais f ON tcf.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY tc.id
        ORDER BY tc.nome ASC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const tipos = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: tipos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar tipos de cardápio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de cardápio'
      });
    }
  }

  // Buscar tipo de cardápio por ID
  static async buscarTipoCardapioPorId(req, res) {
    try {
      const { id } = req.params;

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ['tc.id = ?'];
      let params = [id];

      if (isNutricionista) {
        // Filtro: Apenas tipos de cardápio das filiais que o nutricionista tem acesso
        whereConditions.push(`
          tc.id IN (
            SELECT tcf.tipo_cardapio_id 
            FROM tipos_cardapio_filiais tcf
            WHERE tcf.filial_id IN (
              SELECT uf.filial_id 
              FROM usuarios_filiais uf 
              WHERE uf.usuario_id = ?
            )
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          tc.id, tc.nome, tc.codigo, tc.descricao, tc.status, tc.observacoes, 
          tc.created_at, tc.updated_at
        FROM tipos_cardapio tc
        WHERE ${whereConditions.join(' AND ')}
      `;

      const tipos = await executeQuery(query, params);

      if (tipos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de cardápio não encontrado',
          message: 'O tipo de cardápio especificado não foi encontrado no sistema'
        });
      }

      // Buscar filiais vinculadas
      const filiaisQuery = `
        SELECT 
          f.id,
          f.filial,
          tcf.data_vinculo
        FROM tipos_cardapio_filiais tcf
        JOIN filiais f ON tcf.filial_id = f.id
        WHERE tcf.tipo_cardapio_id = ?
        ORDER BY f.filial ASC
      `;

      const filiais = await executeQuery(filiaisQuery, [id]);

      res.json({
        success: true,
        data: {
          ...tipos[0],
          filiais
        }
      });

    } catch (error) {
      console.error('Erro ao buscar tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar o tipo de cardápio'
      });
    }
  }
}

module.exports = TiposCardapioListController;
