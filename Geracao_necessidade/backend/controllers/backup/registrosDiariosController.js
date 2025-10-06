const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const { escola_id, tipo_media, data_inicio, data_fim } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE 1=1';
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

    const registros = await query(`
      SELECT 
        rd.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM registros_diarios rd
      INNER JOIN escolas e ON rd.escola_id = e.id
      INNER JOIN usuarios u ON rd.nutricionista_id = u.id
      ${whereClause}
      ORDER BY rd.data DESC, e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      data: registros
    });
  } catch (error) {
    console.error('Erro ao buscar registros diários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar registros diários'
    });
  }
};

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { escola_id, data, medias, isEdit, dataOriginal } = req.body;

    // Converter datas ISO para formato MySQL (YYYY-MM-DD)
    const dataFormatada = new Date(data).toISOString().split('T')[0];
    const dataOriginalFormatada = dataOriginal ? new Date(dataOriginal).toISOString().split('T')[0] : null;

    console.log('=== REGISTRO DIÁRIO - INÍCIO ===');
    console.log('User ID:', userId);
    console.log('Escola ID:', escola_id);
    console.log('Data nova (original):', data);
    console.log('Data nova (formatada):', dataFormatada);
    console.log('Data original (original):', dataOriginal);
    console.log('Data original (formatada):', dataOriginalFormatada);
    console.log('É edição:', isEdit);
    console.log('Médias:', medias);

    // Validar campos obrigatórios
    if (!escola_id || !data || !medias) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'É necessário informar escola, data e médias'
      });
    }

    // Verificar se a escola existe
    const escolaExiste = await query('SELECT id FROM escolas WHERE id = ? AND ativo = 1', [escola_id]);
    if (escolaExiste.length === 0) {
      return res.status(400).json({
        error: 'Escola inválida',
        message: 'A escola selecionada não existe ou está inativa'
      });
    }

    // Verificar se não é edição e se já existe registro para esta escola/data
    // Comentado para permitir múltiplos registros por escola/data
    // if (!isEdit) {
    //   const existeRegistro = await query(
    //     'SELECT COUNT(*) as total FROM registros_diarios WHERE escola_id = ? AND data = ? AND nutricionista_id = ?',
    //     [escola_id, data, userId]
    //   );
    //   
    //   if (existeRegistro[0].total > 0) {
    //     return res.status(400).json({
    //       error: 'Registro duplicado',
    //       message: 'Já existe um registro para esta escola e data. Use a opção de editar para modificar.'
    //     });
    //   }
    // }

    let sucessos = 0;
    let erros = 0;
    const resultados = [];

    // Se for edição, primeiro deletar todos os registros existentes para esta escola/data original
    if (isEdit) {
      try {
        // Usar a data original formatada
        const dataParaDeletar = dataOriginalFormatada || dataFormatada;
        
        console.log('=== EDIÇÃO - DELETANDO REGISTROS EXISTENTES ===');
        console.log('Data para deletar:', dataParaDeletar);
        console.log('Escola ID:', escola_id);
        console.log('User ID:', userId);
        
        // Buscar registros que serão deletados para log
        const registrosParaDeletar = await query(
          'SELECT * FROM registros_diarios WHERE escola_id = ? AND data = ? AND nutricionista_id = ?',
          [escola_id, dataParaDeletar, userId]
        );
        
        console.log('Registros encontrados para deletar:', registrosParaDeletar.length);
        console.log('Detalhes dos registros:', registrosParaDeletar);
        
        const deleteResult = await query(
          'DELETE FROM registros_diarios WHERE escola_id = ? AND data = ? AND nutricionista_id = ?',
          [escola_id, dataParaDeletar, userId]
        );
        
        console.log('Resultado da deleção:', deleteResult);
        console.log('Registros deletados:', deleteResult.affectedRows);
        
      } catch (error) {
        console.error('Erro ao deletar registros existentes:', error);
      }
    }

    // Processar cada tipo de média
    for (const [campo, valor] of Object.entries(medias)) {
      if (valor > 0) {
        try {
          const tipoMedia = campo.replace('media_', '');

          // Verificar se já existe registro para esta escola, data e tipo (apenas se não for edição)
          if (!isEdit) {
            const existeRegistro = await query(
              'SELECT id FROM registros_diarios WHERE escola_id = ? AND data = ? AND tipo_media = ? AND nutricionista_id = ?',
              [escola_id, data, tipoMedia, userId]
            );

            if (existeRegistro.length > 0) {
              // Atualizar registro existente
              await query(
                'UPDATE registros_diarios SET valor = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
                [valor, existeRegistro[0].id]
              );
              resultados.push({ id: existeRegistro[0].id, tipo: tipoMedia, action: 'updated' });
            } else {
              // Criar novo registro
              const resultado = await query(
                'INSERT INTO registros_diarios (escola_id, nutricionista_id, data, tipo_media, valor) VALUES (?, ?, ?, ?, ?)',
                [escola_id, userId, dataFormatada, tipoMedia, valor]
              );
              resultados.push({ id: resultado.insertId, tipo: tipoMedia, action: 'created' });
            }
          } else {
            // Para edição, sempre criar novo registro
            console.log('=== CRIANDO NOVO REGISTRO ===');
            console.log('Escola ID:', escola_id);
            console.log('User ID:', userId);
            console.log('Data (original):', data);
            console.log('Data (formatada):', dataFormatada);
            console.log('Tipo Média:', tipoMedia);
            console.log('Valor:', valor);
            
            const resultado = await query(
              'INSERT INTO registros_diarios (escola_id, nutricionista_id, data, tipo_media, valor) VALUES (?, ?, ?, ?, ?)',
              [escola_id, userId, dataFormatada, tipoMedia, valor]
            );
            
            console.log('Registro criado com ID:', resultado.insertId);
            resultados.push({ id: resultado.insertId, tipo: tipoMedia, action: 'created' });
          }

          sucessos++;
        } catch (error) {
          console.error(`Erro ao processar ${campo}:`, error);
          erros++;
        }
      }
    }

    console.log('=== RESULTADO FINAL ===');
    console.log('Sucessos:', sucessos);
    console.log('Erros:', erros);
    console.log('Resultados:', resultados);
    console.log('=== FIM DO PROCESSO ===');

    res.status(201).json({
      success: true,
      message: `${sucessos} registros processados com sucesso, ${erros} erros`,
      data: {
        sucessos,
        erros,
        resultados
      }
    });
  } catch (error) {
    console.error('Erro ao criar registros:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar registros diários'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;
    const { valor } = req.body;

    if (valor === undefined) {
      return res.status(400).json({
        error: 'Valor obrigatório',
        message: 'É necessário informar o valor'
      });
    }

    // Verificar se o registro existe
    const registro = await query(
      'SELECT id, nutricionista_id FROM registros_diarios WHERE id = ?',
      [id]
    );

    if (registro.length === 0) {
      return res.status(404).json({
        error: 'Registro não encontrado',
        message: 'Registro não encontrado'
      });
    }

    // Verificar permissões: Nutricionistas só podem editar seus próprios registros
    // Coordenacao e Supervisao podem editar qualquer registro
    if (userType === 'Nutricionista' && registro[0].nutricionista_id !== userId) {
      return res.status(403).json({
        error: 'Sem permissão',
        message: 'Você só pode editar seus próprios registros'
      });
    }

    // Atualizar registro
    await query(
      'UPDATE registros_diarios SET valor = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
      [valor, id]
    );

    res.json({
      success: true,
      message: 'Registro atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar registro diário'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { id } = req.params;

    // Verificar se o registro existe
    const registro = await query(
      'SELECT id, nutricionista_id FROM registros_diarios WHERE id = ?',
      [id]
    );

    if (registro.length === 0) {
      return res.status(404).json({
        error: 'Registro não encontrado',
        message: 'Registro não encontrado'
      });
    }

    // Verificar permissões: Nutricionistas só podem deletar seus próprios registros
    // Coordenacao e Supervisao podem deletar qualquer registro
    if (userType === 'Nutricionista' && registro[0].nutricionista_id !== userId) {
      return res.status(403).json({
        error: 'Sem permissão',
        message: 'Você só pode deletar seus próprios registros'
      });
    }

    // Deletar registro
    await query('DELETE FROM registros_diarios WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Registro deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar registro diário'
    });
  }
};

const calcularMedias = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;
    const { escola_id } = req.body;

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

    // Buscar todos os registros agrupados por escola e tipo de média
    const registros = await query(`
      SELECT 
        rd.escola_id,
        rd.tipo_media,
        COUNT(*) as quantidade_lancamentos,
        AVG(rd.valor) as media_calculada,
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
        let campoMedia;
        if (registro.tipo_media === 'eja') {
          campoMedia = 'media_eja_eja'; // EJA para EJA
        } else if (registro.tipo_media === 'almoco') {
          campoMedia = 'media_almoco_almoco'; // Almoço para Almoço
        } else if (registro.tipo_media === 'parcial') {
          campoMedia = 'media_parcial_parcial'; // Parcial para Parcial
        } else if (registro.tipo_media === 'lanche') {
          campoMedia = 'media_lanche_lanche'; // Lanche para Lanche
        } else {
          // Se já está no formato composto (eja_parcial, etc.), usar como está
          campoMedia = `media_${registro.tipo_media}`;
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
          // Criar nova média
          const camposMedias = [
            'media_eja_parcial', 'media_eja_almoco', 'media_eja_lanche', 'media_eja_eja',
            'media_almoco_parcial', 'media_almoco_almoco', 'media_almoco_lanche', 'media_almoco_eja',
            'media_parcial_parcial', 'media_parcial_almoco', 'media_parcial_lanche', 'media_parcial_eja',
            'media_lanche_parcial', 'media_lanche_almoco', 'media_lanche_lanche', 'media_lanche_eja'
          ];

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

const calcularMediasPorPeriodo = async (req, res) => {
  try {
    const { escola_id, data } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    if (!escola_id || !data) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'Escola e data são obrigatórios'
      });
    }

    let whereClause = 'WHERE rd.ativo = 1 AND rd.escola_id = ? AND rd.data = ?';
    let params = [escola_id, data];

    // Se for nutricionista, filtrar apenas seus registros
    if (userType === 'Nutricionista') {
      whereClause += ' AND rd.nutricionista_id = ?';
      params.push(userId);
    }

    // Buscar médias por período para a escola e data específicas
    const medias = await query(`
      SELECT 
        rd.tipo_media,
        AVG(rd.valor) as media_periodo,
        COUNT(*) as quantidade_registros
      FROM registros_diarios rd
      ${whereClause}
      GROUP BY rd.tipo_media
    `, params);

    // Organizar as médias por tipo
    const mediasOrganizadas = {};
    medias.forEach(media => {
      mediasOrganizadas[media.tipo_media] = {
        media: parseFloat(media.media_periodo) || 0,
        quantidade_registros: media.quantidade_registros
      };
    });

    res.json({
      success: true,
      data: mediasOrganizadas
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
  listar,
  criar,
  atualizar,
  deletar,
  calcularMedias,
  calcularMediasPorPeriodo
};
