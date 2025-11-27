/**
 * Controller CRUD de Filiais
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

class FiliaisCRUDController {
  
  /**
   * Criar nova filial
   */
  static criarFilial = asyncHandler(async (req, res) => {
    const {
      codigo_filial,
      cnpj,
      filial,
      razao_social,
      logradouro,
      numero,
      bairro,
      cep,
      cidade,
      estado,
      supervisao,
      coordenacao,
      status = 1
    } = req.body;

    // Validações específicas
    if (!filial || filial.trim().length < 3) {
      return errorResponse(res, 'Nome da filial deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    if (!razao_social || razao_social.trim().length < 3) {
      return errorResponse(res, 'Razão social deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Validar CNPJ se fornecido
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return errorResponse(res, 'CNPJ deve ter 14 dígitos', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Validar estado se fornecido
    if (estado && estado.length !== 2) {
      return errorResponse(res, 'Estado deve ter 2 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se já existe uma filial com o mesmo código
    if (codigo_filial) {
      const existingFilial = await executeQuery(
        'SELECT id FROM filiais WHERE codigo_filial = ?',
        [codigo_filial]
      );

      if (existingFilial.length > 0) {
        return conflictResponse(res, 'Já existe uma filial com este código');
      }
    }

    // Inserir filial
    const insertQuery = `
      INSERT INTO filiais (
        codigo_filial, cnpj, filial, razao_social, 
        logradouro, numero, bairro, cep, cidade, estado,
        supervisao, coordenacao, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      codigo_filial, cnpj, filial, razao_social,
      logradouro, numero, bairro, cep, cidade, estado,
      supervisao, coordenacao, status
    ]);

    // Buscar filial criada
    const newFilial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [result.insertId]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(newFilial[0]);

    return successResponse(res, data, 'Filial criada com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar filial
   */
  static atualizarFilial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se a filial existe
    const existingFilial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    if (existingFilial.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Validações específicas
    if (updateData.filial && updateData.filial.trim().length < 3) {
      return errorResponse(res, 'Nome da filial deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    if (updateData.razao_social && updateData.razao_social.trim().length < 3) {
      return errorResponse(res, 'Razão social deve ter pelo menos 3 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Validar CNPJ se fornecido
    if (updateData.cnpj) {
      const cnpjLimpo = updateData.cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return errorResponse(res, 'CNPJ deve ter 14 dígitos', STATUS_CODES.BAD_REQUEST);
      }
    }

    // Validar estado se fornecido
    if (updateData.estado && updateData.estado.length !== 2) {
      return errorResponse(res, 'Estado deve ter 2 caracteres', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se já existe outra filial com o mesmo código
    if (updateData.codigo_filial) {
      const existingFilialWithCode = await executeQuery(
        'SELECT id FROM filiais WHERE codigo_filial = ? AND id != ?',
        [updateData.codigo_filial, id]
      );

      if (existingFilialWithCode.length > 0) {
        return conflictResponse(res, 'Já existe outra filial com este código');
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateParams = [];
    const camposValidos = [
      'codigo_filial', 'cnpj', 'filial', 'razao_social', 'logradouro', 
      'numero', 'bairro', 'cep', 'cidade', 'estado', 'supervisao', 
      'coordenacao', 'status'
    ];

    Object.keys(updateData).forEach(key => {
      if (camposValidos.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateParams.push(updateData[key]);
      }
    });

    // Sempre atualizar o timestamp
    updateFields.push('atualizado_em = CURRENT_TIMESTAMP');

    if (updateFields.length === 0) {
      return errorResponse(res, 'Nenhum campo foi fornecido para atualização', STATUS_CODES.BAD_REQUEST);
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE filiais SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar filial atualizada
    const updatedFilial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(updatedFilial[0]);

    return successResponse(res, data, 'Filial atualizada com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir filial (soft delete)
   */
  static excluirFilial = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se a filial existe
    const filial = await executeQuery(
      'SELECT * FROM filiais WHERE id = ?',
      [id]
    );

    if (filial.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Verificar se há almoxarifados vinculados
    const almoxarifados = await executeQuery(
      'SELECT id FROM almoxarifado WHERE filial_id = ?',
      [id]
    );

    if (almoxarifados.length > 0) {
      return errorResponse(res, `Não é possível excluir a filial. Existem ${almoxarifados.length} almoxarifado(s) vinculado(s) a ela.`, STATUS_CODES.BAD_REQUEST, {
        dependencies: {
          almoxarifados: almoxarifados.length
        }
      });
    }

    // Excluir filial
    await executeQuery('DELETE FROM filiais WHERE id = ?', [id]);

    return successResponse(res, null, 'Filial excluída com sucesso', STATUS_CODES.OK);
  });

  /**
   * Criar almoxarifado
   */
  static criarAlmoxarifado = asyncHandler(async (req, res) => {
    const { filialId } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do almoxarifado é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se a filial existe
    const filial = await executeQuery('SELECT id FROM filiais WHERE id = ?', [filialId]);
    if (filial.length === 0) {
      return notFoundResponse(res, 'Filial não encontrada');
    }

    // Verificar se já existe um almoxarifado com o mesmo nome na filial
    const almoxarifadoExistente = await executeQuery(
      'SELECT id FROM almoxarifado WHERE filial_id = ? AND nome = ?',
      [filialId, nome.trim()]
    );

    if (almoxarifadoExistente.length > 0) {
      return conflictResponse(res, 'Já existe um almoxarifado com este nome nesta filial');
    }

    const query = `
      INSERT INTO almoxarifado (filial_id, nome, status, criado_em, atualizado_em)
      VALUES (?, ?, 1, NOW(), NOW())
    `;

    const result = await executeQuery(query, [filialId, nome.trim()]);

    // Buscar o almoxarifado criado
    const almoxarifado = await executeQuery(
      'SELECT * FROM almoxarifado WHERE id = ?',
      [result.insertId]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifado[0]);

    return successResponse(res, data, 'Almoxarifado criado com sucesso', STATUS_CODES.CREATED);
  });

  /**
   * Atualizar almoxarifado
   */
  static atualizarAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nome, status } = req.body;

    if (!nome || nome.trim() === '') {
      return errorResponse(res, 'O nome do almoxarifado é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery('SELECT * FROM almoxarifado WHERE id = ?', [id]);
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    // Verificar se já existe outro almoxarifado com o mesmo nome na mesma filial
    const almoxarifadoExistente = await executeQuery(
      'SELECT id FROM almoxarifado WHERE filial_id = ? AND nome = ? AND id != ?',
      [almoxarifado[0].filial_id, nome.trim(), id]
    );

    if (almoxarifadoExistente.length > 0) {
      return conflictResponse(res, 'Já existe um almoxarifado com este nome nesta filial');
    }

    const query = `
      UPDATE almoxarifado 
      SET nome = ?, status = ?, atualizado_em = NOW()
      WHERE id = ?
    `;

    await executeQuery(query, [nome.trim(), status, id]);

    // Buscar o almoxarifado atualizado
    const almoxarifadoAtualizado = await executeQuery(
      'SELECT * FROM almoxarifado WHERE id = ?',
      [id]
    );

    // Adicionar links HATEOAS
    const data = res.addResourceLinks(almoxarifadoAtualizado[0]);

    return successResponse(res, data, 'Almoxarifado atualizado com sucesso', STATUS_CODES.OK);
  });

  /**
   * Excluir almoxarifado
   */
  static excluirAlmoxarifado = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se o almoxarifado existe
    const almoxarifado = await executeQuery('SELECT * FROM almoxarifado WHERE id = ?', [id]);
    if (almoxarifado.length === 0) {
      return notFoundResponse(res, 'Almoxarifado não encontrado');
    }

    // Verificação de itens removida - tabela almoxarifado_itens foi removida

    await executeQuery('DELETE FROM almoxarifado WHERE id = ?', [id]);

    return successResponse(res, null, 'Almoxarifado excluído com sucesso', STATUS_CODES.OK);
  });

  /**
   * Adicionar item ao almoxarifado
   * REMOVIDO - tabela almoxarifado_itens foi removida
   */

  /**
   * Remover item do almoxarifado
   * REMOVIDO - tabela almoxarifado_itens foi removida
   */
}

module.exports = FiliaisCRUDController;
