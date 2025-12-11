/**
 * Funções de cálculo e processamento de dados para Necessidades de Cardápio
 * Separa a lógica de cálculo do controller e service
 */

class NecessidadesCardapioCalculations {
  /**
   * Criar mapa de médias por período para acesso rápido
   * @param {Array} medias - Array de médias retornadas do banco
   * @returns {Object} Mapa com periodo_id como chave e dados da média como valor
   */
  static criarMapaMediasPorPeriodo(medias) {
    const mediasPorPeriodo = {};
    
    medias.forEach(m => {
      const periodoId = Number(m.periodo_atendimento_id);
      if (!mediasPorPeriodo[periodoId] || 
          new Date(m.data_calculo) > new Date(mediasPorPeriodo[periodoId].data_calculo)) {
        mediasPorPeriodo[periodoId] = m;
      }
    });
    
    return mediasPorPeriodo;
  }

  /**
   * Obter média de efetivos para um período específico
   * @param {Object} mediasPorPeriodo - Mapa de médias
   * @param {number} periodoId - ID do período
   * @returns {number} Média de efetivos (0 se não encontrada)
   */
  static obterMediaEfetivos(mediasPorPeriodo, periodoId) {
    const periodoIdNum = Number(periodoId);
    
    if (mediasPorPeriodo[periodoIdNum]) {
      const mediaData = mediasPorPeriodo[periodoIdNum];
      if (mediaData.media !== null && mediaData.media !== undefined && mediaData.media !== '') {
        return parseFloat(mediaData.media) || 0;
      }
    }
    
    return 0;
  }

  /**
   * Calcular quantidade (MEDIA × PERCAPTA)
   * @param {number} mediaEfetivos - Média de efetivos
   * @param {number|string} percapta - Percapta do produto
   * @returns {number} Quantidade calculada
   */
  static calcularQuantidade(mediaEfetivos, percapta) {
    return parseFloat((mediaEfetivos * parseFloat(percapta || 0)).toFixed(3));
  }

  /**
   * Montar objeto de necessidade para inserção/preview
   * @param {Object} dados - Dados necessários para montar o objeto
   * @returns {Object} Objeto formatado para inserção
   */
  static montarObjetoNecessidade({
    cardapio_id,
    cardapio,
    unidade,
    periodo,
    prato,
    produto,
    mediaEfetivos,
    quantidade,
    filialInfo = [],
    centroCustoInfo = []
  }) {
    return {
      cardapio_id,
      cardapio_nome: cardapio.nome,
      mes_referencia: cardapio.mes_referencia,
      ano_referencia: cardapio.ano_referencia,
      filial_id: unidade.filial_id,
      filial_nome: filialInfo.length > 0 ? filialInfo[0].filial_nome : unidade.filial_nome,
      centro_custo_id: unidade.centro_custo_id,
      centro_custo_nome: centroCustoInfo.length > 0 ? centroCustoInfo[0].centro_custo_nome : unidade.centro_custo_nome,
      contrato_id: unidade.contrato_id,
      contrato_nome: unidade.contrato_nome,
      produto_comercial_id: prato.produto_comercial_id || 0,
      produto_comercial_nome: prato.produto_comercial_nome || '',
      unidade_id: unidade.unidade_id,
      unidade_nome: unidade.unidade_nome,
      periodo_atendimento_id: periodo.periodo_id,
      periodo_atendimento_nome: periodo.periodo_nome,
      data: prato.data,
      prato_id: prato.prato_id,
      prato_nome: prato.prato_nome,
      produto_id: produto.produto_origem_id,
      produto_nome: produto.produto_origem_nome,
      produto_unidade_medida: produto.unidade_medida_sigla,
      percapta: produto.percapta,
      media_efetivos: mediaEfetivos,
      quantidade: quantidade,
      ordem: prato.ordem
    };
  }

  /**
   * Gerar estatísticas resumidas dos dados
   * @param {Array} dados - Array de dados processados
   * @param {number} totalUnidades - Total de unidades processadas
   * @returns {Object} Objeto com estatísticas resumidas
   */
  static gerarResumo(dados, totalUnidades) {
    return {
      total_registros: dados.length,
      total_unidades: totalUnidades,
      total_periodos: [...new Set(dados.map(r => r.periodo_atendimento_id))].length,
      total_pratos: [...new Set(dados.map(r => r.prato_id))].length,
      total_produtos: [...new Set(dados.map(r => r.produto_id))].length,
      quantidade_total: dados.reduce((sum, r) => sum + (r.quantidade || 0), 0)
    };
  }

  /**
   * Converter valores para inserção em lote
   * @param {Array} insercoes - Array de objetos de necessidade
   * @returns {Array} Array de arrays com valores para inserção
   */
  static converterParaValoresInsercao(insercoes) {
    return insercoes.map(item => [
      item.cardapio_id,
      item.cardapio_nome,
      item.mes_referencia,
      item.ano_referencia,
      item.filial_id,
      item.filial_nome,
      item.centro_custo_id,
      item.centro_custo_nome,
      item.contrato_id,
      item.contrato_nome,
      item.produto_comercial_id,
      item.produto_comercial_nome,
      item.unidade_id,
      item.unidade_nome,
      item.periodo_atendimento_id,
      item.periodo_atendimento_nome,
      item.data,
      item.prato_id,
      item.prato_nome,
      item.produto_id,
      item.produto_nome,
      item.produto_unidade_medida,
      item.percapta,
      item.media_efetivos,
      item.quantidade,
      item.ordem,
      item.usuario_gerador_id
    ]);
  }

  /**
   * Construir cláusula WHERE baseada em filtros
   * @param {Object} filtros - Objeto com filtros
   * @returns {Object} Objeto com whereClause e params
   */
  static construirWhereClause(filtros) {
    const whereConditions = ['1=1'];
    const params = [];

    const campos = [
      'cardapio_id', 'filial_id', 'centro_custo_id', 'contrato_id',
      'produto_comercial_id', 'unidade_id', 'periodo_atendimento_id', 'produto_id'
    ];

    campos.forEach(campo => {
      if (filtros[campo]) {
        whereConditions.push(`nc.${campo} = ?`);
        params.push(filtros[campo]);
      }
    });

    if (filtros.data_inicio) {
      whereConditions.push('nc.data >= ?');
      params.push(filtros.data_inicio);
    }

    if (filtros.data_fim) {
      whereConditions.push('nc.data <= ?');
      params.push(filtros.data_fim);
    }

    return {
      whereClause: whereConditions.join(' AND '),
      params
    };
  }

  /**
   * Construir cláusula ORDER BY com validação
   * @param {string} sortField - Campo para ordenação
   * @param {string} sortDirection - Direção (ASC/DESC)
   * @returns {string} Cláusula ORDER BY
   */
  static construirOrderBy(sortField, sortDirection) {
    const fieldMap = {
      id: 'nc.id',
      cardapio_id: 'nc.cardapio_id',
      cardapio_nome: 'nc.cardapio_nome',
      mes_referencia: 'nc.mes_referencia',
      ano_referencia: 'nc.ano_referencia',
      filial_id: 'nc.filial_id',
      filial_nome: 'nc.filial_nome',
      centro_custo_id: 'nc.centro_custo_id',
      centro_custo_nome: 'nc.centro_custo_nome',
      contrato_id: 'nc.contrato_id',
      contrato_nome: 'nc.contrato_nome',
      produto_comercial_id: 'nc.produto_comercial_id',
      produto_comercial_nome: 'nc.produto_comercial_nome',
      unidade_id: 'nc.unidade_id',
      unidade_nome: 'nc.unidade_nome',
      periodo_atendimento_id: 'nc.periodo_atendimento_id',
      periodo_atendimento_nome: 'nc.periodo_atendimento_nome',
      data: 'nc.data',
      prato_id: 'nc.prato_id',
      prato_nome: 'nc.prato_nome',
      produto_id: 'nc.produto_id',
      produto_nome: 'nc.produto_nome',
      percapta: 'nc.percapta',
      media_efetivos: 'nc.media_efetivos',
      quantidade: 'nc.quantidade',
      ordem: 'nc.ordem',
      data_geracao: 'nc.data_geracao'
    };
    
    const orderByField = fieldMap[sortField] || 'nc.data';
    return `ORDER BY ${orderByField} ${sortDirection}`;
  }
}

module.exports = NecessidadesCardapioCalculations;

