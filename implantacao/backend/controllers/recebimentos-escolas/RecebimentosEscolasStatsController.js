const { executeQuery } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { 
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
      try {
        const axios = require('axios');
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        
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

    // Estatísticas gerais
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 END) as no_prazo,
        COUNT(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 END) as atrasado,
        COUNT(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 END) as antecipado,
        COUNT(CASE WHEN re.tipo_recebimento = 'Completo' THEN 1 END) as completos,
        COUNT(CASE WHEN re.tipo_recebimento = 'Parcial' THEN 1 END) as parciais,
        COUNT(CASE WHEN re.pendencia_anterior = 1 THEN 1 END) as com_pendencia,
        COUNT(CASE WHEN re.precisa_reentrega = 1 THEN 1 END) as precisa_reentrega
      FROM recebimentos_escolas re
      ${whereClause}
    `, params);

    // Estatísticas por escola
    const statsPorEscola = await executeQuery(`
      SELECT 
        re.escola_nome as nome_escola,
        re.escola_rota as rota,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 END) as no_prazo,
        COUNT(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 END) as atrasado,
        COUNT(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 END) as antecipado
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.escola_id, re.escola_nome, re.escola_rota
      ORDER BY total_recebimentos DESC
      LIMIT 10
    `, params);

    // Estatísticas por tipo de entrega
    const statsPorTipoEntrega = await executeQuery(`
      SELECT 
        re.tipo_entrega,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 END) as no_prazo,
        COUNT(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 END) as atrasado,
        COUNT(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 END) as antecipado
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.tipo_entrega
      ORDER BY total_recebimentos DESC
    `, params);

    // Estatísticas por tipo de recebimento
    const statsPorTipoRecebimento = await executeQuery(`
      SELECT 
        re.tipo_recebimento,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 END) as no_prazo,
        COUNT(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 END) as atrasado,
        COUNT(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 END) as antecipado
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY re.tipo_recebimento
      ORDER BY total_recebimentos DESC
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_recebimentos: 0,
          no_prazo: 0,
          atrasado: 0,
          antecipado: 0,
          completos: 0,
          parciais: 0,
          com_pendencia: 0,
          precisa_reentrega: 0
        },
        porEscola: statsPorEscola,
        porTipoEntrega: statsPorTipoEntrega,
        porTipoRecebimento: statsPorTipoRecebimento
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter estatísticas'
    });
  }
};

const obterResumo = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtro baseado no tipo de usuário
    if (userType === 'Nutricionista') {
      // TODO: Implementar filtro por rotas nutricionistas
      // Por enquanto, mostrar todos
    }

    if (data_inicio) {
      whereClause += ' AND re.data_recebimento >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND re.data_recebimento <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await executeQuery(`
      SELECT 
        DATE(re.data_recebimento) as data,
        COUNT(*) as total_recebimentos,
        COUNT(CASE WHEN re.status_entrega = 'No Prazo' THEN 1 END) as no_prazo,
        COUNT(CASE WHEN re.status_entrega = 'Atrasado' THEN 1 END) as atrasado,
        COUNT(CASE WHEN re.status_entrega = 'Antecipado' THEN 1 END) as antecipado
      FROM recebimentos_escolas re
      ${whereClause}
      GROUP BY DATE(re.data_recebimento)
      ORDER BY data DESC
      LIMIT 30
    `, params);

    res.json({
      success: true,
      data: resumo
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao obter resumo'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo
};
