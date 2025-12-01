/**
 * Controller CRUD de Almoxarifado Estoque
 * Responsável por operações de Create, Update e Delete
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class AlmoxarifadoEstoqueCRUDController {
  
  /**
   * Criar novo estoque
   */
  static criarEstoque = asyncHandler(async (req, res) => {
    const { 
      almoxarifado_id, 
      produto_generico_id, 
      quantidade_atual = 0,
      quantidade_reservada = 0,
      valor_unitario_medio = 0,
      estoque_minimo = 0,
      estoque_maximo = null,
      lote = null,
      data_validade = null,
      status = 'ATIVO',
      observacoes = null
    } = req.body;
    const userId = req.user?.id || null;

    // Verificar se almoxarifado existe
    const almoxarifado = await executeQuery(
      'SELECT id, nome FROM almoxarifado WHERE id = ?',
      [almoxarifado_id]
    );

    if (almoxarifado.length === 0) {
      return errorResponse(res, 'Almoxarifado não encontrado', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se produto genérico existe e buscar grupo_id e grupo_nome
    const produtoGenerico = await executeQuery(
      `SELECT pg.id, pg.nome, pg.grupo_id, g.nome as grupo_nome
       FROM produto_generico pg
       LEFT JOIN grupos g ON pg.grupo_id = g.id
       WHERE pg.id = ?`,
      [produto_generico_id]
    );

    if (produtoGenerico.length === 0) {
      return errorResponse(res, 'Produto genérico não encontrado', STATUS_CODES.BAD_REQUEST);
    }

    const grupoId = produtoGenerico[0].grupo_id || null;
    const grupoNome = produtoGenerico[0].grupo_nome || null;

    // Verificar se já existe estoque para esta combinação (considerando lote e validade)
    const existingEstoque = await executeQuery(
      'SELECT id FROM almoxarifado_estoque WHERE almoxarifado_id = ? AND produto_generico_id = ? AND COALESCE(lote, "") = COALESCE(?, "") AND COALESCE(data_validade, "") = COALESCE(?, "")',
      [almoxarifado_id, produto_generico_id, lote || '', data_validade || '']
    );

    if (existingEstoque.length > 0) {
      return conflictResponse(res, 'Já existe um estoque para este produto neste almoxarifado com o mesmo lote e data de validade');
    }

    // Inserir estoque
    const result = await executeQuery(
      `INSERT INTO almoxarifado_estoque (
        almoxarifado_id, 
        produto_generico_id,
        grupo_id,
        grupo_nome,
        quantidade_atual, 
        quantidade_reservada,
        valor_unitario_medio,
        estoque_minimo,
        estoque_maximo,
        lote,
        data_validade,
        status,
        observacoes,
        usuario_cadastro_id,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        almoxarifado_id,
        produto_generico_id,
        grupoId,
        grupoNome,
        parseFloat(quantidade_atual) || 0,
        parseFloat(quantidade_reservada) || 0,
        parseFloat(valor_unitario_medio) || 0,
        parseFloat(estoque_minimo) || 0,
        estoque_maximo ? parseFloat(estoque_maximo) : null,
        lote && lote.trim() ? lote.trim() : null,
        data_validade || null,
        status,
        observacoes && observacoes.trim() ? observacoes.trim() : null,
        userId
      ]
    );

    const novoEstoqueId = result.insertId;

    // Buscar estoque criado
    const estoques = await executeQuery(
      `SELECT 
        ae.id,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo,
        ae.produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        ae.grupo_id,
        ae.grupo_nome,
        ae.quantidade_atual,
        ae.quantidade_reservada,
        ae.quantidade_disponivel,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.estoque_minimo,
        ae.estoque_maximo,
        ae.lote,
        ae.data_validade,
        ae.status,
        ae.observacoes,
        ae.criado_em,
        ae.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado_estoque ae
       LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
       LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
       LEFT JOIN usuarios uc ON ae.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON ae.usuario_atualizacao_id = ua.id
       WHERE ae.id = ?`,
      [novoEstoqueId]
    );

    const estoque = estoques[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(estoque);

    return successResponse(res, data, 'Estoque criado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar estoque
   */
  static atualizarEstoque = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || null;

    // Verificar se estoque existe
    const existingEstoque = await executeQuery(
      'SELECT id FROM almoxarifado_estoque WHERE id = ?',
      [id]
    );

    if (existingEstoque.length === 0) {
      return notFoundResponse(res, 'Estoque não encontrado');
    }

    // Verificar se almoxarifado existe (se fornecido)
    if (updateData.almoxarifado_id) {
      const almoxarifado = await executeQuery(
        'SELECT id FROM almoxarifado WHERE id = ?',
        [updateData.almoxarifado_id]
      );

      if (almoxarifado.length === 0) {
        return errorResponse(res, 'Almoxarifado não encontrado', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Verificar se produto genérico existe (se fornecido) e buscar grupo_id e grupo_nome
    let grupoId = null;
    let grupoNome = null;
    
    if (updateData.produto_generico_id) {
      const produtoGenerico = await executeQuery(
        `SELECT pg.id, pg.grupo_id, g.nome as grupo_nome
         FROM produto_generico pg
         LEFT JOIN grupos g ON pg.grupo_id = g.id
         WHERE pg.id = ?`,
        [updateData.produto_generico_id]
      );

      if (produtoGenerico.length === 0) {
        return errorResponse(res, 'Produto genérico não encontrado', STATUS_CODES.BAD_REQUEST);
      }
      
      grupoId = produtoGenerico[0].grupo_id || null;
      grupoNome = produtoGenerico[0].grupo_nome || null;
    }

    // Construir query de atualização dinamicamente
    const fieldsToUpdate = [];
    const values = [];

    if (updateData.almoxarifado_id !== undefined) {
      fieldsToUpdate.push('almoxarifado_id = ?');
      values.push(updateData.almoxarifado_id);
    }
    if (updateData.produto_generico_id !== undefined) {
      fieldsToUpdate.push('produto_generico_id = ?');
      values.push(updateData.produto_generico_id);
      
      // Atualizar grupo_id e grupo_nome quando produto_generico_id for alterado
      if (grupoId !== null || grupoNome !== null) {
        fieldsToUpdate.push('grupo_id = ?');
        values.push(grupoId);
        fieldsToUpdate.push('grupo_nome = ?');
        values.push(grupoNome);
      }
    }
    if (updateData.quantidade_atual !== undefined) {
      fieldsToUpdate.push('quantidade_atual = ?');
      values.push(parseFloat(updateData.quantidade_atual) || 0);
    }
    if (updateData.quantidade_reservada !== undefined) {
      fieldsToUpdate.push('quantidade_reservada = ?');
      values.push(parseFloat(updateData.quantidade_reservada) || 0);
    }
    if (updateData.valor_unitario_medio !== undefined) {
      fieldsToUpdate.push('valor_unitario_medio = ?');
      values.push(parseFloat(updateData.valor_unitario_medio) || 0);
    }
    if (updateData.estoque_minimo !== undefined) {
      fieldsToUpdate.push('estoque_minimo = ?');
      values.push(parseFloat(updateData.estoque_minimo) || 0);
    }
    if (updateData.estoque_maximo !== undefined) {
      fieldsToUpdate.push('estoque_maximo = ?');
      values.push(updateData.estoque_maximo ? parseFloat(updateData.estoque_maximo) : null);
    }
    if (updateData.lote !== undefined) {
      fieldsToUpdate.push('lote = ?');
      values.push(updateData.lote && updateData.lote.trim() ? updateData.lote.trim() : null);
    }
    if (updateData.data_validade !== undefined) {
      fieldsToUpdate.push('data_validade = ?');
      values.push(updateData.data_validade || null);
    }
    if (updateData.status !== undefined) {
      fieldsToUpdate.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.observacoes !== undefined) {
      fieldsToUpdate.push('observacoes = ?');
      values.push(updateData.observacoes && updateData.observacoes.trim() ? updateData.observacoes.trim() : null);
    }

    if (fieldsToUpdate.length === 0) {
      return errorResponse(res, 'Nenhum campo fornecido para atualização', STATUS_CODES.BAD_REQUEST);
    }

    fieldsToUpdate.push('usuario_atualizacao_id = ?');
    fieldsToUpdate.push('atualizado_em = NOW()');
    values.push(userId, id);

    await executeQuery(
      `UPDATE almoxarifado_estoque SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
      values
    );

    // Buscar estoque atualizado
    const estoques = await executeQuery(
      `SELECT 
        ae.id,
        ae.almoxarifado_id,
        a.nome as almoxarifado_nome,
        a.codigo as almoxarifado_codigo,
        ae.produto_generico_id,
        pg.nome as produto_generico_nome,
        pg.codigo as produto_generico_codigo,
        ae.grupo_id,
        ae.grupo_nome,
        ae.quantidade_atual,
        ae.quantidade_reservada,
        ae.quantidade_disponivel,
        ae.valor_unitario_medio,
        ae.valor_total,
        ae.estoque_minimo,
        ae.estoque_maximo,
        ae.lote,
        ae.data_validade,
        ae.status,
        ae.observacoes,
        ae.criado_em,
        ae.atualizado_em,
        uc.nome as usuario_criador_nome,
        ua.nome as usuario_atualizador_nome
       FROM almoxarifado_estoque ae
       LEFT JOIN almoxarifado a ON ae.almoxarifado_id = a.id
       LEFT JOIN produto_generico pg ON ae.produto_generico_id = pg.id
       LEFT JOIN usuarios uc ON ae.usuario_cadastro_id = uc.id
       LEFT JOIN usuarios ua ON ae.usuario_atualizacao_id = ua.id
       WHERE ae.id = ?`,
      [id]
    );

    const estoque = estoques[0];

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(estoque);

    return successResponse(res, data, 'Estoque atualizado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir estoque (soft delete)
   */
  static excluirEstoque = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id || null;

    // Verificar se estoque existe
    const existingEstoque = await executeQuery(
      'SELECT id FROM almoxarifado_estoque WHERE id = ?',
      [id]
    );

    if (existingEstoque.length === 0) {
      return notFoundResponse(res, 'Estoque não encontrado');
    }

    // Atualizar status para INATIVO (soft delete)
    await executeQuery(
      'UPDATE almoxarifado_estoque SET status = ?, usuario_atualizacao_id = ?, atualizado_em = NOW() WHERE id = ?',
      ['INATIVO', userId, id]
    );

    return successResponse(res, null, 'Estoque excluído com sucesso', STATUS_CODES.OK);
  });
}

module.exports = AlmoxarifadoEstoqueCRUDController;

