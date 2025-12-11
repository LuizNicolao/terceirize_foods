/**
 * Service para lógica de negócio de Necessidades de Cardápio
 * Centraliza a lógica de processamento separada do controller
 */

const NecessidadesCardapioQueries = require('./NecessidadesCardapioQueries');
const NecessidadesCardapioCalculations = require('./NecessidadesCardapioCalculations');

class NecessidadesCardapioService {
  /**
   * Processar dados de necessidade para preview ou geração
   * @param {Object} connection - Conexão do banco de dados
   * @param {Object} params - Parâmetros de processamento
   * @param {boolean} isPreview - Se é preview (não salva no banco)
   * @returns {Promise<Object>} Objeto com dados processados e resumo
   */
  static async processarDados(connection, { cardapio_id, filial_id, centro_custo_id, contrato_id, usuario_id = null }, isPreview = false) {
    // 1. Buscar informações do cardápio
    const [cardapioInfo] = await NecessidadesCardapioQueries.buscarCardapio(connection, cardapio_id);
    
    if (cardapioInfo.length === 0) {
      throw new Error('Cardápio não encontrado');
    }

    const cardapio = cardapioInfo[0];

    // 2. Buscar unidades que atendem aos critérios
    const [unidades] = await NecessidadesCardapioQueries.buscarUnidades(connection, {
      contrato_id,
      filial_id,
      centro_custo_id,
      cardapio_id
    });

    if (unidades.length === 0) {
      throw new Error('Nenhuma unidade encontrada que atenda aos critérios especificados');
    }

    // 3. Processar dados para cada unidade
    const dados = [];

    for (const unidade of unidades) {
      // 3.1. Buscar períodos de atendimento da unidade (apenas ativos)
      const [periodos] = await NecessidadesCardapioQueries.buscarPeriodosUnidade(connection, unidade.unidade_id);
      
      const periodosFiltrados = periodos.map(p => ({
        periodo_id: Number(p.periodo_id),
        periodo_nome: p.periodo_nome
      }));

      // 3.2. Buscar médias da unidade
      const [todasMediasUnidade] = await NecessidadesCardapioQueries.buscarMediasUnidade(connection, unidade.unidade_id);
      const mediasPorPeriodo = NecessidadesCardapioCalculations.criarMapaMediasPorPeriodo(todasMediasUnidade);

      // 3.3. Processar cada período
      for (const periodo of periodosFiltrados) {
        // Verificar se período está habilitado no cardápio
        const [periodoHabilitado] = await NecessidadesCardapioQueries.verificarPeriodoHabilitado(
          connection, 
          cardapio_id, 
          periodo.periodo_id
        );
        
        if (periodoHabilitado.length === 0) {
          // Período não está habilitado no cardápio, pular
          continue;
        }

        // Obter média para este período
        const mediaEfetivos = NecessidadesCardapioCalculations.obterMediaEfetivos(
          mediasPorPeriodo, 
          periodo.periodo_id
        );

        // 3.4. Buscar pratos do cardápio para este período
        const [pratos] = await NecessidadesCardapioQueries.buscarPratosCardapio(
          connection, 
          cardapio_id, 
          periodo.periodo_id
        );

        // 3.5. Processar cada prato
        for (const prato of pratos) {
          // Buscar produtos do prato
          const [produtos] = await NecessidadesCardapioQueries.buscarProdutosPrato(
            connection, 
            prato.prato_id, 
            unidade.centro_custo_id
          );

          // 3.6. Processar cada produto
          for (const produto of produtos) {
            // Calcular quantidade
            const quantidade = NecessidadesCardapioCalculations.calcularQuantidade(
              mediaEfetivos, 
              produto.percapta
            );

            // Buscar informações de cache (filial e centro de custo)
            const [filialInfo] = await NecessidadesCardapioQueries.buscarFilialInfo(
              connection, 
              cardapio_id, 
              unidade.filial_id
            );

            const [centroCustoInfo] = await NecessidadesCardapioQueries.buscarCentroCustoInfo(
              connection, 
              cardapio_id, 
              unidade.centro_custo_id
            );

            // Montar objeto de necessidade
            const necessidadeObj = NecessidadesCardapioCalculations.montarObjetoNecessidade({
              cardapio_id,
              cardapio,
              unidade,
              periodo,
              prato,
              produto,
              mediaEfetivos,
              quantidade,
              filialInfo,
              centroCustoInfo
            });

            // Adicionar usuario_gerador_id se não for preview
            if (!isPreview && usuario_id) {
              necessidadeObj.usuario_gerador_id = usuario_id;
            }

            dados.push(necessidadeObj);
          }
        }
      }
    }

    // 4. Gerar resumo
    const resumo = NecessidadesCardapioCalculations.gerarResumo(dados, unidades.length);

    return {
      dados,
      resumo,
      unidades_processadas: unidades.length
    };
  }

  /**
   * Gerar preview (calcula sem salvar)
   */
  static async gerarPreview(connection, params) {
    return this.processarDados(connection, params, true);
  }

  /**
   * Gerar necessidade (calcula e salva no banco)
   */
  static async gerarNecessidade(connection, params) {
    const { cardapio_id, filial_id, centro_custo_id, contrato_id } = params;

    // Deletar registros anteriores da mesma combinação
    await NecessidadesCardapioQueries.deletarNecessidadesAnteriores(connection, {
      cardapio_id,
      filial_id,
      centro_custo_id,
      contrato_id
    });

    // Processar dados
    const { dados, resumo, unidades_processadas } = await this.processarDados(connection, params, false);

    // Inserir no banco em lotes
    if (dados.length > 0) {
      const values = NecessidadesCardapioCalculations.converterParaValoresInsercao(dados);
      const batchSize = 500;

      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        await NecessidadesCardapioQueries.inserirNecessidades(connection, batch);
      }
    }

    return {
      registros_inseridos: dados.length,
      unidades_processadas,
      resumo
    };
  }

  /**
   * Listar necessidades com filtros e paginação
   */
  static async listarNecessidades(connection, filtros, paginacao) {
    const { whereClause, params } = NecessidadesCardapioCalculations.construirWhereClause(filtros);
    
    const orderBy = NecessidadesCardapioCalculations.construirOrderBy(
      paginacao.sortField || 'data',
      paginacao.sortDirection || 'ASC'
    );

    const limitInt = parseInt(paginacao.limit) || 50;
    const offsetInt = parseInt(paginacao.offset) || 0;

    // Buscar registros
    const [registros] = await NecessidadesCardapioQueries.listarNecessidades(connection, {
      whereClause,
      params,
      orderBy,
      limitInt,
      offsetInt
    });

    // Contar total
    const [countResult] = await NecessidadesCardapioQueries.contarNecessidades(connection, {
      whereClause,
      params
    });

    const total = countResult[0]?.total || 0;

    return {
      registros,
      paginacao: {
        pagina: paginacao.page || 1,
        limite: limitInt,
        total,
        total_paginas: Math.ceil(total / limitInt)
      }
    };
  }

  /**
   * Exportar necessidades em JSON
   */
  static async exportarNecessidades(connection, filtros) {
    const { whereClause, params } = NecessidadesCardapioCalculations.construirWhereClause(filtros);
    
    const [registros] = await NecessidadesCardapioQueries.exportarNecessidades(connection, {
      whereClause,
      params
    });

    return registros;
  }

  /**
   * Excluir necessidade
   */
  static async excluirNecessidade(connection, { id, filtros }) {
    if (id) {
      const [result] = await NecessidadesCardapioQueries.excluirPorId(connection, id);
      return result.affectedRows || 0;
    } else if (filtros) {
      const [result] = await NecessidadesCardapioQueries.excluirPorFiltros(connection, filtros);
      return result.affectedRows || 0;
    }
    
    throw new Error('É necessário informar o ID ou os filtros para excluir');
  }
}

module.exports = NecessidadesCardapioService;

