const { executeQuery } = require('../../config/database');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

/**
 * Controller CRUD para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
class TipoAtendimentoEscolaCRUDController {
  /**
   * Criar novo vínculo de tipo de atendimento com escola
   */
  static async criar(req, res) {
    try {
      const {
        escola_id,
        tipo_atendimento,
        ativo = 1
      } = req.body;

      const userId = req.user.id;

      // Validar campos obrigatórios
      if (!escola_id) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios',
          message: 'Escola é obrigatória'
        });
      }

      if (!tipo_atendimento) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios',
          message: 'Tipo de atendimento é obrigatório'
        });
      }

      // Validar tipo de atendimento
      const tiposValidos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial_manha', 'eja', 'parcial_tarde'];
      if (!tiposValidos.includes(tipo_atendimento)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido',
          message: `Tipo de atendimento deve ser um dos seguintes: ${tiposValidos.join(', ')}`
        });
      }

      // Verificar se já existe vínculo ativo para esta escola e tipo
      const vinculoExistente = await executeQuery(
        'SELECT id FROM tipos_atendimento_escola WHERE escola_id = ? AND tipo_atendimento = ? AND ativo = 1',
        [escola_id, tipo_atendimento]
      );

      if (vinculoExistente.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Vínculo já existe',
          message: 'Já existe vínculo ativo para esta escola e tipo de atendimento'
        });
      }

      // Inserir novo vínculo
      const result = await executeQuery(
        `INSERT INTO tipos_atendimento_escola (escola_id, tipo_atendimento, ativo, criado_por, criado_em)
         VALUES (?, ?, ?, ?, NOW())`,
        [escola_id, tipo_atendimento, ativo, userId]
      );

      // Buscar dados completos do vínculo criado
      const novoVinculo = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em,
          e.nome_escola,
          e.rota,
          e.cidade
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        WHERE tae.id = ?`,
        [result.insertId]
      );

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.CREATE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: result.insertId,
        changes: { escola_id, tipo_atendimento, ativo }
      });

      res.status(201).json({
        success: true,
        message: 'Tipo de atendimento vinculado à escola com sucesso',
        data: novoVinculo[0]
      });
    } catch (error) {
      console.error('Erro ao criar vínculo tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao criar vínculo tipo atendimento-escola'
      });
    }
  }

  /**
   * Atualizar vínculo de tipo de atendimento com escola
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        ativo
      } = req.body;

      const userId = req.user.id;

      // Verificar se o vínculo existe
      const vinculoExistente = await executeQuery(
        'SELECT * FROM tipos_atendimento_escola WHERE id = ?',
        [id]
      );

      if (vinculoExistente.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Não encontrado',
          message: 'Vínculo tipo atendimento-escola não encontrado'
        });
      }

      const vinculoAntigo = vinculoExistente[0];

      // Atualizar vínculo
      await executeQuery(
        `UPDATE tipos_atendimento_escola 
         SET ativo = ?, atualizado_por = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [ativo !== undefined ? ativo : vinculoAntigo.ativo, userId, id]
      );

      // Buscar dados atualizados
      const vinculoAtualizado = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em,
          e.nome_escola,
          e.rota,
          e.cidade
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        WHERE tae.id = ?`,
        [id]
      );

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.UPDATE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: id,
        changes: { ativo },
        previous: vinculoAntigo
      });

      res.json({
        success: true,
        message: 'Vínculo tipo atendimento-escola atualizado com sucesso',
        data: vinculoAtualizado[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar vínculo tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao atualizar vínculo tipo atendimento-escola'
      });
    }
  }

  /**
   * Deletar vínculo de tipo de atendimento com escola
   */
  static async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o vínculo existe
      const vinculoExistente = await executeQuery(
        'SELECT * FROM tipos_atendimento_escola WHERE id = ?',
        [id]
      );

      if (vinculoExistente.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Não encontrado',
          message: 'Vínculo tipo atendimento-escola não encontrado'
        });
      }

      // Deletar vínculo
      await executeQuery(
        'DELETE FROM tipos_atendimento_escola WHERE id = ?',
        [id]
      );

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.DELETE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: id,
        previous: vinculoExistente[0]
      });

      res.json({
        success: true,
        message: 'Vínculo tipo atendimento-escola deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar vínculo tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao deletar vínculo tipo atendimento-escola'
      });
    }
  }

  /**
   * Buscar vínculo por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const vinculo = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em,
          e.nome_escola,
          e.rota,
          e.cidade
        FROM tipos_atendimento_escola tae
        LEFT JOIN escolas e ON tae.escola_id = e.id
        WHERE tae.id = ?`,
        [id]
      );

      if (vinculo.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Não encontrado',
          message: 'Vínculo tipo atendimento-escola não encontrado'
        });
      }

      res.json({
        success: true,
        data: vinculo[0]
      });
    } catch (error) {
      console.error('Erro ao buscar vínculo tipo atendimento-escola:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar vínculo tipo atendimento-escola'
      });
    }
  }
}

module.exports = TipoAtendimentoEscolaCRUDController;

