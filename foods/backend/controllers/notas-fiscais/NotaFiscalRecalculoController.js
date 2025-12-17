/**
 * Controller de Recálculo de Médias Ponderadas
 * Recalcula as médias ponderadas do estoque baseado na data de emissão das notas fiscais
 */

const { executeQuery } = require('../../config/database');
const { 
  successResponse, 
  errorResponse,
  STATUS_CODES 
} = require('../../middleware/responseHandler');
const { asyncHandler } = require('../../middleware/responseHandler');

class NotaFiscalRecalculoController {
  
  /**
   * Recalcular médias ponderadas desde o início
   * Processa todas as notas de ENTRADA ordenadas por data de emissão
   * Atualiza apenas valor_unitario_medio, mantendo quantidade_atual intacto
   */
  static recalcularMediasPonderadas = asyncHandler(async (req, res) => {
    const { almoxarifado_id, produto_generico_id } = req.query;
    
    try {
      // Construir filtros opcionais
      let whereClause = "WHERE nf.tipo_nota = 'ENTRADA' AND nf.almoxarifado_id IS NOT NULL";
      let params = [];
      
      if (almoxarifado_id) {
        whereClause += ' AND nf.almoxarifado_id = ?';
        params.push(almoxarifado_id);
      }
      
      if (produto_generico_id) {
        whereClause += ' AND nfi.produto_generico_id = ?';
        params.push(produto_generico_id);
      }
      
      // Buscar todas as notas de ENTRADA ordenadas por data de emissão
      const notasQuery = `
        SELECT DISTINCT
          nf.id as nota_fiscal_id,
          nf.almoxarifado_id,
          nf.data_emissao
        FROM notas_fiscais nf
        INNER JOIN notas_fiscais_itens nfi ON nf.id = nfi.nota_fiscal_id
        ${whereClause}
        ORDER BY nf.data_emissao ASC, nf.id ASC
      `;
      
      const notas = await executeQuery(notasQuery, params);
      
      if (notas.length === 0) {
        return successResponse(res, {
          processadas: 0,
          produtos_atualizados: 0,
          mensagem: 'Nenhuma nota de entrada encontrada para recálculo'
        }, 'Recálculo concluído');
      }
      
      // Agrupar por produto/almoxarifado/lote/validade para recalcular cada um do zero
      const produtosMap = new Map();
      
      // Primeiro, coletar todos os produtos únicos
      for (const nota of notas) {
        const itensQuery = `
          SELECT 
            nfi.produto_generico_id,
            nfi.lote,
            nfi.data_validade
          FROM notas_fiscais_itens nfi
          WHERE nfi.nota_fiscal_id = ?
            AND nfi.produto_generico_id IS NOT NULL
            AND nfi.quantidade > 0
        `;
        
        const itens = await executeQuery(itensQuery, [nota.nota_fiscal_id]);
        
        for (const item of itens) {
          const chave = `${nota.almoxarifado_id}-${item.produto_generico_id}-${item.lote || ''}-${item.data_validade || ''}`;
          if (!produtosMap.has(chave)) {
            produtosMap.set(chave, {
              almoxarifado_id: nota.almoxarifado_id,
              produto_generico_id: item.produto_generico_id,
              lote: item.lote || null,
              data_validade: item.data_validade || null
            });
          }
        }
      }
      
      // Agora recalcular cada produto do zero
      let produtosAtualizados = 0;
      
      for (const [chave, produto] of produtosMap) {
        // Buscar estoque existente
        let estoqueQuery = `
          SELECT id, quantidade_atual, valor_unitario_medio
          FROM almoxarifado_estoque
          WHERE almoxarifado_id = ?
            AND produto_generico_id = ?
            AND status = 'ATIVO'
        `;
        let estoqueParams = [produto.almoxarifado_id, produto.produto_generico_id];
        
        if (produto.lote) {
          estoqueQuery += ' AND COALESCE(lote, \'\') = ?';
          estoqueParams.push(produto.lote);
        } else {
          estoqueQuery += ' AND (lote IS NULL OR lote = \'\')';
        }
        
        if (produto.data_validade) {
          estoqueQuery += ' AND COALESCE(data_validade, \'\') = ?';
          estoqueParams.push(produto.data_validade);
        } else {
          estoqueQuery += ' AND (data_validade IS NULL)';
        }
        
        estoqueQuery += ' LIMIT 1';
        
        const estoque = await executeQuery(estoqueQuery, estoqueParams);
        
        if (estoque.length === 0) {
          continue; // Pular se não existe estoque
        }
        
        // Buscar TODAS as notas de ENTRADA para este produto ordenadas por data
        let notasQuery = `
          SELECT 
            nfi.quantidade,
            nfi.valor_unitario
          FROM notas_fiscais nf
          INNER JOIN notas_fiscais_itens nfi ON nf.id = nfi.nota_fiscal_id
          WHERE nf.tipo_nota = 'ENTRADA'
            AND nf.almoxarifado_id = ?
            AND nfi.produto_generico_id = ?
        `;
        let notasParams = [produto.almoxarifado_id, produto.produto_generico_id];
        
        if (produto.lote) {
          notasQuery += ' AND COALESCE(nfi.lote, \'\') = ?';
          notasParams.push(produto.lote);
        } else {
          notasQuery += ' AND (nfi.lote IS NULL OR nfi.lote = \'\')';
        }
        
        if (produto.data_validade) {
          notasQuery += ' AND COALESCE(nfi.data_validade, \'\') = ?';
          notasParams.push(produto.data_validade);
        } else {
          notasQuery += ' AND (nfi.data_validade IS NULL)';
        }
        
        notasQuery += ' ORDER BY nf.data_emissao ASC, nf.id ASC';
        
        const todasNotas = await executeQuery(notasQuery, notasParams);
        
        // Recalcular média do zero
        let quantidadeAcumulada = 0;
        let valorTotalAcumulado = 0;
        
        for (const notaItem of todasNotas) {
          const qtd = parseFloat(notaItem.quantidade) || 0;
          const valor = parseFloat(notaItem.valor_unitario) || 0;
          
          if (qtd > 0 && valor > 0) {
            quantidadeAcumulada += qtd;
            valorTotalAcumulado += qtd * valor;
          }
        }
        
        const novaMedia = quantidadeAcumulada > 0 
          ? valorTotalAcumulado / quantidadeAcumulada 
          : 0;
        
        // Atualizar APENAS valor_unitario_medio, mantendo quantidade_atual
        await executeQuery(
          `UPDATE almoxarifado_estoque 
           SET valor_unitario_medio = ?,
               atualizado_em = NOW()
           WHERE id = ?`,
          [novaMedia, estoque[0].id]
        );
        
        produtosAtualizados++;
      }
      
      return successResponse(res, {
        notas_processadas: notas.length,
        produtos_atualizados: produtosAtualizados,
        mensagem: 'Recálculo de médias concluído com sucesso'
      }, 'Recálculo concluído');
      
    } catch (error) {
      console.error('Erro ao recalcular médias ponderadas:', error);
      return errorResponse(res, `Erro ao recalcular médias: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });
  
  /**
   * Recalcular médias ponderadas para um produto específico desde o início
   * Versão otimizada que recalcula do zero para um produto/almoxarifado/lote
   */
  static recalcularMediaProduto = asyncHandler(async (req, res) => {
    const { almoxarifado_id, produto_generico_id, lote, data_validade } = req.body;
    
    if (!almoxarifado_id || !produto_generico_id) {
      return errorResponse(res, 'almoxarifado_id e produto_generico_id são obrigatórios', STATUS_CODES.BAD_REQUEST);
    }
    
    try {
      // Buscar estoque existente
      let estoqueQuery = `
        SELECT id, quantidade_atual, valor_unitario_medio
        FROM almoxarifado_estoque
        WHERE almoxarifado_id = ?
          AND produto_generico_id = ?
          AND status = 'ATIVO'
      `;
      let estoqueParams = [almoxarifado_id, produto_generico_id];
      
      if (lote) {
        estoqueQuery += ' AND COALESCE(lote, \'\') = ?';
        estoqueParams.push(lote);
      } else {
        estoqueQuery += ' AND (lote IS NULL OR lote = \'\')';
      }
      
      if (data_validade) {
        estoqueQuery += ' AND COALESCE(data_validade, \'\') = ?';
        estoqueParams.push(data_validade);
      } else {
        estoqueQuery += ' AND (data_validade IS NULL)';
      }
      
      estoqueQuery += ' LIMIT 1';
      
      const estoque = await executeQuery(estoqueQuery, estoqueParams);
      
      if (estoque.length === 0) {
        return errorResponse(res, 'Estoque não encontrado', STATUS_CODES.NOT_FOUND);
      }
      
      const estoqueId = estoque[0].id;
      const quantidadeAtual = parseFloat(estoque[0].quantidade_atual) || 0;
      
      // Buscar todas as notas de ENTRADA para este produto ordenadas por data
      let notasQuery = `
        SELECT 
          nfi.quantidade,
          nfi.valor_unitario
        FROM notas_fiscais nf
        INNER JOIN notas_fiscais_itens nfi ON nf.id = nfi.nota_fiscal_id
        WHERE nf.tipo_nota = 'ENTRADA'
          AND nf.almoxarifado_id = ?
          AND nfi.produto_generico_id = ?
      `;
      let notasParams = [almoxarifado_id, produto_generico_id];
      
      if (lote) {
        notasQuery += ' AND COALESCE(nfi.lote, \'\') = ?';
        notasParams.push(lote);
      } else {
        notasQuery += ' AND (nfi.lote IS NULL OR nfi.lote = \'\')';
      }
      
      if (data_validade) {
        notasQuery += ' AND COALESCE(nfi.data_validade, \'\') = ?';
        notasParams.push(data_validade);
      } else {
        notasQuery += ' AND (nfi.data_validade IS NULL)';
      }
      
      notasQuery += ' ORDER BY nf.data_emissao ASC, nf.id ASC';
      
      const notas = await executeQuery(notasQuery, notasParams);
      
      // Recalcular média do zero
      let quantidadeAcumulada = 0;
      let valorTotalAcumulado = 0;
      
      for (const nota of notas) {
        const qtd = parseFloat(nota.quantidade) || 0;
        const valor = parseFloat(nota.valor_unitario) || 0;
        
        if (qtd > 0 && valor > 0) {
          quantidadeAcumulada += qtd;
          valorTotalAcumulado += qtd * valor;
        }
      }
      
      const novaMedia = quantidadeAcumulada > 0 
        ? valorTotalAcumulado / quantidadeAcumulada 
        : 0;
      
      // Atualizar apenas valor_unitario_medio, mantendo quantidade_atual
      await executeQuery(
        `UPDATE almoxarifado_estoque 
         SET valor_unitario_medio = ?,
             atualizado_em = NOW()
         WHERE id = ?`,
        [novaMedia, estoqueId]
      );
      
      return successResponse(res, {
        produto_generico_id,
        almoxarifado_id,
        quantidade_atual: quantidadeAtual,
        valor_unitario_medio_anterior: parseFloat(estoque[0].valor_unitario_medio) || 0,
        valor_unitario_medio_novo: novaMedia,
        notas_processadas: notas.length
      }, 'Média recalculada com sucesso');
      
    } catch (error) {
      console.error('Erro ao recalcular média do produto:', error);
      return errorResponse(res, `Erro ao recalcular média: ${error.message}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  });
}

module.exports = NotaFiscalRecalculoController;

