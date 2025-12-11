/**
 * Queries SQL reutilizáveis para Necessidades de Cardápio
 * Separa as queries do controller para melhor manutenibilidade
 */

class NecessidadesCardapioQueries {
  /**
   * Buscar informações básicas do cardápio
   */
  static buscarCardapio(connection, cardapio_id) {
    return connection.execute(
      `SELECT nome, mes_referencia, ano_referencia 
       FROM cardapios 
       WHERE id = ?`,
      [cardapio_id]
    );
  }

  /**
   * Buscar unidades que atendem aos critérios (FILIAL + CENTRO DE CUSTO + CONTRATO + CARDÁPIO)
   */
  static buscarUnidades(connection, { contrato_id, filial_id, centro_custo_id, cardapio_id }) {
    const query = `
      SELECT DISTINCT
        ciu.cozinha_industrial_id AS unidade_id,
        ciu.unidade_nome,
        c.filial_id,
        c.filial_nome,
        c.centro_custo_id,
        c.centro_custo_nome,
        c.id AS contrato_id,
        c.nome AS contrato_nome
      FROM cozinha_industrial_contratos_unidades ciu
      INNER JOIN contratos c ON c.id = ciu.contrato_id
      INNER JOIN cardapios_contratos cc ON cc.contrato_id = c.id
      INNER JOIN cardapios_filiais cf ON cf.cardapio_id = cc.cardapio_id AND cf.filial_id = c.filial_id
      INNER JOIN cardapios_centros_custo ccc ON ccc.cardapio_id = cc.cardapio_id AND ccc.centro_custo_id = c.centro_custo_id
      WHERE ciu.contrato_id = ?
        AND c.filial_id = ?
        AND c.centro_custo_id = ?
        AND cc.cardapio_id = ?
        AND ciu.status = 'ativo'
        AND c.status = 'ativo'
    `;

    return connection.execute(query, [contrato_id, filial_id, centro_custo_id, cardapio_id]);
  }

  /**
   * Buscar períodos de atendimento ativos da unidade escolar
   */
  static buscarPeriodosUnidade(connection, unidade_id) {
    return connection.execute(
      `SELECT 
        pa.id AS periodo_id,
        pa.nome AS periodo_nome
       FROM cozinha_industrial_periodos_atendimento cipa
       INNER JOIN periodos_atendimento pa ON pa.id = cipa.periodo_atendimento_id
       WHERE cipa.cozinha_industrial_id = ?
         AND cipa.status = 'ativo'
         AND pa.status = 'ativo'`,
      [unidade_id]
    );
  }

  /**
   * Verificar se período está habilitado no cardápio
   */
  static verificarPeriodoHabilitado(connection, cardapio_id, periodo_id) {
    return connection.execute(
      `SELECT periodo_atendimento_id 
       FROM cardapios_periodos_atendimento 
       WHERE cardapio_id = ? 
         AND periodo_atendimento_id = ?`,
      [cardapio_id, periodo_id]
    );
  }

  /**
   * Buscar médias de quantidades servidas da unidade
   */
  static buscarMediasUnidade(connection, unidade_id) {
    return connection.execute(
      `SELECT periodo_atendimento_id, media, quantidade_lancamentos, data_calculo
       FROM medias_quantidades_servidas 
       WHERE unidade_id = ?
       ORDER BY data_calculo DESC`,
      [unidade_id]
    );
  }

  /**
   * Buscar pratos do cardápio para um período específico
   */
  static buscarPratosCardapio(connection, cardapio_id, periodo_id) {
    return connection.execute(
      `SELECT 
        cp.id AS cardapio_prato_id,
        cp.data,
        cp.prato_id,
        cp.produto_comercial_id,
        cp.ordem,
        p.nome AS prato_nome,
        pc.nome_comercial AS produto_comercial_nome
       FROM cardapio_pratos cp
       INNER JOIN pratos p ON p.id = cp.prato_id
       LEFT JOIN (
         SELECT DISTINCT produto_comercial_id, nome_comercial
         FROM cardapios_produtos_comerciais
         WHERE cardapio_id = ?
       ) pc ON pc.produto_comercial_id = cp.produto_comercial_id
       WHERE cp.cardapio_id = ?
         AND cp.periodo_atendimento_id = ?
       ORDER BY cp.data, cp.ordem`,
      [cardapio_id, cardapio_id, periodo_id]
    );
  }

  /**
   * Buscar produtos do prato para um centro de custo específico
   */
  static buscarProdutosPrato(connection, prato_id, centro_custo_id) {
    return connection.execute(
      `SELECT 
        pp.id,
        pp.produto_origem_id,
        pp.produto_origem_nome,
        pp.unidade_medida_sigla,
        pp.percapta
       FROM produtos_pratos pp
       WHERE pp.prato_id = ?
         AND pp.centro_custo_id = ?`,
      [prato_id, centro_custo_id]
    );
  }

  /**
   * Buscar informações de filial (cache)
   */
  static buscarFilialInfo(connection, cardapio_id, filial_id) {
    return connection.execute(
      `SELECT filial_nome 
       FROM cardapios_filiais 
       WHERE cardapio_id = ? AND filial_id = ?
       LIMIT 1`,
      [cardapio_id, filial_id]
    );
  }

  /**
   * Buscar informações de centro de custo (cache)
   */
  static buscarCentroCustoInfo(connection, cardapio_id, centro_custo_id) {
    return connection.execute(
      `SELECT centro_custo_nome 
       FROM cardapios_centros_custo 
       WHERE cardapio_id = ? AND centro_custo_id = ?
       LIMIT 1`,
      [cardapio_id, centro_custo_id]
    );
  }

  /**
   * Deletar registros anteriores da mesma combinação
   */
  static deletarNecessidadesAnteriores(connection, { cardapio_id, filial_id, centro_custo_id, contrato_id }) {
    return connection.execute(
      `DELETE FROM necessidades_cardapio 
       WHERE cardapio_id = ? 
         AND filial_id = ? 
         AND centro_custo_id = ? 
         AND contrato_id = ?`,
      [cardapio_id, filial_id, centro_custo_id, contrato_id]
    );
  }

  /**
   * Inserir necessidades em lote
   */
  static inserirNecessidades(connection, values, batchSize = 500) {
    const placeholders = values.map(() => 
      '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).join(', ');
    
    const flatValues = values.flat();
    
    return connection.query(
      `INSERT INTO necessidades_cardapio (
        cardapio_id, cardapio_nome, mes_referencia, ano_referencia,
        filial_id, filial_nome,
        centro_custo_id, centro_custo_nome,
        contrato_id, contrato_nome,
        produto_comercial_id, produto_comercial_nome,
        unidade_id, unidade_nome,
        periodo_atendimento_id, periodo_atendimento_nome,
        data, prato_id, prato_nome,
        produto_id, produto_nome, produto_unidade_medida,
        percapta, media_efetivos, quantidade, ordem, usuario_gerador_id
      ) VALUES ${placeholders}`,
      flatValues
    );
  }

  /**
   * Listar necessidades com filtros e paginação
   */
  static listarNecessidades(connection, { whereClause, params, orderBy, limitInt, offsetInt }) {
    const query = `
      SELECT 
        nc.id,
        nc.cardapio_id,
        nc.cardapio_nome,
        nc.mes_referencia,
        nc.ano_referencia,
        nc.filial_id,
        nc.filial_nome,
        nc.centro_custo_id,
        nc.centro_custo_nome,
        nc.contrato_id,
        nc.contrato_nome,
        nc.produto_comercial_id,
        nc.produto_comercial_nome,
        nc.unidade_id,
        nc.unidade_nome,
        nc.periodo_atendimento_id,
        nc.periodo_atendimento_nome,
        nc.data,
        nc.prato_id,
        nc.prato_nome,
        nc.produto_id,
        nc.produto_nome,
        nc.produto_unidade_medida,
        nc.percapta,
        nc.media_efetivos,
        nc.quantidade,
        nc.ordem,
        nc.data_geracao
      FROM necessidades_cardapio nc
      WHERE ${whereClause}
      ${orderBy}
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    return connection.query(query, params);
  }

  /**
   * Contar total de necessidades (para paginação)
   */
  static contarNecessidades(connection, { whereClause, params }) {
    const query = `
      SELECT COUNT(*) as total
      FROM necessidades_cardapio nc
      WHERE ${whereClause}
    `;

    return connection.query(query, params);
  }

  /**
   * Exportar necessidades em JSON
   */
  static exportarNecessidades(connection, { whereClause, params }) {
    const query = `
      SELECT 
        nc.cardapio_nome AS 'NOME DO CARDÁPIO',
        nc.mes_referencia AS 'MÊS REF.',
        nc.ano_referencia AS 'ANO',
        nc.filial_nome AS 'FILIAL',
        nc.centro_custo_nome AS 'CENTRO DE CUSTO',
        nc.contrato_nome AS 'CONTRATO',
        nc.produto_comercial_nome AS 'TIPO DE CARDÁPIO',
        nc.unidade_nome AS 'UNIDADES ESCOLARES',
        nc.periodo_atendimento_nome AS 'PERÍODO',
        DATE_FORMAT(nc.data, '%d/%m/%Y') AS 'DATA',
        nc.prato_nome AS 'PRATO',
        nc.produto_nome AS 'PRODUTO',
        nc.percapta AS 'PERCAPTA',
        nc.media_efetivos AS 'MEDIA/EFETIVOS',
        nc.quantidade AS 'QUANTIDADE',
        nc.ordem AS 'ORDEM'
      FROM necessidades_cardapio nc
      WHERE ${whereClause}
      ORDER BY nc.data, nc.unidade_nome, nc.periodo_atendimento_nome, nc.ordem
    `;

    return connection.query(query, params);
  }

  /**
   * Excluir necessidade por ID
   */
  static excluirPorId(connection, id) {
    return connection.query('DELETE FROM necessidades_cardapio WHERE id = ?', [id]);
  }

  /**
   * Excluir necessidade por filtros
   */
  static excluirPorFiltros(connection, { cardapio_id, filial_id, centro_custo_id, contrato_id }) {
    return connection.query(
      `DELETE FROM necessidades_cardapio 
       WHERE cardapio_id = ? 
         AND filial_id = ? 
         AND centro_custo_id = ? 
         AND contrato_id = ?`,
      [cardapio_id, filial_id, centro_custo_id, contrato_id]
    );
  }
}

module.exports = NecessidadesCardapioQueries;

