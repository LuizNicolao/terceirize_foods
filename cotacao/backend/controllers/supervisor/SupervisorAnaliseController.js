/**
 * Controller de Análise do Supervisor
 * Gerencia as análises e decisões do supervisor sobre cotações
 */

const { executeQuery } = require('../../config/database');
const { createResourceLinks } = require('../../middleware/hateoas');
// const ExcelJS = require('exceljs');
// const PDFDocument = require('pdfkit');

class SupervisorAnaliseController {
  // POST /api/supervisor/:id/analisar - Analisar cotação como supervisor
  static async analisarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { 
        status, 
        observacoes_supervisor, 
        justificativa_supervisor 
      } = req.body;

      // Verificar o status atual da cotação
      const cotacaoQuery = `
        SELECT status FROM cotacoes WHERE id = ?
      `;
      
      const cotacoes = await executeQuery(cotacaoQuery, [id]);
      
      if (!cotacoes || cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];
      
      // Impedir análise de cotações em renegociação
      if (cotacao.status === 'renegociacao') {
        return res.status(403).json({
          success: false,
          message: 'Não é possível analisar cotações em renegociação. Apenas visualização é permitida.'
        });
      }

      // Impedir análise de cotações já aprovadas ou rejeitadas
      if (['aprovada', 'rejeitada'].includes(cotacao.status)) {
        return res.status(403).json({
          success: false,
          message: 'Não é possível analisar cotações já finalizadas (aprovadas ou rejeitadas).'
        });
      }

      const updateQuery = `
        UPDATE cotacoes 
        SET 
          status = ?,
          justificativa = ?,
          data_atualizacao = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [
        status,
        observacoes_supervisor || justificativa_supervisor || '',
        id
      ]);

      // Adicionar links HATEOAS
      const response = {
        success: true,
        message: 'Cotação analisada pelo supervisor com sucesso',
        data: { id, status },
        links: createResourceLinks(req, 'supervisor', id)
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao analisar cotação como supervisor:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // POST /api/supervisor/:id/enviar-gestor - Enviar cotação para gestor
  static async enviarParaGestor(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Verificar o status atual da cotação
      const cotacaoQuery = `
        SELECT status FROM cotacoes WHERE id = ?
      `;
      
      const cotacoes = await executeQuery(cotacaoQuery, [id]);
      
      if (!cotacoes || cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];
      
      // Impedir envio para gestor de cotações em renegociação
      if (cotacao.status === 'renegociacao') {
        return res.status(403).json({
          success: false,
          message: 'Não é possível enviar cotações em renegociação para gestor. Apenas visualização é permitida.'
        });
      }

      // Impedir envio de cotações já finalizadas
      if (['aprovada', 'rejeitada'].includes(cotacao.status)) {
        return res.status(403).json({
          success: false,
          message: 'Não é possível enviar cotações já finalizadas para gestor.'
        });
      }

      const updateQuery = `
        UPDATE cotacoes 
        SET 
          status = ?,
          data_atualizacao = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, [status, id]);

      // Adicionar links HATEOAS
      const response = {
        success: true,
        message: 'Cotação enviada para gestor com sucesso',
        data: { id, status },
        links: createResourceLinks(req, 'supervisor', id)
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao enviar cotação para gestor:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // GET /api/supervisor/:id/detalhes - Buscar detalhes da cotação para análise
  static async getDetalhesCotacao(req, res) {
    try {
      const { id } = req.params;

      // Buscar dados básicos da cotação
      const cotacaoQuery = `
        SELECT 
          c.*
        FROM cotacoes c
        WHERE c.id = ?
      `;

      const cotacoes = await executeQuery(cotacaoQuery, [id]);

      if (!cotacoes || cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      // Buscar fornecedores da cotação
      const fornecedoresQuery = `
        SELECT 
          id,
          fornecedor_id,
          nome,
          tipo_frete,
          valor_frete,
          prazo_pagamento,
          frete
        FROM fornecedores 
        WHERE cotacao_id = ?
        ORDER BY nome
      `;

      const fornecedores = await executeQuery(fornecedoresQuery, [id]);

      // Para cada fornecedor, buscar seus produtos
      for (let fornecedor of fornecedores) {
        const fornecedorProdutosQuery = `
          SELECT 
            pf.id,
            pf.produto_id,
            pf.valor_unitario,
            pf.primeiro_valor,
            pf.valor_anterior,
            pf.total,
            pf.difal,
            pf.ipi,
            pf.prazo_entrega,
            pf.data_entrega_fn,
            pf.nome,
            pf.qtde,
            pf.un,
            pf.ult_valor_aprovado,
            pf.ult_fornecedor_aprovado
          FROM produtos_fornecedores pf
          WHERE pf.fornecedor_id = ?
          ORDER BY pf.nome
        `;

        const fornecedorProdutos = await executeQuery(fornecedorProdutosQuery, [fornecedor.id]);
        fornecedor.produtos = fornecedorProdutos;
      }

      // Buscar produtos da cotação
      const produtosQuery = `
        SELECT 
          id,
          produto_id,
          nome,
          qtde as quantidade,
          un as unidade_medida,
          entrega,
          prazo_entrega,
          is_duplicado,
          produtos_originais
        FROM produtos 
        WHERE cotacao_id = ?
        ORDER BY nome
      `;

      const produtos = await executeQuery(produtosQuery, [id]);

      // Buscar produtos_fornecedores (preços) com informações completas
      const precosQuery = `
        SELECT 
          pf.id,
          pf.produto_id,
          pf.fornecedor_id,
          pf.valor_unitario,
          pf.total,
          pf.nome as produto_nome,
          pf.qtde as quantidade,
          pf.un as unidade_medida,
          pf.prazo_entrega,
          pf.ult_valor_aprovado,
          pf.ult_fornecedor_aprovado,
          pf.valor_anterior,
          pf.primeiro_valor,
          pf.difal,
          pf.ipi,
          pf.data_entrega_fn,
          f.nome as fornecedor_nome,
          f.prazo_pagamento,
          f.valor_frete,
          f.frete,
          -- Buscar último valor aprovado das tabelas saving e saving_itens
          (
            SELECT si.valor_unitario_final
            FROM saving s
            JOIN saving_itens si ON s.id = si.saving_id
            WHERE s.tipo = 'programada'
              AND s.status = 'concluido'
              AND si.descricao COLLATE utf8mb4_general_ci = pf.nome COLLATE utf8mb4_general_ci
              AND si.status = 'aprovado'
            ORDER BY s.data_registro DESC
            LIMIT 1
          ) as ultimo_valor_aprovado_saving,
          -- Buscar último fornecedor aprovado das tabelas saving e saving_itens
          (
            SELECT si.fornecedor
            FROM saving s
            JOIN saving_itens si ON s.id = si.saving_id
            WHERE s.tipo = 'programada'
              AND s.status = 'concluido'
              AND si.descricao COLLATE utf8mb4_general_ci = pf.nome COLLATE utf8mb4_general_ci
              AND si.status = 'aprovado'
            ORDER BY s.data_registro DESC
            LIMIT 1
          ) as ultimo_fornecedor_aprovado_saving
        FROM produtos_fornecedores pf
        JOIN fornecedores f ON pf.fornecedor_id = f.id
        JOIN cotacoes c ON f.cotacao_id = c.id
        WHERE f.cotacao_id = ?
        ORDER BY pf.nome, f.nome
      `;

      const precos = await executeQuery(precosQuery, [id]);

      // Montar resposta completa com estrutura esperada pelo frontend
      const cotacaoCompleta = {
        ...cotacao,
        fornecedores,
        produtos,
        itens: precos // Adicionar os produtos_fornecedores como "itens"
      };

      res.json({
        success: true,
        data: cotacaoCompleta
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes da cotação:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor' 
      });
    }
  }

  // GET /api/supervisor/:id/export/pdf - Exportar análise em PDF
  static async exportarPDF(req, res) {
    try {
      const { id } = req.params;
      const { viewMode } = req.query;

      // Buscar dados da cotação
      const cotacaoQuery = `
        SELECT c.*, 
               GROUP_CONCAT(DISTINCT f.nome) as fornecedores
        FROM cotacoes c
        LEFT JOIN fornecedores f ON c.id = f.cotacao_id
        WHERE c.id = ?
        GROUP BY c.id
      `;
      
      const cotacoes = await executeQuery(cotacaoQuery, [id]);
      
      if (!cotacoes || cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      // Buscar itens da cotação
      const itensQuery = `
        SELECT 
          pf.nome as produto_nome,
          f.nome as fornecedor_nome,
          pf.quantidade,
          pf.unidade_medida,
          pf.valor_unitario,
          pf.prazo_entrega,
          pf.prazo_pagamento,
          pf.data_entrega_fn,
          pf.ult_valor_aprovado,
          pf.primeiro_valor
        FROM produtos_fornecedores pf
        JOIN fornecedores f ON pf.fornecedor_id = f.id
        WHERE f.cotacao_id = ?
        ORDER BY pf.nome, f.nome
      `;
      
      const itens = await executeQuery(itensQuery, [id]);
      cotacao.itens = itens;

      // TODO: Implementar exportação PDF quando pdfkit estiver disponível
      // Criar PDF
      // const doc = new PDFDocument();
      
      // Configurar headers para download
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `attachment; filename="cotacao_${id}_${viewMode}.pdf"`);
      
      // doc.pipe(res);

      // Título
      // doc.fontSize(20).text(`Análise da Cotação #${cotacao.numero}`, { align: 'center' });
      // doc.moveDown();
      
      // Informações da cotação
      // doc.fontSize(14).text('Informações Gerais:', { underline: true });
      // doc.fontSize(12).text(`Comprador: ${cotacao.comprador}`);
      // doc.fontSize(12).text(`Data de Criação: ${new Date(cotacao.data_criacao).toLocaleDateString('pt-BR')}`);
      // doc.fontSize(12).text(`Status: ${cotacao.status}`);
      // doc.moveDown();

      // Título da visualização
      // const viewModeLabels = {
      //   'padrao': 'Visualização Padrão',
      //   'resumo': 'Resumo Comparativo',
      //   'melhor-preco': 'Melhor Preço',
      //   'melhor-entrega': 'Melhor Prazo de Entrega',
      //   'melhor-pagamento': 'Melhor Prazo de Pagamento',
      //   'comparativo': 'Comparativo de Produtos'
      // };

      // doc.fontSize(16).text(viewModeLabels[viewMode] || 'Análise', { underline: true });
      // doc.moveDown();

      // Tabela de dados
      // if (itens && itens.length > 0) {
      //   const headers = ['Produto', 'Fornecedor', 'Qtd', 'Valor Unit.', 'Total', 'Prazo Entrega', 'Prazo Pagamento'];
      //   const startY = doc.y;
      //   let currentY = startY;

      //   // Headers
      //   headers.forEach((header, index) => {
      //     doc.fontSize(10).text(header, 50 + (index * 70), currentY);
      //   });
      //   currentY += 20;

      //   // Dados
      //   itens.forEach(item => {
      //     if (currentY > 700) {
      //       doc.addPage();
      //       currentY = 50;
      //     }
          
      //     doc.fontSize(9).text(item.produto_nome || '-', 50, currentY);
      //     doc.fontSize(9).text(item.fornecedor_nome || '-', 120, currentY);
      //     doc.fontSize(9).text(item.quantidade || '-', 190, currentY);
      //     doc.fontSize(9).text(`R$ ${parseFloat(item.valor_unitario || 0).toFixed(2)}`, 260, currentY);
      //     doc.fontSize(9).text(`R$ ${(parseFloat(item.quantidade || 0) * parseFloat(item.valor_unitario || 0)).toFixed(2)}`, 330, currentY);
      //     doc.fontSize(9).text(item.prazo_entrega || '-', 400, currentY);
      //     doc.fontSize(9).text(item.prazo_pagamento || '-', 470, currentY);
          
      //     currentY += 15;
      //   });
      // }

      // doc.end();
      
      // Retorno temporário
      res.json({
        success: true,
        message: 'Exportação PDF temporariamente desabilitada',
        data: { id, viewMode, itens }
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }

  // GET /api/supervisor/:id/export/excel - Exportar análise em Excel
  static async exportarExcel(req, res) {
    try {
      const { id } = req.params;
      const { viewMode } = req.query;

      // Buscar dados da cotação
      const cotacaoQuery = `
        SELECT c.*, 
               GROUP_CONCAT(DISTINCT f.nome) as fornecedores
        FROM cotacoes c
        LEFT JOIN fornecedores f ON c.id = f.cotacao_id
        WHERE c.id = ?
        GROUP BY c.id
      `;
      
      const cotacoes = await executeQuery(cotacaoQuery, [id]);
      
      if (!cotacoes || cotacoes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const cotacao = cotacoes[0];

      // Buscar itens da cotação
      const itensQuery = `
        SELECT 
          pf.nome as produto_nome,
          f.nome as fornecedor_nome,
          pf.quantidade,
          pf.unidade_medida,
          pf.valor_unitario,
          pf.prazo_entrega,
          pf.prazo_pagamento,
          pf.data_entrega_fn,
          pf.ult_valor_aprovado,
          pf.primeiro_valor
        FROM produtos_fornecedores pf
        JOIN fornecedores f ON pf.fornecedor_id = f.id
        WHERE f.cotacao_id = ?
        ORDER BY pf.nome, f.nome
      `;
      
      const itens = await executeQuery(itensQuery, [id]);

      // TODO: Implementar exportação Excel quando exceljs estiver disponível
      // Criar workbook Excel
      // const workbook = new ExcelJS.Workbook();
      // const worksheet = workbook.addWorksheet('Análise');

      // Adicionar informações da cotação
      // worksheet.addRow(['Cotação #' + cotacao.numero]);
      // worksheet.addRow(['Comprador', cotacao.comprador]);
      // worksheet.addRow(['Data de Criação', new Date(cotacao.data_criacao).toLocaleDateString('pt-BR')]);
      // worksheet.addRow(['Status', cotacao.status]);
      // worksheet.addRow([]);

      // Título da visualização
      // const viewModeLabels = {
      //   'padrao': 'Visualização Padrão',
      //   'resumo': 'Resumo Comparativo',
      //   'melhor-preco': 'Melhor Preço',
      //   'melhor-entrega': 'Melhor Prazo de Entrega',
      //   'melhor-pagamento': 'Melhor Prazo de Pagamento',
      //   'comparativo': 'Comparativo de Produtos'
      // };

      // worksheet.addRow([viewModeLabels[viewMode] || 'Análise']);
      // worksheet.addRow([]);

      // Headers da tabela
      // const headers = ['Produto', 'Fornecedor', 'Quantidade', 'Unidade', 'Valor Unitário', 'Valor Total', 'Prazo Entrega', 'Prazo Pagamento', 'Data Entrega', 'Últ. Valor Aprovado', 'Primeiro Valor'];
      // worksheet.addRow(headers);

      // Dados
      // itens.forEach(item => {
      //   worksheet.addRow([
      //     item.produto_nome || '-',
      //     item.fornecedor_nome || '-',
      //     parseFloat(item.quantidade || 0),
      //     item.unidade_medida || '-',
      //     parseFloat(item.valor_unitario || 0),
      //     parseFloat(item.quantidade || 0) * parseFloat(item.valor_unitario || 0),
      //     item.prazo_entrega || '-',
      //     item.prazo_pagamento || '-',
      //     item.data_entrega_fn ? new Date(item.data_entrega_fn).toLocaleDateString('pt-BR') : '-',
      //     parseFloat(item.ult_valor_aprovado || 0),
      //     parseFloat(item.primeiro_valor || 0)
      //   ]);
      // });

      // Estilizar headers
      // const headerRow = worksheet.getRow(7);
      // headerRow.font = { bold: true };
      // headerRow.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: 'FFE0E0E0' }
      // };

      // Configurar headers para download
      // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      // res.setHeader('Content-Disposition', `attachment; filename="cotacao_${id}_${viewMode}.xlsx"`);
      
      // await workbook.xlsx.write(res);
      
      // Retorno temporário
      res.json({
        success: true,
        message: 'Exportação Excel temporariamente desabilitada',
        data: { id, viewMode, itens }
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor',
        error: error.message 
      });
    }
  }
}

module.exports = SupervisorAnaliseController;
