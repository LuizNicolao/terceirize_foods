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
      if (!produto_origem_id || !produto_generico_id || !quantidade_origem || !quantidade_generico) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios: produto origem, produto genérico e quantidades'
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', 1)
              `, [
                necId,
                necessidade_id_grupo,
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
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', 1)
            `, [
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
   * Aprovar substituição
   */
  static async aprovarSubstituicao(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.id;

      await executeQuery(`
        UPDATE necessidades_substituicoes 
        SET 
          status = 'aprovado',
          usuario_aprovador_id = ?,
          data_aprovacao = NOW(),
          data_atualizacao = NOW()
        WHERE id = ?
      `, [usuario_id, id]);

      res.json({
        success: true,
        message: 'Substituição aprovada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao aprovar substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao aprovar substituição'
      });
    }
  }
}

module.exports = SubstituicoesCRUDController;
