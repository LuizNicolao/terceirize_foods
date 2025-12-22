const { executeQuery } = require('../../config/database');
const { buscarEscolasIdsDaNutricionista } = require('./utils/ajusteUtils');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, escola, grupo, data, semana_abastecimento, status } = req.query;
    const userType = req.user.tipo_de_acesso;
    const isNutricionista = userType === 'nutricionista';

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (isNutricionista) {
      try {
        const authToken = req.headers.authorization?.replace('Bearer ', '');

        const escolasIds = await buscarEscolasIdsDaNutricionista(req.user.email, authToken);

        if (escolasIds.length > 0) {
          const placeholders = escolasIds.map(() => '?').join(',');
          whereClause += ` AND n.escola_id IN (${placeholders})`;
          params.push(...escolasIds);
        } else {
          whereClause += ' AND n.usuario_email = ?';
          params.push(req.user.email);
        }
      } catch (error) {
        whereClause += ' AND n.usuario_email = ?';
        params.push(req.user.email);
      }
    } else if (!['coordenador', 'supervisor', 'administrador', 'logistica'].includes(userType)) {
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais - Buscar por ID da necessidade
    if (search) {
      // Tentar buscar como número (ID) ou como string (caso seja string numérica)
      const searchAsNumber = parseInt(search);
      if (!isNaN(searchAsNumber)) {
        whereClause += ' AND n.necessidade_id = ?';
        params.push(searchAsNumber);
      } else {
        // Se não for número, buscar por LIKE no ID (caso seja string)
        whereClause += ' AND CAST(n.necessidade_id AS CHAR) LIKE ?';
        params.push(`%${search}%`);
      }
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

    if (status) {
      // Filtrar por status
      whereClause += ' AND n.status = ?';
      params.push(status);
    }

    // Excluir necessidades com status CONF quando for para correção
    if (req.query.excluir_conf === 'true' || req.query.excluir_status_conf === 'true') {
      whereClause += ' AND n.status != ?';
      params.push('CONF');
    }

    // Para aba de correção: mostrar apenas NEC e NEC NUTRI
    if (req.query.apenas_nec_correcao === 'true') {
      whereClause += ' AND n.status IN (?, ?)';
      params.push('NEC', 'NEC NUTRI');
    }

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;
    
    const offset = (validPageNum - 1) * validLimitNum;

    // Query para contar total de necessidades distintas (agrupadas por necessidade_id)
    const countQuery = `
      SELECT COUNT(DISTINCT n.necessidade_id) as total
      FROM necessidades n
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);

    const totalItems = countResult && countResult.length > 0 && countResult[0] ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalItems / validLimitNum);

    // Primeiro, buscar os IDs das necessidades paginadas (agrupadas por necessidade_id)
    const necessidadesIdsQuery = `
      SELECT n.necessidade_id
      FROM necessidades n
      ${whereClause}
      GROUP BY n.necessidade_id
      ORDER BY MAX(n.data_preenchimento) DESC
      LIMIT ${validLimitNum} OFFSET ${offset}
    `;
    
    const necessidadesIdsResult = await executeQuery(necessidadesIdsQuery, params);
    const necessidadesIds = necessidadesIdsResult.map(row => row.necessidade_id);

    // Se não houver necessidades, retornar array vazio
    if (necessidadesIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          currentPage: validPageNum,
          totalPages,
          totalItems,
          itemsPerPage: validLimitNum,
          hasNextPage: validPageNum < totalPages,
          hasPrevPage: validPageNum > 1
        }
      });
    }

    // Agora buscar todos os produtos dessas necessidades
    const placeholders = necessidadesIds.map(() => '?').join(',');
    const necessidades = await executeQuery(`
      SELECT 
        n.*
      FROM necessidades n
      WHERE n.necessidade_id IN (${placeholders})
      ORDER BY n.data_preenchimento DESC, n.necessidade_id ASC
    `, necessidadesIds);

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
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const { search, escola } = req.query;
    const userType = req.user.tipo_de_acesso;
    const isNutricionista = userType === 'nutricionista';

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (isNutricionista) {
      try {
        const authToken = req.headers.authorization?.replace('Bearer ', '');
        const escolasIds = await buscarEscolasIdsDaNutricionista(req.user.email, authToken);

        if (escolasIds.length > 0) {
          const placeholders = escolasIds.map(() => '?').join(',');
          whereClause += ` AND n.escola_id IN (${placeholders})`;
          params.push(...escolasIds);
        } else {
          whereClause += ' AND n.usuario_email = ?';
          params.push(req.user.email);
        }
      } catch (error) {
        whereClause += ' AND n.usuario_email = ?';
        params.push(req.user.email);
      }
    } else if (!['coordenador', 'supervisor', 'administrador', 'logistica'].includes(userType)) {
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    // Filtros opcionais - Buscar por ID da necessidade
    if (search) {
      // Tentar buscar como número (ID) ou como string (caso seja string numérica)
      const searchAsNumber = parseInt(search);
      if (!isNaN(searchAsNumber)) {
        whereClause += ' AND n.necessidade_id = ?';
        params.push(searchAsNumber);
      } else {
        // Se não for número, buscar por LIKE no ID (caso seja string)
        whereClause += ' AND CAST(n.necessidade_id AS CHAR) LIKE ?';
        params.push(`%${search}%`);
      }
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
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar necessidades'
    });
  }
};

const listarEscolasNutricionista = async (req, res) => {
  try {
    const userType = req.user.tipo_de_acesso;
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (userType === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const rotasResponse = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          timeout: 5000
        });

        if (rotasResponse.data && rotasResponse.data.success) {
          let rotas = rotasResponse.data.data?.rotas || rotasResponse.data.data || rotasResponse.data || [];
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
          
          // Coletar IDs das escolas das rotas
          const escolasIds = [];
          rotas.forEach(rota => {
            if (rota.escolas_responsaveis) {
              const ids = rota.escolas_responsaveis
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));
              escolasIds.push(...ids);
            }
          });

          if (escolasIds.length === 0) {
            return res.json({ success: true, data: [] });
          }

          // Buscar unidades escolares diretamente do banco de dados usando os IDs
          // O endpoint do Foods retorna vazio para nutricionistas, então buscamos direto do banco
          try {
            const { executeQuery } = require('../../config/database');
            
            const placeholders = escolasIds.map(() => '?').join(',');
            const unidadesQuery = `
              SELECT DISTINCT
                ue.id,
                ue.nome_escola,
                COALESCE(GROUP_CONCAT(r.nome SEPARATOR ', '), 'N/A') as rota_nome,
                ue.cidade,
                ue.codigo_teknisa,
                ue.filial_id
              FROM foods_db.unidades_escolares ue
              LEFT JOIN foods_db.rotas r ON FIND_IN_SET(r.id, ue.rota_id) > 0
              WHERE ue.id IN (${placeholders})
                AND ue.status = 'ativo'
              GROUP BY ue.id, ue.nome_escola, ue.cidade, ue.codigo_teknisa, ue.filial_id
              ORDER BY ue.nome_escola ASC
            `;
            
            const unidadesEncontradas = await executeQuery(unidadesQuery, escolasIds);

            if (unidadesEncontradas && unidadesEncontradas.length > 0) {
              const escolas = unidadesEncontradas.map(unidade => ({
                id: unidade.id,
                nome_escola: unidade.nome_escola || `Escola ${unidade.id}`,
                rota: unidade.rota_nome || 'N/A',
                cidade: unidade.cidade || '',
                codigo_teknisa: unidade.codigo_teknisa || '',
                filial_id: unidade.filial_id
              }));

              return res.json({
                success: true,
                data: escolas
              });
            } else {
              return res.json({ success: true, data: [] });
            }
          } catch (dbError) {
            console.error('Erro ao buscar escolas do banco:', dbError.message);
            return res.json({ success: true, data: [] });
          }
        }
        
        return res.json({ success: true, data: [] });
      } catch (apiError) {
        console.error('Erro ao buscar escolas:', apiError.message);
        return res.json({ success: true, data: [] });
      }
    }

    // Se não for nutricionista, buscar todas as unidades escolares do Foods
    if (userType !== 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar todas as unidades escolares do foods (sem paginação para admin)
        const response = await axios.get(`${foodsApiUrl}/unidades-escolares?limit=10000`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
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
  } catch (error) {
    console.error('Erro ao buscar escolas da nutricionista:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar escolas'
    });
  }
};

// Buscar status únicos das necessidades
const buscarStatusDisponiveis = async (req, res) => {
  try {
    const userType = req.user.tipo_de_acesso;
    const isNutricionista = userType === 'nutricionista';

    let whereClause = 'WHERE n.status IS NOT NULL AND n.status != ""';
    let params = [];

    // Aplicar filtros de permissão
    if (isNutricionista) {
      try {
        const authToken = req.headers.authorization?.replace('Bearer ', '');
        const escolasIds = await buscarEscolasIdsDaNutricionista(req.user.email, authToken);

        if (escolasIds.length > 0) {
          const placeholders = escolasIds.map(() => '?').join(',');
          whereClause += ` AND n.escola_id IN (${placeholders})`;
          params.push(...escolasIds);
        } else {
          whereClause += ' AND n.usuario_email = ?';
          params.push(req.user.email);
        }
      } catch (error) {
        whereClause += ' AND n.usuario_email = ?';
        params.push(req.user.email);
      }
    } else if (!['coordenador', 'supervisor', 'administrador', 'logistica'].includes(userType)) {
      whereClause += ' AND n.usuario_email = ?';
      params.push(req.user.email);
    }

    const query = `
      SELECT DISTINCT n.status
      FROM necessidades n
      ${whereClause}
      ORDER BY n.status ASC
    `;

    const statusList = await executeQuery(query, params);

    const status = statusList.map(row => row.status).filter(s => s);

    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Erro ao buscar status disponíveis:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar status disponíveis'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  listarEscolasNutricionista,
  buscarStatusDisponiveis
};
