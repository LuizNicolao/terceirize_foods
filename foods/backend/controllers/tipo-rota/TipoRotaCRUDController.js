/**
 * Controller CRUD de Tipo de Rota
 * Responsável por criar, atualizar e excluir tipos de rota
 * Implementa validação: escola só pode estar em uma rota por grupo
 */

const { executeQuery } = require('../../config/database');

class TipoRotaCRUDController {
  // Criar tipo de rota
  static async criarTipoRota(req, res) {
    try {
      const {
        filial_id,
        grupo_id,
        nome,
        status = 'ativo'
      } = req.body;

      // Validações específicas
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se a filial existe
      const filial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [filial_id]
      );

      if (filial.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada'
        });
      }

      // Verificar se o grupo existe
      const grupo = await executeQuery(
        'SELECT id FROM grupos WHERE id = ?',
        [grupo_id]
      );

      if (grupo.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Grupo não encontrado',
          message: 'O grupo especificado não foi encontrado'
        });
      }

      // Inserir tipo de rota
      const insertQuery = `
        INSERT INTO tipo_rota (
          filial_id, grupo_id, nome, status
        ) VALUES (?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        filial_id,
        grupo_id,
        nome.trim(),
        status
      ]);

      // Buscar tipo de rota criado
      const newTipoRota = await executeQuery(
        `SELECT tr.*, f.filial as filial_nome, g.nome as grupo_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         LEFT JOIN grupos g ON tr.grupo_id = g.id
         WHERE tr.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Tipo de rota criado com sucesso',
        data: newTipoRota[0]
      });

    } catch (error) {
      console.error('Erro ao criar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar o tipo de rota'
      });
    }
  }

  // Atualizar tipo de rota
  static async atualizarTipoRota(req, res) {
    try {
      const { id } = req.params;
      const {
        filial_id,
        grupo_id,
        nome,
        status
      } = req.body;

      // Verificar se o tipo de rota existe
      const existingTipoRota = await executeQuery(
        'SELECT * FROM tipo_rota WHERE id = ?',
        [id]
      );

      if (existingTipoRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado'
        });
      }

      // Validações específicas
      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se a filial existe (se fornecida)
      if (filial_id) {
        const filial = await executeQuery(
          'SELECT id FROM filiais WHERE id = ?',
          [filial_id]
        );

        if (filial.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Filial não encontrada',
            message: 'A filial especificada não foi encontrada'
          });
        }
      }

      // Verificar se o grupo existe (se fornecido)
      const grupoIdParaValidacao = grupo_id || existingTipoRota[0].grupo_id;
      if (grupo_id) {
        const grupo = await executeQuery(
          'SELECT id FROM grupos WHERE id = ?',
          [grupo_id]
        );

        if (grupo.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Grupo não encontrado',
            message: 'O grupo especificado não foi encontrado'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
      }
      if (grupo_id !== undefined) {
        updateFields.push('grupo_id = ?');
        updateParams.push(grupo_id);
      }
      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateParams.push(nome.trim());
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }

      // Sempre atualizar o timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length > 0) {
        updateParams.push(id);
        await executeQuery(
          `UPDATE tipo_rota SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }

      // Buscar tipo de rota atualizado
      const updatedTipoRota = await executeQuery(
        `SELECT tr.*, f.filial as filial_nome, g.nome as grupo_nome
         FROM tipo_rota tr
         LEFT JOIN filiais f ON tr.filial_id = f.id
         LEFT JOIN grupos g ON tr.grupo_id = g.id
         WHERE tr.id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: 'Tipo de rota atualizado com sucesso',
        data: updatedTipoRota[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar o tipo de rota'
      });
    }
  }

  // Excluir tipo de rota
  static async excluirTipoRota(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o tipo de rota existe
      const tipoRota = await executeQuery(
        'SELECT * FROM tipo_rota WHERE id = ?',
        [id]
      );

      if (tipoRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de rota não encontrado',
          message: 'O tipo de rota especificado não foi encontrado'
        });
      }

      // Remover vinculações de unidades escolares (via CASCADE ou manualmente)
      await executeQuery(
        'UPDATE unidades_escolares SET tipo_rota_id = NULL, ordem_entrega = 0 WHERE tipo_rota_id = ?',
        [id]
      );

      // Excluir tipo de rota
      await executeQuery('DELETE FROM tipo_rota WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Tipo de rota excluído com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir tipo de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir o tipo de rota'
      });
    }
  }
}

module.exports = TipoRotaCRUDController;

