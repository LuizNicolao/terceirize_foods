/**
 * Controller de Almoxarifados para Unidades Escolares
 * Responsável por gerenciar almoxarifados específicos de unidades escolares
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  conflictResponse 
} = require('../../middleware/responseHandler');
const { STATUS_CODES } = require('../../middleware/responseHandler');

class UnidadesEscolaresAlmoxarifadoController {

  /**
   * Listar almoxarifados de uma unidade escolar
   */
  static listarAlmoxarifados = asyncHandler(async (req, res) => {
    const { unidadeEscolarId } = req.params;

    // Verificar se a unidade escolar existe
    const unidadeEscolar = await executeQuery(
      'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
      [unidadeEscolarId]
    );

    if (unidadeEscolar.length === 0) {
      return notFoundResponse(res, 'Unidade escolar não encontrada');
    }

    const query = `
      SELECT 
        id, unidade_escolar_id, nome, status, criado_em, atualizado_em
      FROM almoxarifados 
      WHERE unidade_escolar_id = ?
      ORDER BY nome ASC
    `;

    const almoxarifados = await executeQuery(query, [unidadeEscolarId]);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, almoxarifados, 'Almoxarifados da unidade escolar listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(almoxarifados)._links,
      unidade_escolar: unidadeEscolar[0]
    });
  });

  /**
   * Criar almoxarifado para uma unidade escolar
   */
  static criarAlmoxarifado = asyncHandler(async (req, res) => {
    const { unidadeEscolarId } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do almoxarifado é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se a unidade escolar existe
    const unidadeEscolar = await executeQuery(
      'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?', 
      [unidadeEscolarId]
    );
    
    if (unidadeEscolar.length === 0) {
      return notFoundResponse(res, 'Unidade escolar não encontrada');
    }

    // Verificar se já existe um almoxarifado para esta unidade escolar
    const almoxarifadoExistente = await executeQuery(
      'SELECT id FROM almoxarifados WHERE unidade_escolar_id = ?',
      [unidadeEscolarId]
    );

    if (almoxarifadoExistente.length > 0) {
      return conflictResponse(res, 'Esta unidade escolar já possui um almoxarifado. Cada unidade escolar pode ter apenas um almoxarifado.');
    }

    // Verificar se já existe um almoxarifado com o mesmo nome
    const almoxarifadoMesmoNome = await executeQuery(
      'SELECT id FROM almoxarifados WHERE nome = ?',
      [nome.trim()]
    );

    if (almoxarifadoMesmoNome.length > 0) {
      return conflictResponse(res, 'Já existe um almoxarifado com este nome no sistema');
    }

    const query = `
      INSERT INTO almoxarifados (unidade_escolar_id, nome, status, criado_em, atualizado_em)
      VALUES (?, ?, 1, NOW(), NOW())
    `;

    const result = await executeQuery(query, [unidadeEscolarId, nome.trim()]);

    // Buscar o almoxarifado criado
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ?',
      [result.insertId]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado[0]);

    return successResponse(res, data, 'Almoxarifado criado com sucesso para a unidade escolar', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar almoxarifado de uma unidade escolar
   */
  static atualizarAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, status } = req.body;

    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do almoxarifado é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se o almoxarifado existe e pertence a uma unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ? AND unidade_escolar_id IS NOT NULL', 
      [id]
    );
    
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado de unidade escolar não encontrado');
    }

    // Verificar se já existe outro almoxarifado com o mesmo nome
    const almoxarifadoExistente = await executeQuery(
      'SELECT id FROM almoxarifados WHERE nome = ? AND id != ?',
      [nome.trim(), id]
    );

    if (almoxarifadoExistente.length > 0) {
      return conflictResponse(res, 'Já existe um almoxarifado com este nome no sistema');
    }

    const updateQuery = `
      UPDATE almoxarifados 
      SET nome = ?, status = ?, atualizado_em = NOW()
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [nome.trim(), status, id]);

    // Buscar o almoxarifado atualizado
    const almoxarifadoAtualizado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ?',
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifadoAtualizado[0]);

    return successResponse(res, data, 'Almoxarifado atualizado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir almoxarifado de uma unidade escolar
   */
  static excluirAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se o almoxarifado existe e pertence a uma unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ? AND unidade_escolar_id IS NOT NULL', 
      [id]
    );
    
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado de unidade escolar não encontrado');
    }

    // Verificar se há itens no almoxarifado
    const itens = await executeQuery(
      'SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ?',
      [id]
    );

    if (itens.length > 0) {
      return errorResponse(res, `Não é possível excluir o almoxarifado. Existem ${itens.length} item(s) cadastrado(s).`, STATUS_CODES.BAD_REQUEST, {
        dependencies: {
          itens: itens.length
        }
      });
    }

    // Excluir almoxarifado
    await executeQuery('DELETE FROM almoxarifados WHERE id = ?', [id]);

    return successResponse(res, null, 'Almoxarifado excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Listar itens de um almoxarifado de unidade escolar
   */
  static listarItensAlmoxarifado = asyncHandler(async (req, res) => {
    const { almoxarifadoId } = req.params;

    // Verificar se o almoxarifado existe e pertence a uma unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ? AND unidade_escolar_id IS NOT NULL', 
      [almoxarifadoId]
    );
    
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado de unidade escolar não encontrado');
    }

    const query = `
      SELECT 
        ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade,
        ai.criado_em, ai.atualizado_em,
        p.nome as produto_nome, p.codigo_produto as produto_codigo,
        u.nome as unidade_nome
      FROM almoxarifado_itens ai
      INNER JOIN produtos p ON ai.produto_id = p.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      WHERE ai.almoxarifado_id = ?
      ORDER BY p.nome ASC
    `;

    const itens = await executeQuery(query, [almoxarifadoId]);

    // Retornar resposta no formato esperado pelo frontend
    return successResponse(res, itens, 'Itens do almoxarifado listados com sucesso', STATUS_CODES.OK, {
      _links: res.addListLinks(itens)._links,
      almoxarifado: almoxarifado[0]
    });
  });

  /**
   * Adicionar item ao almoxarifado de unidade escolar
   */
  static adicionarItemAlmoxarifado = asyncHandler(async (req, res) => {
    const { almoxarifadoId } = req.params;
    const { produto_id, quantidade } = req.body;

    if (!produto_id || !quantidade) {
      return errorResponse(res, 'Produto e quantidade são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }

    if (quantidade <= 0) {
      return errorResponse(res, 'A quantidade deve ser maior que zero', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se o almoxarifado existe e pertence a uma unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ? AND unidade_escolar_id IS NOT NULL', 
      [almoxarifadoId]
    );
    
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado de unidade escolar não encontrado');
    }

    // Verificar se o produto existe
    const produto = await executeQuery(
      'SELECT id, nome FROM produtos WHERE id = ?', 
      [produto_id]
    );
    
    if (produto.length === 0) {
      return notFoundResponse(res, 'Produto não encontrado');
    }

    // Verificar se o item já existe no almoxarifado
    const itemExistente = await executeQuery(
      'SELECT id FROM almoxarifado_itens WHERE almoxarifado_id = ? AND produto_id = ?',
      [almoxarifadoId, produto_id]
    );

    if (itemExistente.length > 0) {
      return conflictResponse(res, 'Este produto já está cadastrado neste almoxarifado');
    }

    const query = `
      INSERT INTO almoxarifado_itens (almoxarifado_id, produto_id, quantidade, criado_em, atualizado_em)
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(query, [almoxarifadoId, produto_id, quantidade]);

    // Buscar o item criado
    const item = await executeQuery(
      'SELECT * FROM almoxarifado_itens WHERE id = ?',
      [result.insertId]
    );

    return successResponse(res, item[0], 'Item adicionado ao almoxarifado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Remover item do almoxarifado de unidade escolar
   */
  static removerItemAlmoxarifado = asyncHandler(async (req, res) => {
    const { almoxarifadoId, itemId } = req.params;

    // Verificar se o almoxarifado existe e pertence a uma unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE id = ? AND unidade_escolar_id IS NOT NULL', 
      [almoxarifadoId]
    );
    
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado de unidade escolar não encontrado');
    }

    // Verificar se o item existe e pertence ao almoxarifado
    const item = await executeQuery(
      'SELECT * FROM almoxarifado_itens WHERE id = ? AND almoxarifado_id = ?',
      [itemId, almoxarifadoId]
    );
    
    if (item.length === 0) {
      return notFoundResponse(res, 'Item não encontrado neste almoxarifado');
    }

    // Remover item
    await executeQuery('DELETE FROM almoxarifado_itens WHERE id = ?', [itemId]);

    return successResponse(res, null, 'Item removido do almoxarifado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Buscar almoxarifado de uma unidade escolar específica
   */
  static buscarAlmoxarifadoUnidadeEscolar = asyncHandler(async (req, res) => {
    const { unidadeEscolarId } = req.params;

    // Verificar se a unidade escolar existe
    const unidadeEscolar = await executeQuery(
      'SELECT id, nome_escola, cidade, estado FROM unidades_escolares WHERE id = ?',
      [unidadeEscolarId]
    );

    if (unidadeEscolar.length === 0) {
      return notFoundResponse(res, 'Unidade escolar não encontrada');
    }

    // Buscar almoxarifado da unidade escolar
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifados WHERE unidade_escolar_id = ?',
      [unidadeEscolarId]
    );

    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Esta unidade escolar não possui almoxarifado cadastrado');
    }

    // Buscar itens do almoxarifado
    const itensQuery = `
      SELECT 
        ai.id, ai.almoxarifado_id, ai.produto_id, ai.quantidade,
        ai.criado_em, ai.atualizado_em,
        p.nome as produto_nome, p.codigo_produto as produto_codigo,
        u.nome as unidade_nome
      FROM almoxarifado_itens ai
      INNER JOIN produtos p ON ai.produto_id = p.id
      LEFT JOIN unidades_medida u ON p.unidade_id = u.id
      WHERE ai.almoxarifado_id = ?
      ORDER BY p.nome ASC
    `;
    const itens = await executeQuery(itensQuery, [almoxarifado[0].id]);

    const resultado = {
      ...almoxarifado[0],
      unidade_escolar: unidadeEscolar[0],
      itens: itens,
      total_itens: itens.length
    };

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(resultado);

    return successResponse(res, data, 'Almoxarifado da unidade escolar encontrado com sucesso', STATUS_CODES.OK);
  });
}

module.exports = UnidadesEscolaresAlmoxarifadoController;
