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
        cidade: unidade.cidade || '',
        filial_id: unidade.filial_id || null,
        filial_nome: unidade.filial_nome || unidade.filial || unidade.nome_filial || ''
      };
    }
  } catch (error) {
    console.error('Erro ao buscar informações da escola do Foods:', error);
  }

  return {
    id: escolaId,
    nome_escola: '',
    rota: '',
    cidade: '',
    filial_id: null,
    filial_nome: ''
  };
}

/**
 * Normaliza campo tipos_atendimento vindo do banco
 * Aceita JSON, string simples ou nulo
 */
function parseTiposAtendimento(rawTipos) {
  if (!rawTipos) {
    return [];
  }

  if (Array.isArray(rawTipos)) {
    return rawTipos;
  }

  if (typeof rawTipos !== 'string') {
    return [];
  }

  const trimmed = rawTipos.trim();
  if (trimmed === '') {
    return [];
  }

  try {
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (typeof parsed === 'string') {
        return [parsed];
      }
    }
  } catch (error) {
    // Se falhar, cai no fallback abaixo
  }

  // Fallback: tratar como lista separada por vírgula
  return trimmed
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Controller CRUD para Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
class TipoAtendimentoEscolaCRUDController {
  /**
   * Criar novo vínculo de tipo de atendimento com escola
   * Aceita array de tipos ou um único tipo (compatibilidade)
   */
  static async criar(req, res) {
    try {
      const {
        escola_id,
        tipos_atendimento, // Array de tipos (novo formato)
        tipo_atendimento,  // Tipo único (compatibilidade)
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

      // Normalizar tipos: aceitar array ou tipo único
      let tiposArray = [];
      if (tipos_atendimento && Array.isArray(tipos_atendimento)) {
        tiposArray = tipos_atendimento;
      } else if (tipo_atendimento) {
        tiposArray = [tipo_atendimento];
      }

      if (tiposArray.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios',
          message: 'Ao menos um tipo de atendimento é obrigatório'
        });
      }

      // Validar tipos de atendimento
      const tiposValidos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial_manha', 'eja', 'parcial_tarde'];
      const tiposInvalidos = tiposArray.filter(t => !tiposValidos.includes(t));
      if (tiposInvalidos.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Tipo inválido',
          message: `Tipos inválidos: ${tiposInvalidos.join(', ')}. Tipos válidos: ${tiposValidos.join(', ')}`
        });
      }

      // Remover duplicatas
      tiposArray = [...new Set(tiposArray)];

      // Verificar se já existe registro para esta escola
      const vinculoExistente = await executeQuery(
        'SELECT id, tipos_atendimento FROM tipos_atendimento_escola WHERE escola_id = ?',
        [escola_id]
      );

      if (vinculoExistente.length > 0) {
        // Atualizar tipos existentes (adicionar novos tipos sem duplicar)
        const registro = vinculoExistente[0];
        const tiposExistentes = parseTiposAtendimento(registro.tipos_atendimento);
        const tiposCombinados = [...new Set([...tiposExistentes, ...tiposArray])];
        
        await executeQuery(
          `UPDATE tipos_atendimento_escola 
           SET tipos_atendimento = ?, ativo = ?, atualizado_por = ?, atualizado_em = NOW()
           WHERE id = ?`,
          [JSON.stringify(tiposCombinados), ativo, userId, registro.id]
        );

        // Buscar dados atualizados
        const vinculoAtualizado = await executeQuery(
          `SELECT 
            tae.id,
            tae.escola_id,
            tae.tipos_atendimento,
            tae.ativo,
            tae.criado_por,
            tae.criado_em,
            tae.atualizado_em
          FROM tipos_atendimento_escola tae
          WHERE tae.id = ?`,
          [registro.id]
        );

        // Buscar informações da escola via API do Foods
        const authToken = req.headers.authorization;
        const escolaInfo = await buscarInfoEscola(escola_id, authToken);
        const resultado = {
          ...vinculoAtualizado[0],
          tipos_atendimento: parseTiposAtendimento(vinculoAtualizado[0].tipos_atendimento),
          nome_escola: escolaInfo.nome_escola,
          rota: escolaInfo.rota,
          cidade: escolaInfo.cidade,
          filial_id: escolaInfo.filial_id,
          filial_nome: escolaInfo.filial_nome
        };

        // Registrar auditoria
        await auditMiddleware(AUDIT_ACTIONS.UPDATE, req, {
          entity: 'tipos_atendimento_escola',
          entityId: registro.id,
          changes: { tipos_atendimento: tiposCombinados, ativo }
        });

        return res.status(200).json({
          success: true,
          message: 'Tipos de atendimento atualizados com sucesso',
          data: resultado
        });
      }

      // Criar novo registro
      const result = await executeQuery(
        `INSERT INTO tipos_atendimento_escola (escola_id, tipos_atendimento, ativo, criado_por, criado_em)
         VALUES (?, ?, ?, ?, NOW())`,
        [escola_id, JSON.stringify(tiposArray), ativo, userId]
      );

      // Buscar dados completos do vínculo criado
      const novoVinculoQuery = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipos_atendimento,
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
      const novoVinculo = {
        ...novoVinculoQuery[0],
        tipos_atendimento: parseTiposAtendimento(novoVinculoQuery[0].tipos_atendimento),
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade,
        filial_id: escolaInfo.filial_id,
        filial_nome: escolaInfo.filial_nome
      };

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.CREATE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: result.insertId,
        changes: { escola_id, tipos_atendimento: tiposArray, ativo }
      });

      res.status(201).json({
        success: true,
        message: 'Tipos de atendimento vinculados à escola com sucesso',
        data: novoVinculo
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
   * Aceita atualizar tipos_atendimento (array) ou apenas status
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        tipos_atendimento,
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
      const tiposAntigos = parseTiposAtendimento(vinculoAntigo.tipos_atendimento);

      // Validar tipos se fornecidos
      if (tipos_atendimento && Array.isArray(tipos_atendimento)) {
        const tiposValidos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial_manha', 'eja', 'parcial_tarde'];
        const tiposInvalidos = tipos_atendimento.filter(t => !tiposValidos.includes(t));
        if (tiposInvalidos.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Tipo inválido',
            message: `Tipos inválidos: ${tiposInvalidos.join(', ')}`
          });
        }
      }

      // Preparar dados para atualização
      const novosTipos = tipos_atendimento && Array.isArray(tipos_atendimento) 
        ? [...new Set(tipos_atendimento)] 
        : tiposAntigos;
      const novoAtivo = ativo !== undefined ? ativo : vinculoAntigo.ativo;

      // Atualizar vínculo
      await executeQuery(
        `UPDATE tipos_atendimento_escola 
         SET tipos_atendimento = ?, ativo = ?, atualizado_por = ?, atualizado_em = NOW()
         WHERE id = ?`,
        [JSON.stringify(novosTipos), novoAtivo, userId, id]
      );

      // Buscar dados atualizados
      const vinculoAtualizadoQuery = await executeQuery(
        `SELECT 
          tae.id,
          tae.escola_id,
          tae.tipos_atendimento,
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
      const vinculoAtualizado = {
        ...vinculoAtualizadoQuery[0],
        tipos_atendimento: parseTiposAtendimento(vinculoAtualizadoQuery[0].tipos_atendimento),
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade,
        filial_id: escolaInfo.filial_id,
        filial_nome: escolaInfo.filial_nome
      };

      // Registrar auditoria
      await auditMiddleware(AUDIT_ACTIONS.UPDATE, req, {
        entity: 'tipos_atendimento_escola',
        entityId: id,
        changes: { tipos_atendimento: novosTipos, ativo: novoAtivo },
        previous: { ...vinculoAntigo, tipos_atendimento: tiposAntigos }
      });

      res.json({
        success: true,
        message: 'Vínculo tipo atendimento-escola atualizado com sucesso',
        data: vinculoAtualizado
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
          tae.tipos_atendimento,
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
        tipos_atendimento: parseTiposAtendimento(vinculoQuery[0].tipos_atendimento),
        nome_escola: escolaInfo.nome_escola,
        rota: escolaInfo.rota,
        cidade: escolaInfo.cidade,
        filial_id: escolaInfo.filial_id,
        filial_nome: escolaInfo.filial_nome
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

