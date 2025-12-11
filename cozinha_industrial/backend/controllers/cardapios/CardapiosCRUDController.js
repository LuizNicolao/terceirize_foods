const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller CRUD de Cardápios
 * Responsável por operações de Create, Update e Delete
 */
class CardapiosCRUDController {
  /**
   * Criar novo cardápio
   */
  static criar = asyncHandler(async (req, res) => {
    const {
      nome,
      mes_referencia,
      ano_referencia,
      numero_semanas = 4,
      filiais = [],
      centros_custo = [],
      contratos = [],
      produtos_comerciais = [],
      periodos_atendimento = [],
      pratos = [] // [{ data, prato_id, produto_comercial_id, ordem }]
    } = req.body;

    const usuarioId = req.user?.id || null;

    // Validações básicas
    if (!nome || !mes_referencia || !ano_referencia) {
      return errorResponse(
        res,
        'Nome, mês e ano de referência são obrigatórios',
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (mes_referencia < 1 || mes_referencia > 12) {
      return errorResponse(
        res,
        'Mês de referência deve estar entre 1 e 12',
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (numero_semanas < 1 || numero_semanas > 5) {
      return errorResponse(
        res,
        'Número de semanas deve estar entre 1 e 5',
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Validar se há pelo menos um contrato ou centro de custo
    if (contratos.length === 0 && centros_custo.length === 0) {
      return errorResponse(
        res,
        'É necessário selecionar pelo menos um contrato ou centro de custo',
        STATUS_CODES.BAD_REQUEST
      );
    }

    try {
      // Inserir cardápio principal
      const cardapioResult = await executeQuery(
        `INSERT INTO cardapios 
         (nome, mes_referencia, ano_referencia, numero_semanas, status, usuario_criador_id, usuario_atualizador_id)
         VALUES (?, ?, ?, ?, 'ativo', ?, ?)`,
        [nome, mes_referencia, ano_referencia, numero_semanas, usuarioId, usuarioId]
      );

      const cardapioId = cardapioResult.insertId;

      // Preparar queries para vínculos
      const queries = [];

      // Vínculos de filiais
      if (filiais.length > 0) {
        filiais.forEach(filial => {
          const filialId = typeof filial === 'object' ? filial.id : filial;
          queries.push({
            sql: `INSERT INTO cardapios_filiais (cardapio_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
            params: [
              cardapioId,
              filialId,
              typeof filial === 'object' ? (filial.nome || null) : null
            ]
          });
        });
      }

      // Vínculos de centros de custo
      if (centros_custo.length > 0) {
        centros_custo.forEach(centroCusto => {
          const centroCustoId = typeof centroCusto === 'object' ? centroCusto.id : centroCusto;
          queries.push({
            sql: `INSERT INTO cardapios_centros_custo (cardapio_id, centro_custo_id, centro_custo_nome) VALUES (?, ?, ?)`,
            params: [
              cardapioId,
              centroCustoId,
              typeof centroCusto === 'object' ? (centroCusto.nome || null) : null
            ]
          });
        });
      }

      // Vínculos de contratos
      if (contratos.length > 0) {
        contratos.forEach(contrato => {
          const contratoId = typeof contrato === 'object' ? contrato.id : contrato;
          queries.push({
            sql: `INSERT INTO cardapios_contratos (cardapio_id, contrato_id) VALUES (?, ?)`,
            params: [cardapioId, contratoId]
          });
        });
      }

      // Vínculos de produtos comerciais
      if (produtos_comerciais.length > 0) {
        produtos_comerciais.forEach(produto => {
          const produtoId = typeof produto === 'object' ? produto.id : produto;
          queries.push({
            sql: `INSERT INTO cardapios_produtos_comerciais 
                  (cardapio_id, produto_comercial_id, nome_comercial, grupo_id, grupo_nome, subgrupo_id, subgrupo_nome, classe_id, classe_nome) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              cardapioId,
              produtoId,
              typeof produto === 'object' ? (produto.nome_comercial || null) : null,
              typeof produto === 'object' ? (produto.grupo_id || null) : null,
              typeof produto === 'object' ? (produto.grupo_nome || null) : null,
              typeof produto === 'object' ? (produto.subgrupo_id || null) : null,
              typeof produto === 'object' ? (produto.subgrupo_nome || null) : null,
              typeof produto === 'object' ? (produto.classe_id || null) : null,
              typeof produto === 'object' ? (produto.classe_nome || null) : null
            ]
          });
        });
      }

      // Vínculos de períodos de atendimento
      if (periodos_atendimento.length > 0) {
        periodos_atendimento.forEach(periodoId => {
          queries.push({
            sql: `INSERT INTO cardapios_periodos_atendimento (cardapio_id, periodo_atendimento_id) VALUES (?, ?)`,
            params: [cardapioId, periodoId]
          });
        });
      }

      // Vínculos de pratos
      if (pratos.length > 0) {
        pratos.forEach(prato => {
          queries.push({
            sql: `INSERT INTO cardapio_pratos 
                  (cardapio_id, data, prato_id, produto_comercial_id, ordem)
                  VALUES (?, ?, ?, ?, ?)`,
            params: [
              cardapioId,
              prato.data,
              prato.prato_id,
              prato.produto_comercial_id || null,
              prato.ordem || 1
            ]
          });
        });
      }

      // Executar todas as queries em transação
      if (queries.length > 0) {
        await executeTransaction(queries);
      }

      // Buscar cardápio completo criado
      const cardapioCompleto = await CardapiosCRUDController.buscarCardapioCompleto(cardapioId);

      return successResponse(
        res,
        cardapioCompleto,
        'Cardápio criado com sucesso',
        STATUS_CODES.CREATED
      );
    } catch (error) {
      console.error('Erro ao criar cardápio:', error);
      return errorResponse(
        res,
        'Erro ao criar cardápio: ' + error.message,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Atualizar cardápio
   */
  static atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      nome,
      mes_referencia,
      ano_referencia,
      numero_semanas,
      status,
      filiais = [],
      centros_custo = [],
      contratos = [],
      produtos_comerciais = [],
      periodos_atendimento = [],
      pratos = []
    } = req.body;

    const usuarioId = req.user?.id || null;

    // Verificar se cardápio existe
    const [cardapioExistente] = await executeQuery(
      `SELECT id FROM cardapios WHERE id = ?`,
      [id]
    );

    if (!cardapioExistente) {
      return notFoundResponse(res, 'Cardápio não encontrado');
    }

    // Validações
    if (mes_referencia && (mes_referencia < 1 || mes_referencia > 12)) {
      return errorResponse(
        res,
        'Mês de referência deve estar entre 1 e 12',
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (numero_semanas && (numero_semanas < 1 || numero_semanas > 5)) {
      return errorResponse(
        res,
        'Número de semanas deve estar entre 1 e 5',
        STATUS_CODES.BAD_REQUEST
      );
    }

    try {
      const queries = [];

      // Atualizar dados básicos do cardápio
      const camposAtualizacao = [];
      const valoresAtualizacao = [];

      if (nome !== undefined) {
        camposAtualizacao.push('nome = ?');
        valoresAtualizacao.push(nome);
      }
      if (mes_referencia !== undefined) {
        camposAtualizacao.push('mes_referencia = ?');
        valoresAtualizacao.push(mes_referencia);
      }
      if (ano_referencia !== undefined) {
        camposAtualizacao.push('ano_referencia = ?');
        valoresAtualizacao.push(ano_referencia);
      }
      if (numero_semanas !== undefined) {
        camposAtualizacao.push('numero_semanas = ?');
        valoresAtualizacao.push(numero_semanas);
      }
      if (status !== undefined) {
        camposAtualizacao.push('status = ?');
        valoresAtualizacao.push(status);
      }

      if (camposAtualizacao.length > 0) {
        camposAtualizacao.push('usuario_atualizador_id = ?');
        valoresAtualizacao.push(usuarioId);
        valoresAtualizacao.push(id);

        queries.push({
          sql: `UPDATE cardapios SET ${camposAtualizacao.join(', ')} WHERE id = ?`,
          params: valoresAtualizacao
        });
      }

      // Remover e recriar vínculos (simplificado)
      // Filiais
      if (filiais !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapios_filiais WHERE cardapio_id = ?`,
          params: [id]
        });
        filiais.forEach(filial => {
          const filialId = typeof filial === 'object' ? filial.id : filial;
          queries.push({
            sql: `INSERT INTO cardapios_filiais (cardapio_id, filial_id, filial_nome) VALUES (?, ?, ?)`,
            params: [
              id,
              filialId,
              typeof filial === 'object' ? (filial.nome || null) : null
            ]
          });
        });
      }

      // Centros de custo
      if (centros_custo !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapios_centros_custo WHERE cardapio_id = ?`,
          params: [id]
        });
        centros_custo.forEach(centroCusto => {
          const centroCustoId = typeof centroCusto === 'object' ? centroCusto.id : centroCusto;
          queries.push({
            sql: `INSERT INTO cardapios_centros_custo (cardapio_id, centro_custo_id, centro_custo_nome) VALUES (?, ?, ?)`,
            params: [
              id,
              centroCustoId,
              typeof centroCusto === 'object' ? (centroCusto.nome || null) : null
            ]
          });
        });
      }

      // Contratos
      if (contratos !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapios_contratos WHERE cardapio_id = ?`,
          params: [id]
        });
        contratos.forEach(contrato => {
          const contratoId = typeof contrato === 'object' ? contrato.id : contrato;
          queries.push({
            sql: `INSERT INTO cardapios_contratos (cardapio_id, contrato_id) VALUES (?, ?)`,
            params: [id, contratoId]
          });
        });
      }

      // Produtos comerciais
      if (produtos_comerciais !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapios_produtos_comerciais WHERE cardapio_id = ?`,
          params: [id]
        });
        produtos_comerciais.forEach(produto => {
          const produtoId = typeof produto === 'object' ? produto.id : produto;
          queries.push({
            sql: `INSERT INTO cardapios_produtos_comerciais 
                  (cardapio_id, produto_comercial_id, nome_comercial, grupo_id, grupo_nome, subgrupo_id, subgrupo_nome, classe_id, classe_nome) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              id,
              produtoId,
              typeof produto === 'object' ? (produto.nome_comercial || null) : null,
              typeof produto === 'object' ? (produto.grupo_id || null) : null,
              typeof produto === 'object' ? (produto.grupo_nome || null) : null,
              typeof produto === 'object' ? (produto.subgrupo_id || null) : null,
              typeof produto === 'object' ? (produto.subgrupo_nome || null) : null,
              typeof produto === 'object' ? (produto.classe_id || null) : null,
              typeof produto === 'object' ? (produto.classe_nome || null) : null
            ]
          });
        });
      }

      // Períodos de atendimento
      if (periodos_atendimento !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapios_periodos_atendimento WHERE cardapio_id = ?`,
          params: [id]
        });
        periodos_atendimento.forEach(periodoId => {
          queries.push({
            sql: `INSERT INTO cardapios_periodos_atendimento (cardapio_id, periodo_atendimento_id) VALUES (?, ?)`,
            params: [id, periodoId]
          });
        });
      }

      // Pratos
      if (pratos !== undefined) {
        queries.push({
          sql: `DELETE FROM cardapio_pratos WHERE cardapio_id = ?`,
          params: [id]
        });
        pratos.forEach(prato => {
          queries.push({
            sql: `INSERT INTO cardapio_pratos 
                  (cardapio_id, data, prato_id, produto_comercial_id, ordem)
                  VALUES (?, ?, ?, ?, ?)`,
            params: [
              id,
              prato.data,
              prato.prato_id,
              prato.produto_comercial_id || null,
              prato.ordem || 1
            ]
          });
        });
      }

      // Executar todas as queries em transação
      if (queries.length > 0) {
        await executeTransaction(queries);
      }

      // Buscar cardápio atualizado
      const cardapioCompleto = await CardapiosCRUDController.buscarCardapioCompleto(id);

      return successResponse(
        res,
        cardapioCompleto,
        'Cardápio atualizado com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao atualizar cardápio:', error);
      return errorResponse(
        res,
        'Erro ao atualizar cardápio: ' + error.message,
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Buscar cardápio por ID
   */
  static buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cardapio = await CardapiosCRUDController.buscarCardapioCompleto(id);

    if (!cardapio) {
      return notFoundResponse(res, 'Cardápio não encontrado');
    }

    return successResponse(
      res,
      cardapio,
      'Cardápio encontrado com sucesso',
      STATUS_CODES.OK
    );
  });

  /**
   * Buscar cardápio completo com todos os vínculos
   */
  static async buscarCardapioCompleto(id) {
    const [cardapio] = await executeQuery(
      `SELECT * FROM cardapios WHERE id = ?`,
      [id]
    );

    if (!cardapio) {
      return null;
    }

    // Buscar filiais
    const filiais = await executeQuery(
      `SELECT 
        cf.filial_id as id,
        COALESCE(cf.filial_nome, f.filial) as nome
       FROM cardapios_filiais cf
       LEFT JOIN foods_db.filiais f ON cf.filial_id = f.id
       WHERE cf.cardapio_id = ?`,
      [id]
    );

    // Buscar centros de custo
    const centrosCusto = await executeQuery(
      `SELECT 
        cc.centro_custo_id as id,
        COALESCE(cc.centro_custo_nome, c.nome) as nome
       FROM cardapios_centros_custo cc
       LEFT JOIN foods_db.centro_custo c ON cc.centro_custo_id = c.id
       WHERE cc.cardapio_id = ?`,
      [id]
    );

    // Buscar contratos
    const contratos = await executeQuery(
      `SELECT ct.contrato_id as id, c.nome
       FROM cardapios_contratos ct
       LEFT JOIN contratos c ON ct.contrato_id = c.id
       WHERE ct.cardapio_id = ?`,
      [id]
    );

    // Buscar produtos comerciais
    const produtosComerciais = await executeQuery(
      `SELECT 
        pc.produto_comercial_id as id,
        COALESCE(pc.nome_comercial, p.nome_comercial) as nome,
        pc.grupo_id,
        pc.grupo_nome,
        pc.subgrupo_id,
        pc.subgrupo_nome,
        pc.classe_id,
        pc.classe_nome
       FROM cardapios_produtos_comerciais pc
       LEFT JOIN foods_db.produto_comercial p ON pc.produto_comercial_id = p.id
       WHERE pc.cardapio_id = ?`,
      [id]
    );

    // Buscar períodos de atendimento
    const periodosAtendimento = await executeQuery(
      `SELECT pa.periodo_atendimento_id as id, p.nome
       FROM cardapios_periodos_atendimento pa
       LEFT JOIN periodos_atendimento p ON pa.periodo_atendimento_id = p.id
       WHERE pa.cardapio_id = ?`,
      [id]
    );

    // Buscar pratos
    const pratos = await executeQuery(
      `SELECT 
        cp.id,
        cp.data,
        cp.prato_id,
        cp.produto_comercial_id,
        cp.ordem,
        p.nome as prato_nome,
        COALESCE(cpc.nome_comercial, pc.nome_comercial) as produto_comercial_nome,
        cpc.grupo_id as produto_comercial_grupo_id,
        cpc.grupo_nome as produto_comercial_grupo_nome,
        cpc.subgrupo_id as produto_comercial_subgrupo_id,
        cpc.subgrupo_nome as produto_comercial_subgrupo_nome,
        cpc.classe_id as produto_comercial_classe_id,
        cpc.classe_nome as produto_comercial_classe_nome
       FROM cardapio_pratos cp
       LEFT JOIN pratos p ON cp.prato_id = p.id
       LEFT JOIN cardapios_produtos_comerciais cpc ON cp.produto_comercial_id = cpc.produto_comercial_id AND cpc.cardapio_id = cp.cardapio_id
       LEFT JOIN foods_db.produto_comercial pc ON cp.produto_comercial_id = pc.id
       WHERE cp.cardapio_id = ?
       ORDER BY cp.data, cp.ordem`,
      [id]
    );

    return {
      ...cardapio,
      filiais: filiais || [],
      centros_custo: centrosCusto || [],
      contratos: contratos || [],
      produtos_comerciais: produtosComerciais || [],
      periodos_atendimento: periodosAtendimento || [],
      pratos: pratos || []
    };
  }

  /**
   * Excluir cardápio
   */
  static excluir = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar se cardápio existe
    const [cardapio] = await executeQuery(
      `SELECT id FROM cardapios WHERE id = ?`,
      [id]
    );

    if (!cardapio) {
      return notFoundResponse(res, 'Cardápio não encontrado');
    }

    // Excluir cardápio (cascade vai excluir vínculos)
    await executeQuery(
      `DELETE FROM cardapios WHERE id = ?`,
      [id]
    );

    return successResponse(
      res,
      null,
      'Cardápio excluído com sucesso',
      STATUS_CODES.OK
    );
  });
}

module.exports = CardapiosCRUDController;

