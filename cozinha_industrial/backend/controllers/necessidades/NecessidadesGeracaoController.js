const { executeQuery, pool } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller para Geração de Necessidades
 * Processa cálculo e criação de necessidades com cabeçalho + itens
 */
class NecessidadesGeracaoController {
  /**
   * Pré-visualizar necessidade (calcular sem salvar)
   * POST /necessidades/previsualizar
   */
  static previsualizar = asyncHandler(async (req, res) => {
    const {
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id
    } = req.body;

    // Validações obrigatórias
    if (!filial_id || !centro_custo_id || !contrato_id || !cardapio_id) {
      return errorResponse(
        res, 
        'filial_id, centro_custo_id, contrato_id e cardapio_id são obrigatórios', 
        STATUS_CODES.BAD_REQUEST
      );
    }

    try {
      const resultado = await NecessidadesGeracaoController._calcularNecessidade({
        filial_id,
        centro_custo_id,
        contrato_id,
        cardapio_id,
        salvar: false
      });

      return successResponse(res, {
        total_itens: resultado.total_itens || 0,
        cozinhas: resultado.cozinhas || 0,
        itens: resultado.itens || []
      });

    } catch (error) {
      return errorResponse(
        res, 
        error.message || 'Erro ao pré-visualizar necessidade', 
        error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });

  /**
   * Gerar e salvar necessidade
   * POST /necessidades/gerar
   */
  static gerar = asyncHandler(async (req, res) => {
    const {
      filial_id,
      centro_custo_id,
      contrato_id,
      cardapio_id,
      sobrescrever = false
    } = req.body;

    const usuarioId = req.user?.id || null;
    const usuarioNome = req.user?.nome || null;

    // Validações obrigatórias
    if (!filial_id || !centro_custo_id || !contrato_id || !cardapio_id) {
      return errorResponse(
        res, 
        'filial_id, centro_custo_id, contrato_id e cardapio_id são obrigatórios', 
        STATUS_CODES.BAD_REQUEST
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Buscar informações do cardápio
      const [cardapios] = await connection.execute(
        `SELECT nome, mes_referencia, ano_referencia 
         FROM cardapios 
         WHERE id = ?`,
        [cardapio_id]
      );

      if (cardapios.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Cardápio não encontrado', STATUS_CODES.NOT_FOUND);
      }

      const cardapio = cardapios[0];
      const mes_ref = cardapio.mes_referencia;
      const ano = cardapio.ano_referencia;

      // Verificar duplicidade
      const [existentes] = await connection.execute(
        `SELECT id, codigo FROM necessidades 
         WHERE filial_id = ? 
           AND centro_custo_id = ? 
           AND contrato_id = ? 
           AND cardapio_id = ? 
           AND mes_ref = ? 
           AND ano = ?`,
        [filial_id, centro_custo_id, contrato_id, cardapio_id, mes_ref, ano]
      );

      if (existentes.length > 0 && !sobrescrever) {
        await connection.rollback();
        return errorResponse(
          res, 
          {
            message: 'Já existe uma necessidade gerada para esses parâmetros',
            necessidade_existente: {
              id: existentes[0].id,
              codigo: existentes[0].codigo
            },
            params: { filial_id, centro_custo_id, contrato_id, cardapio_id, mes_ref, ano }
          }, 
          STATUS_CODES.CONFLICT
        );
      }

      // Se existe e deve sobrescrever, deletar a anterior
      if (existentes.length > 0 && sobrescrever) {
        await connection.execute(
          `DELETE FROM necessidades WHERE id = ?`,
          [existentes[0].id]
        );
      }

      // Calcular necessidade (sem salvar ainda, apenas para obter os dados)
      const resultado = await NecessidadesGeracaoController._calcularNecessidade({
        filial_id,
        centro_custo_id,
        contrato_id,
        cardapio_id,
        salvar: false,
        connection
      });

      if (!resultado.success) {
        await connection.rollback();
        return errorResponse(
          res,
          resultado.message || 'Erro ao calcular necessidade',
          resultado.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }

      // Obter nomes das unidades (já vem na query principal)
      if (resultado.itens.length === 0) {
        await connection.rollback();
        return errorResponse(
          res,
          'Nenhum item encontrado para gerar a necessidade',
          STATUS_CODES.NOT_FOUND
        );
      }

      // Pegar nomes do primeiro item (todos têm os mesmos valores)
      const primeiroItem = resultado.itens[0];
      const filialNome = primeiroItem.filial_nome || '';
      const centroCustoNome = primeiroItem.centro_custo_nome || '';
      const contratoNome = primeiroItem.contrato_nome || '';

      // Gerar código sequencial
      const [codigoResult] = await connection.execute(
        `CALL sp_gerar_codigo_necessidade(?, @codigo)`,
        [ano]
      );
      const [codigoData] = await connection.execute(`SELECT @codigo as codigo`);
      const codigo = codigoData[0].codigo;

      // Contar cozinhas distintas
      const cozinhasDistintas = new Set(
        resultado.itens.map(item => item.cozinha_industrial_id)
      );

      // Inserir cabeçalho
      const [insertHeader] = await connection.execute(
        `INSERT INTO necessidades (
          codigo, filial_id, filial_nome, centro_custo_id, centro_custo_nome,
          contrato_id, contrato_nome, cardapio_id, cardapio_nome,
          mes_ref, ano, total_cozinhas, total_itens,
          usuario_gerador_id, usuario_gerador_nome, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gerada')`,
        [
          codigo,
          filial_id,
          filialNome,
          centro_custo_id,
          centroCustoNome,
          contrato_id,
          contratoNome,
          cardapio_id,
          cardapio.nome,
          mes_ref,
          ano,
          cozinhasDistintas.size,
          resultado.itens.length,
          usuarioId,
          usuarioNome
        ]
      );

      const necessidadeId = insertHeader.insertId;

      // Preparar itens para inserção
      const itensValues = resultado.itens.map(item => [
        necessidadeId,
        item.nome_docardapio,
        item.mes_ref,
        item.ano,
        item.filial_id,
        item.filial_nome,
        item.centro_custo_id,
        item.centro_custo_nome,
        item.contrato_id,
        item.contrato_nome,
        item.tipo_de_cardapio,
        item.cozinha_industrial_id,
        item.cozinha_industrial_nome,
        item.periodo_atendimento_id,
        item.periodo_nome,
        item.data_consumo,
        item.prato_id,
        item.prato_nome,
        item.produto_id,
        item.produto_nome,
        item.produto_unidade_medida,
        item.percapta,
        item.media_efetivos,
        item.quantidade,
        item.ordem
      ]);

      // Inserir itens em lote
      if (itensValues.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < itensValues.length; i += batchSize) {
          const batch = itensValues.slice(i, i + batchSize);
          await connection.query(
            `INSERT INTO necessidades_itens (
              necessidade_id, nome_docardapio, mes_ref, ano,
              filial_id, filial_nome, centro_custo_id, centro_custo_nome,
              contrato_id, contrato_nome, tipo_de_cardapio,
              cozinha_industrial_id, cozinha_industrial_nome,
              periodo_atendimento_id, periodo_nome,
              data_consumo, prato_id, prato_nome,
              produto_id, produto_nome, produto_unidade_medida,
              percapta, media_efetivos, quantidade, ordem
            ) VALUES ?`,
            [batch]
          );
        }
      }

      await connection.commit();

      // Buscar necessidade criada
      const [necessidades] = await connection.execute(
        `SELECT * FROM necessidades WHERE id = ?`,
        [necessidadeId]
      );

      return successResponse(res, {
        message: 'Necessidade gerada com sucesso',
        data: {
          necessidade: necessidades[0] || null,
          total_itens: resultado.itens.length,
          total_cozinhas: cozinhasDistintas.size
        }
      }, STATUS_CODES.CREATED);

    } catch (error) {
      await connection.rollback();
      return errorResponse(
        res, 
        'Erro ao gerar necessidade: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    } finally {
      connection.release();
    }
  });

  /**
   * Recalcular necessidade existente
   * POST /necessidades/:id/recalcular
   */
  static recalcular = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sobrescrever = true } = req.body;

    const usuarioId = req.user?.id || null;
    const usuarioNome = req.user?.nome || null;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Buscar necessidade existente
      const [necessidades] = await connection.execute(
        `SELECT * FROM necessidades WHERE id = ?`,
        [id]
      );

      if (necessidades.length === 0) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 'Necessidade não encontrada', STATUS_CODES.NOT_FOUND);
      }

      const necessidade = necessidades[0];

      // Validar que todos os campos necessários existem
      if (!necessidade.filial_id || !necessidade.centro_custo_id || !necessidade.contrato_id || !necessidade.cardapio_id) {
        await connection.rollback();
        connection.release();
        return errorResponse(
          res,
          'A necessidade não possui todos os parâmetros necessários para recalcular (filial_id, centro_custo_id, contrato_id ou cardapio_id estão ausentes)',
          STATUS_CODES.BAD_REQUEST
        );
      }

      // Gerar novamente com os mesmos parâmetros
      const resultado = await NecessidadesGeracaoController._calcularNecessidade({
        filial_id: necessidade.filial_id,
        centro_custo_id: necessidade.centro_custo_id,
        contrato_id: necessidade.contrato_id,
        cardapio_id: necessidade.cardapio_id,
        salvar: false, // Não salvar no método _calcularNecessidade, vamos fazer manualmente
        connection
      });

      if (!resultado.success) {
        await connection.rollback();
        return errorResponse(
          res,
          resultado.message || 'Erro ao recalcular necessidade',
          resultado.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR
        );
      }

      // Deletar itens antigos
      await connection.execute(
        `DELETE FROM necessidades_itens WHERE necessidade_id = ?`,
        [id]
      );

      // Atualizar cabeçalho
      const cozinhasDistintas = new Set(
        resultado.itens.map(item => item.cozinha_industrial_id)
      );

      await connection.execute(
        `UPDATE necessidades 
         SET total_cozinhas = ?, 
             total_itens = ?,
             usuario_gerador_id = ?,
             usuario_gerador_nome = ?,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          cozinhasDistintas.size,
          resultado.itens.length,
          usuarioId,
          usuarioNome,
          id
        ]
      );

      // Inserir novos itens
      const itensValues = resultado.itens.map(item => [
        id,
        item.nome_docardapio,
        item.mes_ref,
        item.ano,
        item.filial_id,
        item.filial_nome,
        item.centro_custo_id,
        item.centro_custo_nome,
        item.contrato_id,
        item.contrato_nome,
        item.tipo_de_cardapio,
        item.cozinha_industrial_id,
        item.cozinha_industrial_nome,
        item.periodo_atendimento_id,
        item.periodo_nome,
        item.data_consumo,
        item.prato_id,
        item.prato_nome,
        item.produto_id,
        item.produto_nome,
        item.produto_unidade_medida,
        item.percapta,
        item.media_efetivos,
        item.quantidade,
        item.ordem
      ]);

      if (itensValues.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < itensValues.length; i += batchSize) {
          const batch = itensValues.slice(i, i + batchSize);
          await connection.query(
            `INSERT INTO necessidades_itens (
              necessidade_id, nome_docardapio, mes_ref, ano,
              filial_id, filial_nome, centro_custo_id, centro_custo_nome,
              contrato_id, contrato_nome, tipo_de_cardapio,
              cozinha_industrial_id, cozinha_industrial_nome,
              periodo_atendimento_id, periodo_nome,
              data_consumo, prato_id, prato_nome,
              produto_id, produto_nome, produto_unidade_medida,
              percapta, media_efetivos, quantidade, ordem
            ) VALUES ?`,
            [batch]
          );
        }
      }

      await connection.commit();

      // Buscar necessidade atualizada
      const [necessidadesAtualizadas] = await connection.execute(
        `SELECT * FROM necessidades WHERE id = ?`,
        [id]
      );

      return successResponse(res, {
        message: 'Necessidade recalculada com sucesso',
        data: {
          necessidade: necessidadesAtualizadas[0] || necessidade,
          total_itens: resultado.itens.length,
          total_cozinhas: cozinhasDistintas.size
        }
      });

    } catch (error) {
      await connection.rollback();
      return errorResponse(
        res, 
        'Erro ao recalcular necessidade: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    } finally {
      connection.release();
    }
  });

  /**
   * Método interno para calcular necessidade
   * @private
   */
  static async _calcularNecessidade({
    filial_id,
    centro_custo_id,
    contrato_id,
    cardapio_id,
    salvar = false,
    connection = null
  }) {
    // Validações obrigatórias
    if (!filial_id || !centro_custo_id || !contrato_id || !cardapio_id) {
      throw {
        message: 'filial_id, centro_custo_id, contrato_id e cardapio_id são obrigatórios',
        statusCode: STATUS_CODES.BAD_REQUEST
      };
    }

    const useConnection = connection || pool;
    const needsTransaction = !connection;
    let transactionStarted = false;

    try {
      if (needsTransaction) {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;
      }

      // Garantir que os valores não são undefined
      const cardapioId = cardapio_id;
      const filialId = filial_id;
      const centroCustoId = centro_custo_id;
      const contratoId = contrato_id;

      if (!cardapioId || !filialId || !centroCustoId || !contratoId) {
        throw {
          message: 'Parâmetros inválidos: todos os IDs devem ser fornecidos',
          statusCode: STATUS_CODES.BAD_REQUEST
        };
      }

      // Buscar informações do cardápio
      const [cardapios] = await connection.execute(
        `SELECT nome, mes_referencia, ano_referencia 
         FROM cardapios 
         WHERE id = ?`,
        [cardapioId]
      );

      if (cardapios.length === 0) {
        throw { message: 'Cardápio não encontrado', statusCode: STATUS_CODES.NOT_FOUND };
      }

      const cardapio = cardapios[0];
      const mes_ref = cardapio.mes_referencia;
      const ano = cardapio.ano_referencia;

      // 1. Identificar unidades (cozinhas) que atendem aos critérios
      const [unidades] = await connection.execute(
        `SELECT DISTINCT
          ciu.cozinha_industrial_id AS unidade_id,
          ciu.unidade_nome,
          c.filial_id,
          cf.filial_nome,
          c.centro_custo_id,
          ccc.centro_custo_nome,
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
          AND c.status = 'ativo'`,
        [contratoId, filialId, centroCustoId, cardapioId]
      );

      if (unidades.length === 0) {
        if (transactionStarted) {
          await connection.rollback();
          connection.release();
        }
        throw {
          message: 'Nenhuma cozinha industrial encontrada que atenda aos critérios especificados',
          statusCode: STATUS_CODES.NOT_FOUND
        };
      }

      // 2. Buscar tipos de cardápio (produtos comerciais) vinculados ao cardápio
      const [produtosComerciaisCardapio] = await connection.execute(
        `SELECT DISTINCT 
          produto_comercial_id,
          nome_comercial 
         FROM cardapios_produtos_comerciais 
         WHERE cardapio_id = ?`,
        [cardapioId]
      );

      if (produtosComerciaisCardapio.length === 0) {
        throw {
          message: 'Nenhum produto comercial (tipo de cardápio) vinculado ao cardápio',
          statusCode: STATUS_CODES.BAD_REQUEST
        };
      }

      // 3. Processar cada unidade
      const itens = [];
      const mediasFaltantes = [];

      for (const unidade of unidades) {
        // Buscar períodos da cozinha
        const [periodosCozinha] = await connection.execute(
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

        // Buscar períodos do cardápio
        const [periodosCardapio] = await connection.execute(
          `SELECT periodo_atendimento_id 
           FROM cardapios_periodos_atendimento 
           WHERE cardapio_id = ?`,
          [cardapioId]
        );
        
        const periodosCardapioIds = periodosCardapio.map(p => p.periodo_atendimento_id);
        
        // Filtrar períodos válidos (cozinha E cardápio)
        const periodosValidos = periodosCozinha.filter(p => 
          periodosCardapioIds.includes(p.periodo_id)
        );

        if (periodosValidos.length === 0) {
          continue;
        }

        // Buscar tipos de cardápio vinculados à unidade (cozinha)
        const [tiposCardapioCozinha] = await connection.execute(
          `SELECT 
            tipo_cardapio_id
           FROM cozinha_industrial_tipos_cardapio
           WHERE cozinha_industrial_id = ?
             AND status = 'ativo'`,
          [unidade.unidade_id]
        );

        // Buscar produtos comerciais dos tipos de cardápio vinculados à unidade
        const tiposCardapioIds = tiposCardapioCozinha.map(tc => tc.tipo_cardapio_id);
        let produtosComerciaisCozinha = [];
        
        if (tiposCardapioIds.length > 0) {
          const placeholders = tiposCardapioIds.map(() => '?').join(',');
          const [produtosCozinha] = await connection.execute(
            `SELECT DISTINCT
              tcp.tipo_cardapio_id,
              tcp.produto_comercial_id,
              tcp.produto_comercial_nome
             FROM tipos_cardapio_produtos tcp
             WHERE tcp.tipo_cardapio_id IN (${placeholders})`,
            tiposCardapioIds
          );
          produtosComerciaisCozinha = produtosCozinha;
        }

        // Criar mapa de produtos comerciais da cozinha por tipo_cardapio_id
        const produtosPorTipoCardapio = {};
        produtosComerciaisCozinha.forEach(prod => {
          if (!produtosPorTipoCardapio[prod.tipo_cardapio_id]) {
            produtosPorTipoCardapio[prod.tipo_cardapio_id] = [];
          }
          produtosPorTipoCardapio[prod.tipo_cardapio_id].push({
            produto_comercial_id: prod.produto_comercial_id,
            produto_comercial_nome: prod.produto_comercial_nome
          });
        });

        // Filtrar produtos comerciais válidos (que estão no cardápio E vinculados à unidade)
        const produtosComerciaisValidos = [];
        const produtosCardapioIds = produtosComerciaisCardapio.map(p => p.produto_comercial_id);
        
        produtosComerciaisCozinha.forEach(prodCozinha => {
          if (produtosCardapioIds.includes(prodCozinha.produto_comercial_id)) {
            // Verificar se já não foi adicionado
            const jaExiste = produtosComerciaisValidos.some(
              p => p.produto_comercial_id === prodCozinha.produto_comercial_id && 
                   p.tipo_cardapio_id === prodCozinha.tipo_cardapio_id
            );
            if (!jaExiste) {
              produtosComerciaisValidos.push({
                tipo_cardapio_id: prodCozinha.tipo_cardapio_id,
                produto_comercial_id: prodCozinha.produto_comercial_id,
                produto_comercial_nome: prodCozinha.produto_comercial_nome
              });
            }
          }
        });

        if (produtosComerciaisValidos.length === 0) {
          continue;
        }

        for (const periodo of periodosValidos) {
          // Buscar TODOS os pratos do cardápio
          const [todosPratos] = await connection.execute(
            `SELECT 
              cp.data,
              cp.prato_id,
              cp.produto_comercial_id,
              cp.ordem,
              p.nome AS prato_nome
             FROM cardapio_pratos cp
             INNER JOIN pratos p ON p.id = cp.prato_id
             WHERE cp.cardapio_id = ?
             ORDER BY cp.data, cp.ordem`,
            [cardapioId]
          );

          if (todosPratos.length === 0) {
            continue;
          }

          // Processar cada produto comercial válido (tipo de cardápio vinculado à unidade E ao cardápio)
          for (const produtoValido of produtosComerciaisValidos) {
            const tipoDeCardapio = produtoValido.produto_comercial_nome;

            // Verificar média de efetivos considerando tipo_cardapio_id e produto_comercial_id
            const [medias] = await connection.execute(
              `SELECT media 
               FROM medias_quantidades_servidas 
               WHERE unidade_id = ? 
                 AND periodo_atendimento_id = ?
                 AND tipo_cardapio_id = ?
                 AND produto_comercial_id = ?`,
              [
                unidade.unidade_id, 
                periodo.periodo_id,
                produtoValido.tipo_cardapio_id,
                produtoValido.produto_comercial_id
              ]
            );

            if (medias.length === 0 || !medias[0].media) {
              mediasFaltantes.push({
                cozinha_industrial_id: unidade.unidade_id,
                cozinha_industrial_nome: unidade.unidade_nome,
                periodo_atendimento_id: periodo.periodo_id,
                periodo_nome: periodo.periodo_nome,
                tipo_cardapio_id: produtoValido.tipo_cardapio_id,
                produto_comercial_id: produtoValido.produto_comercial_id,
                tipo_de_cardapio: tipoDeCardapio
              });
              continue;
            }

            const mediaEfetivos = medias[0].media;

            // Usar TODOS os pratos do cardápio para este produto comercial
            for (const prato of todosPratos) {
              // Buscar produtos do prato para o centro de custo
              const [produtos] = await connection.execute(
                `SELECT 
                  pp.produto_origem_id,
                  pp.produto_origem_nome,
                  pp.unidade_medida_sigla,
                  pp.percapta
                 FROM produtos_pratos pp
                 WHERE pp.prato_id = ?
                   AND pp.centro_custo_id = ?`,
                [prato.prato_id, unidade.centro_custo_id]
              );

              if (produtos.length === 0) {
                continue;
              }

              for (const produto of produtos) {
                // Calcular quantidade: MEDIA × PERCAPTA
                const quantidadeBruta = mediaEfetivos * parseFloat(produto.percapta || 0);
                // Arredondar para 3 casas decimais
                const quantidade = Math.round(quantidadeBruta * 1000) / 1000;

                itens.push({
                  nome_docardapio: cardapio.nome,
                  mes_ref,
                  ano,
                  filial_id: unidade.filial_id,
                  filial_nome: unidade.filial_nome,
                  centro_custo_id: unidade.centro_custo_id,
                  centro_custo_nome: unidade.centro_custo_nome,
                  contrato_id: unidade.contrato_id,
                  contrato_nome: unidade.contrato_nome,
                  tipo_de_cardapio: tipoDeCardapio,
                  cozinha_industrial_id: unidade.unidade_id,
                  cozinha_industrial_nome: unidade.unidade_nome,
                  periodo_atendimento_id: periodo.periodo_id,
                  periodo_nome: periodo.periodo_nome,
                  data_consumo: prato.data,
                  prato_id: prato.prato_id,
                  prato_nome: prato.prato_nome,
                  produto_id: produto.produto_origem_id,
                  produto_nome: produto.produto_origem_nome,
                  produto_unidade_medida: produto.unidade_medida_sigla,
                  percapta: parseFloat(produto.percapta),
                  media_efetivos: mediaEfetivos,
                  quantidade,
                  ordem: prato.ordem
                });
              }
            }
          }
        }
      }

      // Se houver médias faltantes, não permite gerar
      if (mediasFaltantes.length > 0) {
        if (transactionStarted) {
          await connection.rollback();
          connection.release();
        }
        
        // Construir mensagem detalhada com as médias faltantes
        const detalhesMedias = mediasFaltantes.map((media, index) => {
          return `${index + 1}. ${media.cozinha_industrial_nome} - ${media.periodo_nome} - ${media.tipo_de_cardapio || 'Tipo de Cardápio ID: ' + media.tipo_cardapio_id}`;
        }).join('\n');
        
        throw {
          message: `Existem médias de efetivos faltantes. A necessidade não pode ser gerada.\n\nMédias faltantes:\n${detalhesMedias}`,
          statusCode: STATUS_CODES.BAD_REQUEST,
          medias_faltantes: mediasFaltantes
        };
      }

      if (transactionStarted) {
        await connection.commit();
        connection.release();
      }

      return {
        success: true,
        itens,
        total_itens: itens.length,
        cozinhas: [...new Set(itens.map(i => i.cozinha_industrial_id))].length
      };

    } catch (error) {
      if (transactionStarted && connection) {
        await connection.rollback();
        connection.release();
      }
      throw error;
    }
  }
}

module.exports = NecessidadesGeracaoController;
