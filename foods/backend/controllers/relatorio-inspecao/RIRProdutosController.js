/**
 * Controller de Produtos do Relatório de Inspeção
 * Responsável por inserir, atualizar e excluir produtos do RIR
 */

const { executeQuery } = require('../../config/database');
const { errorResponse, STATUS_CODES } = require('../../middleware/responseHandler');

class RIRProdutosController {
  /**
   * Inserir produtos do relatório de inspeção
   * @param {number} relatorioInspecaoId - ID do relatório
   * @param {Array} produtos - Array de produtos
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async inserirProdutos(relatorioInspecaoId, produtos) {
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return { success: true }; // Sem produtos para inserir
    }

    try {
      // Inserir cada produto
      for (const produto of produtos) {
        await executeQuery(
          `INSERT INTO relatorio_inspecao_produtos (
            relatorio_inspecao_id,
            pedido_item_id,
            codigo,
            descricao,
            unidade_medida,
            quantidade_pedido,
            grupo_id,
            grupo_nome,
            nqa_id,
            nqa_codigo,
            fabricacao,
            lote,
            validade,
            temperatura,
            aval_sensorial,
            tam_lote,
            num_amostras_avaliadas,
            num_amostras_aprovadas,
            num_amostras_reprovadas,
            ac,
            re,
            controle_validade,
            resultado_final,
            observacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            relatorioInspecaoId,
            (produto.pedido_item_id && produto.pedido_item_id > 0) ? produto.pedido_item_id : null,
            produto.codigo || produto.codigo_produto || null,
            produto.descricao || produto.nome_produto || null,
            produto.unidade_medida || produto.und || null,
            produto.quantidade_pedido ? parseFloat(produto.quantidade_pedido) : (produto.qtde ? parseFloat(produto.qtde) : null),
            produto.grupo_id || produto.grupoId || null,
            produto.grupo_nome || null,
            produto.nqa_id || null,
            produto.nqa_codigo || null,
            produto.fabricacao ? (typeof produto.fabricacao === 'string' && produto.fabricacao.includes('/') ? RIRProdutosController.parseDateBR(produto.fabricacao) : produto.fabricacao) : null,
            produto.lote || null,
            produto.validade ? (typeof produto.validade === 'string' && produto.validade.includes('/') ? RIRProdutosController.parseDateBR(produto.validade) : produto.validade) : null,
            produto.temperatura || null,
            produto.aval_sensorial || null,
            produto.tam_lote ? parseFloat(produto.tam_lote) : null,
            produto.num_amostras_avaliadas ? parseInt(produto.num_amostras_avaliadas) : null,
            produto.num_amostras_aprovadas ? parseFloat(produto.num_amostras_aprovadas) : null,
            produto.num_amostras_reprovadas ? parseInt(produto.num_amostras_reprovadas) : null,
            produto.ac ? parseInt(produto.ac) : null,
            produto.re ? parseInt(produto.re) : null,
            produto.controle_validade ? parseFloat(produto.controle_validade) : null,
            produto.resultado_final || null,
            produto.observacao || null
          ]
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao inserir produtos do RIR:', error);
      return {
        success: false,
        error: `Erro ao inserir produtos: ${error.message}`
      };
    }
  }

  /**
   * Atualizar produtos do relatório de inspeção
   * Remove todos os produtos antigos e insere os novos
   * @param {number} relatorioInspecaoId - ID do relatório
   * @param {Array} produtos - Array de produtos
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async atualizarProdutos(relatorioInspecaoId, produtos) {
    try {
      // Remover produtos antigos
      await executeQuery(
        'DELETE FROM relatorio_inspecao_produtos WHERE relatorio_inspecao_id = ?',
        [relatorioInspecaoId]
      );

      // Inserir novos produtos
      return await this.inserirProdutos(relatorioInspecaoId, produtos);
    } catch (error) {
      console.error('Erro ao atualizar produtos do RIR:', error);
      return {
        success: false,
        error: `Erro ao atualizar produtos: ${error.message}`
      };
    }
  }

  /**
   * Buscar produtos do relatório de inspeção
   * @param {number} relatorioInspecaoId - ID do relatório
   * @returns {Promise<Array>}
   */
  static async buscarProdutos(relatorioInspecaoId) {
    const produtos = await executeQuery(
      `SELECT * FROM relatorio_inspecao_produtos 
       WHERE relatorio_inspecao_id = ? 
       ORDER BY id`,
      [relatorioInspecaoId]
    );

    return produtos || [];
  }

  /**
   * Remover todos os produtos do relatório
   * @param {number} relatorioInspecaoId - ID do relatório
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async removerProdutos(relatorioInspecaoId) {
    try {
      await executeQuery(
        'DELETE FROM relatorio_inspecao_produtos WHERE relatorio_inspecao_id = ?',
        [relatorioInspecaoId]
      );
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover produtos do RIR:', error);
      return {
        success: false,
        error: `Erro ao remover produtos: ${error.message}`
      };
    }
  }

  /**
   * Calcular status geral baseado nos produtos
   * @param {Array} produtos - Array de produtos
   * @returns {string} - 'APROVADO', 'REPROVADO' ou 'PARCIAL'
   */
  static calcularStatusGeral(produtos) {
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return 'APROVADO';
    }

    const totalAprovados = produtos.filter(p => p.resultado_final === 'Aprovado').length;
    const totalReprovados = produtos.filter(p => p.resultado_final === 'Reprovado').length;

    if (totalReprovados > 0 && totalAprovados > 0) {
      return 'PARCIAL';
    } else if (totalReprovados > 0) {
      return 'REPROVADO';
    }

    return 'APROVADO';
  }

  /**
   * Converter data BR (DD/MM/YYYY) para ISO (YYYY-MM-DD)
   * @param {string} dateBR - Data no formato DD/MM/YYYY
   * @returns {string|null} - Data no formato YYYY-MM-DD ou null
   */
  static parseDateBR(dateBR) {
    if (!dateBR || typeof dateBR !== 'string') return null;
    
    const parts = dateBR.split('/');
    if (parts.length !== 3) return null;
    
    const [dia, mes, ano] = parts;
    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return null;
    
    return `${ano}-${mes}-${dia}`;
  }
}

module.exports = RIRProdutosController;

