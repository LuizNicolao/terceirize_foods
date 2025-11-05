/**
 * Controller para geração de PDF de Solicitações de Compras
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const { notFoundResponse } = require('../../middleware/responseHandler');

class SolicitacoesComprasPDFController {
  /**
   * Gerar PDF da solicitação de compras
   */
  static gerarPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar dados completos da solicitação
    const [solicitacao] = await executeQuery(
      `SELECT 
        sc.id,
        sc.numero_solicitacao,
        sc.data_entrega_cd,
        sc.data_documento,
        sc.semana_abastecimento,
        sc.justificativa,
        sc.observacoes,
        sc.status,
        sc.criado_em,
        sc.unidade,
        sc.usuario_nome,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo,
        u.nome as usuario_nome_from_user
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      LEFT JOIN usuarios u ON sc.usuario_id = u.id OR sc.criado_por = u.id
      WHERE sc.id = ?`,
      [id]
    );

    if (!solicitacao) {
      return notFoundResponse(res, 'Solicitação de compras não encontrada');
    }

    // Buscar itens da solicitação
    const itens = await executeQuery(
      `SELECT 
        sci.id,
        sci.produto_id,
        sci.quantidade,
        sci.observacao,
        sci.unidade_medida_id,
        pg.codigo as produto_codigo,
        pg.nome as produto_nome,
        um.sigla as unidade_simbolo,
        um.nome as unidade_nome
      FROM solicitacao_compras_itens sci
      INNER JOIN produto_generico pg ON sci.produto_id = pg.id
      LEFT JOIN unidades_medida um ON sci.unidade_medida_id = um.id
      WHERE sci.solicitacao_id = ?
      ORDER BY pg.nome`,
      [id]
    );

    // Buscar números de pedidos vinculados à solicitação (únicos)
    const pedidosVinculados = await executeQuery(
      `SELECT DISTINCT pc.numero_pedido
       FROM pedidos_compras pc
       INNER JOIN pedido_compras_itens pci ON pc.id = pci.pedido_id
       INNER JOIN solicitacao_compras_itens sci ON pci.solicitacao_item_id = sci.id
       WHERE sci.solicitacao_id = ?
       ORDER BY pc.numero_pedido`,
      [id]
    );

    const numerosPedidos = pedidosVinculados.map(p => p.numero_pedido);

    // Buscar vínculos com pedidos para calcular quantidade_utilizada e saldo_disponivel
    const itensComPedidos = await Promise.all(
      itens.map(async (item) => {
        // Buscar pedidos vinculados a este item
        const vinculos = await executeQuery(
          `SELECT 
            pci.quantidade_pedido,
            pc.numero_pedido,
            pc.id as pedido_id
          FROM pedido_compras_itens pci
          INNER JOIN pedidos_compras pc ON pci.pedido_id = pc.id
          WHERE pci.solicitacao_item_id = ?
            AND pc.status IN ('aprovado', 'parcial', 'finalizado')`,
          [item.id]
        );

        // Calcular quantidade utilizada e saldo disponível
        const quantidade_utilizada = vinculos.reduce((sum, v) => sum + parseFloat(v.quantidade_pedido || 0), 0);
        const saldo_disponivel = parseFloat(item.quantidade || 0) - quantidade_utilizada;

        // Status do item
        let statusItem = 'ABERTO';
        if (quantidade_utilizada > 0 && saldo_disponivel > 0) {
          statusItem = 'PARCIAL';
        } else if (saldo_disponivel <= 0 && quantidade_utilizada > 0) {
          statusItem = 'FINALIZADO';
        }

        return {
          ...item,
          quantidade_utilizada,
          saldo_disponivel,
          status_item: statusItem,
          pedidos_vinculados: vinculos.map(v => ({
            numero: v.numero_pedido,
            quantidade: parseFloat(v.quantidade_pedido || 0)
          }))
        };
      })
    );

    // Gerar PDF usando PDFKit - Layout adaptado do modal
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 30,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=solicitacao_${solicitacao.numero_solicitacao}.pdf`);
    doc.pipe(res);

    // Função auxiliar para desenhar badge de status
    const drawStatusBadge = (x, y, status) => {
      const statusText = status?.toUpperCase() || '-';
      const statusWidth = doc.widthOfString(statusText, { font: 'Helvetica-Bold', fontSize: 9 }) + 10;
      const statusHeight = 15;
      
      let bgColor = '#E5E7EB';
      let textColor = '#374151';
      
      if (status === 'parcial') {
        bgColor = '#FED7AA';
        textColor = '#C2410C';
      } else if (status === 'finalizado') {
        bgColor = '#BBF7D0';
        textColor = '#166534';
      } else if (status === 'aberto') {
        bgColor = '#DBEAFE';
        textColor = '#1E40AF';
      }
      
      doc.roundedRect(x, y, statusWidth, statusHeight, 4)
         .fillColor(bgColor)
         .fill()
         .fillColor(textColor);
      
      doc.fontSize(9).font('Helvetica-Bold')
         .text(statusText, x + 5, y + 2, { width: statusWidth - 10, align: 'center' });
      
      doc.fillColor('black');
      return { width: statusWidth, height: statusHeight };
    };

    // Título principal
    doc.fontSize(20).font('Helvetica-Bold').fillColor('black');
    doc.text('Visualizar Solicitação', 30, 30, { align: 'center' });
    doc.moveDown(1);

    // Cabeçalho da Solicitação (similar ao modal)
    let headerY = doc.y;
    const leftMargin = 30;
    const rightMargin = 30;
    const pageWidth = 595; // A4 width
    const usableWidth = pageWidth - leftMargin - rightMargin;
    const colWidth = usableWidth / 2;
    const spacing = 20;
    const lineHeight = 18; // Reduzido de 25 para 18
    let currentY = headerY;
    const headerStartY = currentY;

    // Estimar altura do cabeçalho
    let estimatedHeaderHeight = 160;
    if (solicitacao.observacoes) {
      estimatedHeaderHeight = 200; // Mais espaço para observações
    }

    // Desenhar fundo cinza claro para o cabeçalho (simular bg-gray-50)
    doc.rect(leftMargin, headerStartY - 5, usableWidth, estimatedHeaderHeight)
       .fillColor('#F9FAFB')
       .fill()
       .fillColor('black');

    // Removido título "Cabeçalho da Solicitação"
    currentY += 5;

    // Linha 1: Filial | Data de Entrega CD
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Filial:', leftMargin + 10, currentY);
    doc.font('Helvetica').text(solicitacao.filial_nome || solicitacao.unidade || '-', leftMargin + 10, currentY + 12);
    
    doc.font('Helvetica-Bold');
    doc.text('Data de Entrega CD:', leftMargin + colWidth + spacing, currentY);
    const dataEntrega = solicitacao.data_entrega_cd
      ? new Date(solicitacao.data_entrega_cd).toLocaleDateString('pt-BR')
      : '-';
    doc.font('Helvetica').text(dataEntrega, leftMargin + colWidth + spacing, currentY + 12);
    currentY += lineHeight;

    // Linha 2: Semana de Abastecimento | Justificativa
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Semana de Abastecimento:', leftMargin + 10, currentY);
    doc.font('Helvetica').text(solicitacao.semana_abastecimento || '-', leftMargin + 10, currentY + 12);
    
    doc.font('Helvetica-Bold');
    doc.text('Justificativa:', leftMargin + colWidth + spacing, currentY);
    doc.font('Helvetica').text(solicitacao.justificativa || '-', leftMargin + colWidth + spacing, currentY + 12);
    currentY += lineHeight;

    // Linha 3: Data do Documento | Número da Solicitação
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Data do Documento:', leftMargin + 10, currentY);
    const dataDocumento = solicitacao.data_documento
      ? new Date(solicitacao.data_documento).toLocaleDateString('pt-BR')
      : (solicitacao.criado_em
          ? new Date(solicitacao.criado_em).toLocaleDateString('pt-BR')
          : '-');
    doc.font('Helvetica').text(dataDocumento, leftMargin + 10, currentY + 12);
    
    doc.font('Helvetica-Bold');
    doc.text('Número da Solicitação:', leftMargin + colWidth + spacing, currentY);
    doc.font('Helvetica').text(solicitacao.numero_solicitacao || '-', leftMargin + colWidth + spacing, currentY + 12);
    currentY += lineHeight;

    // Linha 4: Solicitante | Pedidos Vinculados
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Solicitante:', leftMargin + 10, currentY);
    const solicitanteNome = solicitacao.usuario_nome || solicitacao.usuario_nome_from_user || '-';
    doc.font('Helvetica').text(solicitanteNome, leftMargin + 10, currentY + 12);
    
    doc.font('Helvetica-Bold');
    doc.text('Pedidos Vinculados:', leftMargin + colWidth + spacing, currentY);
    const pedidosText = numerosPedidos.length > 0 ? numerosPedidos.join(', ') : '-';
    doc.font('Helvetica').text(pedidosText, leftMargin + colWidth + spacing, currentY + 12);
    currentY += lineHeight;

    // Observações Gerais
    if (solicitacao.observacoes) {
      currentY += 8;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Observações Gerais:', leftMargin + 10, currentY);
      currentY += 12;
      const observacoesHeight = doc.heightOfString(solicitacao.observacoes, {
        width: usableWidth - 20,
        align: 'left'
      });
      doc.font('Helvetica').text(solicitacao.observacoes, leftMargin + 10, currentY, {
        width: usableWidth - 20,
        align: 'left'
      });
      currentY += observacoesHeight + 8;
    } else {
      currentY += 10;
    }

    doc.y = currentY + 15;
    doc.moveDown(1);

    // Verificar se precisa de nova página antes da tabela
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 30;
    }

    // Produtos da Solicitação (similar ao modal)
    const produtosTitleY = doc.y;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black');
    doc.text('Produtos da Solicitação', leftMargin + 10, produtosTitleY);
    doc.y = produtosTitleY + 20;

    // Tabela simples (similar ao modal)
    const tableLeft = leftMargin + 10;
    const tableTop = doc.y;
    const tableWidth = usableWidth - 20;
    
    // Larguras das colunas (melhor espaçamento)
    const colWidths = {
      produto: tableWidth * 0.45,  // 45%
      unidade: tableWidth * 0.12,  // 12%
      quantidade: tableWidth * 0.18, // 18%
      observacao: tableWidth * 0.25  // 25%
    };

    // Cabeçalho da tabela
    doc.fontSize(10).font('Helvetica-Bold');
    let x = tableLeft;
    doc.text('Produto Genérico', x, tableTop, { width: colWidths.produto });
    x += colWidths.produto;
    doc.text('Unidade', x, tableTop, { width: colWidths.unidade, align: 'center' });
    x += colWidths.unidade;
    doc.text('Quantidade', x, tableTop, { width: colWidths.quantidade, align: 'right' });
    x += colWidths.quantidade;
    doc.text('Observação', x, tableTop, { width: colWidths.observacao });

    // Linha separadora
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + tableWidth, tableTop + 15).stroke();

    // Dados dos itens
    doc.fontSize(9).font('Helvetica');
    let tableRowY = tableTop + 20;
    const maxY = 750;
    let pageBreakOccurred = false;
    
    itensComPedidos.forEach((item, index) => {
      // Verificar se precisa de nova página
      if (tableRowY > maxY) {
        pageBreakOccurred = true;
        doc.addPage();
        doc.y = 30;
        tableRowY = doc.y;
        
        // Reimprimir título
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('Produtos da Solicitação', leftMargin + 10, tableRowY - 20);
        
        // Reimprimir cabeçalho
        doc.fontSize(10).font('Helvetica-Bold');
        x = tableLeft;
        doc.text('Produto Genérico', x, tableRowY, { width: colWidths.produto });
        x += colWidths.produto;
        doc.text('Unidade', x, tableRowY, { width: colWidths.unidade, align: 'center' });
        x += colWidths.unidade;
        doc.text('Quantidade', x, tableRowY, { width: colWidths.quantidade, align: 'right' });
        x += colWidths.quantidade;
        doc.text('Observação', x, tableRowY, { width: colWidths.observacao });
        doc.moveTo(tableLeft, tableRowY + 15).lineTo(tableLeft + tableWidth, tableRowY + 15).stroke();
        tableRowY += 20;
      }

      x = tableLeft;
      // Produto (código + nome)
      const produtoText = item.produto_codigo 
        ? `${item.produto_codigo} - ${item.produto_nome || '-'}`
        : (item.produto_nome || '-');
      doc.font('Helvetica').text(produtoText, x, tableRowY, { width: colWidths.produto - 5 });
      x += colWidths.produto;
      
      // Unidade
      doc.text(item.unidade_simbolo || item.unidade_nome || '-', x, tableRowY, { width: colWidths.unidade, align: 'center' });
      x += colWidths.unidade;
      
      // Quantidade
      doc.text(parseFloat(item.quantidade || 0).toFixed(3), x, tableRowY, { width: colWidths.quantidade, align: 'right' });
      x += colWidths.quantidade;
      
      // Observação
      doc.text(item.observacao || '-', x, tableRowY, { width: colWidths.observacao - 5 });

      tableRowY += 18;
    });

    // Linha final da tabela
    doc.moveTo(tableLeft, tableRowY - 3).lineTo(tableLeft + tableWidth, tableRowY - 3).stroke();

    // Finalizar PDF
    doc.end();
  });
}

module.exports = SolicitacoesComprasPDFController;

