const { executeQuery } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, escola, grupo, data, semana_abastecimento } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'nutricionista') {
      // Nutricionista: apenas registros criados por ela
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    } else if (userType === 'coordenador' || userType === 'supervisor' || userType === 'administrador') {
      // Coordenador, Supervisor e Administrador: acesso a todas as escolas
      // Não adiciona filtro adicional
    } else {
      // Outros tipos: apenas registros criados por eles
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (n.produto LIKE ? OR n.escola LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola) {
      whereClause += ' AND n.escola = ?';
      params.push(escola);
    }

    if (grupo) {
      whereClause += ' AND n.grupo_id = ?';
      params.push(grupo);
    }

    if (data) {
      // Buscar por semana de consumo usando LIKE para maior flexibilidade
      whereClause += ' AND n.semana_consumo LIKE ?';
      params.push(`%${data}%`);
    }

    if (semana_abastecimento) {
      // Para semana de abastecimento, filtrar por semana_abastecimento
      whereClause += ' AND n.semana_abastecimento = ?';
      params.push(semana_abastecimento);
    }

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
    
    const offset = (validPageNum - 1) * validLimitNum;

    // Query para contar total de registros (sem JOIN com tabelas externas)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM necessidades n
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);
    const totalItems = countResult && countResult.length > 0 && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / validLimitNum);

    // Query principal com paginação (sem JOIN - dados já na tabela necessidades)
    const necessidades = await executeQuery(`
      SELECT 
        n.*
      FROM necessidades n
      ${whereClause}
      ORDER BY n.data_preenchimento DESC
      LIMIT ${validLimitNum} OFFSET ${offset}
    `, params);

    res.json({
      success: true,
      data: necessidades,
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
    console.error('Erro ao buscar necessidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, escola } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Lógica de permissões por tipo de usuário
    if (userType === 'nutricionista') {
      // Nutricionista: apenas registros criados por ela
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    } else if (userType === 'coordenador' || userType === 'supervisor' || userType === 'administrador') {
      // Coordenador, Supervisor e Administrador: acesso a todas as escolas
      // Não adiciona filtro adicional
    } else {
      // Outros tipos: apenas registros criados por eles
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais
    if (search) {
      whereClause += ' AND (n.produto LIKE ? OR n.escola LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola) {
      whereClause += ' AND n.escola = ?';
      params.push(escola);
    }


    const necessidades = await executeQuery(`
      SELECT 
        n.*
      FROM necessidades n
      ${whereClause}
      ORDER BY n.data_preenchimento DESC
    `, params);

    res.json({
      success: true,
      data: necessidades
    });
  } catch (error) {
    console.error('Erro ao buscar necessidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const listarEscolasNutricionista = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const userType = req.user.tipo_de_acesso;
    
    // Se não for nutricionista, buscar todas as unidades escolares do Foods
    if (userType !== 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar todas as unidades escolares do foods (sem paginação para admin)
        const response = await axios.get(`${foodsApiUrl}/unidades-escolares?limit=10000`, {
          headers: {
            'Authorization': req.headers.authorization // Já contém "Bearer " + token
          },
          timeout: 5000 // Timeout de 5 segundos
        });

        if (response.data && response.data.success) {
          const unidadesEscolares = response.data.data || [];
          
          // Converter unidades escolares para o formato esperado pelo dropdown
          const escolas = unidadesEscolares.map(unidade => ({
            id: unidade.id,
            nome_escola: unidade.nome_escola || unidade.nome,
            rota: unidade.rota_nome || unidade.rota || 'N/A',
            cidade: unidade.cidade || '',
            codigo_teknisa: unidade.codigo_teknisa || unidade.codigo || '',
            filial_id: unidade.filial_id
          }));

          return res.json({
            success: true,
            data: escolas
          });
        } else {
          return res.json({
            success: true,
            data: []
          });
        }
      } catch (apiError) {
        console.error('Erro ao buscar unidades escolares do foods:', apiError);
        return res.json({
          success: true,
          data: []
        });
      }
    }

    // Buscar escolas da nutricionista via API do foods (mesmo endpoint usado em Unidades Escolares)
    try {
      const axios = require('axios');
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      
      // Buscar unidades escolares do foods (que já aplica filtro por nutricionista)
      const response = await axios.get(`${foodsApiUrl}/unidades-escolares?limit=10000`, {
        headers: {
          'Authorization': req.headers.authorization // Já contém "Bearer " + token
        }
      });

      if (response.data && response.data.success) {
        const unidadesEscolares = response.data.data || [];
        
        // Converter unidades escolares para o formato esperado pelo dropdown
        const escolas = unidadesEscolares.map(unidade => ({
          id: unidade.id,
          nome_escola: unidade.nome_escola || unidade.nome,
          rota: unidade.rota || 'N/A',
          cidade: unidade.cidade || '',
          codigo_teknisa: unidade.codigo_teknisa || unidade.codigo || ''
        }));

        return res.json({
          success: true,
          data: escolas
        });
      } else {
        return res.json({
          success: true,
          data: []
        });
      }
    } catch (apiError) {
      console.error('Erro ao buscar unidades escolares do foods:', apiError);
      return res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Erro ao buscar escolas da nutricionista:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar escolas'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  listarEscolasNutricionista
};
