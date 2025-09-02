const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class AlmoxarifadoController {
  static async buscarAlmoxarifado(req, res) {
    try {
      const { unidadeEscolarId } = req.params;

      // Verificar se a unidade escolar existe
      const [unidade] = await executeQuery(
        'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
        [unidadeEscolarId]
      );

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade escolar não encontrada'
        });
      }

      // Buscar almoxarifado da unidade escolar
      const [almoxarifado] = await executeQuery(
        `SELECT 
          id,
          unidade_escolar_id,
          nome,
          status,
          created_at,
          updated_at
        FROM almoxarifado_unidades_escolares 
        WHERE unidade_escolar_id = ?`,
        [unidadeEscolarId]
      );

      if (!almoxarifado) {
        return res.status(404).json({
          success: false,
          message: 'Almoxarifado não encontrado para esta unidade escolar'
        });
      }

      res.json({
        success: true,
        data: almoxarifado
      });
    } catch (error) {
      console.error('Erro ao buscar almoxarifado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async criarAlmoxarifado(req, res) {
    try {
      const { unidadeEscolarId } = req.params;
      const { nome, status } = req.body;

      // Validações
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome do almoxarifado é obrigatório'
        });
      }

      // Verificar se a unidade escolar existe
      const [unidade] = await executeQuery(
        'SELECT id, nome_escola FROM unidades_escolares WHERE id = ?',
        [unidadeEscolarId]
      );

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade escolar não encontrada'
        });
      }

      // Verificar se já existe almoxarifado para esta unidade escolar
      const [existing] = await executeQuery(
        'SELECT id FROM almoxarifado_unidades_escolares WHERE unidade_escolar_id = ?',
        [unidadeEscolarId]
      );

      if (existing) {
        return res.status(422).json({
          success: false,
          message: 'Já existe um almoxarifado para esta unidade escolar',
          errors: {
            duplicate: ['Almoxarifado duplicado']
          },
          errorCategories: {
            duplicate: [{ msg: 'Já existe um almoxarifado para esta unidade escolar' }]
          }
        });
      }

      // Inserir almoxarifado
      const insertQuery = `
        INSERT INTO almoxarifado_unidades_escolares 
        (unidade_escolar_id, nome, status)
        VALUES (?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        unidadeEscolarId,
        nome,
        status || 1
      ]);

      const almoxarifadoId = result.insertId;

      // Buscar almoxarifado criado
      const [almoxarifado] = await executeQuery(
        `SELECT 
          id,
          unidade_escolar_id,
          nome,
          status,
          created_at,
          updated_at
        FROM almoxarifado_unidades_escolares 
        WHERE id = ?`,
        [almoxarifadoId]
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'create', 'almoxarifado_unidades_escolares', {
        almoxarifado_id: almoxarifadoId,
        unidade_escolar_id: unidadeEscolarId,
        nome
      });

      res.status(201).json({
        success: true,
        message: 'Almoxarifado criado com sucesso',
        data: almoxarifado
      });
    } catch (error) {
      console.error('Erro ao criar almoxarifado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async atualizarAlmoxarifado(req, res) {
    try {
      const { id } = req.params;
      const { nome, status } = req.body;

      // Verificar se o almoxarifado existe
      const [existing] = await executeQuery(
        'SELECT * FROM almoxarifado_unidades_escolares WHERE id = ?',
        [id]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Almoxarifado não encontrado'
        });
      }

      // Validações
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome do almoxarifado é obrigatório'
        });
      }

      // Atualizar almoxarifado
      const updateQuery = `
        UPDATE almoxarifado_unidades_escolares 
        SET nome = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [
        nome,
        status || existing.status,
        id
      ]);

      // Buscar almoxarifado atualizado
      const [almoxarifado] = await executeQuery(
        `SELECT 
          id,
          unidade_escolar_id,
          nome,
          status,
          created_at,
          updated_at
        FROM almoxarifado_unidades_escolares 
        WHERE id = ?`,
        [id]
      );

      // Registrar auditoria
      await logAction(req.user?.id, 'update', 'almoxarifado_unidades_escolares', {
        almoxarifado_id: id,
        unidade_escolar_id: existing.unidade_escolar_id,
        nome
      });

      res.json({
        success: true,
        message: 'Almoxarifado atualizado com sucesso',
        data: almoxarifado
      });
    } catch (error) {
      console.error('Erro ao atualizar almoxarifado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async excluirAlmoxarifado(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o almoxarifado existe
      const [almoxarifado] = await executeQuery(
        'SELECT * FROM almoxarifado_unidades_escolares WHERE id = ?',
        [id]
      );

      if (!almoxarifado) {
        return res.status(404).json({
          success: false,
          message: 'Almoxarifado não encontrado'
        });
      }

      // Excluir almoxarifado
      await executeQuery('DELETE FROM almoxarifado_unidades_escolares WHERE id = ?', [id]);

      // Registrar auditoria
      await logAction(req.user?.id, 'delete', 'almoxarifado_unidades_escolares', {
        almoxarifado_id: id,
        almoxarifado_deletado: almoxarifado
      });

      res.json({
        success: true,
        message: 'Almoxarifado excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir almoxarifado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AlmoxarifadoController;
