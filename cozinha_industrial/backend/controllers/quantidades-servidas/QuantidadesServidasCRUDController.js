const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Quantidades Servidas (Cozinha Industrial)
 * Sistema de registros diários com períodos de atendimento dinâmicos
 */
class QuantidadesServidasCRUDController {
  
  /**
   * Criar/atualizar registros diários (salva um registro por período de atendimento)
   * @param {Object} req.body - { unidade_id, nutricionista_id, data, quantidades: { periodo_id: valor }, unidade_nome }
   */
  static criar = asyncHandler(async (req, res) => {
    const { unidade_id, nutricionista_id, data, quantidades = {}, unidade_nome } = req.body;
    const usuarioId = req.user?.id;
    
    if (!unidade_id || !data) {
      return errorResponse(
        res,
        'unidade_id e data são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Normalizar quantidades: esperamos um objeto { periodo_id: valor }
    // Exemplo: { "24": 150, "25": 200 } onde 24=ALMOCO, 25=JANTAR
    const quantidadesNormalizadas = {};
    Object.keys(quantidades).forEach(periodoId => {
      const periodoIdNum = parseInt(periodoId);
      const valor = Number(quantidades[periodoId]) || 0;
      if (!isNaN(periodoIdNum) && periodoIdNum > 0) {
        quantidadesNormalizadas[periodoIdNum] = valor;
      }
    });

    // Verificar se é um novo registro (não existe nenhum registro para essa unidade/data)
    const registrosExistentes = await executeQuery(
      'SELECT id FROM quantidades_servidas WHERE unidade_id = ? AND data = ? AND ativo = 1 LIMIT 1',
      [unidade_id, data]
    );
    
    const isNovoRegistro = registrosExistentes.length === 0;

    // Validação: não permitir criar novo registro com todos os valores zero
    if (isNovoRegistro) {
      const valores = Object.values(quantidadesNormalizadas);
      const temValorMaiorQueZero = valores.some(valor => Number(valor) > 0);
      
      if (!temValorMaiorQueZero) {
        return errorResponse(
          res,
          'É necessário informar pelo menos uma quantidade maior que zero para criar um novo registro',
          STATUS_CODES.BAD_REQUEST
        );
      }
    }

    // Validar que os períodos existem
    const periodoIds = Object.keys(quantidadesNormalizadas).map(id => parseInt(id));
    if (periodoIds.length > 0) {
      const placeholders = periodoIds.map(() => '?').join(',');
      const periodosExistentes = await executeQuery(
        `SELECT id FROM periodos_atendimento WHERE id IN (${placeholders}) AND status = 'ativo'`,
        periodoIds
      );
      
      const periodosValidos = new Set(periodosExistentes.map(p => p.id));
      const periodosInvalidos = periodoIds.filter(id => !periodosValidos.has(id));
      
      if (periodosInvalidos.length > 0) {
        return errorResponse(
          res,
          `Períodos inválidos ou inativos: ${periodosInvalidos.join(', ')}`,
          STATUS_CODES.BAD_REQUEST
        );
      }
    }

    const registrosInseridos = [];
    
    // Processar cada período de atendimento
    for (const [periodoIdStr, valor] of Object.entries(quantidadesNormalizadas)) {
      const periodoId = parseInt(periodoIdStr);
      const valorNum = Number(valor) || 0;
      
      // Usar INSERT ... ON DUPLICATE KEY UPDATE para evitar erro de chave duplicada
      // Isso garante que se já existir um registro (ativo ou inativo), ele será atualizado
      const result = await executeQuery(
        `INSERT INTO quantidades_servidas 
         (unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valor, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           valor = VALUES(valor),
           nutricionista_id = VALUES(nutricionista_id),
           unidade_nome = VALUES(unidade_nome),
           ativo = 1,
           atualizado_em = NOW()`,
        [unidade_id, unidade_nome, periodoId, nutricionista_id, data, valorNum]
      );
      
      // Verificar se foi inserção ou atualização
      const registroId = result.insertId || 0;
      
      // Se insertId é 0, significa que foi uma atualização (ON DUPLICATE KEY UPDATE)
      // Nesse caso, precisamos buscar o ID do registro atualizado
      let idFinal = registroId;
      if (registroId === 0) {
        const registroAtualizado = await executeQuery(
          'SELECT id FROM quantidades_servidas WHERE unidade_id = ? AND data = ? AND periodo_atendimento_id = ? LIMIT 1',
          [unidade_id, data, periodoId]
        );
        idFinal = registroAtualizado[0]?.id || 0;
      }
      
      registrosInseridos.push({ 
        id: idFinal, 
        periodo_atendimento_id: periodoId, 
        valor: valorNum, 
        acao: registroId === 0 ? 'atualizado' : 'criado'
      });
    }
    
    // Buscar médias atualizadas para todos os períodos
    const medias = await executeQuery(
      'SELECT * FROM medias_quantidades_servidas WHERE unidade_id = ?',
      [unidade_id]
    );
    
    return successResponse(
      res,
      {
        registros: registrosInseridos,
        medias: medias
      },
      'Registros salvos com sucesso',
      STATUS_CODES.OK
    );
  });
  
  /**
   * Buscar registros de uma unidade em uma data específica
   * Retorna quantidades organizadas por periodo_atendimento_id
   */
  static buscarPorUnidadeData = asyncHandler(async (req, res) => {
    const { unidade_id, data } = req.query;
    
    if (!unidade_id || !data) {
      return errorResponse(
        res,
        'unidade_id e data são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    const registros = await executeQuery(
      `SELECT 
        rd.*,
        pa.nome as periodo_nome,
        pa.codigo as periodo_codigo
      FROM quantidades_servidas rd
      INNER JOIN periodos_atendimento pa ON rd.periodo_atendimento_id = pa.id
      WHERE rd.unidade_id = ? AND rd.data = ? AND rd.ativo = 1
      ORDER BY pa.nome`,
      [unidade_id, data]
    );
    
    // Transformar em objeto com chaves por periodo_atendimento_id
    const quantidades = {};
    
    registros.forEach(reg => {
      quantidades[reg.periodo_atendimento_id] = {
        periodo_atendimento_id: reg.periodo_atendimento_id,
        periodo_nome: reg.periodo_nome,
        periodo_codigo: reg.periodo_codigo,
        valor: reg.valor
      };
    });
    
    return successResponse(
      res,
      {
        registros: registros,
        quantidades: quantidades
      },
      'Registros encontrados com sucesso',
      STATUS_CODES.OK
    );
  });
  
  /**
   * Excluir registros de uma data específica
   */
  static excluir = asyncHandler(async (req, res) => {
    const { unidade_id, data } = req.body;
    
    if (!unidade_id || !data) {
      return errorResponse(
        res,
        'unidade_id e data são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // Soft delete: marcar como inativo
    await executeQuery(
      `UPDATE quantidades_servidas 
       SET ativo = 0, atualizado_em = NOW() 
       WHERE unidade_id = ? AND data = ?`,
      [unidade_id, data]
    );
    
    return successResponse(
      res,
      null,
      'Registros excluídos com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = QuantidadesServidasCRUDController;
