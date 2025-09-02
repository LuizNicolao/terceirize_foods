const { executeQuery } = require('../../config/database');
const { auditChangesMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

class IntoleranciasCRUDController {
  static async criarIntolerancia(req, res) {
    try {
      const { nome, status = 'ativo' } = req.body;

      // Verificar se já existe uma intolerância com o mesmo nome
      const checkQuery = 'SELECT id FROM intolerancias WHERE nome = ?';
      const [existing] = await executeQuery(checkQuery, [nome]);

      if (existing) {
        return res.status(422).json({
          success: false,
          message: 'Já existe uma intolerância com este nome',
          errors: {
            nome: ['Já existe uma intolerância com este nome']
          },
          errorCategories: {
            nome: ['duplicate']
          }
        });
      }

      // Inserir nova intolerância
      const insertQuery = `
        INSERT INTO intolerancias (nome, status) 
        VALUES (?, ?)
      `;

      const result = await executeQuery(insertQuery, [nome, status]);
      const intoleranciaId = result.insertId;

      // Buscar a intolerância criada
      const selectQuery = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        FROM intolerancias 
        WHERE id = ?
      `;

      const [intolerancia] = await executeQuery(selectQuery, [intoleranciaId]);

      // Registrar auditoria
      await auditChangesMiddleware(req, res, () => {});

      // Adicionar links HATEOAS
      intolerancia.links = [
        { rel: 'self', href: `/intolerancias/${intolerancia.id}`, method: 'GET' },
        { rel: 'update', href: `/intolerancias/${intolerancia.id}`, method: 'PUT' },
        { rel: 'delete', href: `/intolerancias/${intolerancia.id}`, method: 'DELETE' }
      ];

      res.status(201).json({
        success: true,
        message: 'Intolerância criada com sucesso',
        data: intolerancia
      });
    } catch (error) {
      console.error('Erro ao criar intolerância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async atualizarIntolerancia(req, res) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      // Verificar se a intolerância existe
      const checkQuery = 'SELECT id, nome, status FROM intolerancias WHERE id = ?';
      const [existing] = await executeQuery(checkQuery, [id]);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Intolerância não encontrada'
        });
      }

      // Se está tentando desativar a intolerância, verificar se há efetivos vinculados
      if (status !== undefined && status === 0 && existing.status === 1) {
        const checkEfetivosQuery = `
          SELECT COUNT(*) as total 
          FROM efetivos 
          WHERE intolerancia_id = ? AND status = 1
        `;
        const [efetivosResult] = await executeQuery(checkEfetivosQuery, [id]);
        
        if (efetivosResult.total > 0) {
          return res.status(400).json({
            success: false,
            message: `Não é possível desativar esta intolerância. Ela está vinculada a ${efetivosResult.total} efetivo(s) ativo(s).`
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateParams.push(nome);
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateFields.push('atualizado_em = CURRENT_TIMESTAMP');
      updateParams.push(id);

      const updateQuery = `
        UPDATE intolerancias 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await executeQuery(updateQuery, updateParams);

      // Buscar a intolerância atualizada
      const selectQuery = `
        SELECT 
          id,
          nome,
          status,
          criado_em,
          atualizado_em
        FROM intolerancias 
        WHERE id = ?
      `;

      const [intolerancia] = await executeQuery(selectQuery, [id]);

      // Registrar auditoria
      await auditChangesMiddleware(req, res, () => {});

      // Adicionar links HATEOAS
      intolerancia.links = [
        { rel: 'self', href: `/intolerancias/${intolerancia.id}`, method: 'GET' },
        { rel: 'update', href: `/intolerancias/${intolerancia.id}`, method: 'PUT' },
        { rel: 'delete', href: `/intolerancias/${intolerancia.id}`, method: 'DELETE' }
      ];

      res.json({
        success: true,
        message: 'Intolerância atualizada com sucesso',
        data: intolerancia
      });
    } catch (error) {
      console.error('Erro ao atualizar intolerância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async excluirIntolerancia(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a intolerância existe
      const checkQuery = 'SELECT id, nome FROM intolerancias WHERE id = ?';
      const [existing] = await executeQuery(checkQuery, [id]);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Intolerância não encontrada'
        });
      }

      // Verificar se há efetivos vinculados a esta intolerância
      const checkEfetivosQuery = `
        SELECT COUNT(*) as total 
        FROM efetivos 
        WHERE intolerancia_id = ?
      `;
      const [efetivosResult] = await executeQuery(checkEfetivosQuery, [id]);
      
      if (efetivosResult.total > 0) {
        return res.status(400).json({
          success: false,
          message: `Não é possível excluir esta intolerância. Ela está vinculada a ${efetivosResult.total} efetivo(s).`
        });
      }

      // Excluir a intolerância
      const deleteQuery = 'DELETE FROM intolerancias WHERE id = ?';
      await executeQuery(deleteQuery, [id]);

      // Registrar auditoria
      await auditChangesMiddleware(req, res, () => {});

      res.json({
        success: true,
        message: 'Intolerância excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir intolerância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = IntoleranciasCRUDController;
