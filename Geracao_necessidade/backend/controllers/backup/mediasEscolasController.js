const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    const { escola_id } = req.query;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

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

    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      INNER JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
      ORDER BY e.nome_escola ASC
    `, params);

    res.json({
      success: true,
      data: medias
    });
  } catch (error) {
    console.error('Erro ao buscar médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar médias das escolas'
    });
  }
};

const buscarPorEscola = async (req, res) => {
  try {
    const { escola_id } = req.params;
    const userId = req.user.id;
    const userType = req.user.tipo_usuario;

    let whereClause = 'WHERE me.escola_id = ?';
    let params = [escola_id];

    // Se for nutricionista, filtrar apenas suas médias
    if (userType === 'Nutricionista') {
      whereClause += ' AND me.nutricionista_id = ?';
      params.push(userId);
    }
    // Coordenador e Supervisão podem ver médias de qualquer escola

    const medias = await query(`
      SELECT 
        me.*,
        e.nome_escola,
        e.rota,
        u.nome as nutricionista_nome
      FROM medias_escolas me
      INNER JOIN escolas e ON me.escola_id = e.id
      LEFT JOIN usuarios u ON me.nutricionista_id = u.id
      ${whereClause}
    `, params);

    if (medias.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Nenhuma média encontrada para esta escola'
      });
    }

    res.json({
      success: true,
      data: medias[0]
    });
  } catch (error) {
    console.error('Erro ao buscar médias da escola:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar médias da escola'
    });
  }
};

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      escola_id,
      nome_escola,
      rota,
      media_eja_parcial,
      media_eja_almoco,
      media_eja_lanche,
      media_eja_eja,
      media_almoco_parcial,
      media_almoco_almoco,
      media_almoco_lanche,
      media_almoco_eja,
      media_parcial_parcial,
      media_parcial_almoco,
      media_parcial_lanche,
      media_parcial_eja,
      media_lanche_parcial,
      media_lanche_almoco,
      media_lanche_lanche,
      media_lanche_eja
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
      return res.status(400).json({
        error: 'Escola obrigatória',
        message: 'É necessário selecionar uma escola ou fornecer nome e rota'
      });
    }

    // Verificar se já existe média para esta escola
    const existeMedia = await query(
      'SELECT id FROM medias_escolas WHERE escola_id = ? AND nutricionista_id = ?',
      [escolaId, userId]
    );

    if (existeMedia.length > 0) {
      return res.status(400).json({
        error: 'Média já existe',
        message: 'Já existe uma média cadastrada para esta escola'
      });
    }

    // Criar médias para a escola
    const resultado = await query(`
      INSERT INTO medias_escolas (
        escola_id, nutricionista_id,
        media_eja_parcial, media_eja_almoco, media_eja_lanche, media_eja_eja,
        media_almoco_parcial, media_almoco_almoco, media_almoco_lanche, media_almoco_eja,
        media_parcial_parcial, media_parcial_almoco, media_parcial_lanche, media_parcial_eja,
        media_lanche_parcial, media_lanche_almoco, media_lanche_lanche, media_lanche_eja
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      escolaId, userId,
      media_eja_parcial || 0, media_eja_almoco || 0, media_eja_lanche || 0, media_eja_eja || 0,
      media_almoco_parcial || 0, media_almoco_almoco || 0, media_almoco_lanche || 0, media_almoco_eja || 0,
      media_parcial_parcial || 0, media_parcial_almoco || 0, media_parcial_lanche || 0, media_parcial_eja || 0,
      media_lanche_parcial || 0, media_lanche_almoco || 0, media_lanche_lanche || 0, media_lanche_eja || 0
    ]);

    res.status(201).json({
      success: true,
      message: 'Médias cadastradas com sucesso',
      data: { id: resultado.insertId, escola_id: escolaId }
    });
  } catch (error) {
    console.error('Erro ao criar médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao cadastrar médias'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      media_eja_parcial,
      media_eja_almoco,
      media_eja_lanche,
      media_eja_eja,
      media_almoco_parcial,
      media_almoco_almoco,
      media_almoco_lanche,
      media_almoco_eja,
      media_parcial_parcial,
      media_parcial_almoco,
      media_parcial_lanche,
      media_parcial_eja,
      media_lanche_parcial,
      media_lanche_almoco,
      media_lanche_lanche,
      media_lanche_eja
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
      return res.status(404).json({
        error: 'Média não encontrada',
        message: 'Média não encontrada ou você não tem permissão para editá-la'
      });
    }

    await query(`
      UPDATE medias_escolas SET
        media_eja_parcial = ?, media_eja_almoco = ?, media_eja_lanche = ?, media_eja_eja = ?,
        media_almoco_parcial = ?, media_almoco_almoco = ?, media_almoco_lanche = ?, media_almoco_eja = ?,
        media_parcial_parcial = ?, media_parcial_almoco = ?, media_parcial_lanche = ?, media_parcial_eja = ?,
        media_lanche_parcial = ?, media_lanche_almoco = ?, media_lanche_lanche = ?, media_lanche_eja = ?,
        data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      media_eja_parcial || 0, media_eja_almoco || 0, media_eja_lanche || 0, media_eja_eja || 0,
      media_almoco_parcial || 0, media_almoco_almoco || 0, media_almoco_lanche || 0, media_almoco_eja || 0,
      media_parcial_parcial || 0, media_parcial_almoco || 0, media_parcial_lanche || 0, media_parcial_eja || 0,
      media_lanche_parcial || 0, media_lanche_almoco || 0, media_lanche_lanche || 0, media_lanche_eja || 0,
      id
    ]);

    res.json({
      success: true,
      message: 'Médias atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar médias'
    });
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
      return res.status(404).json({
        error: 'Média não encontrada',
        message: 'Média não encontrada ou você não tem permissão para excluí-la'
      });
    }

    await query('DELETE FROM medias_escolas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Médias excluídas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir médias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao excluir médias'
    });
  }
};

const listarEscolasNutricionista = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userType = req.user.tipo_usuario;
    const userRota = req.user.rota;


    let whereClause = 'WHERE e.ativo = 1';
    let params = [userId];

    // Se for nutricionista, filtrar apenas suas escolas pela rota
    if (userType === 'Nutricionista') {
      // Extrair número da rota do usuário (ex: 'Rota 1' -> '1')
      const numeroRota = userRota.match(/\d+/)?.[0] || '1';
      
      // Buscar escolas que contenham o número da rota
      whereClause += ' AND e.rota LIKE ?';
      params.push(`%ROTA ${numeroRota.padStart(2, '0')}%`);
    }
    // Coordenador e Supervisão veem todas as escolas (sem filtro adicional)


    const escolas = await query(`
      SELECT 
        e.id,
        e.nome_escola,
        e.rota,
        e.cidade,
        e.estado,
        e.email_nutricionista,
        u.nome as nutricionista_nome,
        CASE 
          WHEN me.id IS NOT NULL THEN 1 
          ELSE 0 
        END as tem_media
      FROM escolas e
      LEFT JOIN usuarios u ON e.email_nutricionista = u.email
      LEFT JOIN medias_escolas me ON e.id = me.escola_id AND me.nutricionista_id = ?
      ${whereClause}
      ORDER BY e.nome_escola ASC
    `, params);

    console.log('Query executada com sucesso');
    console.log('Número de escolas encontradas:', escolas.length);
    console.log('Escolas encontradas:', escolas.map(e => ({ id: e.id, nome: e.nome_escola, rota: e.rota })));

    res.json({
      success: true,
      data: escolas
    });
  } catch (error) {
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar escolas'
    });
  }
};

module.exports = {
  listar,
  buscarPorEscola,
  criar,
  atualizar,
  deletar,
  listarEscolasNutricionista
};
