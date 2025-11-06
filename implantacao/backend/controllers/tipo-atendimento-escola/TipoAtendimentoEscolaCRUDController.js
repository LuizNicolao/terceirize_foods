const { executeQuery } = require('../../config/database');
const { auditMiddleware, AUDIT_ACTIONS } = require('../../utils/audit');

/**
 * Função auxiliar para buscar informações de escola via API do Foods
 */
async function buscarInfoEscola(escolaId, authToken) {
  const axios = require('axios');
  const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';

  try {
    const response = await axios.get(`${foodsApiUrl}/unidades-escolares/${escolaId}`, {
      headers: {
        'Authorization': `Bearer ${authToken?.replace('Bearer ', '') || ''}`
      },
      timeout: 5000
    });

    if (response.data && response.data.success && response.data.data) {
      const unidade = response.data.data;
      return {
        id: unidade.id,
        nome_escola: unidade.nome_escola || unidade.nome || '',
        rota: unidade.rota_nome || unidade.rota || '',
        cidade: unidade.cidade || ''
      };
    }
  } catch (error) {
    console.error('Erro ao buscar informações da escola do Foods:', error);
  }

  return {
    id: escolaId,
    nome_escola: '',
    rota: '',
    cidade: ''
  };
}

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
      const novoVinculoQuery = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em
        FROM tipos_atendimento_escola tae
        WHERE tae.id = ?`,
        [result.insertId]
      );

      // Buscar informações da escola via API do Foods
      const authToken = req.headers.authorization;
      const escolaInfo = await buscarInfoEscola(escola_id, authToken);
      const novoVinculo = novoVinculoQuery.map(v => ({
        ...v,
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade
      }));

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.CREATE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: result.insertId,
        changes: { escola_id, tipo_atendimento, ativo }
      });

      res.status(201).json({
        success: true,
        message: 'Tipo de atendimento vinculado à escola com sucesso',
        data: novoVinculo.length > 0 ? novoVinculo[0] : null
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
      const vinculoAtualizadoQuery = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em
        FROM tipos_atendimento_escola tae
        WHERE tae.id = ?`,
        [id]
      );

      // Buscar informações da escola via API do Foods
      const authToken = req.headers.authorization;
      const escolaInfo = await buscarInfoEscola(vinculoAntigo.escola_id, authToken);
      const vinculoAtualizado = vinculoAtualizadoQuery.map(v => ({
        ...v,
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade
      }));

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
        data: vinculoAtualizado.length > 0 ? vinculoAtualizado[0] : null
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

      const vinculoQuery = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipo_atendimento,
          tae.ativo,
          tae.criado_por,
          tae.criado_em,
          tae.atualizado_em
        FROM tipos_atendimento_escola tae
        WHERE tae.id = ?`,
        [id]
      );

      if (vinculoQuery.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Não encontrado',
          message: 'Vínculo tipo atendimento-escola não encontrado'
        });
      }

      // Buscar informações da escola via API do Foods
      const authToken = req.headers.authorization;
      const escolaInfo = await buscarInfoEscola(vinculoQuery[0].escola_id, authToken);
      const vinculo = {
        ...vinculoQuery[0],
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade
      };

      res.json({
        success: true,
        data: vinculo
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

