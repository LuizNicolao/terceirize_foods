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

    // Cabeçalho
    doc.fontSize(20).font('Helvetica-Bold').text('Visualizar Solicitação de Compra', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').text('Informações da Solicitação', { align: 'center' });
    doc.moveDown(1);

    // Informações principais (duas colunas)
    const infoY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Número:', 50, infoY);
    doc.font('Helvetica');
    doc.text(solicitacao.numero_solicitacao || '-', 120, infoY);

    const dataCriacao = solicitacao.criado_em 
      ? new Date(solicitacao.criado_em).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-';
    
    doc.font('Helvetica-Bold');
    doc.text('Data de Criação:', 300, infoY);
    doc.font('Helvetica');
    doc.text(dataCriacao, 420, infoY);

    const dataEntrega = solicitacao.data_entrega_cd
      ? new Date(solicitacao.data_entrega_cd).toLocaleDateString('pt-BR')
      : '-';
    
    doc.font('Helvetica-Bold');
    doc.text('Data Entrega CD:', 50, infoY + 20);
    doc.font('Helvetica');
    doc.text(dataEntrega, 150, infoY + 20);

    const statusLabel = solicitacao.status?.toUpperCase() || '-';
    doc.font('Helvetica-Bold');
    doc.text('Status:', 300, infoY + 20);
    doc.font('Helvetica');
    doc.text(statusLabel, 350, infoY + 20);

    doc.moveDown(2);

    // Seção: Filial
    doc.fontSize(12).font('Helvetica-Bold').text('Filial', 50, doc.y);
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${solicitacao.filial_nome || solicitacao.unidade || '-'}`, 50, doc.y);
    doc.text(`Código: ${solicitacao.filial_codigo || '-'}`, 50, doc.y + 15);
    doc.moveDown(1.5);

    // Seção: Justificativa
    doc.fontSize(12).font('Helvetica-Bold').text('Justificativa', 50, doc.y);
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Justificativa: ${solicitacao.justificativa || '-'}`, 50, doc.y);
    doc.moveDown(2);

    // Tabela: Produtos Solicitados
    doc.fontSize(12).font('Helvetica-Bold').text('Produtos Solicitados', 50, doc.y);
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = {
      codigo: 50,
      produto: 180,
      unidade: 40,
      quantidade_solicitada: 60,
      quantidade_utilizada: 60,
      saldo_disponivel: 60,
      status: 60,
      pedidos: 100
    };

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
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + Object.values(colWidths).reduce((a, b) => a + b, 0), tableTop + 15).stroke();

    // Dados dos itens
    doc.fontSize(8).font('Helvetica');
    let currentY = tableTop + 20;
    
    itensComPedidos.forEach((item, index) => {
      if (currentY > 700) {
        // Nova página se necessário
        doc.addPage();
        currentY = 50;
        
        // Reimprimir cabeçalho da tabela
        doc.fontSize(8).font('Helvetica-Bold');
        x = tableLeft;
        doc.text('CÓDIGO', x, currentY);
        x += colWidths.codigo;
        doc.text('PRODUTO', x, currentY);
        x += colWidths.produto;
        doc.text('UN', x, currentY);
        x += colWidths.unidade;
        doc.text('QTD. SOLICITADA', x, currentY);
        x += colWidths.quantidade_solicitada;
        doc.text('QTD. UTILIZADA', x, currentY);
        x += colWidths.quantidade_utilizada;
        doc.text('SALDO DISP.', x, currentY);
        x += colWidths.saldo_disponivel;
        doc.text('STATUS', x, currentY);
        x += colWidths.status;
        doc.text('PEDIDOS VINCULADOS', x, currentY);
        currentY += 20;
        doc.moveTo(tableLeft, currentY - 5).lineTo(tableLeft + Object.values(colWidths).reduce((a, b) => a + b, 0), currentY - 5).stroke();
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
      
      doc.text(item.status_item || '-', x, currentY);
      x += colWidths.status;
      
      // Pedidos vinculados
      const pedidosText = item.pedidos_vinculados.length > 0
        ? item.pedidos_vinculados.map(p => `${p.numero} (${p.quantidade.toFixed(3)})`).join(', ')
        : '-';
      doc.text(pedidosText, x, currentY, { width: colWidths.pedidos, ellipsis: true });

      currentY += 15;
    });

    // Finalizar PDF
    doc.end();
  });
}

module.exports = SolicitacoesComprasPDFController;

