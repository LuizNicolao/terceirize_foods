const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para listagem de Necessidades
 * Gerencia consultas e exportações
 */
class NecessidadesListController {
  /**
   * Listar necessidades (cabeçalhos) com filtros e paginação
   * GET /necessidades
   */
  static listar = asyncHandler(async (req, res) => {
    const {
      search,
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id,
      mes_ref,
      ano,
      status
    } = req.query;

    const pagination = req.pagination || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || pagination.limit || 20;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || 'criado_em';
    const sortDirection = req.query.sortDirection || 'DESC';

    try {
      // Construir WHERE clause
      let whereConditions = ['1=1'];
      const params = [];

      if (search) {
        whereConditions.push(`(
          codigo LIKE ? OR
          filial_nome LIKE ? OR
          centro_custo_nome LIKE ? OR
          contrato_nome LIKE ? OR
          cardapio_nome LIKE ?
        )`);
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filial_id) {
        whereConditions.push('filial_id = ?');
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereConditions.push('centro_custo_id = ?');
        params.push(centro_custo_id);
      }

      if (contrato_id) {
        whereConditions.push('contrato_id = ?');
        params.push(contrato_id);
      }

      if (cardapio_id) {
        whereConditions.push('cardapio_id = ?');
        params.push(cardapio_id);
      }

      if (mes_ref) {
        whereConditions.push('mes_ref = ?');
        params.push(mes_ref);
      }

      if (ano) {
        whereConditions.push('ano = ?');
        params.push(ano);
      }

      if (status) {
        whereConditions.push('status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // Validar campo de ordenação
      const allowedSortFields = [
        'id', 'codigo', 'filial_nome', 'centro_custo_nome', 
        'contrato_nome', 'cardapio_nome', 'mes_ref', 'ano', 
        'total_cozinhas', 'total_itens', 'criado_em'
      ];
      const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'criado_em';
      const safeSortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Contar total
      const countResult = await executeQuery(
        `SELECT COUNT(*) as total FROM necessidades WHERE ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      // Buscar registros - garantir que limit e offset são inteiros
      const limitInt = parseInt(limit) || 20;
      const offsetInt = parseInt(offset) || 0;
      
      const query = `SELECT 
          id,
          codigo,
          filial_id,
          filial_nome,
          centro_custo_id,
          centro_custo_nome,
          contrato_id,
          contrato_nome,
          cardapio_id,
          cardapio_nome,
          mes_ref,
          ano,
          total_cozinhas,
          total_itens,
          usuario_gerador_id,
          usuario_gerador_nome,
          status,
          criado_em,
          atualizado_em
         FROM necessidades
         WHERE ${whereClause}
         ORDER BY ${safeSortField} ${safeSortDirection}
         LIMIT ${limitInt} OFFSET ${offsetInt}`;
      
      const registros = await executeQuery(query, params);

      return successResponse(res, {
        data: registros,
        pagination: {
          page,
          limit: limitInt,
          total,
          totalPages: Math.ceil(total / limitInt)
        }
      });

    } catch (error) {
      console.error('Erro ao listar necessidades:', error);
      return errorResponse(
        res, 
        'Erro ao listar necessidades: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Buscar necessidade por ID com itens
   * GET /necessidades/:id
   */
  static buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      // Buscar cabeçalho
      const necessidades = await executeQuery(
        `SELECT * FROM necessidades WHERE id = ?`,
        [id]
      );

      if (necessidades.length === 0) {
        return errorResponse(res, 'Necessidade não encontrada', STATUS_CODES.NOT_FOUND);
      }

      const necessidade = necessidades[0];

      // Buscar itens
      const itens = await executeQuery(
        `SELECT * FROM necessidades_itens 
         WHERE necessidade_id = ?
         ORDER BY data_consumo, cozinha_industrial_nome, periodo_nome, ordem, prato_nome`,
        [id]
      );

      necessidade.itens = itens;

      return successResponse(res, necessidade, 'Necessidade encontrada com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar necessidade:', error);
      return errorResponse(
        res, 
        'Erro ao buscar necessidade: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Exportar necessidades em JSON
   * GET /necessidades/exportar/json
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const {
      search,
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id,
      mes_ref,
      ano,
      status
    } = req.query;

    try {
      // Construir WHERE clause (mesma lógica do listar)
      let whereConditions = ['1=1'];
      const params = [];

      if (search) {
        whereConditions.push(`(
          codigo LIKE ? OR
          filial_nome LIKE ? OR
          centro_custo_nome LIKE ? OR
          contrato_nome LIKE ? OR
          cardapio_nome LIKE ?
        )`);
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filial_id) {
        whereConditions.push('filial_id = ?');
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereConditions.push('centro_custo_id = ?');
        params.push(centro_custo_id);
      }

      if (contrato_id) {
        whereConditions.push('contrato_id = ?');
        params.push(contrato_id);
      }

      if (cardapio_id) {
        whereConditions.push('cardapio_id = ?');
        params.push(cardapio_id);
      }

      if (mes_ref) {
        whereConditions.push('mes_ref = ?');
        params.push(mes_ref);
      }

      if (ano) {
        whereConditions.push('ano = ?');
        params.push(ano);
      }

      if (status) {
        whereConditions.push('status = ?');
        params.push(status);
      }

      const whereClause = whereConditions.join(' AND ');

      // Buscar todos os registros
      const registros = await executeQuery(
        `SELECT 
          codigo AS 'NECESSIDADE',
          filial_nome AS 'FILIAL',
          centro_custo_nome AS 'CENTRO DE CUSTO',
          cardapio_nome AS 'CARDÁPIO',
          total_cozinhas AS 'TOTAL DE COZINHAS',
          total_itens AS 'TOTAL DE ITENS',
          mes_ref AS 'MÊS REF.',
          ano AS 'ANO',
          status AS 'STATUS',
          usuario_gerador_nome AS 'GERADO POR',
          DATE_FORMAT(criado_em, '%d/%m/%Y %H:%i:%s') AS 'CRIADO EM'
         FROM necessidades
         WHERE ${whereClause}
         ORDER BY criado_em DESC`,
        params
      );

      return successResponse(res, {
        data: registros,
        total: registros.length,
        exportado_em: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao exportar necessidades:', error);
      return errorResponse(
        res, 
        'Erro ao exportar necessidades: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });
}

module.exports = NecessidadesListController;
