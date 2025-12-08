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

      // Função auxiliar para garantir que undefined seja convertido para null
      const nullIfUndefined = (value) => value === undefined ? null : value;

      // Validar dados obrigatórios
      if (!produto_origem_id || !produto_generico_id) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: produto origem e produto genérico'
        });
      }

      // Garantir que produto_generico_codigo sempre use o id (não a coluna codigo)
      // Isso evita problemas com códigos como "GEN-20" ao invés do ID numérico
      const produto_generico_codigo_corrigido = produto_generico_id;

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

            // Garantir que as quantidades não sejam null ou undefined
            const quantidadeOrigem = (qtdOrig !== null && qtdOrig !== undefined) ? parseFloat(qtdOrig) || 0 : 0;
            const quantidadeGenerico = (qtdGen !== null && qtdGen !== undefined) ? parseFloat(qtdGen) || 0 : 0;

            // Garantir que escola_nome não seja null ou undefined (usar string vazia se não houver)
            const escolaNomeValido = (escNome !== null && escNome !== undefined && escNome !== '') ? String(escNome) : '';

            // Verificar se já existe substituição para esta necessidade
            const existing = await executeQuery(`
              SELECT id FROM necessidades_substituicoes 
              WHERE necessidade_id = ? AND ativo = 1
            `, [necId]);

            let result;
            if (existing.length > 0) {
              // Atualizar existente - garantir que todos os valores sejam null se undefined
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
                nullIfUndefined(produto_generico_id),
                nullIfUndefined(produto_generico_codigo_corrigido),
                nullIfUndefined(produto_generico_nome),
                nullIfUndefined(produto_generico_unidade),
                quantidadeOrigem,
                quantidadeGenerico,
                nullIfUndefined(necId)
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

              // Criar nova - garantir que todos os valores sejam null se undefined
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
                nullIfUndefined(necId),
                nullIfUndefined(necId), // necessidade_id_grupo usa o mesmo necessidade_id
                nullIfUndefined(produto_origem_id),
                nullIfUndefined(produto_origem_nome),
                nullIfUndefined(produto_origem_unidade),
                nullIfUndefined(produto_generico_id),
                nullIfUndefined(produto_generico_codigo_corrigido),
                nullIfUndefined(produto_generico_nome),
                nullIfUndefined(produto_generico_unidade),
                quantidadeOrigem,
                quantidadeGenerico,
                nullIfUndefined(escId),
                escolaNomeValido || '',
                nullIfUndefined(semana_abastecimento),
                nullIfUndefined(semana_consumo),
                nullIfUndefined(grupo),
                nullIfUndefined(grupo_id),
                nullIfUndefined(usuario_id)
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
          // Garantir que as quantidades não sejam null ou undefined
          const quantidadeOrigem = (quantidade_origem !== null && quantidade_origem !== undefined) ? parseFloat(quantidade_origem) || 0 : 0;
          const quantidadeGenerico = (quantidade_generico !== null && quantidade_generico !== undefined) ? parseFloat(quantidade_generico) || 0 : 0;

          // Garantir que escola_nome não seja null ou undefined (usar string vazia se não houver)
          const escolaNomeValido = (escola_nome !== null && escola_nome !== undefined && escola_nome !== '') ? String(escola_nome) : '';

          // Verificar se já existe
          const existing = await executeQuery(`
            SELECT id FROM necessidades_substituicoes 
            WHERE necessidade_id = ? AND ativo = 1
          `, [necessidade_id]);

          let result;
          if (existing.length > 0) {
            // Atualizar - garantir que todos os valores sejam null se undefined
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
              nullIfUndefined(produto_generico_id),
              nullIfUndefined(produto_generico_codigo),
              nullIfUndefined(produto_generico_nome),
              nullIfUndefined(produto_generico_unidade),
              quantidadeOrigem,
              quantidadeGenerico,
              nullIfUndefined(necessidade_id)
            ]);
          } else {
            // Criar nova - garantir que todos os valores sejam null se undefined
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
              nullIfUndefined(necessidade_id),
              nullIfUndefined(necessidade_id), // necessidade_id_grupo usa o mesmo necessidade_id
              nullIfUndefined(produto_origem_id),
              nullIfUndefined(produto_origem_nome),
              nullIfUndefined(produto_origem_unidade),
              nullIfUndefined(produto_generico_id),
              nullIfUndefined(produto_generico_codigo),
              nullIfUndefined(produto_generico_nome),
              nullIfUndefined(produto_generico_unidade),
              quantidadeOrigem,
              quantidadeGenerico,
              nullIfUndefined(escola_id),
              escolaNomeValido || '',
              nullIfUndefined(semana_abastecimento),
              nullIfUndefined(semana_consumo),
              nullIfUndefined(usuario_id)
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

      // Verificar se a substituição existe
      const substituicao = await executeQuery(`
        SELECT id, status FROM necessidades_substituicoes 
        WHERE id = ?
      `, [id]);

      if (substituicao.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Substituição não encontrada',
          message: 'Substituição não encontrada'
        });
      }

      // Alterar status para EXCLUÍDO e ativo = 0 (não deletar fisicamente)
      await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET status = 'EXCLUÍDO', ativo = 0, data_atualizacao = NOW()
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

          // Buscar id da semana de abastecimento na tabela calendario
          // Usar MIN(id) para pegar um id representativo da semana
          // Tentar busca exata primeiro, depois busca com LIKE para casos de formatação diferente
          let semanaId = null;
          
          // Tentativa 1: Busca exata
          const [semanaCalendarioExata] = await connection.execute(`
            SELECT MIN(id) as semana_id
            FROM foods_db.calendario
            WHERE semana_abastecimento = ?
            LIMIT 1
          `, [semana_abastecimento]);
          
          if (semanaCalendarioExata.length > 0 && semanaCalendarioExata[0].semana_id) {
            semanaId = semanaCalendarioExata[0].semana_id;
          } else {
            // Tentativa 2: Busca com LIKE (caso haja diferenças de formatação)
            // Remover parênteses e espaços extras para comparação
            const semanaLimpa = semana_abastecimento.replace(/[()]/g, '').trim();
            const [semanaCalendarioLike] = await connection.execute(`
              SELECT MIN(id) as semana_id
              FROM foods_db.calendario
              WHERE REPLACE(REPLACE(semana_abastecimento, '(', ''), ')', '') LIKE ?
              LIMIT 1
            `, [`%${semanaLimpa}%`]);
            
            if (semanaCalendarioLike.length > 0 && semanaCalendarioLike[0].semana_id) {
              semanaId = semanaCalendarioLike[0].semana_id;
            }
          }
          
          // Se ainda não encontrou, usar hash da semana_abastecimento como fallback
          if (!semanaId) {
            // Gerar um número baseado no hash da string da semana
            let hash = 0;
            for (let i = 0; i < semana_abastecimento.length; i++) {
              const char = semana_abastecimento.charCodeAt(i);
              hash = ((hash << 5) - hash) + char;
              hash = hash & hash; // Convert to 32bit integer
            }
            semanaId = Math.abs(hash) % 100000; // Limitar a 5 dígitos
          }

          // Usar SELECT FOR UPDATE para lockar os registros em ordem consistente
          // Incluir escola_id e grupo_id para gerar numero_romaneio
          const [rows] = await connection.execute(`
            SELECT id, produto_origem_id, semana_abastecimento, semana_consumo, status, escola_id, grupo_id
            FROM necessidades_substituicoes
            WHERE produto_origem_id = ? 
              AND semana_abastecimento = ? 
              AND semana_consumo = ?
              AND status = 'conf'
              AND ativo = 1
            ORDER BY id ASC
            FOR UPDATE
          `, [produto_origem_id, semana_abastecimento, semana_consumo]);

          // Gerar numero_romaneio para cada combinação única de escola_id + grupo_id
          // Agrupar registros por escola_id e grupo_id
          const gruposRomaneio = {};
          rows.forEach(row => {
            const escolaId = row.escola_id;
            const grupoId = row.grupo_id;
            const chave = `${escolaId || 'NULL'}_${grupoId || 'NULL'}`;
            
            if (!gruposRomaneio[chave]) {
              // Sempre gerar numero_romaneio, mesmo se semanaId for null
              // Se semanaId for null, usar um hash da semana_abastecimento
              const idSemana = semanaId || (() => {
                let hash = 0;
                for (let i = 0; i < semana_abastecimento.length; i++) {
                  const char = semana_abastecimento.charCodeAt(i);
                  hash = ((hash << 5) - hash) + char;
                  hash = hash & hash;
                }
                return Math.abs(hash) % 100000;
              })();
              
              gruposRomaneio[chave] = {
                escola_id: escolaId,
                grupo_id: grupoId,
                numero_romaneio: `${idSemana}-${escolaId || 'NULL'}-${grupoId || 'NULL'}`
              };
            }
          });

          // Atualizar status de 'conf' para 'conf log' e gerar numero_romaneio
          // Para cada grupo único, atualizar os registros correspondentes
          let totalAtualizado = 0;
          
          if (Object.keys(gruposRomaneio).length > 0) {
            // Atualizar cada grupo separadamente para garantir que o numero_romaneio correto seja atribuído
            for (const grupo of Object.values(gruposRomaneio)) {
              const [result] = await connection.execute(`
                UPDATE necessidades_substituicoes 
                SET 
                  status = 'conf log',
                  numero_romaneio = ?,
                  data_atualizacao = NOW()
                WHERE produto_origem_id = ? 
                  AND semana_abastecimento = ? 
                  AND semana_consumo = ?
                  AND status = 'conf'
                  AND ativo = 1
                  AND (escola_id = ? OR (escola_id IS NULL AND ? IS NULL))
                  AND (grupo_id = ? OR (grupo_id IS NULL AND ? IS NULL))
              `, [
                grupo.numero_romaneio,
                produto_origem_id, 
                semana_abastecimento, 
                semana_consumo,
                grupo.escola_id,
                grupo.escola_id,
                grupo.grupo_id,
                grupo.grupo_id
              ]);
              totalAtualizado += result.affectedRows;
            }
          } else {
            // Se não há grupos, atualizar apenas o status (caso raro)
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
            totalAtualizado = result.affectedRows;
          }

          const result = { affectedRows: totalAtualizado };

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

      // Função auxiliar para garantir que undefined seja convertido para null
      const nullIfUndefined = (value) => value === undefined ? null : value;

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
              COALESCE(
                n.ajuste_conf_coord,
                n.ajuste_logistica,
                n.ajuste_coordenacao,
                n.ajuste_conf_nutri,
                n.ajuste_nutricionista,
                n.ajuste,
                0
              ) AS quantidade_origem,
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
          // Garantir que escola_nome não seja null ou undefined (usar string vazia se não houver)
          const escolaNomeValido = (necessidade.escola_nome !== null && necessidade.escola_nome !== undefined && necessidade.escola_nome !== '') ? String(necessidade.escola_nome) : '';

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
              nullIfUndefined(necessidade.necessidade_id),
              nullIfUndefined(necessidade.necessidade_id_grupo || necessidade.necessidade_id),
              nullIfUndefined(necessidade.produto_origem_id),
              nullIfUndefined(necessidade.produto_origem_nome),
              nullIfUndefined(necessidade.produto_origem_unidade),
              (necessidade.quantidade_origem !== null && necessidade.quantidade_origem !== undefined) ? parseFloat(necessidade.quantidade_origem) || 0 : 0,
              (necessidade.quantidade_origem !== null && necessidade.quantidade_origem !== undefined) ? parseFloat(necessidade.quantidade_origem) || 0 : 0,
              nullIfUndefined(necessidade.escola_id),
              escolaNomeValido || '',
              nullIfUndefined(necessidade.semana_abastecimento),
              nullIfUndefined(necessidade.semana_consumo),
              nullIfUndefined(necessidade.grupo),
              nullIfUndefined(necessidade.grupo_id),
              nullIfUndefined(req.user?.id)
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
        [
          nullIfUndefined(novoProduto.produto_id),
          nullIfUndefined(novoProduto.produto_nome),
          nullIfUndefined(novoProduto.unidade_medida),
          ...necessidade_ids
        ]
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
            nullIfUndefined(produtoGenericoPadrao.id || produtoGenericoPadrao.codigo),
            nullIfUndefined(produtoGenericoPadrao.id || produtoGenericoPadrao.codigo), // produto_generico_codigo sempre usa o id
            nullIfUndefined(produtoGenericoPadrao.nome),
            nullIfUndefined(
            produtoGenericoPadrao.unidade_medida_sigla ||
              produtoGenericoPadrao.unidade ||
              produtoGenericoPadrao.unidade_medida ||
              ''
            ),
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

      // Função auxiliar para garantir que undefined seja convertido para null
      const nullIfUndefined = (value) => value === undefined ? null : value;

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
              nullIfUndefined(produtoGenerico.id),
              nullIfUndefined(produtoGenerico.id), // produto_generico_codigo sempre usa o id
              nullIfUndefined(produtoGenerico.nome),
              nullIfUndefined(produtoGenerico.unidade),
              nullIfUndefined(registro.necessidade_id)
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
