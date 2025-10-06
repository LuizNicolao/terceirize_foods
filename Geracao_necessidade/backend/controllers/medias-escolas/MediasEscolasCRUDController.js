const { query } = require('../../config/database');
const {
  successResponse,
  notFoundResponse,
  conflictResponse,
  errorResponse,
  STATUS_CODES
} = require('../../middleware/responseHandler');

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      escola_id,
      nome_escola,
      rota,
      media_lanche_manha,
      media_almoco,
      media_lanche_tarde,
      media_parcial,
      media_eja
    } = req.body;

    let escolaId = escola_id;

    // Se não tem escola_id mas tem nome_escola e rota, criar a escola
    if (!escola_id && nome_escola && rota) {
      // Verificar se a escola já existe
      const escolaExistente = await query(
        'SELECT id FROM escolas WHERE nome_escola = ? AND rota = ?',
        [nome_escola, rota]
      );

      if (escolaExistente.length > 0) {
        escolaId = escolaExistente[0].id;
      } else {
        // Criar nova escola
        const novaEscola = await query(
          'INSERT INTO escolas (nome_escola, rota, ativo) VALUES (?, ?, 1)',
          [nome_escola, rota]
        );
        escolaId = novaEscola.insertId;
      }
    }

    // Validar escola_id obrigatório
    if (!escolaId) {
      return errorResponse(res, 'É necessário selecionar uma escola ou fornecer nome e rota', STATUS_CODES.BAD_REQUEST, { code: 'SCHOOL_REQUIRED' });
    }

    // Verificar se já existe média para esta escola
    const existeMedia = await query(
      'SELECT id FROM medias_escolas WHERE escola_id = ? AND nutricionista_id = ?',
      [escolaId, userId]
    );

    if (existeMedia.length > 0) {
      return conflictResponse(res, 'Já existe uma média cadastrada para esta escola', { code: 'MEDIA_ALREADY_EXISTS' });
    }

    // Criar médias para a escola
    const resultado = await query(`
      INSERT INTO medias_escolas (
        escola_id, nutricionista_id,
        media_lanche_manha, media_almoco, media_lanche_tarde, media_parcial, media_eja
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      escolaId, userId,
      media_lanche_manha || 0, media_almoco || 0, media_lanche_tarde || 0, media_parcial || 0, media_eja || 0
    ]);

    // Buscar a média criada para retornar dados completos
    const novaMedia = await query(`
      SELECT 
        me.id,
        me.escola_id,
        me.media_lanche_manha,
        me.media_almoco,
        me.media_lanche_tarde,
        me.media_parcial,
        me.media_eja,
        me.data_criacao,
        e.nome_escola,
        e.rota
      FROM medias_escolas me
      LEFT JOIN escolas e ON me.escola_id = e.id
      WHERE me.id = ?
    `, [resultado.insertId]);

    successResponse(res, novaMedia[0], 'Médias cadastradas com sucesso', STATUS_CODES.CREATED, { id: resultado.insertId });
  } catch (error) {
    console.error('Erro ao criar médias:', error);
    errorResponse(res, 'Erro ao cadastrar médias', STATUS_CODES.INTERNAL_SERVER_ERROR, { code: 'INTERNAL_SERVER_ERROR' });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      media_lanche_manha,
      media_almoco,
      media_lanche_tarde,
      media_parcial,
      media_eja
    } = req.body;

    // Verificar se a média existe e se o usuário tem permissão
    let mediaQuery = `
      SELECT me.id, me.escola_id, e.email_nutricionista 
      FROM medias_escolas me 
      INNER JOIN escolas e ON me.escola_id = e.id 
      WHERE me.id = ?
    `;
    let mediaParams = [id];

    // Se for nutricionista, verificar se a média pertence a ele
    if (req.user.tipo_usuario === 'Nutricionista') {
      mediaQuery += ' AND me.nutricionista_id = ?';
      mediaParams.push(userId);
    }
    // Coordenador e Supervisão podem editar qualquer média

    const media = await query(mediaQuery, mediaParams);

    if (media.length === 0) {
      return notFoundResponse(res, 'Média não encontrada ou você não tem permissão para editá-la');
    }

    await query(`
      UPDATE medias_escolas SET
        media_lanche_manha = ?, media_almoco = ?, media_lanche_tarde = ?, media_parcial = ?, media_eja = ?,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      media_lanche_manha || 0, media_almoco || 0, media_lanche_tarde || 0, media_parcial || 0, media_eja || 0,
      id
    ]);

    // Buscar a média atualizada para retornar dados completos
    const mediaAtualizada = await query(`
      SELECT 
        me.id,
        me.escola_id,
        me.media_lanche_manha,
        me.media_almoco,
        me.media_lanche_tarde,
        me.media_parcial,
        me.media_eja,
        me.data_criacao,
        me.data_atualizacao,
        e.nome_escola,
        e.rota
      FROM medias_escolas me
      LEFT JOIN escolas e ON me.escola_id = e.id
      WHERE me.id = ?
    `, [id]);

    successResponse(res, mediaAtualizada[0], 'Médias atualizadas com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar médias:', error);
    errorResponse(res, 'Erro ao atualizar médias', STATUS_CODES.INTERNAL_SERVER_ERROR, { code: 'INTERNAL_SERVER_ERROR' });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a média existe e se o usuário tem permissão
    let mediaQuery = `
      SELECT me.id, me.escola_id, e.email_nutricionista 
      FROM medias_escolas me 
      INNER JOIN escolas e ON me.escola_id = e.id 
      WHERE me.id = ?
    `;
    let mediaParams = [id];

    // Se for nutricionista, verificar se a média pertence a ele
    if (req.user.tipo_usuario === 'Nutricionista') {
      mediaQuery += ' AND me.nutricionista_id = ?';
      mediaParams.push(userId);
    }
    // Coordenador e Supervisão podem excluir qualquer média

    const media = await query(mediaQuery, mediaParams);

    if (media.length === 0) {
      return notFoundResponse(res, 'Média não encontrada ou você não tem permissão para excluí-la');
    }

    await query('DELETE FROM medias_escolas WHERE id = ?', [id]);

    successResponse(res, null, 'Médias excluídas com sucesso', STATUS_CODES.NO_CONTENT);
  } catch (error) {
    console.error('Erro ao excluir médias:', error);
    errorResponse(res, 'Erro ao excluir médias', STATUS_CODES.INTERNAL_SERVER_ERROR, { code: 'INTERNAL_SERVER_ERROR' });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar
};
