const { executeQuery } = require('../../config/database');
const axios = require('axios');

/**
 * Controller para operações CRUD de substituições
 */
class SubstituicoesCRUDController {
  /**
   * Salvar substituição (consolidada ou individual)
   */
  static async salvarSubstituicao(req, res) {
    try {
      const {
        produto_origem_id,
        produto_origem_nome,
        produto_origem_unidade,
        produto_generico_id,
        produto_generico_codigo,
        produto_generico_nome,
        produto_generico_unidade,
        quantidade_origem,
        quantidade_generico,
        escola_id,
        escola_nome,
        semana_abastecimento,
        semana_consumo,
        necessidade_id,
        necessidade_id_grupo,
        escola_ids // Para salvar múltiplas escolas de uma vez (consolidado)
      } = req.body;

      const usuario_id = req.user.id;

      // Validar dados obrigatórios
      if (!produto_origem_id || !produto_generico_id) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: produto origem e produto genérico'
        });
      }

      // Para salvamento consolidado, validar se escola_ids foi fornecido
      if (escola_ids && Array.isArray(escola_ids) && escola_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de escolas não pode estar vazia'
        });
      }

      // Para salvamento individual, validar quantidades
      if (!escola_ids && (!quantidade_origem || !quantidade_generico)) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: quantidades origem e genérico'
        });
      }

      let sucessos = 0;
      let erros = 0;
      const errosDetalhados = [];

      // Se escola_ids for fornecido (salvar consolidado para múltiplas escolas)
      if (escola_ids && Array.isArray(escola_ids) && escola_ids.length > 0) {
        for (const escola_data of escola_ids) {
          try {
            const {
              escola_id: escId,
              escola_nome: escNome,
              quantidade_origem: qtdOrig,
              quantidade_generico: qtdGen,
              necessidade_id: necId
            } = escola_data;

            // Verificar se já existe substituição para esta necessidade
            const existing = await executeQuery(`
              SELECT id FROM necessidades_substituicoes 
              WHERE necessidade_id = ? AND ativo = 1
            `, [necId]);

            let result;
            if (existing.length > 0) {
              // Atualizar existente
              result = await executeQuery(`
                UPDATE necessidades_substituicoes SET
                  produto_generico_id = ?,
                  produto_generico_codigo = ?,
                  produto_generico_nome = ?,
                  produto_generico_unidade = ?,
                  quantidade_origem = ?,
                  quantidade_generico = ?,
                  data_atualizacao = NOW()
                WHERE necessidade_id = ?
              `, [
                produto_generico_id,
                produto_generico_codigo,
                produto_generico_nome,
                produto_generico_unidade,
                qtdOrig,
                qtdGen,
                necId
              ]);
            } else {
              // Buscar grupo e grupo_id da tabela necessidades
              const grupoResult = await executeQuery(`
                SELECT n.grupo, n.grupo_id 
                FROM necessidades n 
                WHERE n.id = ? 
                LIMIT 1
              `, [necId]);
              
              const grupo = grupoResult.length > 0 ? grupoResult[0].grupo : null;
              const grupo_id = grupoResult.length > 0 ? grupoResult[0].grupo_id : null;

              // Criar nova
              result = await executeQuery(`
                INSERT INTO necessidades_substituicoes (
                  necessidade_id, necessidade_id_grupo,
                  produto_origem_id, produto_origem_nome, produto_origem_unidade,
                  produto_generico_id, produto_generico_codigo, produto_generico_nome, produto_generico_unidade,
                  quantidade_origem, quantidade_generico,
                  escola_id, escola_nome,
                  semana_abastecimento, semana_consumo,
                  grupo, grupo_id, usuario_criador_id, status, ativo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'conf', 1)
              `, [
                necId,
                necId, // necessidade_id_grupo usa o mesmo necessidade_id
                produto_origem_id,
                produto_origem_nome,
                produto_origem_unidade,
                produto_generico_id,
                produto_generico_codigo,
                produto_generico_nome,
                produto_generico_unidade,
                qtdOrig,
                qtdGen,
                escId,
                escNome,
                semana_abastecimento,
                semana_consumo,
                grupo,
                grupo_id,
                usuario_id
              ]);
            }

            sucessos++;
          } catch (error) {
            console.error(`Erro ao salvar substituição para escola ${escola_data.escola_id}:`, error);
            erros++;
            errosDetalhados.push({
              escola_id: escola_data.escola_id,
              erro: error.message
            });
          }
        }
      } else {
        // Salvar individual (uma escola)
        try {
          // Verificar se já existe
          const existing = await executeQuery(`
            SELECT id FROM necessidades_substituicoes 
            WHERE necessidade_id = ? AND ativo = 1
          `, [necessidade_id]);

          let result;
          if (existing.length > 0) {
            // Atualizar
            result = await executeQuery(`
              UPDATE necessidades_substituicoes SET
                produto_generico_id = ?,
                produto_generico_codigo = ?,
                produto_generico_nome = ?,
                produto_generico_unidade = ?,
                quantidade_origem = ?,
                quantidade_generico = ?,
                data_atualizacao = NOW()
              WHERE necessidade_id = ?
            `, [
              produto_generico_id,
              produto_generico_codigo,
              produto_generico_nome,
              produto_generico_unidade,
              quantidade_origem,
              quantidade_generico,
              necessidade_id
            ]);
          } else {
            // Criar nova
            result = await executeQuery(`
              INSERT INTO necessidades_substituicoes (
                necessidade_id, necessidade_id_grupo,
                produto_origem_id, produto_origem_nome, produto_origem_unidade,
                produto_generico_id, produto_generico_codigo, produto_generico_nome, produto_generico_unidade,
                quantidade_origem, quantidade_generico,
                escola_id, escola_nome,
                semana_abastecimento, semana_consumo,
                usuario_criador_id, status, ativo
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'conf', 1)
            `, [
              necessidade_id,
              necessidade_id, // necessidade_id_grupo usa o mesmo necessidade_id
              produto_origem_id,
              produto_origem_nome,
              produto_origem_unidade,
              produto_generico_id,
              produto_generico_codigo,
              produto_generico_nome,
              produto_generico_unidade,
              quantidade_origem,
              quantidade_generico,
              escola_id,
              escola_nome,
              semana_abastecimento,
              semana_consumo,
              usuario_id
            ]);
          }

          sucessos++;
        } catch (error) {
          console.error('Erro ao salvar substituição:', error);
          erros++;
          errosDetalhados.push({
            erro: error.message
          });
        }
      }


      res.json({
        success: sucessos > 0,
        message: `${sucessos} substituição(ões) salva(s) com sucesso${erros > 0 ? `, ${erros} erro(s)` : ''}`,
        sucessos,
        erros,
        erros_detalhados: errosDetalhados.length > 0 ? errosDetalhados : undefined
      });

    } catch (error) {
      console.error('Erro ao salvar substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao salvar substituição'
      });
    }
  }

  /**
   * Deletar substituição (soft delete)
   */
  static async deletarSubstituicao(req, res) {
    try {
      const { id } = req.params;

      await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET ativo = 0, data_atualizacao = NOW()
        WHERE id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'Substituição excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao deletar substituição'
      });
    }
  }

  /**
   * Liberar análise (conf → conf log)
   */
  static async liberarAnalise(req, res) {
    const { produto_origem_id, semana_abastecimento, semana_consumo } = req.body;
    const usuario_id = req.user.id;

    if (!produto_origem_id || !semana_abastecimento || !semana_consumo) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios: produto origem, semana abastecimento e semana consumo'
      });
    }

    // Função auxiliar para executar com retry em caso de deadlock
    const executarComRetry = async (maxTentativas = 5) => {
      let ultimoErro = null;
      const { pool } = require('../../config/database');
      
      for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
        const connection = await pool.getConnection();
        
        try {
          // Configurar timeout da transação
          await connection.query('SET SESSION innodb_lock_wait_timeout = 10');
          
          await connection.beginTransaction();

          // Usar SELECT FOR UPDATE para lockar os registros em ordem consistente
          const [rows] = await connection.execute(`
            SELECT id, produto_origem_id, semana_abastecimento, semana_consumo, status
            FROM necessidades_substituicoes
            WHERE produto_origem_id = ? 
              AND semana_abastecimento = ? 
              AND semana_consumo = ?
              AND status = 'conf'
              AND ativo = 1
            ORDER BY id ASC
            FOR UPDATE
          `, [produto_origem_id, semana_abastecimento, semana_consumo]);

          // Atualizar status de 'conf' para 'conf log' para todas as substituições do produto origem
          const [result] = await connection.execute(`
            UPDATE necessidades_substituicoes 
            SET 
              status = 'conf log',
              data_atualizacao = NOW()
            WHERE produto_origem_id = ? 
              AND semana_abastecimento = ? 
              AND semana_consumo = ?
              AND status = 'conf'
              AND ativo = 1
          `, [produto_origem_id, semana_abastecimento, semana_consumo]);

          // Marcar apenas as necessidades que têm substituições registradas como processadas
          await connection.execute(`
            UPDATE necessidades n
            INNER JOIN necessidades_substituicoes ns ON n.id = ns.necessidade_id
            SET n.substituicao_processada = 1 
            WHERE ns.produto_origem_id = ? 
              AND ns.semana_abastecimento = ? 
              AND ns.semana_consumo = ?
              AND ns.status = 'conf log'
              AND ns.ativo = 1
          `, [produto_origem_id, semana_abastecimento, semana_consumo]);

          await connection.commit();
          connection.release();
          
          return result;
        } catch (error) {
          try {
            await connection.rollback();
          } catch (rollbackError) {
            console.error('Erro ao fazer rollback:', rollbackError);
          }
          connection.release();
          
          ultimoErro = error;
          
          // Se for deadlock e ainda temos tentativas, fazer retry
          if (error.code === 'ER_LOCK_DEADLOCK' && tentativa < maxTentativas - 1) {
            // Delay exponencial com jitter: 100ms, 200ms, 400ms, 800ms
            const baseDelay = 100 * Math.pow(2, tentativa);
            const jitter = Math.floor(Math.random() * 100);
            const delay = baseDelay + jitter;
            
            console.warn(`Deadlock detectado na tentativa ${tentativa + 1}/${maxTentativas} (liberarAnalise). Aguardando ${delay}ms antes de tentar novamente...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Se não for deadlock ou esgotaram as tentativas, lançar erro
          throw error;
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      throw ultimoErro || new Error('Falha ao executar operação após múltiplas tentativas');
    };

    try {
      const result = await executarComRetry();

      res.json({
        success: true,
        message: 'Análise liberada com sucesso',
        affectedRows: result.affectedRows
      });

    } catch (error) {
      console.error('Erro ao liberar análise:', error);
      
      // Mensagem mais amigável para deadlock
      if (error.code === 'ER_LOCK_DEADLOCK') {
        return res.status(409).json({
          success: false,
          message: 'Conflito ao processar. Por favor, tente novamente em alguns instantes.',
          error: 'Deadlock detectado - operação pode ser tentada novamente'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao liberar análise'
      });
    }
  }

  static async trocarProdutoOrigem(req, res) {
    try {
      const { necessidade_ids, novo_produto_id } = req.body;

      if (!Array.isArray(necessidade_ids) || necessidade_ids.length === 0 || !novo_produto_id) {
        return res.status(400).json({
          success: false,
          message: 'Necessidade(s) e novo produto são obrigatórios.'
        });
      }

        const placeholders = necessidade_ids.map(() => '?').join(',');
      let registros = await executeQuery(
        `
          SELECT 
            necessidade_id,
            produto_origem_id,
            produto_origem_nome,
            produto_origem_unidade,
            produto_trocado_id,
            grupo
          FROM necessidades_substituicoes
          WHERE necessidade_id IN (${placeholders})
            AND ativo = 1
        `,
        necessidade_ids
      );

      if (!registros.length) {
        // Criar registros base automaticamente para necessidades que ainda não possuem substituição
        const placeholdersBase = necessidade_ids.map(() => '?').join(',');
        const necessidadesBase = await executeQuery(
          `
            SELECT 
              n.id AS necessidade_id,
              n.id AS necessidade_id_grupo,
              n.produto_id AS produto_origem_id,
              n.produto AS produto_origem_nome,
              n.produto_unidade AS produto_origem_unidade,
              n.ajuste_conf_coord AS quantidade_origem,
              n.escola_id,
              n.escola AS escola_nome,
              n.semana_abastecimento,
              n.semana_consumo,
              n.grupo,
              n.grupo_id
            FROM necessidades n
            WHERE n.id IN (${placeholdersBase})
          `,
          necessidade_ids
        );

        if (!necessidadesBase.length) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma substituição encontrada. Salve a necessidade antes de trocar o produto.'
        });
        }

        for (const necessidade of necessidadesBase) {
          await executeQuery(
            `
              INSERT INTO necessidades_substituicoes (
                necessidade_id,
                necessidade_id_grupo,
                produto_origem_id,
                produto_origem_nome,
                produto_origem_unidade,
                produto_generico_id,
                produto_generico_codigo,
                produto_generico_nome,
                produto_generico_unidade,
                quantidade_origem,
                quantidade_generico,
                escola_id,
                escola_nome,
                semana_abastecimento,
                semana_consumo,
                grupo,
                grupo_id,
                usuario_criador_id,
                status,
                ativo
              ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'conf', 1)
            `,
            [
              necessidade.necessidade_id,
              necessidade.necessidade_id_grupo || necessidade.necessidade_id,
              necessidade.produto_origem_id,
              necessidade.produto_origem_nome,
              necessidade.produto_origem_unidade,
              necessidade.quantidade_origem || 0,
              necessidade.quantidade_origem || 0,
              necessidade.escola_id,
              necessidade.escola_nome,
              necessidade.semana_abastecimento,
              necessidade.semana_consumo,
              necessidade.grupo,
              necessidade.grupo_id,
              req.user?.id || null
            ]
          );
        }

        registros = await executeQuery(
          `
            SELECT 
              necessidade_id,
              produto_origem_id,
              produto_origem_nome,
              produto_origem_unidade,
              produto_trocado_id,
              grupo
            FROM necessidades_substituicoes
            WHERE necessidade_id IN (${placeholders})
              AND ativo = 1
          `,
          necessidade_ids
        );

        if (!registros.length) {
          return res.status(400).json({
            success: false,
            message: 'Nenhuma substituição encontrada. Salve a necessidade antes de trocar o produto.'
          });
        }
      }

      const jaSubstituido = registros.some(registro => registro.produto_trocado_id);
      if (jaSubstituido) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma substituição ativa para este produto. Desfaça antes de aplicar uma nova troca.'
        });
      }

      const grupoReferencia = registros[0].grupo || null;
      let [novoProduto] = await executeQuery(
        `
          SELECT 
            produto_id,
            produto_nome,
            unidade_medida,
            grupo
          FROM produtos_per_capita
          WHERE (produto_id = ? OR produto_origem_id = ?)
            AND ativo = 1
          LIMIT 1
        `,
        [novo_produto_id, novo_produto_id]
      );

      if (!novoProduto) {
        // Fallback para buscar diretamente no produto origem do Foods
        const [produtoOrigemFallback] = await executeQuery(
          `
            SELECT 
              po.id AS produto_id,
              po.nome AS produto_nome,
              COALESCE(um.sigla, um.nome, '') AS unidade_medida,
              g.nome AS grupo
            FROM foods_db.produto_origem po
            LEFT JOIN foods_db.unidades_medida um ON po.unidade_medida_id = um.id
            LEFT JOIN foods_db.grupos g ON po.grupo_id = g.id
            WHERE po.id = ?
            LIMIT 1
          `,
          [novo_produto_id]
        );

        if (!produtoOrigemFallback) {
        return res.status(404).json({
          success: false,
          message: 'Produto selecionado não encontrado.'
        });
        }

        novoProduto = produtoOrigemFallback;
      }

      if (grupoReferencia && novoProduto.grupo && grupoReferencia !== novoProduto.grupo) {
        return res.status(400).json({
          success: false,
          message: 'O novo produto deve pertencer ao mesmo grupo.'
        });
      }

      await executeQuery(
        `
          UPDATE necessidades_substituicoes
          SET
            produto_trocado_id = produto_origem_id,
            produto_trocado_nome = produto_origem_nome,
            produto_trocado_unidade = produto_origem_unidade,
            produto_origem_id = ?,
            produto_origem_nome = ?,
            produto_origem_unidade = ?,
            data_atualizacao = NOW()
          WHERE necessidade_id IN (${placeholders})
            AND ativo = 1
        `,
        [novoProduto.produto_id, novoProduto.produto_nome, novoProduto.unidade_medida, ...necessidade_ids]
      );

      let produtoGenericoPadrao = null;
      try {
        const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
        const response = await axios.get(
          `${foodsApiUrl}/produto-generico?status=1&limit=10000&produto_origem_id=${novoProduto.produto_id}`,
          {
            headers: {
              Authorization: req.headers.authorization
            },
            timeout: 5000
          }
        );

        let lista = [];
        if (response.data) {
          if (response.data.data && response.data.data.items) {
            lista = response.data.data.items;
          } else if (Array.isArray(response.data.data)) {
            lista = response.data.data;
          } else if (Array.isArray(response.data)) {
            lista = response.data;
      }
        }

        produtoGenericoPadrao =
          lista.find(item => item.produto_padrao === 'Sim') ||
          lista[0] ||
          null;
      } catch (error) {
        console.error('Erro ao buscar produto genérico padrão:', error.message);
      }

      if (produtoGenericoPadrao) {
        await executeQuery(
          `
            UPDATE necessidades_substituicoes
            SET
              produto_generico_id = ?,
              produto_generico_codigo = ?,
              produto_generico_nome = ?,
              produto_generico_unidade = ?,
              data_atualizacao = NOW()
            WHERE necessidade_id IN (${placeholders})
              AND ativo = 1
          `,
          [
            produtoGenericoPadrao.id || produtoGenericoPadrao.codigo,
            produtoGenericoPadrao.codigo || produtoGenericoPadrao.id,
            produtoGenericoPadrao.nome,
            produtoGenericoPadrao.unidade_medida_sigla ||
              produtoGenericoPadrao.unidade ||
              produtoGenericoPadrao.unidade_medida ||
              '',
            ...necessidade_ids
          ]
        );
      }

      return res.json({
        success: true,
        message: 'Produto origem substituído com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao trocar produto origem:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao trocar produto origem'
      });
    }
  }

  static async desfazerTrocaProduto(req, res) {
    try {
      const { necessidade_ids } = req.body;

      if (!Array.isArray(necessidade_ids) || necessidade_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Necessidade(s) são obrigatórias.'
        });
      }

      const placeholders = necessidade_ids.map(() => '?').join(',');
      const registros = await executeQuery(
        `
          SELECT 
            necessidade_id,
            produto_trocado_id,
            produto_trocado_nome,
            produto_trocado_unidade,
            grupo_id
          FROM necessidades_substituicoes
          WHERE necessidade_id IN (${placeholders})
            AND ativo = 1
        `,
        necessidade_ids
      );

      if (!registros.length) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma substituição encontrada.'
        });
      }

      const possuiTroca = registros.some(registro => registro.produto_trocado_id);
      if (!possuiTroca) {
        return res.status(400).json({
          success: false,
          message: 'Não há troca registrada para desfazer.'
        });
      }

      // Buscar produto genérico padrão do produto origem original (produto_trocado_id)
      const produtoTrocadoIds = [...new Set(registros.map(r => r.produto_trocado_id).filter(Boolean))];
      const produtosGenericosPadrao = {};
      
      for (const produtoTrocadoId of produtoTrocadoIds) {
        // Buscar na tabela foods_db.produto_origem que tem produto_generico_padrao_id
        const produtoOrigem = await executeQuery(
          `SELECT 
            po.id,
            po.produto_generico_padrao_id,
            pg.codigo AS produto_generico_codigo,
            pg.nome AS produto_generico_nome,
            COALESCE(um.sigla, um.nome, '') AS produto_generico_unidade
          FROM foods_db.produto_origem po
          LEFT JOIN foods_db.produto_generico pg ON po.produto_generico_padrao_id = pg.id
          LEFT JOIN foods_db.unidades_medida um ON pg.unidade_medida_id = um.id
          WHERE po.id = ?
          LIMIT 1`,
          [produtoTrocadoId]
        );

        if (produtoOrigem.length > 0 && produtoOrigem[0].produto_generico_padrao_id) {
          produtosGenericosPadrao[produtoTrocadoId] = {
            id: produtoOrigem[0].produto_generico_padrao_id,
            codigo: produtoOrigem[0].produto_generico_codigo,
            nome: produtoOrigem[0].produto_generico_nome,
            unidade: produtoOrigem[0].produto_generico_unidade || ''
          };
        } else {
          // Se não encontrar em produto_origem, buscar na API do Foods
          try {
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://foods_backend:3001';
            const response = await axios.get(
              `${foodsApiUrl}/api/produtos-genericos/produto-origem/${produtoTrocadoId}`,
              {
                headers: {
                  'Authorization': req.headers.authorization || ''
                }
              }
            );

            if (response.data && response.data.length > 0) {
              const produtoPadrao = response.data.find(p => p.produto_padrao === 'Sim') || response.data[0];
              produtosGenericosPadrao[produtoTrocadoId] = {
                id: produtoPadrao.id || produtoPadrao.codigo,
                codigo: produtoPadrao.codigo || produtoPadrao.id,
                nome: produtoPadrao.nome,
                unidade: produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade_medida || produtoPadrao.unidade || ''
              };
            }
          } catch (apiError) {
            console.error(`Erro ao buscar produto genérico padrão para produto ${produtoTrocadoId}:`, apiError.message);
          }
        }
      }

      // Atualizar cada registro com o produto genérico padrão correspondente
      for (const registro of registros) {
        if (registro.produto_trocado_id && produtosGenericosPadrao[registro.produto_trocado_id]) {
          const produtoGenerico = produtosGenericosPadrao[registro.produto_trocado_id];
          await executeQuery(
            `
              UPDATE necessidades_substituicoes
              SET
                produto_origem_id = produto_trocado_id,
                produto_origem_nome = produto_trocado_nome,
                produto_origem_unidade = produto_trocado_unidade,
                produto_generico_id = ?,
                produto_generico_codigo = ?,
                produto_generico_nome = ?,
                produto_generico_unidade = ?,
                produto_trocado_id = NULL,
                produto_trocado_nome = NULL,
                produto_trocado_unidade = NULL,
                data_atualizacao = NOW()
              WHERE necessidade_id = ?
                AND ativo = 1
            `,
            [
              produtoGenerico.id,
              produtoGenerico.codigo,
              produtoGenerico.nome,
              produtoGenerico.unidade,
              registro.necessidade_id
            ]
          );
        } else {
          // Se não encontrar produto genérico padrão, apenas restaura o produto origem
      await executeQuery(
        `
          UPDATE necessidades_substituicoes
          SET
            produto_origem_id = produto_trocado_id,
            produto_origem_nome = produto_trocado_nome,
            produto_origem_unidade = produto_trocado_unidade,
            produto_trocado_id = NULL,
            produto_trocado_nome = NULL,
            produto_trocado_unidade = NULL,
            data_atualizacao = NOW()
              WHERE necessidade_id = ?
            AND ativo = 1
        `,
            [registro.necessidade_id]
      );
        }
      }

      return res.json({
        success: true,
        message: 'Troca desfeita com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao desfazer troca de produto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao desfazer troca de produto'
      });
    }
  }
}

module.exports = SubstituicoesCRUDController;
