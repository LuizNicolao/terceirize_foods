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
        sc.semana_abastecimento,
        sc.justificativa,
        sc.observacoes,
        sc.status,
        sc.criado_em,
        sc.unidade,
        f.filial as filial_nome,
        f.codigo_filial as filial_codigo,
        u.nome as usuario_nome
      FROM solicitacoes_compras sc
      LEFT JOIN filiais f ON sc.filial_id = f.id
      LEFT JOIN usuarios u ON sc.usuario_id = u.id
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

    // Gerar PDF usando PDFKit
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=solicitacao_${solicitacao.numero_solicitacao}.pdf`);
    doc.pipe(res);

    // Função auxiliar para desenhar caixa com borda
    const drawBox = (x, y, width, height, padding = 10) => {
      doc.rect(x, y, width, height).stroke();
      return { x: x + padding, y: y + padding, width: width - (padding * 2), height: height - (padding * 2) };
    };

    // Função auxiliar para desenhar badge de status
    const drawStatusBadge = (x, y, status) => {
      const statusText = status?.toUpperCase() || '-';
      const statusWidth = doc.widthOfString(statusText, { font: 'Helvetica-Bold', fontSize: 9 }) + 10;
      const statusHeight = 15;
      
      // Cor de fundo baseada no status
      let bgColor = '#E5E7EB'; // cinza padrão
      let textColor = '#374151'; // cinza escuro
      
      if (status === 'parcial') {
        bgColor = '#FED7AA'; // laranja claro
        textColor = '#C2410C'; // laranja escuro
      } else if (status === 'finalizado') {
        bgColor = '#BBF7D0'; // verde claro
        textColor = '#166534'; // verde escuro
      } else if (status === 'aberto') {
        bgColor = '#DBEAFE'; // azul claro
        textColor = '#1E40AF'; // azul escuro
      }
      
      // Desenhar retângulo arredondado
      doc.roundedRect(x, y, statusWidth, statusHeight, 4)
         .fillColor(bgColor)
         .fill()
         .fillColor(textColor);
      
      doc.fontSize(9).font('Helvetica-Bold')
         .text(statusText, x + 5, y + 2, { width: statusWidth - 10, align: 'center' });
      
      doc.fillColor('black'); // Resetar cor
      return { width: statusWidth, height: statusHeight };
    };

    // Título principal
    doc.fontSize(24).font('Helvetica-Bold').fillColor('black');
    const titleY = 50;
    doc.text('Visualizar Solicitação de Compra', 50, titleY);
    
    // Linha embaixo do título
    const titleWidth = doc.widthOfString('Visualizar Solicitação de Compra', { font: 'Helvetica-Bold', fontSize: 24 });
    doc.moveTo(50, titleY + 25).lineTo(50 + titleWidth, titleY + 25).stroke();
    
    doc.moveDown(1);

    const startY = doc.y;
    const boxWidth = 240;
    const boxHeight = 100;
    const spacing = 10; // Reduzido de 20 para 10

    // Caixa: Informações da Solicitação (esquerda)
    const infoBox = drawBox(50, startY, boxWidth, boxHeight);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
    doc.text('Informações da Solicitação', infoBox.x, infoBox.y);
    
    let infoContentY = infoBox.y + 20;
    doc.fontSize(10);
    
    // Número
    doc.font('Helvetica-Bold').text('Número:', infoBox.x, infoContentY);
    doc.font('Helvetica').text(solicitacao.numero_solicitacao || '-', infoBox.x + 60, infoContentY);
    infoContentY += 15;
    
    // Data de Criação
    const dataCriacao = solicitacao.criado_em 
      ? new Date(solicitacao.criado_em).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-';
    doc.font('Helvetica-Bold').text('Data de Criação:', infoBox.x, infoContentY);
    doc.font('Helvetica').text(dataCriacao, infoBox.x + 100, infoContentY);
    infoContentY += 15;
    
    // Data Entrega CD
    const dataEntrega = solicitacao.data_entrega_cd
      ? new Date(solicitacao.data_entrega_cd).toLocaleDateString('pt-BR')
      : '-';
    doc.font('Helvetica-Bold').text('Data Entrega CD:', infoBox.x, infoContentY);
    doc.font('Helvetica').text(dataEntrega, infoBox.x + 110, infoContentY);
    infoContentY += 15;
    
    // Status com badge
    doc.font('Helvetica-Bold').text('Status:', infoBox.x, infoContentY);
    const statusLabel = solicitacao.status?.toLowerCase() || '';
    drawStatusBadge(infoBox.x + 50, infoContentY - 2, statusLabel);

    // Caixa: Filial (direita)
    const filialBox = drawBox(50 + boxWidth + spacing, startY, boxWidth, boxHeight);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
    doc.text('Filial', filialBox.x, filialBox.y);
    
    let filialContentY = filialBox.y + 20;
    doc.fontSize(10);
    
    // Nome
    doc.font('Helvetica-Bold').text('Nome:', filialBox.x, filialContentY);
    doc.font('Helvetica').text(solicitacao.filial_nome || solicitacao.unidade || '-', filialBox.x + 50, filialContentY);
    filialContentY += 15;
    
    // Código
    doc.font('Helvetica-Bold').text('Código:', filialBox.x, filialContentY);
    doc.font('Helvetica').text(solicitacao.filial_codigo || '-', filialBox.x + 50, filialContentY);

    // Caixa: Justificativa (abaixo das informações)
    const justificativaBox = drawBox(50, startY + boxHeight + spacing, boxWidth * 2 + spacing, 60);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
    doc.text('Justificativa', justificativaBox.x, justificativaBox.y);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`Justificativa: ${solicitacao.justificativa || '-'}`, justificativaBox.x, justificativaBox.y + 20);

    doc.y = startY + boxHeight + spacing + 60 + 10; // Reduzido de +20 para +10

    // Verificar se precisa de nova página antes da tabela
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    // Tabela: Produtos Solicitados
    const produtosTitleY = doc.y;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
    doc.text(`Produtos Solicitados (${itensComPedidos.length})`, 50, produtosTitleY);
    
    const tableStartY = produtosTitleY + 15; // Reduzido de 20 para 15
    const tableTop = tableStartY + 10;
    const tableLeft = 50;
    // Ajustar larguras para caber na página A4 (largura útil ~495 pontos com margem de 50)
    const colWidths = {
      codigo: 45,
      produto: 140,
      unidade: 30,
      quantidade_solicitada: 50,
      quantidade_utilizada: 50,
      saldo_disponivel: 50,
      status: 50,
      pedidos: 80
    };
    const tableWidth = Object.values(colWidths).reduce((a, b) => a + b, 0); // Total: 495

    // Desenhar caixa ao redor da tabela (vai ser ajustada depois)
    const produtosBox = drawBox(tableLeft - 10, tableStartY, tableWidth + 20, 750 - tableStartY);

    // Cabeçalho da tabela
    doc.fontSize(8).font('Helvetica-Bold');
    let x = tableLeft;
    doc.text('CÓDIGO', x, tableTop);
    x += colWidths.codigo;
    doc.text('PRODUTO', x, tableTop);
    x += colWidths.produto;
    doc.text('UN', x, tableTop);
    x += colWidths.unidade;
    doc.text('QTD. SOLICITADA', x, tableTop);
    x += colWidths.quantidade_solicitada;
    doc.text('QTD. UTILIZADA', x, tableTop);
    x += colWidths.quantidade_utilizada;
    doc.text('SALDO DISP.', x, tableTop);
    x += colWidths.saldo_disponivel;
    doc.text('STATUS', x, tableTop);
    x += colWidths.status;
    doc.text('PEDIDOS VINCULADOS', x, tableTop);

    // Linha separadora
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + tableWidth, tableTop + 15).stroke();

    // Dados dos itens
    doc.fontSize(8).font('Helvetica');
    let currentY = tableTop + 20;
    const maxY = 700; // Altura máxima antes de quebrar página
    let pageBreakOccurred = false;
    
    itensComPedidos.forEach((item, index) => {
      // Verificar se precisa de nova página (deixar espaço para pelo menos uma linha + footer)
      if (currentY > maxY) {
        pageBreakOccurred = true;
        
        // Fechar a caixa na página atual
        const boxBottom = currentY - 5;
        doc.moveTo(tableLeft - 10, boxBottom).lineTo(tableLeft + tableWidth + 10, boxBottom).stroke();
        
        // Nova página
        doc.addPage();
        
        // Desenhar caixa na nova página
        const newTableStartY = 50;
        const newTableTop = newTableStartY + 10;
        drawBox(tableLeft - 10, newTableStartY, tableWidth + 20, 750 - newTableStartY);
        
        // Reimprimir título da seção
        doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
        doc.text(`Produtos Solicitados (${itensComPedidos.length})`, tableLeft, newTableStartY - 15);
        
        // Reimprimir cabeçalho da tabela
        currentY = newTableTop + 20;
        doc.fontSize(8).font('Helvetica-Bold');
        x = tableLeft;
        doc.text('CÓDIGO', x, newTableTop);
        x += colWidths.codigo;
        doc.text('PRODUTO', x, newTableTop);
        x += colWidths.produto;
        doc.text('UN', x, newTableTop);
        x += colWidths.unidade;
        doc.text('QTD. SOLICITADA', x, newTableTop);
        x += colWidths.quantidade_solicitada;
        doc.text('QTD. UTILIZADA', x, newTableTop);
        x += colWidths.quantidade_utilizada;
        doc.text('SALDO DISP.', x, newTableTop);
        x += colWidths.saldo_disponivel;
        doc.text('STATUS', x, newTableTop);
        x += colWidths.status;
        doc.text('PEDIDOS VINCULADOS', x, newTableTop);
        currentY = newTableTop + 20;
        doc.moveTo(tableLeft, currentY - 5).lineTo(tableLeft + tableWidth, currentY - 5).stroke();
      }

      x = tableLeft;
      doc.text(item.produto_codigo || '-', x, currentY);
      x += colWidths.codigo;
      
      // Produto (pode quebrar linha)
      const produtoNome = item.produto_nome || '-';
      const maxWidth = colWidths.produto - 5;
      doc.text(produtoNome, x, currentY, { width: maxWidth, ellipsis: true });
      x += colWidths.produto;
      
      doc.text(item.unidade_simbolo || '-', x, currentY);
      x += colWidths.unidade;
      
      doc.text(parseFloat(item.quantidade || 0).toFixed(2), x, currentY, { width: colWidths.quantidade_solicitada, align: 'right' });
      x += colWidths.quantidade_solicitada;
      
      doc.text(parseFloat(item.quantidade_utilizada || 0).toFixed(2), x, currentY, { width: colWidths.quantidade_utilizada, align: 'right' });
      x += colWidths.quantidade_utilizada;
      
      doc.text(parseFloat(item.saldo_disponivel || 0).toFixed(2), x, currentY, { width: colWidths.saldo_disponivel, align: 'right' });
      x += colWidths.saldo_disponivel;
      
      // Status com badge
      const itemStatus = item.status_item?.toLowerCase() || '';
      const badgeInfo = drawStatusBadge(x, currentY - 2, itemStatus);
      x += colWidths.status;
      
      // Pedidos vinculados
      const pedidosText = item.pedidos_vinculados.length > 0
        ? item.pedidos_vinculados.map(p => `${p.numero} (${p.quantidade.toFixed(3)})`).join(', ')
        : '-';
      doc.font('Helvetica').fontSize(8).fillColor('black');
      doc.text(pedidosText, x, currentY, { width: colWidths.pedidos, ellipsis: true });

      currentY += 15;
    });

    // Fechar a caixa na última página (se não houve quebra de página, ajustar altura)
    if (!pageBreakOccurred) {
      // Ajustar altura da caixa para o conteúdo real
      const tableEndY = currentY;
      const tableHeight = tableEndY - tableStartY + 10;
      // Redesenhar a caixa com altura correta
      doc.rect(tableLeft - 10, tableStartY, tableWidth + 20, tableHeight).stroke();
    } else {
      // Se houve quebra, fechar a caixa na última página
      const boxBottom = currentY - 5;
      doc.moveTo(tableLeft - 10, boxBottom).lineTo(tableLeft + tableWidth + 10, boxBottom).stroke();
    }

    // Finalizar PDF
    doc.end();
  });
}

module.exports = SolicitacoesComprasPDFController;

