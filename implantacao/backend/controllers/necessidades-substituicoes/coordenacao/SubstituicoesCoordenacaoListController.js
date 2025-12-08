/**
 * Controller de Listagem para Aba Coordenação
 * Busca necessidades com status conf log da tabela necessidades_substituicoes
 */

const { executeQuery } = require('../../../config/database');
const { buscarProdutosDoGrupo, buscarProdutoPadrao } = require('../utils/produtosUtils');
const { construirFiltroTipoRota, construirFiltroRota } = require('../utils/filtrosUtils');

class SubstituicoesCoordenacaoListController {
  /**
   * Listar necessidades para coordenação (status conf log)
   * Lê APENAS da tabela necessidades_substituicoes
   */
  static async listar(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;

      // Construir query base
      let whereConditions = ['status = "conf log"', 'ativo = 1', "(status IS NULL OR status != 'EXCLUÍDO')"];
      const params = [];

      // Aplicar filtros
      const tipoRotaFilter = construirFiltroTipoRota(tipo_rota_id);
      if (tipoRotaFilter.condition) {
        whereConditions.push(tipoRotaFilter.condition);
        params.push(...tipoRotaFilter.params);
      }

      const rotaFilter = construirFiltroRota(rota_id);
      if (rotaFilter.condition) {
        whereConditions.push(rotaFilter.condition);
        params.push(...rotaFilter.params);
      }

      if (grupo) {
        whereConditions.push('grupo = ?');
        params.push(grupo);
      }

      if (semana_abastecimento) {
        whereConditions.push('semana_abastecimento = ?');
        params.push(semana_abastecimento);
      }

      if (semana_consumo) {
        whereConditions.push('semana_consumo = ?');
        params.push(semana_consumo);
      }

      // Buscar necessidades agrupadas por produto origem e produto genérico
      const necessidades = await executeQuery(`
        SELECT 
          produto_origem_id as codigo_origem,
          produto_origem_nome,
          produto_origem_unidade,
          MAX(produto_trocado_id) as produto_trocado_id,
          MAX(produto_trocado_nome) as produto_trocado_nome,
          MAX(produto_trocado_unidade) as produto_trocado_unidade,
          grupo,
          grupo_id,
          semana_abastecimento,
          semana_consumo,
          SUM(quantidade_origem) as quantidade_total_origem,
          produto_generico_id,
          produto_generico_codigo,
          produto_generico_nome,
          produto_generico_unidade
        FROM necessidades_substituicoes
        WHERE ${whereConditions.join(' AND ')}
        GROUP BY produto_origem_id, produto_origem_nome, produto_origem_unidade, grupo, grupo_id,
                 semana_abastecimento, semana_consumo, produto_generico_id, 
                 produto_generico_codigo, produto_generico_nome, produto_generico_unidade
        ORDER BY produto_origem_nome ASC, produto_generico_nome ASC
      `, params);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Buscar produto padrão
          const produtoPadraoId = await buscarProdutoPadrao(necessidade.codigo_origem, req.headers.authorization);

          // Buscar substituições existentes
          const substituicoes = await executeQuery(`
            SELECT 
              ns.id,
              ns.necessidade_id,
              ns.escola_id,
              ns.escola_nome,
              ns.quantidade_origem,
              ns.quantidade_generico,
              ns.status,
              ns.data_criacao,
              ns.data_atualizacao,
              ns.produto_trocado_id,
              ns.produto_trocado_nome,
              ns.produto_trocado_unidade
            FROM necessidades_substituicoes ns
            WHERE ns.produto_origem_id = ?
              AND ns.produto_generico_id = ?
              AND ns.semana_abastecimento = ?
              AND ns.semana_consumo = ?
              AND ns.ativo = 1
              AND ns.status = 'conf log'
            ORDER BY ns.escola_nome ASC
          `, [
            necessidade.codigo_origem,
            necessidade.produto_generico_id || '',
            necessidade.semana_abastecimento,
            necessidade.semana_consumo
          ]);

          const produtosGrupo = await buscarProdutosDoGrupo(
            necessidade.grupo_id,
            necessidade.grupo,
            req.headers.authorization
          );

          return {
            ...necessidade,
            produto_padrao_id: produtoPadraoId,
            produtos_grupo: produtosGrupo,
            escolas: substituicoes.map(sub => ({
              necessidade_id: sub.necessidade_id,
              escola_id: sub.escola_id,
              escola_nome: sub.escola_nome,
              quantidade_origem: sub.quantidade_origem,
              quantidade_generico: sub.quantidade_generico,
              produto_trocado_id: sub.produto_trocado_id || null,
              produto_trocado_nome: sub.produto_trocado_nome || null,
              produto_trocado_unidade: sub.produto_trocado_unidade || null,
              substituicao: {
                id: sub.id,
                status: sub.status,
                data_criacao: sub.data_criacao,
                data_atualizacao: sub.data_atualizacao
              }
            })),
            produto_trocado_id: necessidade.produto_trocado_id,
            produto_trocado_nome: necessidade.produto_trocado_nome,
            produto_trocado_unidade: necessidade.produto_trocado_unidade
          };
        })
      );

      res.json({
        success: true,
        data: produtosComSubstituicoes,
        total: produtosComSubstituicoes.length
      });

    } catch (error) {
      console.error('Erro ao listar necessidades para coordenação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para coordenação'
      });
    }
  }
}

module.exports = SubstituicoesCoordenacaoListController;

