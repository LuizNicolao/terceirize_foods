const { executeQuery, pool } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para Geração de Necessidade de Cardápios
 * Processa filtros e popula a tabela relacional necessidades_cardapio
 */
class NecessidadesCardapioController {
  /**
   * Gerar necessidade baseada nos filtros
   * POST /cardapios/gerar-necessidade
   */
  static gerar = asyncHandler(async (req, res) => {
    const {
      cardapio_id,
      filial_id,
      centro_custo_id,
      contrato_id,
      usuario_id
    } = req.body;

    // Validações obrigatórias
    if (!cardapio_id) {
      return errorResponse(res, 'cardapio_id é obrigatório', STATUS_CODES.BAD_REQUEST);
    }

    if (!filial_id || !centro_custo_id || !contrato_id) {
      return errorResponse(res, 'filial_id, centro_custo_id e contrato_id são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Buscar informações do cardápio
      const cardapioInfo = await connection.execute(
        `SELECT nome, mes_referencia, ano_referencia 
         FROM cardapios 
         WHERE id = ?`,
        [cardapio_id]
      );

      if (cardapioInfo[0].length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Cardápio não encontrado', STATUS_CODES.NOT_FOUND);
      }

      const cardapio = cardapioInfo[0][0];

      // 1. Identificar unidades que atendem aos critérios
      // FILIAL + CENTRO DE CUSTO + CONTRATO + CARDÁPIO
      const unidadesQuery = `
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

      const [unidades] = await connection.execute(unidadesQuery, [
        contrato_id,
        filial_id,
        centro_custo_id,
        cardapio_id
      ]);

      if (unidades.length === 0) {
        await connection.rollback();
        return errorResponse(
          res,
          'Nenhuma unidade encontrada que atenda aos critérios especificados',
          STATUS_CODES.NOT_FOUND
        );
      }

      // 2. Deletar registros anteriores da mesma combinação
      await connection.execute(
        `DELETE FROM necessidades_cardapio 
         WHERE cardapio_id = ? 
           AND filial_id = ? 
           AND centro_custo_id = ? 
           AND contrato_id = ?`,
        [cardapio_id, filial_id, centro_custo_id, contrato_id]
      );

      // 3. Para cada unidade, buscar períodos, pratos, produtos e calcular quantidades
      const insercoes = [];

      for (const unidade of unidades) {
        // Buscar períodos de atendimento da unidade
        const [periodos] = await connection.execute(
          `SELECT 
            pa.id AS periodo_id,
            pa.nome AS periodo_nome
           FROM cozinha_industrial_periodos_atendimento cipa
           INNER JOIN periodos_atendimento pa ON pa.id = cipa.periodo_atendimento_id
           WHERE cipa.cozinha_industrial_id = ?
             AND cipa.status = 'ativo'
             AND pa.status = 'ativo'`,
          [unidade.unidade_id]
        );

        // Verificar se o período está vinculado ao cardápio
        const [periodosCardapio] = await connection.execute(
          `SELECT periodo_atendimento_id 
           FROM cardapios_periodos_atendimento 
           WHERE cardapio_id = ?`,
          [cardapio_id]
        );
        
        const periodosCardapioIds = periodosCardapio.map(p => p.periodo_atendimento_id);
        const periodosFiltrados = periodos.filter(p => periodosCardapioIds.includes(p.periodo_id));

        for (const periodo of periodosFiltrados) {
          // Buscar pratos do cardápio para este período
          const [pratos] = await connection.execute(
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
             LEFT JOIN cardapios_produtos_comerciais cpc ON cpc.produto_comercial_id = cp.produto_comercial_id AND cpc.cardapio_id = ?
             LEFT JOIN (
               SELECT DISTINCT produto_comercial_id, nome_comercial
               FROM cardapios_produtos_comerciais
               WHERE cardapio_id = ?
             ) pc ON pc.produto_comercial_id = cp.produto_comercial_id
             WHERE cp.cardapio_id = ?
             ORDER BY cp.data, cp.ordem`,
            [cardapio_id, cardapio_id, cardapio_id]
          );

          // Buscar média/efetivos para esta unidade e período
          const [medias] = await connection.execute(
            `SELECT media 
             FROM medias_quantidades_servidas 
             WHERE unidade_id = ? 
               AND periodo_atendimento_id = ?
             LIMIT 1`,
            [unidade.unidade_id, periodo.periodo_id]
          );

          const mediaEfetivos = medias.length > 0 ? medias[0].media : 0;

          for (const prato of pratos) {
            // Buscar produtos do prato para o centro de custo
            const [produtos] = await connection.execute(
              `SELECT 
                pp.id,
                pp.produto_origem_id,
                pp.produto_origem_nome,
                pp.unidade_medida_sigla,
                pp.percapta
               FROM produtos_pratos pp
               WHERE pp.prato_id = ?
                 AND pp.centro_custo_id = ?`,
              [prato.prato_id, unidade.centro_custo_id]
            );

            for (const produto of produtos) {
              // Calcular quantidade: MEDIA × PERCAPTA
              const quantidade = (mediaEfetivos * parseFloat(produto.percapta || 0)).toFixed(3);

              // Buscar informações de filial e centro de custo (cache)
              const [filialInfo] = await connection.execute(
                `SELECT filial_nome 
                 FROM cardapios_filiais 
                 WHERE cardapio_id = ? AND filial_id = ?
                 LIMIT 1`,
                [cardapio_id, unidade.filial_id]
              );

              const [centroCustoInfo] = await connection.execute(
                `SELECT centro_custo_nome 
                 FROM cardapios_centros_custo 
                 WHERE cardapio_id = ? AND centro_custo_id = ?
                 LIMIT 1`,
                [cardapio_id, unidade.centro_custo_id]
              );

              insercoes.push({
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
                quantidade: parseFloat(quantidade),
                ordem: prato.ordem,
                usuario_gerador_id: usuario_id || null
              });
            }
          }
        }
      }

      // 4. Inserir todos os registros de uma vez (batch insert)
      if (insercoes.length > 0) {
        const insertQuery = `
          INSERT INTO necessidades_cardapio (
            cardapio_id, cardapio_nome, mes_referencia, ano_referencia,
            filial_id, filial_nome,
            centro_custo_id, centro_custo_nome,
            contrato_id, contrato_nome,
            produto_comercial_id, produto_comercial_nome,
            unidade_id, unidade_nome,
            periodo_atendimento_id, periodo_atendimento_nome,
            data, prato_id, prato_nome,
            produto_id, produto_nome, produto_unidade_medida,
            percapta, media_efetivos, quantidade, ordem,
            usuario_gerador_id
          ) VALUES ?
        `;

        const values = insercoes.map(item => [
          item.cardapio_id, item.cardapio_nome, item.mes_referencia, item.ano_referencia,
          item.filial_id, item.filial_nome,
          item.centro_custo_id, item.centro_custo_nome,
          item.contrato_id, item.contrato_nome,
          item.produto_comercial_id, item.produto_comercial_nome,
          item.unidade_id, item.unidade_nome,
          item.periodo_atendimento_id, item.periodo_atendimento_nome,
          item.data, item.prato_id, item.prato_nome,
          item.produto_id, item.produto_nome, item.produto_unidade_medida,
          item.percapta, item.media_efetivos, item.quantidade, item.ordem,
          item.usuario_gerador_id
        ]);

        // Executar inserção em lotes para melhor performance
        const batchSize = 1000;
        for (let i = 0; i < values.length; i += batchSize) {
          const batch = values.slice(i, i + batchSize);
          await connection.query(insertQuery, [batch]);
        }
      }

      await connection.commit();

      return successResponse(res, {
        message: 'Necessidade gerada com sucesso',
        total_registros: insercoes.length,
        filtros: {
          cardapio_id,
          filial_id,
          centro_custo_id,
          contrato_id
        }
      }, STATUS_CODES.CREATED);

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao gerar necessidade:', error);
      return errorResponse(res, 'Erro ao gerar necessidade: ' + error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    } finally {
      connection.release();
    }
  });

  /**
   * Listar necessidades geradas (da tabela relacional)
   * GET /cardapios/necessidades
   */
  static listar = asyncHandler(async (req, res) => {
    const {
      cardapio_id,
      filial_id,
      centro_custo_id,
      contrato_id,
      unidade_id,
      periodo_atendimento_id,
      produto_id,
      data_inicio,
      data_fim
    } = req.query;

    const pagination = req.pagination || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || pagination.limit || 50;
    const offset = (page - 1) * limit;

    try {
      // Construir WHERE clause
      let whereConditions = ['1=1'];
      const params = [];

      if (cardapio_id) {
        whereConditions.push('cardapio_id = ?');
        params.push(cardapio_id);
      }

      if (filial_id) {
        whereConditions.push('filial_id = ?');
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereConditions.push('centro_custo_id = ?');
        params.push(centro_custo_id);
      }

      if (contrato_id) {
        whereConditions.push('contrato_id = ?');
        params.push(contrato_id);
      }

      if (unidade_id) {
        whereConditions.push('unidade_id = ?');
        params.push(unidade_id);
      }

      if (periodo_atendimento_id) {
        whereConditions.push('periodo_atendimento_id = ?');
        params.push(periodo_atendimento_id);
      }

      if (produto_id) {
        whereConditions.push('produto_id = ?');
        params.push(produto_id);
      }

      if (data_inicio) {
        whereConditions.push('data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('data <= ?');
        params.push(data_fim);
      }

      const whereClause = whereConditions.join(' AND ');

      // Contar total
      const [countResult] = await executeQuery(
        `SELECT COUNT(*) as total FROM necessidades_cardapio WHERE ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      // Buscar registros
      const registros = await executeQuery(
        `SELECT 
          id,
          cardapio_id,
          cardapio_nome,
          mes_referencia,
          ano_referencia,
          filial_id,
          filial_nome,
          centro_custo_id,
          centro_custo_nome,
          contrato_id,
          contrato_nome,
          produto_comercial_id,
          produto_comercial_nome,
          unidade_id,
          unidade_nome,
          periodo_atendimento_id,
          periodo_atendimento_nome,
          data,
          prato_id,
          prato_nome,
          produto_id,
          produto_nome,
          produto_unidade_medida,
          percapta,
          media_efetivos,
          quantidade,
          ordem,
          data_geracao
         FROM necessidades_cardapio
         WHERE ${whereClause}
         ORDER BY data, unidade_nome, periodo_atendimento_nome, ordem, prato_nome
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return successResponse(res, {
        data: registros,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar necessidades:', error);
      return errorResponse(res, 'Erro ao listar necessidades: ' + error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });

  /**
   * Exportar necessidades em JSON
   * GET /cardapios/necessidades/exportar/json
   */
  static exportarJSON = asyncHandler(async (req, res) => {
    const {
      cardapio_id,
      filial_id,
      centro_custo_id,
      contrato_id,
      unidade_id,
      periodo_atendimento_id,
      produto_id,
      data_inicio,
      data_fim
    } = req.query;

    try {
      // Construir WHERE clause (mesma lógica do listar)
      let whereConditions = ['1=1'];
      const params = [];

      if (cardapio_id) {
        whereConditions.push('cardapio_id = ?');
        params.push(cardapio_id);
      }

      if (filial_id) {
        whereConditions.push('filial_id = ?');
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereConditions.push('centro_custo_id = ?');
        params.push(centro_custo_id);
      }

      if (contrato_id) {
        whereConditions.push('contrato_id = ?');
        params.push(contrato_id);
      }

      if (unidade_id) {
        whereConditions.push('unidade_id = ?');
        params.push(unidade_id);
      }

      if (periodo_atendimento_id) {
        whereConditions.push('periodo_atendimento_id = ?');
        params.push(periodo_atendimento_id);
      }

      if (produto_id) {
        whereConditions.push('produto_id = ?');
        params.push(produto_id);
      }

      if (data_inicio) {
        whereConditions.push('data >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('data <= ?');
        params.push(data_fim);
      }

      const whereClause = whereConditions.join(' AND ');

      // Buscar todos os registros
      const registros = await executeQuery(
        `SELECT 
          cardapio_nome AS 'NOME DO CARDÁPIO',
          mes_referencia AS 'MÊS REF.',
          ano_referencia AS 'ANO',
          filial_nome AS 'FILIAL',
          centro_custo_nome AS 'CENTRO DE CUSTO',
          contrato_nome AS 'CONTRATO',
          produto_comercial_nome AS 'TIPO DE CARDÁPIO',
          unidade_nome AS 'UNIDADES ESCOLARES',
          periodo_atendimento_nome AS 'PERÍODO',
          DATE_FORMAT(data, '%d/%m/%Y') AS 'DATA',
          prato_nome AS 'PRATO',
          produto_nome AS 'PRODUTO',
          percapta AS 'PERCAPTA',
          media_efetivos AS 'MEDIA/EFETIVOS',
          quantidade AS 'QUANTIDADE',
          ordem AS 'ORDEM'
         FROM necessidades_cardapio
         WHERE ${whereClause}
         ORDER BY data, unidade_nome, periodo_atendimento_nome, ordem, prato_nome`,
        params
      );

      return successResponse(res, {
        data: registros,
        total: registros.length,
        exportado_em: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao exportar necessidades:', error);
      return errorResponse(res, 'Erro ao exportar necessidades: ' + error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });
}

module.exports = NecessidadesCardapioController;
