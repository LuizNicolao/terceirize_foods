const { executeQuery } = require('../../config/database');

const relatorioPendencias = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim, tipo_entrega, rota, semana_abastecimento } = req.query;
    const { page = 1, limit = 10 } = req.pagination || {};
    
    let whereClause = 'WHERE re.tipo_recebimento = "Parcial"';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          }
        });

        if (response.data && response.data.success) {
          // Extrair array de rotas corretamente
          let rotas = response.data.data?.rotas || response.data.data || response.data || [];
          // Garantir que é um array
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
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

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND re.escola_rota = ?';
      params.push(rota);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = 2025;
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    const pendencias = await executeQuery(`
      SELECT 
        re.id,
        re.escola_id,
        re.escola_nome,
        re.escola_rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        u.nome as nutricionista_nome,
        rp.produto_nome,
        rp.quantidade as produto_quantidade,
        rp.produto_unidade_medida as produto_unidade
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      LEFT JOIN recebimentos_produtos rp ON re.id = rp.recebimento_id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, re.escola_rota ASC, re.escola_nome ASC, rp.produto_nome ASC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    // Contar total de registros para paginação
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      LEFT JOIN recebimentos_produtos rp ON re.id = rp.recebimento_id
      ${whereClause}
    `, params);

    const totalItems = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Calcular métricas específicas de pendências baseadas no total geral (não apenas da página atual)
    // Buscar total de escolas com pendências (sem paginação)
    const escolasComPendenciasQuery = await executeQuery(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      ${whereClause}
    `, params);
    
    const escolasComPendencias = escolasComPendenciasQuery[0]?.total || 0;
    
    // Buscar total de escolas na base (todas as escolas cadastradas, independente de recebimentos)
    // Como não temos tabela escolas separada, vamos contar escolas únicas dos recebimentos
    const totalEscolasBase = await executeQuery(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      WHERE re.ativo = 1
    `);
    
    const totalEscolas = totalEscolasBase[0]?.total || 0;
    const percentualPendencias = totalEscolas > 0 ? ((escolasComPendencias / totalEscolas) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      message: 'Relatório de pendências carregado com sucesso',
      data: {
        pendencias,
        metricas: {
          totalPendencias: totalItems,
          produtosPendentes: pendencias.filter(p => p.produto_nome).length,
          escolasComPendencia: escolasComPendencias,
          percentualPendencias: parseFloat(percentualPendencias)
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de pendências:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar relatório de pendências'
    });
  }
};

const relatorioCompletos = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim, tipo_entrega, rota, semana_abastecimento } = req.query;
    const { page = 1, limit = 10 } = req.pagination || {};
    
    let whereClause = 'WHERE re.tipo_recebimento = "Completo"';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          }
        });

        if (response.data && response.data.success) {
          // Extrair array de rotas corretamente
          let rotas = response.data.data?.rotas || response.data.data || response.data || [];
          // Garantir que é um array
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
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

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND re.escola_rota = ?';
      params.push(rota);
    }

    // Filtro por semana de abastecimento
    if (semana_abastecimento && semana_abastecimento !== 'todas') {
      try {
        // Parse da semana no formato "DD/MM a DD/MM"
        const [inicioStr, fimStr] = semana_abastecimento.split(' a ');
        const [diaInicio, mesInicio] = inicioStr.split('/');
        const [diaFim, mesFim] = fimStr.split('/');
        
        // Usar ano atual ou ano dos dados existentes
        const anoRef = 2025;
        
        const dataInicio = `${anoRef}-${mesInicio.padStart(2, '0')}-${diaInicio.padStart(2, '0')}`;
        const dataFim = `${anoRef}-${mesFim.padStart(2, '0')}-${diaFim.padStart(2, '0')}`;
        
        whereClause += ' AND re.data_recebimento >= ? AND re.data_recebimento <= ?';
        params.push(dataInicio, dataFim);
      } catch (error) {
        console.error('Erro ao processar filtro de semana:', error);
        // Se houver erro no parsing, ignora o filtro
      }
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    const completos = await executeQuery(`
      SELECT 
        re.id,
        re.escola_id,
        re.escola_nome,
        re.escola_rota,
        re.data_recebimento,
        re.tipo_recebimento,
        re.tipo_entrega,
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        u.nome as nutricionista_nome
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, re.escola_rota ASC, re.escola_nome ASC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    // Contar total de registros para paginação
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
    `, params);

    const totalItems = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Calcular métricas específicas de completos baseadas no total geral (não apenas da página atual)
    // Buscar total de escolas com recebimentos completos (sem paginação)
    const escolasCompletasQuery = await executeQuery(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      ${whereClause}
    `, params);
    
    const escolasCompletas = escolasCompletasQuery[0]?.total || 0;
    
    // Buscar total de escolas na base (todas as escolas cadastradas, independente de recebimentos)
    // Como não temos tabela escolas separada, vamos contar escolas únicas dos recebimentos
    const totalEscolasBase = await executeQuery(`
      SELECT COUNT(DISTINCT re.escola_id) as total
      FROM recebimentos_escolas re
      WHERE re.ativo = 1
    `);
    
    const totalEscolas = totalEscolasBase[0]?.total || 0;
    const escolasIncompletas = totalEscolas - escolasCompletas;
    const percentualCompleto = totalEscolas > 0 ? ((escolasCompletas / totalEscolas) * 100).toFixed(1) : 0;
    
    // Agrupar por rota baseado no total geral (não apenas da página atual)
    const porRotaQuery = await executeQuery(`
      SELECT 
        re.escola_rota as rota,
        COUNT(DISTINCT re.escola_id) as escolas,
        COUNT(*) as recebimentos
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.escola_rota
      ORDER BY re.escola_rota
    `, params);
    
    const porRota = {};
    porRotaQuery.forEach(item => {
      porRota[item.rota] = {
        escolas: item.escolas,
        recebimentos: item.recebimentos
      };
    });

    res.json({
      success: true,
      message: 'Relatório de completos carregado com sucesso',
      data: {
        completos,
        metricas: {
          escolasCompletas,
          escolasIncompletas,
          totalEscolasBase: totalEscolas,
          percentualCompleto: parseFloat(percentualCompleto),
          porRota
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de completos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar relatório de completos'
    });
  }
};

const listar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim, tipo_entrega, rota, tipo_recebimento } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'nutricionista') {
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
        // Buscar email do usuário logado
        const userEmail = req.user.email;
        
        // Buscar rotas da nutricionista por email
        const response = await axios.get(`${foodsApiUrl}/rotas-nutricionistas?email=${encodeURIComponent(userEmail)}&status=ativo`, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
          }
        });

        if (response.data && response.data.success) {
          // Extrair array de rotas corretamente
          let rotas = response.data.data?.rotas || response.data.data || response.data || [];
          // Garantir que é um array
          if (!Array.isArray(rotas)) {
            rotas = rotas.rotas || [];
          }
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

    // Filtros opcionais
    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    if (tipo_entrega) {
      whereClause += ' AND re.tipo_entrega = ?';
      params.push(tipo_entrega);
    }

    if (rota) {
      whereClause += ' AND re.escola_rota = ?';
      params.push(rota);
    }

    if (tipo_recebimento) {
      whereClause += ' AND re.tipo_recebimento = ?';
      params.push(tipo_recebimento);
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
        re.pendencia_anterior,
        re.precisa_reentrega,
        re.observacoes,
        u.nome as nutricionista_nome
      FROM recebimentos_escolas re
      LEFT JOIN usuarios u ON re.usuario_id = u.id
      ${whereClause}
      ORDER BY re.data_recebimento DESC, re.escola_rota ASC, re.escola_nome ASC
    `, params);

    res.json({
      success: true,
      message: 'Relatórios carregados com sucesso',
      data: { items: recebimentos }
    });
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  relatorioPendencias,
  relatorioCompletos,
  listar
};
