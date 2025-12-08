/**
 * Controller de Listagem para Aba Nutricionista
 * Busca necessidades com status CONF e agrupa por produto origem
 */

const { executeQuery } = require('../../../config/database');
const { buscarProdutosDoGrupo, buscarProdutoPadrao } = require('../utils/produtosUtils');
const { construirCondicoesSubquery } = require('../utils/filtrosUtils');

class SubstituicoesNutricionistaListController {
  /**
   * Listar necessidades para substituição (status CONF)
   * Agrupa por produto origem e mostra escolas solicitantes
   */
  static async listar(req, res) {
    try {
      const { grupo, semana_abastecimento, semana_consumo, tipo_rota_id, rota_id } = req.query;

      // Construir condições para as subqueries do UNION ALL
      const { whereNS, whereN, params: subqueryParams } = construirCondicoesSubquery({
        grupo,
        semana_abastecimento,
        semana_consumo,
        tipo_rota_id,
        rota_id
      });

      // Aumentar o limite do GROUP_CONCAT para evitar truncamento
      await executeQuery(`SET SESSION group_concat_max_len = 1000000`, []);

      // Buscar necessidades agrupadas por produto origem + produto genérico
      const query = `
        SELECT 
          base.codigo_origem,
          base.produto_origem_nome,
          base.produto_origem_unidade,
          MAX(base.produto_trocado_id) AS produto_trocado_id,
          MAX(base.produto_trocado_nome) AS produto_trocado_nome,
          MAX(base.produto_trocado_unidade) AS produto_trocado_unidade,
          MAX(base.produto_generico_id) AS produto_generico_id,
          MAX(base.produto_generico_codigo) AS produto_generico_codigo,
          MAX(base.produto_generico_nome) AS produto_generico_nome,
          MAX(base.produto_generico_unidade) AS produto_generico_unidade,
          SUM(base.quantidade_origem) AS quantidade_total_origem,
          GROUP_CONCAT(DISTINCT base.necessidade_id) AS necessidade_ids,
          base.semana_abastecimento,
          base.semana_consumo,
          base.grupo,
          base.grupo_id,
          GROUP_CONCAT(
            DISTINCT CONCAT(
              base.necessidade_id, '|',
              base.escola_id, '|',
              base.escola_nome, '|',
              base.quantidade_origem
            ) SEPARATOR '::'
          ) as escolas_solicitantes
        FROM (
          SELECT 
            ns.necessidade_id,
            ns.produto_origem_id AS codigo_origem,
            ns.produto_origem_nome,
            ns.produto_origem_unidade,
            ns.produto_trocado_id,
            ns.produto_trocado_nome,
            ns.produto_trocado_unidade,
            ns.produto_generico_id,
            ns.produto_generico_codigo,
            ns.produto_generico_nome,
            ns.produto_generico_unidade,
            ns.quantidade_origem,
            ns.semana_abastecimento,
            ns.semana_consumo,
            ns.grupo,
            ns.grupo_id,
            ns.escola_id,
            ns.escola_nome
          FROM necessidades_substituicoes ns
          WHERE ns.ativo = 1
          AND (ns.status IS NULL OR ns.status = 'conf')
          AND (ns.status IS NULL OR ns.status != 'EXCLUÍDO')${whereNS}
          
          UNION ALL
          
          SELECT 
            n.id AS necessidade_id,
            n.produto_id AS codigo_origem,
            n.produto AS produto_origem_nome,
            n.produto_unidade AS produto_origem_unidade,
            NULL AS produto_trocado_id,
            '' AS produto_trocado_nome,
            '' AS produto_trocado_unidade,
            NULL AS produto_generico_id,
            NULL AS produto_generico_codigo,
            NULL AS produto_generico_nome,
            NULL AS produto_generico_unidade,
            COALESCE(
              n.ajuste_conf_coord,
              n.ajuste_logistica,
              n.ajuste_coordenacao,
              n.ajuste_conf_nutri,
              n.ajuste_nutricionista,
              n.ajuste,
              0
            ) AS quantidade_origem,
            n.semana_abastecimento,
            n.semana_consumo,
            n.grupo,
            n.grupo_id,
            n.escola_id,
            n.escola AS escola_nome
          FROM necessidades n
          WHERE n.status = 'CONF'${whereN}
            AND (n.substituicao_processada = 0 OR n.substituicao_processada IS NULL)
            AND NOT EXISTS (
              SELECT 1
              FROM necessidades_substituicoes ns2
              WHERE ns2.necessidade_id = n.id
                AND ns2.ativo = 1
                AND (ns2.status IS NULL OR ns2.status = 'conf')
                AND (ns2.status IS NULL OR ns2.status != 'EXCLUÍDO')
            )
            AND NOT EXISTS (
              SELECT 1
              FROM necessidades_substituicoes ns3
              WHERE ns3.produto_origem_id = n.produto_id
                AND ns3.escola_id = n.escola_id
                AND ns3.ativo = 0
                AND ns3.status = 'EXCLUÍDO'
                AND ns3.semana_abastecimento = n.semana_abastecimento
                AND ns3.semana_consumo = n.semana_consumo
            )
        ) base
        WHERE 1=1
        GROUP BY 
          base.codigo_origem,
          base.produto_origem_nome,
          base.produto_origem_unidade,
          COALESCE(base.produto_trocado_id, -1),
          COALESCE(base.produto_trocado_nome, ''),
          COALESCE(base.produto_trocado_unidade, ''),
          base.semana_abastecimento,
          base.semana_consumo,
          base.grupo,
          base.grupo_id
        ORDER BY base.produto_origem_nome ASC, base.semana_abastecimento ASC
      `;

      // Combinar parâmetros: apenas os das subqueries (repetidos para ambas)
      const allParams = [...subqueryParams, ...subqueryParams];

      const necessidades = await executeQuery(query, allParams);

      // Buscar substituições existentes para cada produto
      const produtosComSubstituicoes = await Promise.all(
        necessidades.map(async (necessidade) => {
          // Se produto_generico_id é NULL, significa que nunca teve substituições
          if (!necessidade.produto_generico_id) {
            const substituicoesExcluidas = await executeQuery(`
              SELECT COUNT(*) as total
              FROM necessidades_substituicoes ns
              WHERE ns.produto_origem_id = ? 
                AND ns.ativo = 0
                AND ns.status = 'EXCLUÍDO'
            `, [necessidade.codigo_origem]);
            
            if (substituicoesExcluidas[0]?.total > 0) {
              return null;
            }
          }

          // Buscar produto padrão
          const produtoPadraoId = await buscarProdutoPadrao(necessidade.codigo_origem, req.headers.authorization);

          // Buscar substituições existentes
          let substituicoes = [];
          if (necessidade.produto_generico_id) {
            substituicoes = await executeQuery(`
              SELECT 
                ns.id,
                ns.produto_generico_id,
                ns.produto_generico_codigo,
                ns.produto_generico_nome,
                ns.produto_generico_unidade,
                ns.escola_id,
                ns.escola_nome,
                ns.quantidade_origem,
                ns.quantidade_generico,
                ns.status,
                ns.necessidade_id,
                ns.produto_trocado_id,
                ns.produto_trocado_nome,
                ns.produto_trocado_unidade
              FROM necessidades_substituicoes ns
              WHERE ns.produto_origem_id = ? 
                AND ns.produto_generico_id = ?
                AND ns.ativo = 1
                AND (ns.status IS NULL OR ns.status = 'conf')
                AND (ns.status IS NULL OR ns.status != 'EXCLUÍDO')
            `, [necessidade.codigo_origem, necessidade.produto_generico_id]);
            
            if (substituicoes.length === 0) {
              const substituicoesExcluidas = await executeQuery(`
                SELECT COUNT(*) as total
                FROM necessidades_substituicoes ns
                WHERE ns.produto_origem_id = ? 
                  AND ns.produto_generico_id = ?
                  AND ns.ativo = 0
                  AND ns.status = 'EXCLUÍDO'
              `, [necessidade.codigo_origem, necessidade.produto_generico_id]);
              
              if (substituicoesExcluidas[0]?.total > 0) {
                return null;
              }
            }
          }

          // Processar escolas solicitantes
          let escolas = [];
          if (necessidade.escolas_solicitantes) {
            escolas = necessidade.escolas_solicitantes
              .split('::')
              .map(escolaStr => {
                const [necessidade_id, escola_id, escola_nome, quantidade] = escolaStr.split('|');
                return {
                  necessidade_id: parseInt(necessidade_id),
                  escola_id: parseInt(escola_id),
                  escola_nome,
                  quantidade_origem: parseFloat(quantidade)
                };
              });
          }

          // Verificar quais escolas já têm substituição
          escolas.forEach(escola => {
            const substituicao = substituicoes.find(s => s.escola_id === escola.escola_id);
            escola.substituicao = substituicao || null;
            if (substituicao) {
              escola.produto_trocado_id = substituicao.produto_trocado_id || null;
              escola.produto_trocado_nome = substituicao.produto_trocado_nome || null;
              escola.produto_trocado_unidade = substituicao.produto_trocado_unidade || null;
            }
          });

          const produtosGrupo = await buscarProdutosDoGrupo(
            necessidade.grupo_id,
            necessidade.grupo,
            req.headers.authorization
          );

          return {
            ...necessidade,
            escolas,
            substituicoes_existentes: substituicoes.length > 0,
            produto_padrao_id: produtoPadraoId,
            produtos_grupo: produtosGrupo,
            produto_trocado_id: necessidade.produto_trocado_id,
            produto_trocado_nome: necessidade.produto_trocado_nome,
            produto_trocado_unidade: necessidade.produto_trocado_unidade
          };
        })
      );

      // Filtrar produtos origem que só têm substituições excluídas
      const produtosFiltrados = produtosComSubstituicoes.filter(produto => {
        if (!produto) return false;
        if (produto.produto_generico_id && !produto.substituicoes_existentes) {
          return false;
        }
        return true;
      });

      res.json({
        success: true,
        data: produtosFiltrados
      });
    } catch (error) {
      console.error('Erro ao listar necessidades para substituição:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao listar necessidades para substituição'
      });
    }
  }
}

module.exports = SubstituicoesNutricionistaListController;

