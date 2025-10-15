const { executeQuery } = require('../../config/database');

const dashboardRelatorios = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim } = req.query;
    
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

    // Métricas gerais
    const metricas = await executeQuery(`
      SELECT 
        COUNT(*) as total_recebimentos,
        COUNT(DISTINCT re.escola_id) as total_escolas,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as recebimentos_completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as recebimentos_parciais,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Completo' THEN re.escola_id END) as escolas_completas,
        COUNT(DISTINCT CASE WHEN re.tipo_recebimento = 'Parcial' THEN re.escola_id END) as escolas_parciais
      FROM recebimentos_escolas re
      ${whereClause}
    `, params);

    // Métricas por tipo de entrega
    const porTipoEntrega = await executeQuery(`
      SELECT 
        re.tipo_entrega,
        COUNT(*) as total,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.tipo_entrega
      ORDER BY total DESC
    `, params);

    // Métricas por rota
    const porRota = await executeQuery(`
      SELECT 
        re.escola_rota as rota,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.escola_rota
      ORDER BY total_recebimentos DESC
    `, params);

    res.json({
      success: true,
      data: {
        metricas: metricas[0],
        porTipoEntrega,
        porRota
      }
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar dashboard'
    });
  }
};

const obterEstatisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim, tipo_entrega, rota } = req.query;
    
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

    // Estatísticas gerais
    const statsResult = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(DISTINCT re.escola_id) as escolas_unicas
      FROM recebimentos_escolas re
      ${whereClause}
    `, params);

    const stats = statsResult[0] || { 
      total: 0, 
      completos: 0, 
      parciais: 0, 
      escolas_unicas: 0 
    };

    res.json({
      success: true,
      message: 'Estatísticas carregadas com sucesso',
      data: { stats }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    
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

    // Resumo dos últimos 30 dias
    const resumoResult = await executeQuery(`
      SELECT 
        COUNT(*) as total_ultimos_30_dias,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos_ultimos_30_dias,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais_ultimos_30_dias,
        COUNT(DISTINCT re.escola_id) as escolas_unicas_ultimos_30_dias
      FROM recebimentos_escolas re
      ${whereClause}
      AND re.data_recebimento >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, params);

    const resumo = resumoResult[0] || { 
      total_ultimos_30_dias: 0, 
      completos_ultimos_30_dias: 0, 
      parciais_ultimos_30_dias: 0, 
      escolas_unicas_ultimos_30_dias: 0 
    };

    res.json({
      success: true,
      message: 'Resumo carregado com sucesso',
      data: { resumo }
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  dashboardRelatorios,
  obterEstatisticas,
  obterResumo
};
