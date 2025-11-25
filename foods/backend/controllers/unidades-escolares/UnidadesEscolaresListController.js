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
        rota_id,
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
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.centro_custo_id,
          cc.codigo as centro_custo_codigo, cc.nome as centro_custo_nome, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at, ue.filial_id,
          ue.atendimento, ue.horario, ue.supervisao, ue.coordenacao, ue.lat, ue.\`long\`,
          ue.rota_nutricionista_id, ue.almoxarifado_id,
          r.nome as rota_nome,
          r.codigo as rota_codigo,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo,
          rn.codigo as rota_nutricionista_codigo,
          u.nome as nutricionista_nome,
          u.email as nutricionista_email,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN centro_custo cc ON ue.centro_custo_id = cc.id
        LEFT JOIN rotas_nutricionistas rn ON ue.rota_nutricionista_id = rn.id
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN almoxarifado a ON ue.almoxarifado_id = a.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
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
          rota_id: rota_id || null,
          filial_id: filial_id || null
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

      // Verificar se é um usuário nutricionista para aplicar filtros específicos
      const isNutricionista = req.user.tipo_de_acesso === 'nutricionista';
      
      let whereConditions = ['ue.id = ?'];
      let params = [id];

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

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.rota_id, ue.regional, ue.centro_custo_id,
          cc.codigo as centro_custo_codigo, cc.nome as centro_custo_nome, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at, ue.filial_id,
          ue.atendimento, ue.horario, ue.supervisao, ue.coordenacao, ue.lat, ue.\`long\`,
          ue.rota_nutricionista_id, ue.almoxarifado_id,
          r.nome as rota_nome,
          r.codigo as rota_codigo,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo,
          rn.codigo as rota_nutricionista_codigo,
          u.nome as nutricionista_nome,
          u.email as nutricionista_email,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN centro_custo cc ON ue.centro_custo_id = cc.id
        LEFT JOIN rotas_nutricionistas rn ON ue.rota_nutricionista_id = rn.id
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN almoxarifado a ON ue.almoxarifado_id = a.id
        WHERE ${whereConditions.join(' AND ')}
      `;

      const unidades = await executeQuery(query, params);

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
}

module.exports = UnidadesEscolaresListController;
