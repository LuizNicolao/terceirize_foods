const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { escola_id, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de todas as escolas

    if (escola_id) {
      whereClause += ' AND me.escola_id = ?';
      params.push(escola_id);
    }

    if (data_inicio) {
      whereClause += ' AND DATE(me.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(me.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_medias,
        COUNT(DISTINCT me.escola_id) as total_escolas_com_media,
        COUNT(DISTINCT me.nutricionista_id) as total_nutricionistas,
        AVG(me.media_lanche_manha) as media_lanche_manha_geral,
        AVG(me.media_almoco) as media_almoco_geral,
        AVG(me.media_lanche_tarde) as media_lanche_tarde_geral,
        AVG(me.media_parcial) as media_parcial_geral,
        AVG(me.media_eja) as media_eja_geral
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
    `, params);

    // Estatísticas por escola
    const statsPorEscola = await query(`
      SELECT 
        e.nome_escola,
        e.rota,
        COUNT(*) as total_medias,
        AVG(me.media_lanche_manha) as media_lanche_manha,
        AVG(me.media_almoco) as media_almoco,
        AVG(me.media_lanche_tarde) as media_lanche_tarde,
        AVG(me.media_parcial) as media_parcial,
        AVG(me.media_eja) as media_eja
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      GROUP BY e.id, e.nome_escola, e.rota
      ORDER BY total_medias DESC
      LIMIT 10
    `, params);

    // Estatísticas por nutricionista
    const statsPorNutricionista = await query(`
      SELECT 
        u.nome as nutricionista_nome,
        COUNT(*) as total_medias,
        COUNT(DISTINCT me.escola_id) as total_escolas,
        AVG(me.media_lanche_manha) as media_lanche_manha,
        AVG(me.media_almoco) as media_almoco,
        AVG(me.media_lanche_tarde) as media_lanche_tarde,
        AVG(me.media_parcial) as media_parcial,
        AVG(me.media_eja) as media_eja
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      GROUP BY u.id, u.nome
      ORDER BY total_medias DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_medias: 0,
          total_escolas_com_media: 0,
          total_nutricionistas: 0,
          media_lanche_manha_geral: 0,
          media_almoco_geral: 0,
          media_lanche_tarde_geral: 0,
          media_parcial_geral: 0,
          media_eja_geral: 0
        },
        porEscola: statsPorEscola,
        porNutricionista: statsPorNutricionista
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
    const userType = req.user.tipo_usuario;
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de todas as escolas

    if (data_inicio) {
      whereClause += ' AND DATE(me.data_cadastro) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(me.data_cadastro) <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(me.data_cadastro) as data,
        COUNT(*) as total_medias,
        COUNT(DISTINCT me.escola_id) as total_escolas,
        COUNT(DISTINCT me.nutricionista_id) as total_nutricionistas
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      GROUP BY DATE(me.data_cadastro)
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

const calcularMedias = async (req, res) => {
  try {
    const userId = req.user.id;
    const { escola_id, data_inicio, data_fim } = req.body;

    if (!escola_id) {
      return res.status(400).json({
        error: 'Escola obrigatória',
        message: 'É necessário informar o ID da escola'
      });
    }

    // Buscar registros diários da escola no período
    let whereClause = 'WHERE rd.escola_id = ?';
    let params = [escola_id];

    if (data_inicio) {
      whereClause += ' AND DATE(rd.data) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(rd.data) <= ?';
      params.push(data_fim);
    }

    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      ${whereClause}
      ORDER BY rd.data ASC
    `, params);

    if (registros.length === 0) {
      return res.json({
        success: true,
        data: {
          escola_id,
          periodo: { data_inicio, data_fim },
          medias: null,
          message: 'Nenhum registro encontrado para o período informado'
        }
      });
    }

    // Calcular médias por período usando os 5 novos tipos
    const medias = {
      lanche_manha: { soma: 0, quantidade: 0 },
      almoco: { soma: 0, quantidade: 0 },
      lanche_tarde: { soma: 0, quantidade: 0 },
      parcial: { soma: 0, quantidade: 0 },
      eja: { soma: 0, quantidade: 0 }
    };

    // Agrupar registros por tipo de média
    registros.forEach(registro => {
      const tipo = registro.tipo_media;
      if (medias[tipo]) {
        medias[tipo].soma += parseFloat(registro.valor) || 0;
        medias[tipo].quantidade += 1;
      }
    });

    // Calcular médias finais (soma ÷ quantidade de lançamentos)
    const mediasCalculadas = {};
    Object.keys(medias).forEach(tipo => {
      const { soma, quantidade } = medias[tipo];
      mediasCalculadas[tipo] = quantidade > 0 ? Math.ceil(soma / quantidade) : 0;
    });

    res.json({
      success: true,
      data: {
        escola_id,
        escola_nome: registros[0].nome_escola,
        escola_rota: registros[0].rota,
        periodo: { data_inicio, data_fim },
        total_registros: registros.length,
        medias: mediasCalculadas
      }
    });
  } catch (error) {
    console.error('Erro ao calcular médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao calcular médias'
    });
  }
};

const { calcularPeriodoDiasUteis } = require('../../utils/diasUteisUtils');

const calcularMediasPorPeriodo = async (req, res) => {
  try {
    const { escola_id, data } = req.query;
    const userId = req.user.id;

    if (!escola_id || !data) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'É necessário informar escola_id e data'
      });
    }

    // Calcular período dos últimos 20 dias úteis
    const dataReferencia = new Date(data);
    const { dataInicio, dataFim } = calcularPeriodoDiasUteis(dataReferencia, 20);

    // Buscar registros diários da escola nos últimos 20 dias úteis
    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      WHERE rd.escola_id = ? AND rd.data >= ? AND rd.data <= ?
      ORDER BY rd.data ASC
    `, [escola_id, dataInicio, dataFim]);

    if (registros.length === 0) {
      return res.json({
        success: true,
        data: {
          escola_id,
          data,
          medias: null,
          message: 'Nenhum registro encontrado para a data informada'
        }
      });
    }

    // Calcular médias do período usando os 5 novos tipos
    const medias = {
      lanche_manha: { soma: 0, quantidade: 0 },
      almoco: { soma: 0, quantidade: 0 },
      lanche_tarde: { soma: 0, quantidade: 0 },
      parcial: { soma: 0, quantidade: 0 },
      eja: { soma: 0, quantidade: 0 }
    };

    // Agrupar registros por tipo de média
    registros.forEach(registro => {
      const tipo = registro.tipo_media;
      if (medias[tipo]) {
        medias[tipo].soma += parseFloat(registro.valor) || 0;
        medias[tipo].quantidade += 1;
      }
    });

    // Calcular médias finais (soma ÷ quantidade de lançamentos)
    const mediasCalculadas = {};
    Object.keys(medias).forEach(tipo => {
      const { soma, quantidade } = medias[tipo];
      mediasCalculadas[tipo] = quantidade > 0 ? Math.ceil(soma / quantidade) : 0;
    });

    res.json({
      success: true,
      data: {
        escola_id,
        escola_nome: registros[0].nome_escola,
        escola_rota: registros[0].rota,
        data,
        total_registros: registros.length,
        medias: mediasCalculadas
      }
    });
  } catch (error) {
    console.error('Erro ao calcular médias por período:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao calcular médias por período'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo,
  calcularMedias,
  calcularMediasPorPeriodo
};
