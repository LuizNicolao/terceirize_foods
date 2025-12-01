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
        filial_id,
        sortField,
        sortDirection
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
        // Usa a nova tabela rotas_nutricionistas_escolas (normalizada)
        whereConditions.push(`
          ue.id IN (
            SELECT rne.unidade_escolar_id
            FROM rotas_nutricionistas_escolas rne
            INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
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
      // Usa a nova tabela unidades_escolares_rotas (normalizada)
      // Mantém compatibilidade com campo antigo rota_id por enquanto
      if (rota_id) {
        const rotaIdNum = parseInt(rota_id, 10);
        if (!isNaN(rotaIdNum)) {
          whereConditions.push(`
            ue.id IN (
              SELECT uer.unidade_escolar_id
              FROM unidades_escolares_rotas uer
              WHERE uer.rota_id = ?
            )
          `);
          params.push(rotaIdNum);
        }
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('ue.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      // Usa DISTINCT para evitar duplicatas quando há múltiplas rotas
      const countQuery = `
        SELECT COUNT(DISTINCT ue.id) as total 
        FROM unidades_escolares ue
        LEFT JOIN unidades_escolares_rotas uer ON ue.id = uer.unidade_escolar_id
        LEFT JOIN rotas r ON uer.rota_id = r.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Aplicar ordenação
      let orderBy = 'ue.ordem_entrega ASC, ue.nome_escola ASC'; // Ordenação padrão
      if (sortField && sortDirection) {
        const validFields = ['codigo_teknisa', 'nome_escola', 'cidade', 'estado', 'status', 'rota_nome', 'filial_nome', 'ordem_entrega', 'created_at', 'updated_at'];
        if (validFields.includes(sortField)) {
          const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
          
          // Mapear campos para colunas do banco
          const fieldMap = {
            'codigo_teknisa': 'ue.codigo_teknisa',
            'nome_escola': 'ue.nome_escola',
            'cidade': 'ue.cidade',
            'estado': 'ue.estado',
            'status': 'ue.status',
            'rota_nome': 'r.nome',
            'filial_nome': 'f.filial',
            'ordem_entrega': 'ue.ordem_entrega',
            'created_at': 'ue.created_at',
            'updated_at': 'ue.updated_at'
          };
          
          orderBy = `${fieldMap[sortField]} ${direction}`;
        }
      }

      // Query principal
      // Usa GROUP_CONCAT para agregar múltiplas rotas em uma string (compatibilidade)
      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, 
          GROUP_CONCAT(DISTINCT uer.rota_id ORDER BY uer.rota_id SEPARATOR ',') as rota_id,
          ue.regional, ue.centro_custo_id,
          cc.codigo as centro_custo_codigo, cc.nome as centro_custo_nome, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at, ue.filial_id,
          ue.atendimento, ue.horario, ue.supervisao, ue.coordenacao, ue.lat, ue.\`long\`,
          ue.rota_nutricionista_id, ue.almoxarifado_id,
          GROUP_CONCAT(DISTINCT r.nome ORDER BY r.nome SEPARATOR ', ') as rota_nome,
          GROUP_CONCAT(DISTINCT r.codigo ORDER BY r.codigo SEPARATOR ', ') as rota_codigo,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo,
          rn.codigo as rota_nutricionista_codigo,
          u.nome as nutricionista_nome,
          u.email as nutricionista_email,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM unidades_escolares ue
        LEFT JOIN unidades_escolares_rotas uer ON ue.id = uer.unidade_escolar_id
        LEFT JOIN rotas r ON uer.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN centro_custo cc ON ue.centro_custo_id = cc.id
        LEFT JOIN rotas_nutricionistas rn ON ue.rota_nutricionista_id = rn.id
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN almoxarifado a ON ue.almoxarifado_id = a.id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY ue.id
        ORDER BY ${orderBy}
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
        // Usa a nova tabela rotas_nutricionistas_escolas (normalizada)
        whereConditions.push(`
          ue.id IN (
            SELECT rne.unidade_escolar_id
            FROM rotas_nutricionistas_escolas rne
            INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
            WHERE rn.usuario_id = ? 
              AND rn.status = 'ativo'
          )
        `);
        params.push(req.user.id);
      }

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, 
          GROUP_CONCAT(DISTINCT uer.rota_id ORDER BY uer.rota_id SEPARATOR ',') as rota_id,
          GROUP_CONCAT(DISTINCT r.nome ORDER BY r.nome SEPARATOR ', ') as rota_nome,
          GROUP_CONCAT(DISTINCT r.codigo ORDER BY r.codigo SEPARATOR ', ') as rota_codigo,
          ue.regional, ue.centro_custo_id,
          cc.codigo as centro_custo_codigo, cc.nome as centro_custo_nome, 
          ue.cc_senior, ue.codigo_senior, ue.abastecimento, ue.ordem_entrega, 
          ue.status, ue.observacoes, ue.created_at, ue.updated_at, ue.filial_id,
          ue.atendimento, ue.horario, ue.supervisao, ue.coordenacao, ue.lat, ue.\`long\`,
          ue.rota_nutricionista_id, ue.almoxarifado_id,
          f.filial as filial_nome,
          f.codigo_filial as filial_codigo,
          GROUP_CONCAT(DISTINCT rn.codigo ORDER BY rn.codigo SEPARATOR ', ') as rota_nutricionista_codigo,
          GROUP_CONCAT(DISTINCT u.nome ORDER BY u.nome SEPARATOR ', ') as nutricionista_nome,
          GROUP_CONCAT(DISTINCT u.email ORDER BY u.email SEPARATOR ', ') as nutricionista_email,
          GROUP_CONCAT(DISTINCT supervisor.nome ORDER BY supervisor.nome SEPARATOR ', ') as supervisor_nome,
          GROUP_CONCAT(DISTINCT coordenador.nome ORDER BY coordenador.nome SEPARATOR ', ') as coordenador_nome,
          a.codigo as almoxarifado_codigo,
          a.nome as almoxarifado_nome
        FROM unidades_escolares ue
        LEFT JOIN unidades_escolares_rotas uer ON ue.id = uer.unidade_escolar_id
        LEFT JOIN rotas r ON uer.rota_id = r.id
        LEFT JOIN filiais f ON ue.filial_id = f.id
        LEFT JOIN centro_custo cc ON ue.centro_custo_id = cc.id
        LEFT JOIN rotas_nutricionistas_escolas rne ON ue.id = rne.unidade_escolar_id
        LEFT JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id AND rn.status = 'ativo'
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN usuarios supervisor ON rn.supervisor_id = supervisor.id
        LEFT JOIN usuarios coordenador ON rn.coordenador_id = coordenador.id
        LEFT JOIN almoxarifado a ON ue.almoxarifado_id = a.id
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado, 
          ue.pais, ue.endereco, ue.numero, ue.bairro, ue.cep,
          ue.centro_distribuicao, ue.regional, ue.centro_custo_id,
          cc.codigo, cc.nome, ue.cc_senior, ue.codigo_senior, ue.abastecimento, 
          ue.ordem_entrega, ue.status, ue.observacoes, ue.created_at, ue.updated_at, 
          ue.filial_id, ue.atendimento, ue.horario, ue.supervisao, ue.coordenacao, 
          ue.lat, ue.\`long\`, ue.rota_nutricionista_id, ue.almoxarifado_id,
          f.filial, f.codigo_filial, a.codigo, a.nome
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
