const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { escola_id, data, medias, isEdit, dataOriginal } = req.body;


    // Converter datas ISO para formato MySQL (YYYY-MM-DD)
    const dataFormatada = new Date(data).toISOString().split('T')[0];
    const dataOriginalFormatada = dataOriginal ? new Date(dataOriginal).toISOString().split('T')[0] : null;


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

    let sucessos = 0;
    let erros = 0;
    const resultados = [];

    // Se for edição, primeiro deletar todos os registros existentes para esta escola/data original
    if (isEdit) {
      try {
        // Usar a data original formatada
        const dataParaDeletar = dataOriginalFormatada || dataFormatada;
        
        // Buscar registros que serão deletados
        const registrosParaDeletar = await query(
          'SELECT * FROM registros_diarios WHERE escola_id = ? AND data = ? AND nutricionista_id = ?',
          [escola_id, dataParaDeletar, userId]
        );
        
        const deleteResult = await query(
          'DELETE FROM registros_diarios WHERE escola_id = ? AND data = ? AND nutricionista_id = ?',
          [escola_id, dataParaDeletar, userId]
        );
        
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
            // Se mudou a data (dataOriginal existe e é diferente), sempre criar novo
            if (dataOriginalFormatada && dataOriginalFormatada !== dataFormatada) {
              // Criar novo registro (data mudou)
              const resultado = await query(
                'INSERT INTO registros_diarios (escola_id, nutricionista_id, data, tipo_media, valor) VALUES (?, ?, ?, ?, ?)',
                [escola_id, userId, dataFormatada, tipoMedia, valor]
              );
              resultados.push({ id: resultado.insertId, tipo: tipoMedia, action: 'created' });
            } else {
              // Verificar se já existe registro para esta escola, data e tipo
              const existeRegistro = await query(
                'SELECT id FROM registros_diarios WHERE escola_id = ? AND data = ? AND tipo_media = ? AND nutricionista_id = ?',
                [escola_id, dataFormatada, tipoMedia, userId]
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
            }
          } else {
            // Para edição, sempre criar novo registro
            const resultado = await query(
              'INSERT INTO registros_diarios (escola_id, nutricionista_id, data, tipo_media, valor) VALUES (?, ?, ?, ?, ?)',
              [escola_id, userId, dataFormatada, tipoMedia, valor]
            );
            
            resultados.push({ id: resultado.insertId, tipo: tipoMedia, action: 'created' });
          }

          sucessos++;
        } catch (error) {
          console.error(`Erro ao processar ${campo}:`, error);
          erros++;
        }
      }
    }


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

module.exports = {
  criar,
  atualizar,
  deletar
};
