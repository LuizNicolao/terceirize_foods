const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  notFoundResponse, 
  errorResponse,
  conflictResponse 
} = require('../../middleware/responseHandler');
const { logAuditoria } = require('../../utils/audit');

class IntoleranciasCRUDController {
  /**
   * Cria uma nova intolerância
   */
  static async criarIntolerancia(req, res) {
    try {
      const { nome, status = 'ativo' } = req.body;
      const usuarioId = req.user.id;

      // Verificar se já existe uma intolerância com o mesmo nome
      const checkQuery = 'SELECT id FROM intolerancias WHERE nome = ?';
      const [existing] = await executeQuery(checkQuery, [nome]);

      if (existing.length > 0) {
        return conflictResponse(res, 'Já existe uma intolerância com este nome');
      }

      // Inserir nova intolerância
      const insertQuery = `
        INSERT INTO intolerancias (nome, status) 
        VALUES (?, ?)
      `;

      const [result] = await executeQuery(insertQuery, [nome, status]);
      const novaIntoleranciaId = result.insertId;

      // Buscar a intolerância criada
      const selectQuery = 'SELECT * FROM intolerancias WHERE id = ?';
      const [intolerancias] = await executeQuery(selectQuery, [novaIntoleranciaId]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'CREATE', 'intolerancias', {
        id: novaIntoleranciaId,
        nome,
        status
      });

      return successResponse(res, intolerancias[0], 'Intolerância criada com sucesso', 201);
    } catch (error) {
      console.error('Erro ao criar intolerância:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }

  /**
   * Atualiza uma intolerância existente
   */
  static async atualizarIntolerancia(req, res) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;
      const usuarioId = req.user.id;

      // Verificar se a intolerância existe
      const checkQuery = 'SELECT * FROM intolerancias WHERE id = ?';
      const [existing] = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        return notFoundResponse(res, 'Intolerância não encontrada');
      }

      // Verificar se já existe outra intolerância com o mesmo nome
      if (nome && nome !== existing[0].nome) {
        const nameCheckQuery = 'SELECT id FROM intolerancias WHERE nome = ? AND id != ?';
        const [nameConflict] = await executeQuery(nameCheckQuery, [nome, id]);

        if (nameConflict.length > 0) {
          return conflictResponse(res, 'Já existe uma intolerância com este nome');
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (nome !== undefined) updateData.nome = nome;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return errorResponse(res, 'Nenhum dado fornecido para atualização', 400);
      }

      // Construir query de atualização dinamicamente
      const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const updateValues = Object.values(updateData);
      updateValues.push(id);

      const updateQuery = `UPDATE intolerancias SET ${updateFields} WHERE id = ?`;
      await executeQuery(updateQuery, updateValues);

      // Buscar a intolerância atualizada
      const [intolerancias] = await executeQuery(checkQuery, [id]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'UPDATE', 'intolerancias', {
        id: parseInt(id),
        ...updateData
      });

      return successResponse(res, intolerancias[0], 'Intolerância atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar intolerância:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }

  /**
   * Exclui uma intolerância
   */
  static async excluirIntolerancia(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;

      // Verificar se a intolerância existe
      const checkQuery = 'SELECT * FROM intolerancias WHERE id = ?';
      const [existing] = await executeQuery(checkQuery, [id]);

      if (existing.length === 0) {
        return notFoundResponse(res, 'Intolerância não encontrada');
      }

      // Excluir a intolerância
      const deleteQuery = 'DELETE FROM intolerancias WHERE id = ?';
      await executeQuery(deleteQuery, [id]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'DELETE', 'intolerancias', {
        id: parseInt(id),
        nome: existing[0].nome
      });

      return successResponse(res, null, 'Intolerância excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir intolerância:', error);
      return errorResponse(res, 'Erro interno do servidor');
    }
  }
}

module.exports = IntoleranciasCRUDController;
