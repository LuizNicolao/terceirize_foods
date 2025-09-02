const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class EfetivosCRUDController {


  static async criarEfetivo(req, res) {
    try {
      const { unidade_escolar_id } = req.params;
      const { tipo_efetivo, quantidade, intolerancia_id } = req.body;

      // Validações
      if (!tipo_efetivo || !quantidade) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de efetivo e quantidade são obrigatórios'
        });
      }

      if (tipo_efetivo === 'NAE' && !intolerancia_id) {
        return res.status(400).json({
          success: false,
          message: 'Intolerância é obrigatória para efetivos NAE'
        });
      }

      if (tipo_efetivo === 'PADRAO' && intolerancia_id) {
        return res.status(400).json({
          success: false,
          message: 'Efetivos padrão não devem ter intolerância associada'
        });
      }

      if (quantidade <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade deve ser maior que zero'
        });
      }

      // Verificar se a unidade escolar existe
      const [unidade] = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE id = ?',
        [unidade_escolar_id]
      );

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade escolar não encontrada'
        });
      }

      // Verificar se a intolerância existe (se for NAE)
      if (tipo_efetivo === 'NAE' && intolerancia_id) {
        const [intolerancia] = await executeQuery(
          'SELECT id FROM intolerancias WHERE id = ?',
          [intolerancia_id]
        );

        if (!intolerancia) {
          return res.status(404).json({
            success: false,
            message: 'Intolerância não encontrada'
          });
        }
      }

      // Verificar se já existe um efetivo duplicado
      const duplicateQuery = `
        SELECT id 
        FROM efetivos 
        WHERE unidade_escolar_id = ? 
        AND tipo_efetivo = ? 
        AND quantidade = ?
        AND (intolerancia_id = ? OR (intolerancia_id IS NULL AND ? IS NULL))
      `;
      
      const [duplicate] = await executeQuery(duplicateQuery, [
        unidade_escolar_id,
        tipo_efetivo,
        quantidade,
        intolerancia_id,
        intolerancia_id
      ]);

      if (duplicate) {
        return res.status(422).json({
          success: false,
          message: 'Já existe um efetivo com estas características para esta unidade escolar',
          errors: {
            duplicate: ['Efetivo duplicado']
          },
          errorCategories: {
            duplicate: [{ msg: 'Já existe um efetivo com estas características para esta unidade escolar' }]
          }
        });
      }

      // Inserir efetivo
      const insertQuery = `
        INSERT INTO efetivos (unidade_escolar_id, tipo_efetivo, quantidade, intolerancia_id)
        VALUES (?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        unidade_escolar_id,
        tipo_efetivo,
        quantidade,
        intolerancia_id || null
      ]);

      const efetivoId = result.insertId;

      // Buscar efetivo criado
      const [efetivo] = await executeQuery(
        `SELECT 
          e.id,
          e.unidade_escolar_id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.criado_em,
          e.atualizado_em,
          i.nome as intolerancia_nome,
          ue.nome_escola as unidade_escolar_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN unidades_escolares ue ON e.unidade_escolar_id = ue.id
        WHERE e.id = ?`,
        [efetivoId]
      );

              // Registrar auditoria
        await logAction(req.user?.id, 'create', 'efetivos', {
          efetivo_id: efetivoId,
          unidade_escolar_id,
          tipo_efetivo,
          quantidade,
          intolerancia_id
        });

      res.status(201).json({
        success: true,
        message: 'Efetivo criado com sucesso',
        data: efetivo
      });
    } catch (error) {
      console.error('Erro ao criar efetivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async atualizarEfetivo(req, res) {
    try {
      const { id } = req.params;
      const { unidade_escolar_id, tipo_efetivo, quantidade, intolerancia_id } = req.body;

      // Validações
      if (!unidade_escolar_id || !tipo_efetivo || !quantidade) {
        return res.status(400).json({
          success: false,
          message: 'Unidade escolar, tipo de efetivo e quantidade são obrigatórios'
        });
      }

      if (tipo_efetivo === 'NAE' && !intolerancia_id) {
        return res.status(400).json({
          success: false,
          message: 'Intolerância é obrigatória para efetivos NAE'
        });
      }

      if (tipo_efetivo === 'PADRAO' && intolerancia_id) {
        return res.status(400).json({
          success: false,
          message: 'Efetivos padrão não devem ter intolerância associada'
        });
      }

      if (quantidade <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade deve ser maior que zero'
        });
      }

      // Verificar se o efetivo existe
      const [efetivoExistente] = await executeQuery(
        'SELECT * FROM efetivos WHERE id = ?',
        [id]
      );

      if (!efetivoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Efetivo não encontrado'
        });
      }

      // Verificar se a unidade escolar existe
      const [unidade] = await executeQuery(
        'SELECT id FROM unidades_escolares WHERE id = ?',
        [unidade_escolar_id]
      );

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade escolar não encontrada'
        });
      }

      // Verificar se a intolerância existe (se for NAE)
      if (tipo_efetivo === 'NAE' && intolerancia_id) {
        const [intolerancia] = await executeQuery(
          'SELECT id FROM intolerancias WHERE id = ?',
          [intolerancia_id]
        );

        if (!intolerancia) {
          return res.status(404).json({
            success: false,
            message: 'Intolerância não encontrada'
          });
        }
      }

      // Verificar se já existe um efetivo duplicado (excluindo o atual)
      const duplicateQuery = `
        SELECT id 
        FROM efetivos 
        WHERE unidade_escolar_id = ? 
        AND tipo_efetivo = ? 
        AND quantidade = ?
        AND (intolerancia_id = ? OR (intolerancia_id IS NULL AND ? IS NULL))
        AND id != ?
      `;
      
      const [duplicate] = await executeQuery(duplicateQuery, [
        unidade_escolar_id,
        tipo_efetivo,
        quantidade,
        intolerancia_id,
        intolerancia_id,
        id
      ]);

      if (duplicate) {
        return res.status(422).json({
          success: false,
          message: 'Já existe um efetivo com estas características para esta unidade escolar',
          errors: {
            duplicate: ['Efetivo duplicado']
          },
          errorCategories: {
            duplicate: [{ msg: 'Já existe um efetivo com estas características para esta unidade escolar' }]
          }
        });
      }

      // Atualizar efetivo
      const updateQuery = `
        UPDATE efetivos 
        SET unidade_escolar_id = ?, tipo_efetivo = ?, quantidade = ?, intolerancia_id = ?
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [
        unidade_escolar_id,
        tipo_efetivo,
        quantidade,
        intolerancia_id || null,
        id
      ]);

      // Buscar efetivo atualizado
      const [efetivo] = await executeQuery(
        `SELECT 
          e.id,
          e.unidade_escolar_id,
          e.tipo_efetivo,
          e.quantidade,
          e.intolerancia_id,
          e.criado_em,
          e.atualizado_em,
          i.nome as intolerancia_nome,
          ue.nome_escola as unidade_escolar_nome
        FROM efetivos e
        LEFT JOIN intolerancias i ON e.intolerancia_id = i.id
        LEFT JOIN unidades_escolares ue ON e.unidade_escolar_id = ue.id
        WHERE e.id = ?`,
        [id]
      );

              // Registrar auditoria
        await logAction(req.user?.id, 'update', 'efetivos', {
          efetivo_id: id,
          unidade_escolar_id,
          tipo_efetivo,
          quantidade,
          intolerancia_id
        });

      res.json({
        success: true,
        message: 'Efetivo atualizado com sucesso',
        data: efetivo
      });
    } catch (error) {
      console.error('Erro ao atualizar efetivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async excluirEfetivo(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o efetivo existe
      const [efetivo] = await executeQuery(
        'SELECT * FROM efetivos WHERE id = ?',
        [id]
      );

      if (!efetivo) {
        return res.status(404).json({
          success: false,
          message: 'Efetivo não encontrado'
        });
      }

      // Excluir efetivo
      await executeQuery('DELETE FROM efetivos WHERE id = ?', [id]);

              // Registrar auditoria
        await logAction(req.user?.id, 'delete', 'efetivos', {
          efetivo_id: id,
          efetivo_deletado: efetivo
        });

      res.json({
        success: true,
        message: 'Efetivo excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir efetivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = EfetivosCRUDController;
