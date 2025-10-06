const { query } = require('../../config/database');

const obterEstatisticas = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { escola_id, tipo_media, data_inicio, data_fim } = req.query;
    
    let whereClause = 'WHERE rd.ativo = 1';
    let params = [];

    // Se for nutricionista, filtrar apenas seus registros
    if (userType === 'Nutricionista') {
      whereClause += ' AND rd.nutricionista_id = ?';
      params.push(userId);
    }

    if (escola_id) {
      whereClause += ' AND rd.escola_id = ?';
      params.push(escola_id);
    }

    if (tipo_media) {
      whereClause += ' AND rd.tipo_media = ?';
      params.push(tipo_media);
    }

    if (data_inicio) {
      whereClause += ' AND rd.data >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND rd.data <= ?';
      params.push(data_fim);
    }

    // Estatísticas gerais
    const stats = await query(`
      SELECT 
        COUNT(*) as total_registros,
        COUNT(DISTINCT rd.escola_id) as total_escolas,
        COUNT(DISTINCT rd.nutricionista_id) as total_nutricionistas,
        COUNT(DISTINCT rd.tipo_media) as total_tipos_media,
        CEIL(AVG(rd.valor)) as media_geral,
        MIN(rd.valor) as valor_minimo,
        MAX(rd.valor) as valor_maximo,
        SUM(rd.valor) as soma_total
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
    `, params);

    // Estatísticas por escola
    const statsPorEscola = await query(`
      SELECT 
        e.nome_escola,
        e.rota,
        COUNT(*) as total_registros,
        COUNT(DISTINCT rd.tipo_media) as tipos_media,
        CEIL(AVG(rd.valor)) as media_geral,
        MIN(rd.valor) as valor_minimo,
        MAX(rd.valor) as valor_maximo
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      GROUP BY e.id, e.nome_escola, e.rota
      ORDER BY total_registros DESC
      LIMIT 10
    `, params);

    // Estatísticas por tipo de média
    const statsPorTipoMedia = await query(`
      SELECT 
        rd.tipo_media,
        COUNT(*) as total_registros,
        COUNT(DISTINCT rd.escola_id) as total_escolas,
        AVG(rd.valor) as media_tipo,
        MIN(rd.valor) as valor_minimo,
        MAX(rd.valor) as valor_maximo
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      GROUP BY rd.tipo_media
      ORDER BY total_registros DESC
    `, params);

    // Estatísticas por nutricionista
    const statsPorNutricionista = await query(`
      SELECT 
        u.nome as nutricionista_nome,
        COUNT(*) as total_registros,
        COUNT(DISTINCT rd.escola_id) as total_escolas,
        COUNT(DISTINCT rd.tipo_media) as tipos_media,
        AVG(rd.valor) as media_geral
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      GROUP BY u.id, u.nome
      ORDER BY total_registros DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      data: {
        gerais: stats[0] || {
          total_registros: 0,
          total_escolas: 0,
          total_nutricionistas: 0,
          total_tipos_media: 0,
          media_geral: 0,
          valor_minimo: 0,
          valor_maximo: 0,
          soma_total: 0
        },
        porEscola: statsPorEscola,
        porTipoMedia: statsPorTipoMedia,
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
    
    let whereClause = 'WHERE rd.ativo = 1';
    let params = [];

    // Se for nutricionista, filtrar apenas seus registros
    if (userType === 'Nutricionista') {
      whereClause += ' AND rd.nutricionista_id = ?';
      params.push(userId);
    }

    if (data_inicio) {
      whereClause += ' AND rd.data >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND rd.data <= ?';
      params.push(data_fim);
    }

    // Resumo por período
    const resumo = await query(`
      SELECT 
        DATE(rd.data) as data,
        COUNT(*) as total_registros,
        COUNT(DISTINCT rd.escola_id) as total_escolas,
        COUNT(DISTINCT rd.nutricionista_id) as total_nutricionistas,
        AVG(rd.valor) as media_geral
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      GROUP BY DATE(rd.data)
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

const { calcularPeriodoDiasUteis } = require('../../utils/diasUteisUtils');

const calcularMedias = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { escola_id } = req.body;

    // Calcular período dos últimos 20 dias úteis
    const { dataInicio, dataFim } = calcularPeriodoDiasUteis(new Date(), 20);

    let whereClause = 'WHERE rd.ativo = 1 AND rd.data >= ? AND rd.data <= ?';
    let params = [dataInicio, dataFim];

    // Se for nutricionista, filtrar apenas seus registros
    if (userType === 'Nutricionista') {
      whereClause += ' AND rd.nutricionista_id = ?';
      params.push(userId);
    }

    if (escola_id) {
      whereClause += ' AND rd.escola_id = ?';
      params.push(escola_id);
    }

    // Buscar registros dos últimos 20 dias úteis agrupados por escola e tipo de média
    const registros = await query(`
      SELECT 
        rd.escola_id,
        rd.tipo_media,
        COUNT(*) as quantidade_lancamentos,
        SUM(rd.valor) as soma_total,
        CEIL(SUM(rd.valor) / COUNT(*)) as media_calculada,
        e.nome_escola,
        e.rota
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      ${whereClause}
      GROUP BY rd.escola_id, rd.tipo_media
    `, params);

    let sucessos = 0;
    let erros = 0;

    // Processar cada grupo de registros
    for (const registro of registros) {
      try {
        // Mapear tipo_media para o campo correto na tabela medias_escolas
        // Se o tipo_media é simples (eja, almoco, parcial, lanche), mapear para o campo correto
        // Mapear tipo_media para campo da tabela medias_escolas (versão simples)
        let campoMedia;
        if (registro.tipo_media === 'eja' || registro.tipo_media === 'eja_eja') {
          campoMedia = 'media_eja';
        } else if (registro.tipo_media === 'almoco' || registro.tipo_media === 'almoco_almoco') {
          campoMedia = 'media_almoco';
        } else if (registro.tipo_media === 'parcial' || registro.tipo_media === 'parcial_parcial') {
          campoMedia = 'media_parcial';
        } else if (registro.tipo_media === 'lanche_manha' || registro.tipo_media === 'lanche_parcial') {
          campoMedia = 'media_lanche_manha';
        } else if (registro.tipo_media === 'lanche_tarde' || registro.tipo_media === 'lanche_lanche') {
          campoMedia = 'media_lanche_tarde';
        } else {
          // Fallback para formato antigo
          campoMedia = 'media_parcial';
        }
        
        // Verificar se já existe média para esta escola e nutricionista
        const existeMedia = await query(
          'SELECT id FROM medias_escolas WHERE escola_id = ? AND nutricionista_id = ?',
          [registro.escola_id, userId]
        );

        if (existeMedia.length > 0) {
          // Atualizar média existente
          await query(`
            UPDATE medias_escolas 
            SET ${campoMedia} = ?, 
                calculada_automaticamente = 1,
                quantidade_lancamentos = ?,
                data_calculo = CURRENT_TIMESTAMP,
                ultima_atualizacao_registros = CURRENT_TIMESTAMP
            WHERE escola_id = ? AND nutricionista_id = ?
          `, [registro.media_calculada, registro.quantidade_lancamentos, registro.escola_id, userId]);
        } else {
          // Criar nova média com estrutura de 5 colunas
          const camposMedias = [
            'media_lanche_manha', 'media_almoco', 'media_lanche_tarde', 'media_parcial', 'media_eja'
          ];

          // Mapear tipo_media para campo correto
          const campoMedia = registro.tipo_media; // Já está no formato correto (lanche_manha, almoco, etc.)
          
          const valoresMedias = camposMedias.map(campo => 
            campo === campoMedia ? registro.media_calculada : 0
          );

          await query(`
            INSERT INTO medias_escolas (
              escola_id, nutricionista_id,
              ${camposMedias.join(', ')},
              calculada_automaticamente,
              quantidade_lancamentos,
              data_calculo,
              ultima_atualizacao_registros
            ) VALUES (?, ?, ${valoresMedias.map(() => '?').join(', ')}, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
              ${camposMedias.map(campo => `${campo} = VALUES(${campo})`).join(', ')},
              calculada_automaticamente = 1,
              quantidade_lancamentos = VALUES(quantidade_lancamentos),
              data_calculo = CURRENT_TIMESTAMP,
              ultima_atualizacao_registros = CURRENT_TIMESTAMP
          `, [registro.escola_id, userId, ...valoresMedias, registro.quantidade_lancamentos]);
        }

        sucessos++;
      } catch (error) {
        console.error(`Erro ao processar média para escola ${registro.escola_id}, tipo ${registro.tipo_media}:`, error);
        erros++;
      }
    }

    res.json({
      success: true,
      message: `Cálculo concluído: ${sucessos} médias processadas com sucesso, ${erros} erros`,
      data: {
        sucessos,
        erros,
        total_processados: registros.length
      }
    });
  } catch (error) {
    console.error('Erro ao calcular médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao calcular médias automaticamente'
    });
  }
};

module.exports = {
  obterEstatisticas,
  obterResumo,
  calcularMedias
};
