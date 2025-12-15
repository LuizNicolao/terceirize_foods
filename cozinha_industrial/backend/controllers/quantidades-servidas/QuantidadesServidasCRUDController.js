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
    const { unidade_id, nutricionista_id, data, quantidades = {}, unidade_nome, tipo_cardapio_id, tipos_cardapio_quantidades = {} } = req.body;
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
    
    // Normalizar tipos_cardapio_quantidades: esperamos um objeto { "tipo_cardapio_id-produto_id-periodo_id": { tipo_cardapio_id, produto_comercial_id, periodo_atendimento_id, valor } }
    const tiposCardapioQuantidadesNormalizadas = {};
    Object.keys(tipos_cardapio_quantidades).forEach(chave => {
      const item = tipos_cardapio_quantidades[chave];
      if (item && typeof item === 'object' && item.tipo_cardapio_id && item.periodo_atendimento_id) {
        tiposCardapioQuantidadesNormalizadas[chave] = {
          tipo_cardapio_id: parseInt(item.tipo_cardapio_id),
          produto_comercial_id: item.produto_comercial_id ? parseInt(item.produto_comercial_id) : null,
          periodo_atendimento_id: parseInt(item.periodo_atendimento_id),
          valor: Number(item.valor) || 0
        };
      }
    });

    // Verificar se é um novo registro (não existe nenhum registro para essa unidade/data)
    // Considerar tanto quantidades quanto tipos_cardapio_quantidades
    const temQuantidades = Object.keys(quantidadesNormalizadas).length > 0;
    const temTiposCardapioQuantidades = Object.keys(tiposCardapioQuantidadesNormalizadas).length > 0;
    
    if (!temQuantidades && !temTiposCardapioQuantidades) {
      return errorResponse(
        res,
        'É necessário informar pelo menos uma quantidade maior que zero',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // Verificar se é um novo registro (não existe nenhum registro para essa unidade/data)
    const registrosExistentes = await executeQuery(
      'SELECT id FROM quantidades_servidas WHERE unidade_id = ? AND data = ? AND ativo = 1 LIMIT 1',
      [unidade_id, data]
    );
    
    const isNovoRegistro = registrosExistentes.length === 0;

    // Validação: não permitir criar novo registro com todos os valores zero
    if (isNovoRegistro) {
      const valoresPeriodos = Object.values(quantidadesNormalizadas);
      const valoresTiposCardapio = Object.values(tiposCardapioQuantidadesNormalizadas).map(item => item.valor);
      const todosValores = [...valoresPeriodos, ...valoresTiposCardapio];
      const temValorMaiorQueZero = todosValores.some(valor => Number(valor) > 0);
      
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
    
    // Processar cada período de atendimento (sem tipo de cardápio)
    for (const [periodoIdStr, valor] of Object.entries(quantidadesNormalizadas)) {
      const periodoId = parseInt(periodoIdStr);
      const valorNum = Number(valor) || 0;
      
      // Usar INSERT ... ON DUPLICATE KEY UPDATE para evitar erro de chave duplicada
      // Isso garante que se já existir um registro (ativo ou inativo), ele será atualizado
      const result = await executeQuery(
        `INSERT INTO quantidades_servidas 
         (unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valor, tipo_cardapio_id, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           valor = VALUES(valor),
           nutricionista_id = VALUES(nutricionista_id),
           unidade_nome = VALUES(unidade_nome),
           tipo_cardapio_id = VALUES(tipo_cardapio_id),
           ativo = 1,
           atualizado_em = NOW()`,
        [unidade_id, unidade_nome, periodoId, nutricionista_id, data, valorNum, null]
      );
      
      // Verificar se foi inserção ou atualização
      const registroId = result.insertId || 0;
      
      // Se insertId é 0, significa que foi uma atualização (ON DUPLICATE KEY UPDATE)
      // Nesse caso, precisamos buscar o ID do registro atualizado
      let idFinal = registroId;
      if (registroId === 0) {
        const registroAtualizado = await executeQuery(
          'SELECT id FROM quantidades_servidas WHERE unidade_id = ? AND data = ? AND periodo_atendimento_id = ? AND tipo_cardapio_id IS NULL LIMIT 1',
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
    
    // Processar cada tipo de cardápio com produto comercial
    for (const [chave, item] of Object.entries(tiposCardapioQuantidadesNormalizadas)) {
      const { tipo_cardapio_id, produto_comercial_id, periodo_atendimento_id, valor } = item;
      const valorNum = Number(valor) || 0;
      
      // Usar INSERT ... ON DUPLICATE KEY UPDATE para evitar erro de chave duplicada
      // Isso garante que se já existir um registro (ativo ou inativo), ele será atualizado
      const result = await executeQuery(
        `INSERT INTO quantidades_servidas 
         (unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valor, tipo_cardapio_id, produto_comercial_id, ativo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           valor = VALUES(valor),
           nutricionista_id = VALUES(nutricionista_id),
           unidade_nome = VALUES(unidade_nome),
           tipo_cardapio_id = VALUES(tipo_cardapio_id),
           produto_comercial_id = VALUES(produto_comercial_id),
           ativo = 1,
           atualizado_em = NOW()`,
        [unidade_id, unidade_nome, periodo_atendimento_id, nutricionista_id, data, valorNum, tipo_cardapio_id, produto_comercial_id || null]
      );
      
      // Verificar se foi inserção ou atualização
      const registroId = result.insertId || 0;
      
      // Se insertId é 0, significa que foi uma atualização (ON DUPLICATE KEY UPDATE)
      // Nesse caso, precisamos buscar o ID do registro atualizado
      let idFinal = registroId;
      if (registroId === 0) {
        const registroAtualizado = await executeQuery(
          'SELECT id FROM quantidades_servidas WHERE unidade_id = ? AND data = ? AND periodo_atendimento_id = ? AND tipo_cardapio_id = ? AND COALESCE(produto_comercial_id, 0) = COALESCE(?, 0) LIMIT 1',
          [unidade_id, data, periodo_atendimento_id, tipo_cardapio_id, produto_comercial_id || null]
        );
        idFinal = registroAtualizado[0]?.id || 0;
      }
      
      registrosInseridos.push({ 
        id: idFinal, 
        tipo_cardapio_id,
        produto_comercial_id,
        periodo_atendimento_id, 
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
    
    // Buscar TODOS os registros da unidade na data (incluindo todos os tipos de cardápio e produtos)
    let whereClause = 'WHERE rd.unidade_id = ? AND rd.data = ? AND rd.ativo = 1';
    const params = [unidade_id, data];
    
    const registros = await executeQuery(
      `SELECT 
        rd.id,
        rd.unidade_id,
        rd.unidade_nome,
        rd.nutricionista_id,
        rd.data,
        rd.periodo_atendimento_id,
        rd.tipo_cardapio_id,
        rd.produto_comercial_id,
        rd.valor,
        rd.ativo,
        rd.criado_em,
        rd.atualizado_em,
        pa.nome as periodo_nome,
        pa.codigo as periodo_codigo
      FROM quantidades_servidas rd
      INNER JOIN periodos_atendimento pa ON rd.periodo_atendimento_id = pa.id
      ${whereClause}
      ORDER BY pa.nome`,
      params
    );
    
    // Transformar em objeto com chaves por tipo_cardapio_id-produto_comercial_id-periodo_atendimento_id
    // Isso permite diferenciar produtos comerciais diferentes do mesmo tipo de cardápio
    const quantidades = {};
    
    registros.forEach(reg => {
      const tipoCardapioId = reg.tipo_cardapio_id || null;
      const produtoComercialId = reg.produto_comercial_id || null;
      const periodoId = reg.periodo_atendimento_id;
      
      // Criar chave única: tipo_cardapio_id-produto_comercial_id-periodo_atendimento_id
      const chave = tipoCardapioId 
        ? `${tipoCardapioId}-${produtoComercialId || 'sem-produto'}-${periodoId}`
        : `sem-tipo-${produtoComercialId || 'sem-produto'}-${periodoId}`;
      
      quantidades[chave] = {
        tipo_cardapio_id: tipoCardapioId,
        produto_comercial_id: produtoComercialId,
        periodo_atendimento_id: periodoId,
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
    const { unidade_id, data, tipo_cardapio_id } = req.body;
    
    if (!unidade_id || !data) {
      return errorResponse(
        res,
        'unidade_id e data são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }
    
    // Soft delete: marcar como inativo
    // Considerar tipo_cardapio_id se fornecido
    let whereClause = 'WHERE unidade_id = ? AND data = ?';
    const params = [unidade_id, data];
    
    if (tipo_cardapio_id !== undefined && tipo_cardapio_id !== null) {
      whereClause += ' AND COALESCE(tipo_cardapio_id, 0) = ?';
      params.push(parseInt(tipo_cardapio_id));
    } else {
      whereClause += ' AND tipo_cardapio_id IS NULL';
    }
    
    await executeQuery(
      `UPDATE quantidades_servidas 
       SET ativo = 0, atualizado_em = NOW() 
       ${whereClause}`,
      params
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
