const { executeQuery } = require('../../config/database');

const listar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { 
      search, 
      escola_id, 
      tipo_recebimento, 
      tipo_entrega, 
      data_inicio, 
      data_fim,
      semana_abastecimento,
      page = 1,
      limit = 10
    } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'nutricionista') {
      // Para nutricionista, filtrar apenas escolas das rotas nutricionistas
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar rotas da nutricionista
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          },
          timeout: 5000 // Timeout de 5 segundos
        });

        if (response.data && response.data.success) {
          const rotas = response.data.data || [];
          const escolasIds = [];
          
          // Extrair IDs das escolas das rotas
          rotas.forEach(rota => {
            if (rota.escolas_responsaveis) {
              const ids = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
              escolasIds.push(...ids);
            }
          });

          // Se a nutricionista tem escolas vinculadas, filtrar por elas
          if (escolasIds.length > 0) {
            whereClause += ` AND re.escola_id IN (${escolasIds.map(() => '?').join(',')})`;
            params.push(...escolasIds);
          } else {
            // Se não tem escolas vinculadas, não mostrar nenhum recebimento
            whereClause += ' AND 1=0';
          }
        } else {
          // Se não conseguir buscar as rotas, não mostrar nenhum recebimento
          whereClause += ' AND 1=0';
        }
      } catch (apiError) {
        console.error('Erro ao buscar rotas do foods:', apiError);
        // Se houver erro na API, não mostrar nenhum recebimento
        whereClause += ' AND 1=0';
      }
    }
    // Para Admin, Supervisor, Coordenador, Gerente: mostrar todos

    if (search) {
      whereClause += ' AND (re.escola_nome LIKE ? OR re.escola_rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola_id) {
      whereClause += ' AND re.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = new Date().getFullYear();
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    // Calcular paginação com validação
    const pageNum = parseInt(page) || 1;
    const limitNum = limit === 'all' ? null : parseInt(limit) || 10;
    
    // Garantir que os valores sejam números válidos e positivos
    const validPageNum = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validLimitNum = limitNum === null ? null : (isNaN(limitNum) || limitNum < 1 ? 10 : limitNum);
    
    const offset = validLimitNum ? (validPageNum - 1) * validLimitNum : 0;

    // Query para contar total de registros (sem JOIN com tabelas externas)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, params);
    const totalItems = countResult && countResult[0] ? countResult[0].total : 0;
    const totalPages = validLimitNum ? Math.ceil(totalItems / validLimitNum) : 1;

    // Query principal com paginação
    const limitClause = validLimitNum ? `LIMIT ${validLimitNum} OFFSET ${offset}` : '';
    const recebimentos = await executeQuery(`
      SELECT 
        re.id,
        re.escola_id,
        re.escola_nome,
        re.escola_rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, re.escola_nome ASC
      ${limitClause}
    `, params);

    // Calcular estatísticas de status
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 ELSE 0 END) as noPrazo,
        SUM(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 ELSE 0 END) as atrasado,
        SUM(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 ELSE 0 END) as antecipado
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `;
    
    const statsResult = await executeQuery(statsQuery, params);
    const stats = statsResult && statsResult[0] ? statsResult[0] : { total: 0, noPrazo: 0, atrasado: 0, antecipado: 0 };

    // Buscar produtos para recebimentos parciais
    const recebimentosComProdutos = await Promise.all(
      recebimentos.map(async (recebimento) => {
        if (recebimento.tipo_recebimento === 'Parcial') {
          try {
            const produtos = await executeQuery(`
              SELECT 
                rp.id,
                rp.produto_id,
                rp.produto_nome,
                rp.produto_unidade_medida,
                rp.produto_tipo,
                rp.quantidade,
                rp.precisa_reentrega
              FROM recebimentos_produtos rp
              WHERE rp.recebimento_id = ?
              ORDER BY rp.produto_nome ASC
            `, [recebimento.id]);
            
            recebimento.produtos = produtos;
            recebimento.total_produtos = produtos.length;
          } catch (error) {
            console.error(`Erro ao buscar produtos para recebimento ${recebimento.id}:`, error);
            recebimento.produtos = [];
            recebimento.total_produtos = 0;
          }
        } else {
          recebimento.produtos = [];
          recebimento.total_produtos = 0;
        }
        return recebimento;
      })
    );

    res.json({
      success: true,
      data: recebimentosComProdutos,
      pagination: {
        currentPage: validPageNum,
        totalPages,
        totalItems,
        itemsPerPage: validLimitNum || totalItems,
        hasNextPage: validPageNum < totalPages,
        hasPrevPage: validPageNum > 1,
        noPrazo: stats.noPrazo || 0,
        atrasado: stats.atrasado || 0,
        antecipado: stats.antecipado || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimentos'
    });
  }
};

const listarTodas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { 
      search, 
      escola_id, 
      tipo_recebimento, 
      tipo_entrega, 
      data_inicio, 
      data_fim,
      semana_abastecimento
    } = req.query;
    
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'nutricionista') {
      // Para nutricionista, filtrar apenas escolas das rotas nutricionistas
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar rotas da nutricionista
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          },
          timeout: 5000 // Timeout de 5 segundos
        });

        if (response.data && response.data.success) {
          const rotas = response.data.data || [];
          const escolasIds = [];
          
          // Extrair IDs das escolas das rotas
          rotas.forEach(rota => {
            if (rota.escolas_responsaveis) {
              const ids = rota.escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
              escolasIds.push(...ids);
            }
          });

          // Se a nutricionista tem escolas vinculadas, filtrar por elas
          if (escolasIds.length > 0) {
            whereClause += ` AND re.escola_id IN (${escolasIds.map(() => '?').join(',')})`;
            params.push(...escolasIds);
          } else {
            // Se não tem escolas vinculadas, não mostrar nenhum recebimento
            whereClause += ' AND 1=0';
          }
        } else {
          // Se não conseguir buscar as rotas, não mostrar nenhum recebimento
          whereClause += ' AND 1=0';
        }
      } catch (apiError) {
        console.error('Erro ao buscar rotas do foods:', apiError);
        // Se houver erro na API, não mostrar nenhum recebimento
        whereClause += ' AND 1=0';
      }
    }
    // Para Admin, Supervisor, Coordenador, Gerente: mostrar todos

    if (search) {
      whereClause += ' AND (re.escola_nome LIKE ? OR re.escola_rota LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (escola_id) {
      whereClause += ' AND re.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        console.log('DEBUG - Processando filtro de semana:', semana_abastecimento);
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = new Date().getFullYear();
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        console.log('DEBUG - Data início:', dataInicio, 'Data fim:', dataFim);
        
        // Verificar algumas datas no banco para debug
        const sampleDates = await executeQuery(`
          SELECT DISTINCT DATE(re.data_recebimento) as data_recebimento 
          FROM recebimentos_escolas re 
          ORDER BY re.data_recebimento DESC 
          LIMIT 10
        `);
        console.log('DEBUG - Amostra de datas no banco:', sampleDates);
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
        
        console.log('DEBUG - Where clause final:', whereClause);
        console.log('DEBUG - Params finais:', params);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    const recebimentos = await executeQuery(`
      SELECT 
        re.id,
        re.escola_id,
        re.escola_nome,
        re.escola_rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, re.escola_nome ASC
    `, params);

    // Buscar produtos para recebimentos parciais
    const recebimentosComProdutos = await Promise.all(
      recebimentos.map(async (recebimento) => {
        if (recebimento.tipo_recebimento === 'Parcial') {
          try {
            const produtos = await executeQuery(`
              SELECT 
                rp.id,
                rp.produto_id,
                rp.produto_nome,
                rp.produto_unidade_medida,
                rp.produto_tipo,
                rp.quantidade,
                rp.precisa_reentrega
              FROM recebimentos_produtos rp
              WHERE rp.recebimento_id = ?
              ORDER BY rp.produto_nome ASC
            `, [recebimento.id]);
            
            recebimento.produtos = produtos;
            recebimento.total_produtos = produtos.length;
          } catch (error) {
            console.error(`Erro ao buscar produtos para recebimento ${recebimento.id}:`, error);
            recebimento.produtos = [];
            recebimento.total_produtos = 0;
          }
        } else {
          recebimento.produtos = [];
          recebimento.total_produtos = 0;
        }
        return recebimento;
      })
    );

    res.json({
      success: true,
      data: recebimentosComProdutos
    });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimentos'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { id } = req.params;

    let whereClause = 'WHERE re.id = ?';
    let params = [id];

    // Filtro por usuário (nutricionistas só veem seus recebimentos)
    if (userType === 'nutricionista') {
      whereClause += ' AND re.usuario_id = ?';
      params.push(userId);
    }

    const recebimentos = await executeQuery(`
      SELECT 
        re.id,
        re.escola_id,
        re.escola_nome,
        re.escola_rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.status_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        re.ativo,
        re.data_cadastro,
        re.data_atualizacao,
        u.nome as usuario_nome
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);

    if (recebimentos.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado'
      });
    }

    const recebimento = recebimentos[0];

    // Se for recebimento parcial, buscar produtos
    if (recebimento.tipo_recebimento === 'Parcial') {
      const produtos = await executeQuery(`
        SELECT 
          rp.id,
          rp.produto_id,
          p.nome as nome_produto,
          p.unidade_medida,
          rp.quantidade
        FROM recebimentos_produtos rp
        INNER JOIN produtos p ON rp.produto_id = p.id
        WHERE rp.recebimento_id = ?
        ORDER BY p.nome ASC
      `, [id]);

      recebimento.produtos = produtos;
    }

    res.json({
      success: true,
      data: recebimento
    });
  } catch (error) {
    console.error('Erro ao buscar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar recebimento'
    });
  }
};

const listarProdutosPorTipo = async (req, res) => {
  try {
    const { tipo_entrega } = req.query;
    
    // Mapear tipos de entrega para tipos da tabela produtos
    const mapeamentoTipos = {
      'HORTI': 'Horti',
      'PAO': 'Pao', 
      'PERECIVEL': 'Pereciveis',
      'BASE SECA': 'Base Seca',
      'LIMPEZA': 'Limpeza'
    };
    
    let whereClause = 'WHERE p.ativo = 1';
    let params = [];
    
    // Se tipo_entrega foi especificado, filtrar por ele
    if (tipo_entrega && mapeamentoTipos[tipo_entrega]) {
      whereClause += ' AND p.tipo = ?';
      params.push(mapeamentoTipos[tipo_entrega]);
    }
    
    // Buscar todos os produtos (sem paginação para o dropdown)
    const produtos = await executeQuery(`
      SELECT 
        p.id, 
        p.nome, 
        p.unidade_medida,
        p.tipo
      FROM produtos p
      ${whereClause}
      ORDER BY p.nome ASC
    `, params);

    res.json({
      success: true,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por tipo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar produtos por tipo'
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
            cidade: unidade.cidade || ''
          }));

          return res.json({
            success: true,
            data: escolas
          });
        } else {
          // Fallback: buscar escolas dos recebimentos existentes
          const escolas = await executeQuery(`
            SELECT DISTINCT
              re.escola_id as id,
              re.escola_nome as nome_escola,
              re.escola_rota as rota,
              re.escola_cidade as cidade
            FROM recebimentos_escolas re
            ORDER BY re.escola_nome ASC
          `);

          return res.json({
            success: true,
            data: escolas
          });
        }
      } catch (apiError) {
        console.error('Erro ao buscar unidades escolares do foods:', apiError);
        
        // Fallback: buscar escolas dos recebimentos existentes
        const escolas = await executeQuery(`
          SELECT DISTINCT
            re.escola_id as id,
            re.escola_nome as nome_escola,
            re.escola_rota as rota,
            re.escola_cidade as cidade
          FROM recebimentos_escolas re
          ORDER BY re.escola_nome ASC
        `);

        return res.json({
          success: true,
          data: escolas
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
          'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
        }
      });

      if (response.data && response.data.success) {
        const unidadesEscolares = response.data.data || [];
        
        // Converter unidades escolares para o formato esperado pelo dropdown
        const escolas = unidadesEscolares.map(unidade => ({
          id: unidade.id,
          nome_escola: unidade.nome_escola || unidade.nome,
          rota: unidade.rota || 'N/A',
          cidade: unidade.cidade || ''
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
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas da nutricionista'
    });
  }
};

module.exports = {
  listar,
  listarTodas,
  buscarPorId,
  listarProdutosPorTipo,
  listarEscolasNutricionista
};
