const db = require('../../config/database');
const { formatResponse } = require('../../utils/formatters');
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
      const [existing] = await db.execute(checkQuery, [nome]);

      if (existing.length > 0) {
        return res.status(400).json(formatResponse(null, 'Já existe uma intolerância com este nome', false));
      }

      // Inserir nova intolerância
      const insertQuery = `
        INSERT INTO intolerancias (nome, status) 
        VALUES (?, ?)
      `;

      const [result] = await db.execute(insertQuery, [nome, status]);
      const novaIntoleranciaId = result.insertId;

      // Buscar a intolerância criada
      const selectQuery = 'SELECT * FROM intolerancias WHERE id = ?';
      const [intolerancias] = await db.execute(selectQuery, [novaIntoleranciaId]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'CREATE', 'intolerancias', {
        id: novaIntoleranciaId,
        nome,
        status
      });

      res.status(201).json(formatResponse(intolerancias[0], 'Intolerância criada com sucesso'));
    } catch (error) {
      console.error('Erro ao criar intolerância:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
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
      const [existing] = await db.execute(checkQuery, [id]);

      if (existing.length === 0) {
        return res.status(404).json(formatResponse(null, 'Intolerância não encontrada', false));
      }

      // Verificar se já existe outra intolerância com o mesmo nome
      if (nome && nome !== existing[0].nome) {
        const nameCheckQuery = 'SELECT id FROM intolerancias WHERE nome = ? AND id != ?';
        const [nameConflict] = await db.execute(nameCheckQuery, [nome, id]);

        if (nameConflict.length > 0) {
          return res.status(400).json(formatResponse(null, 'Já existe uma intolerância com este nome', false));
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (nome !== undefined) updateData.nome = nome;
      if (status !== undefined) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json(formatResponse(null, 'Nenhum dado fornecido para atualização', false));
      }

      // Construir query de atualização dinamicamente
      const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const updateValues = Object.values(updateData);
      updateValues.push(id);

      const updateQuery = `UPDATE intolerancias SET ${updateFields} WHERE id = ?`;
      await db.execute(updateQuery, updateValues);

      // Buscar a intolerância atualizada
      const [intolerancias] = await db.execute(checkQuery, [id]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'UPDATE', 'intolerancias', {
        id: parseInt(id),
        ...updateData
      });

      res.json(formatResponse(intolerancias[0], 'Intolerância atualizada com sucesso'));
    } catch (error) {
      console.error('Erro ao atualizar intolerância:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
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
      const [existing] = await db.execute(checkQuery, [id]);

      if (existing.length === 0) {
        return res.status(404).json(formatResponse(null, 'Intolerância não encontrada', false));
      }

      // Excluir a intolerância
      const deleteQuery = 'DELETE FROM intolerancias WHERE id = ?';
      await db.execute(deleteQuery, [id]);

      // Registrar auditoria
      await logAuditoria(usuarioId, 'DELETE', 'intolerancias', {
        id: parseInt(id),
        nome: existing[0].nome
      });

      res.json(formatResponse(null, 'Intolerância excluída com sucesso'));
    } catch (error) {
      console.error('Erro ao excluir intolerância:', error);
      res.status(500).json(formatResponse(null, 'Erro interno do servidor', false));
    }
  }
}

module.exports = IntoleranciasCRUDController;
