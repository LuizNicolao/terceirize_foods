/**
 * Controller de Movimentação de Patrimônios
 * Responsável por movimentar e listar movimentações de patrimônios
 */

const { executeQuery, pool } = require('../../config/database');

/**
 * Movimentar patrimônio
 */
const movimentarPatrimonio = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      local_destino_id,
      tipo_local_destino,
      responsavel_id,
      motivo = 'transferencia',
      observacoes
    } = req.body;

    // Verificar se o usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const usuarioId = req.user.id;

    // Verificar se o patrimônio existe
    const patrimonio = await executeQuery(
      `SELECT 
        p.*,
        f.id as filial_id, 
        f.filial as filial_nome,
        ue.id as unidade_escolar_id, 
        ue.nome_escola as unidade_escolar_nome,
        pr.nome as produto_nome
      FROM patrimonios p 
      LEFT JOIN filiais f ON p.local_atual_id = f.id 
      LEFT JOIN unidades_escolares ue ON p.local_atual_id = ue.id 
      LEFT JOIN produtos pr ON p.produto_id = pr.id
      WHERE p.id = ?`,
      [id]
    );

    if (patrimonio.length === 0) {
      return res.status(404).json({ error: 'Patrimônio não encontrado' });
    }

    // VALIDAÇÃO DE ACESSO ÀS FILIAIS
    // Verificar se o usuário tem acesso à filial de origem
    let filialOrigemId;
    if (patrimonio[0].filial_id) {
      filialOrigemId = patrimonio[0].filial_id;
    } else if (patrimonio[0].unidade_escolar_id) {
      // Se está em unidade escolar, buscar a filial da unidade
      const unidadeInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [patrimonio[0].local_atual_id]
      );
      if (unidadeInfo.length === 0) {
        return res.status(400).json({ error: 'Informações de filial da unidade escolar não encontradas' });
      }
      filialOrigemId = unidadeInfo[0].filial_id;
    } else {
      return res.status(400).json({ error: 'Patrimônio não possui local válido' });
    }

    // Verificar se o usuário tem acesso à filial de origem
    const acessoOrigem = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios_filiais WHERE usuario_id = ? AND filial_id = ?',
      [usuarioId, filialOrigemId]
    );

    if (acessoOrigem[0].count === 0) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para movimentar patrimônios desta filial de origem. É necessário ter filiais vinculadas ao seu usuário.' 
      });
    }

    // Verificar se o usuário tem acesso à filial de destino
    let filialDestinoId;
    if (tipo_local_destino === 'filial') {
      filialDestinoId = local_destino_id;
    } else if (tipo_local_destino === 'unidade_escolar') {
      // Se destino é unidade escolar, buscar a filial da unidade
      const unidadeDestinoInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [local_destino_id]
      );
      if (unidadeDestinoInfo.length === 0) {
        return res.status(400).json({ error: 'Informações de filial da unidade escolar de destino não encontradas' });
      }
      filialDestinoId = unidadeDestinoInfo[0].filial_id;
    } else {
      return res.status(400).json({ error: 'Tipo de local de destino inválido' });
    }

    // Verificar se o usuário tem acesso à filial de destino
    const acessoDestino = await executeQuery(
      'SELECT COUNT(*) as count FROM usuarios_filiais WHERE usuario_id = ? AND filial_id = ?',
      [usuarioId, filialDestinoId]
    );

    if (acessoDestino[0].count === 0) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para movimentar patrimônios para esta filial de destino. É necessário ter filiais vinculadas ao seu usuário.' 
      });
    }

    // Determinar o tipo de local de origem baseado no local_atual_id
    let tipoLocalOrigem, localOrigemId;
    if (patrimonio[0].filial_id) {
      tipoLocalOrigem = 'filial';
      localOrigemId = patrimonio[0].local_atual_id;
    } else if (patrimonio[0].unidade_escolar_id) {
      tipoLocalOrigem = 'unidade_escolar';
      localOrigemId = patrimonio[0].local_atual_id;
    } else {
      return res.status(400).json({ error: 'Patrimônio não possui local válido' });
    }

    // Verificar se o local de destino existe
    let localDestino;
    if (tipo_local_destino === 'filial') {
      localDestino = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [local_destino_id]
      );
    } else if (tipo_local_destino === 'unidade_escolar') {
      localDestino = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE id = ?',
        [local_destino_id]
      );
    } else {
      return res.status(400).json({ error: 'Tipo de local de destino inválido' });
    }

    if (localDestino.length === 0) {
      return res.status(400).json({ 
        error: `${tipo_local_destino === 'filial' ? 'Filial' : 'Unidade escolar'} de destino não encontrada` 
      });
    }

    // VALIDAÇÃO DE MOVIMENTAÇÃO ENTRE FILIAIS
    // Verificar se a movimentação é permitida baseada nas regras de negócio
    if (tipoLocalOrigem === 'unidade_escolar' && tipo_local_destino === 'unidade_escolar') {
      // Movimentação entre unidades escolares: verificar se ambas pertencem à mesma filial
      const origemInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [localOrigemId]
      );
      
      const destinoInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [local_destino_id]
      );

      if (origemInfo.length === 0 || destinoInfo.length === 0) {
        return res.status(400).json({ error: 'Informações de filial não encontradas' });
      }

      const filialOrigem = origemInfo[0].filial_id;
      const filialDestino = destinoInfo[0].filial_id;

      if (filialOrigem !== filialDestino) {
        return res.status(400).json({ 
          error: 'Não é permitido movimentar patrimônios entre unidades escolares de filiais diferentes. ' +
                 'Patrimônios só podem ser movimentados entre unidades escolares da mesma filial.' 
        });
      }
    } else if (tipoLocalOrigem === 'unidade_escolar' && tipo_local_destino === 'filial') {
      // Movimentação de unidade escolar para filial: verificar se a unidade pertence à filial de destino
      const unidadeInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [localOrigemId]
      );

      if (unidadeInfo.length === 0) {
        return res.status(400).json({ error: 'Informações de filial da unidade escolar não encontradas' });
      }

      if (unidadeInfo[0].filial_id !== local_destino_id) {
        return res.status(400).json({ 
          error: 'Não é permitido movimentar patrimônios de uma unidade escolar para uma filial diferente da qual ela pertence. ' +
                 'A unidade escolar só pode movimentar patrimônios para sua própria filial.' 
        });
      }
    } else if (tipoLocalOrigem === 'filial' && tipo_local_destino === 'unidade_escolar') {
      // Movimentação de filial para unidade escolar: verificar se a unidade pertence à filial de origem
      const unidadeInfo = await executeQuery(
        'SELECT filial_id FROM unidades_escolares WHERE id = ?',
        [local_destino_id]
      );

      if (unidadeInfo.length === 0) {
        return res.status(400).json({ error: 'Informações de filial da unidade escolar não encontradas' });
      }

      if (unidadeInfo[0].filial_id !== localOrigemId) {
        return res.status(400).json({ 
          error: 'Não é permitido movimentar patrimônios de uma filial para uma unidade escolar que não pertence a ela. ' +
                 'A filial só pode movimentar patrimônios para suas próprias unidades escolares.' 
        });
      }
    }
    // Movimentação entre filiais é sempre permitida (tipoLocalOrigem === 'filial' && tipo_local_destino === 'filial')

    // Verificar se o responsável existe
    const responsavel = await executeQuery(
      'SELECT id FROM usuarios WHERE id = ?',
      [responsavel_id]
    );

    if (responsavel.length === 0) {
      return res.status(400).json({ error: 'Responsável não encontrado' });
    }

    // Inserir movimentação
    const movimentacaoQuery = `
      INSERT INTO patrimonios_movimentacoes (
        patrimonio_id, tipo_local_origem, tipo_local_destino, local_origem_id, local_destino_id,
        data_movimentacao, responsavel_id, motivo, observacoes
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)
    `;

    await executeQuery(movimentacaoQuery, [
      id,
      tipoLocalOrigem,
      tipo_local_destino,
      localOrigemId,
      local_destino_id,
      responsavel_id,
      motivo,
      observacoes
    ]);

    // Atualizar local atual do patrimônio
    await executeQuery(
      'UPDATE patrimonios SET local_atual_id = ?, atualizado_em = NOW() WHERE id = ?',
      [local_destino_id, id]
    );

    res.json({
      success: true,
      message: 'Patrimônio movimentado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao movimentar patrimônio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Listar movimentações de um patrimônio
 */
const listarMovimentacoesPatrimonio = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Verificar se o patrimônio existe
    const patrimonio = await executeQuery(
      'SELECT * FROM patrimonios WHERE id = ?',
      [id]
    );

    if (patrimonio.length === 0) {
      return res.status(404).json({ error: 'Patrimônio não encontrado' });
    }

    // Buscar movimentações
    const limitNum = parseInt(limit) || 50;
    const offset = Math.max(0, (parseInt(page) || 1) - 1) * limitNum;

    // Query completa com JOINs para mostrar nomes dos locais
    const query = `
      SELECT 
        pm.*,
        CASE 
          WHEN pm.tipo_local_origem = 'filial' THEN f_origem.filial
          WHEN pm.tipo_local_origem = 'unidade_escolar' THEN ue_origem.nome_escola
        END as local_origem_nome,
        CASE 
          WHEN pm.tipo_local_destino = 'filial' THEN f_destino.filial
          WHEN pm.tipo_local_destino = 'unidade_escolar' THEN ue_destino.nome_escola
        END as local_destino_nome,
        u.nome as responsavel_nome
      FROM patrimonios_movimentacoes pm
      LEFT JOIN filiais f_origem ON pm.tipo_local_origem = 'filial' AND pm.local_origem_id = f_origem.id
      LEFT JOIN unidades_escolares ue_origem ON pm.tipo_local_origem = 'unidade_escolar' AND pm.local_origem_id = ue_origem.id
      LEFT JOIN filiais f_destino ON pm.tipo_local_destino = 'filial' AND pm.local_destino_id = f_destino.id
      LEFT JOIN unidades_escolares ue_destino ON pm.tipo_local_destino = 'unidade_escolar' AND pm.local_destino_id = ue_destino.id
      INNER JOIN usuarios u ON pm.responsavel_id = u.id
      WHERE pm.patrimonio_id = ?
      ORDER BY pm.data_movimentacao DESC
      LIMIT ? OFFSET ?
    `;

    // Garantir que os parâmetros sejam números válidos
    const params = [parseInt(id), limitNum, offset];
    
    // Executar query com pool.query diretamente
    const [movimentacoes] = await pool.query(query, params);
    

    // Contar total
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM patrimonios_movimentacoes WHERE patrimonio_id = ?',
      [parseInt(id)]
    );
    const totalItems = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

    res.json({
      success: true,
      data: movimentacoes,
      pagination: {
        total: totalItems,
        page: parseInt(page) || 1,
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  movimentarPatrimonio,
  listarMovimentacoesPatrimonio
};
