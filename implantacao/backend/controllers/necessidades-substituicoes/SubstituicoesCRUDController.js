const { executeQuery } = require('../../config/database');

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
    try {
      const { produto_origem_id, semana_abastecimento, semana_consumo } = req.body;
      const usuario_id = req.user.id;

      if (!produto_origem_id || !semana_abastecimento || !semana_consumo) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: produto origem, semana abastecimento e semana consumo'
        });
      }

      // Atualizar status de 'conf' para 'conf log' para todas as substituições do produto origem
      const result = await executeQuery(`
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

      // Marcar necessidades como processadas para substituição
      await executeQuery(`
        UPDATE necessidades 
        SET substituicao_processada = 1 
        WHERE produto_id = ? 
          AND semana_abastecimento = ? 
          AND semana_consumo = ?
      `, [produto_origem_id, semana_abastecimento, semana_consumo]);

      res.json({
        success: true,
        message: 'Análise liberada com sucesso',
        affectedRows: result.affectedRows
      });

    } catch (error) {
      console.error('Erro ao liberar análise:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao liberar análise'
      });
    }
  }

}

module.exports = SubstituicoesCRUDController;
