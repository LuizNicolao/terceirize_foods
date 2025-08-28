/**
 * Controller de Listagem de Unidades Escolares
 * Responsável por listar e buscar unidades escolares
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresListController {
  // Listar unidades escolares com paginação, busca e filtros
  static async listarUnidadesEscolares(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        estado,
        cidade,
        centro_distribuicao,
        rota_id
      } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let whereConditions = ['1=1'];
      let params = [];

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

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.lot, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.nome_escola ASC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const unidades = await executeQuery(query, params);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: unidades,
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
          estado: estado || null,
          cidade: cidade || null,
          centro_distribuicao: centro_distribuicao || null,
          rota_id: rota_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar unidades escolares:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as unidades escolares'
      });
    }
  }

  // Buscar unidade escolar por ID
  static async buscarUnidadeEscolarPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.lot, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        WHERE ue.id = ?
      `;

      const unidades = await executeQuery(query, [id]);

      if (unidades.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada no sistema'
        });
      }

      res.json({
        success: true,
        data: unidades[0]
      });

    } catch (error) {
      console.error('Erro ao buscar unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a unidade escolar'
      });
    }
  }

  // Listar almoxarifados de uma unidade escolar
  static async listarAlmoxarifadosUnidadeEscolar(req, res) {
    try {
      const { unidadeEscolarId } = req.params;

      // Verificar se a unidade escolar existe
      const unidadeEscolar = await executeQuery(
        'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
        [unidadeEscolarId]
      );

      if (unidadeEscolar.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Unidade escolar não encontrada',
          message: 'A unidade escolar especificada não foi encontrada no sistema'
        });
      }

      // Buscar almoxarifados da unidade escolar
      const query = `
        SELECT 
          a.id, a.filial_id, a.nome, a.status, 
          a.criado_em, a.atualizado_em,
          f.filial as filial_nome
        FROM almoxarifados a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.unidade_escolar_id = ?
        ORDER BY a.nome ASC
      `;

      const almoxarifados = await executeQuery(query, [unidadeEscolarId]);

      res.json({
        success: true,
        data: almoxarifados,
        unidade_escolar: unidadeEscolar[0]
      });

    } catch (error) {
      console.error('Erro ao listar almoxarifados da unidade escolar:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os almoxarifados da unidade escolar'
      });
    }
  }
}

module.exports = UnidadesEscolaresListController;
