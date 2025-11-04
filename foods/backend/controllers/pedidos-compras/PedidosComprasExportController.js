/**
 * Controller de Exportação de Pedidos de Compras
 * Responsável por exportar dados em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');
const { asyncHandler } = require('../../middleware/responseHandler');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class PedidosComprasExportController {
  
  /**
   * Exportar pedidos de compras para XLSX
   */
  static exportarXLSX = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;

    // Query base
    let query = `
      SELECT 
        p.numero_pedido,
        s.numero_solicitacao,
        p.fornecedor_nome,
        p.fornecedor_cnpj,
        p.filial_nome,
        DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega,
        p.valor_total,
        p.status,
        DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
        (SELECT COUNT(*) FROM pedido_compras_itens WHERE pedido_id = p.id) as total_itens
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      query += ' AND (p.numero_pedido LIKE ? OR p.fornecedor_nome LIKE ? OR p.filial_nome LIKE ? OR s.numero_solicitacao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== '') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.criado_em DESC';

    const pedidos = await executeQuery(query, params);

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos de Compras');

    // Definir cabeçalhos
    worksheet.columns = [
      { header: 'Número', key: 'numero_pedido', width: 15 },
      { header: 'Solicitação', key: 'numero_solicitacao', width: 15 },
      { header: 'Fornecedor', key: 'fornecedor_nome', width: 30 },
      { header: 'CNPJ', key: 'fornecedor_cnpj', width: 18 },
      { header: 'Filial', key: 'filial_nome', width: 25 },
      { header: 'Data Entrega', key: 'data_entrega', width: 15 },
      { header: 'Valor Total', key: 'valor_total', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Itens', key: 'total_itens', width: 12 },
      { header: 'Data Criação', key: 'data_criacao', width: 18 }
    ];

    // Estilizar cabeçalhos
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    pedidos.forEach(pedido => {
      worksheet.addRow({
        numero_pedido: pedido.numero_pedido,
        numero_solicitacao: pedido.numero_solicitacao || '',
        fornecedor_nome: pedido.fornecedor_nome || '',
        fornecedor_cnpj: pedido.fornecedor_cnpj || '',
        filial_nome: pedido.filial_nome || '',
        data_entrega: pedido.data_entrega || '',
        valor_total: pedido.valor_total ? `R$ ${parseFloat(pedido.valor_total).toFixed(2)}` : 'R$ 0,00',
        status: pedido.status || '',
        total_itens: pedido.total_itens || 0,
        data_criacao: pedido.data_criacao || ''
      });
    });

    // Formatar coluna de valor
    worksheet.getColumn('valor_total').numFmt = '"R$" #,##0.00';

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Configurar resposta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=pedidos-compras-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return res.send(buffer);
  });

  /**
   * Exportar pedidos de compras para PDF
   */
  static exportarPDF = asyncHandler(async (req, res) => {
    const { search = '', status } = req.query;

    // Query base (mesma do XLSX)
    let query = `
      SELECT 
        p.numero_pedido,
        s.numero_solicitacao,
        p.fornecedor_nome,
        p.fornecedor_cnpj,
        p.filial_nome,
        DATE_FORMAT(p.data_entrega_cd, '%d/%m/%Y') as data_entrega,
        p.valor_total,
        p.status,
        DATE_FORMAT(p.criado_em, '%d/%m/%Y %H:%i') as data_criacao,
        (SELECT COUNT(*) FROM pedido_compras_itens WHERE pedido_id = p.id) as total_itens
      FROM pedidos_compras p
      LEFT JOIN solicitacoes_compras s ON p.solicitacao_compras_id = s.id
      WHERE 1=1
    `;
    
    let params = [];

    // Aplicar filtros
    if (search) {
      query += ' AND (p.numero_pedido LIKE ? OR p.fornecedor_nome LIKE ? OR p.filial_nome LIKE ? OR s.numero_solicitacao LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== '') {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.criado_em DESC';

    const pedidos = await executeQuery(query, params);

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pedidos-compras-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Título
    doc.fontSize(18).text('Pedidos de Compras', { align: 'center' });
    doc.moveDown();

    // Data de geração
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
    doc.moveDown();

    // Tabela
    const tableTop = doc.y;
    const itemHeight = 20;
    const startX = 50;
    const colWidths = [60, 60, 100, 80, 80, 60, 60, 60, 50];

    // Cabeçalhos
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Número', startX, tableTop);
    doc.text('Solicitação', startX + colWidths[0], tableTop);
    doc.text('Fornecedor', startX + colWidths[0] + colWidths[1], tableTop);
    doc.text('Filial', startX + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
    doc.text('Data Entrega', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
    doc.text('Valor Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);
    doc.text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], tableTop);

    // Linha separadora
    doc.moveTo(startX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Dados
    doc.fontSize(9).font('Helvetica');
    let y = tableTop + itemHeight;
    
    pedidos.forEach((pedido, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(pedido.numero_pedido || '', startX, y);
      doc.text(pedido.numero_solicitacao || '', startX + colWidths[0], y);
      doc.text((pedido.fornecedor_nome || '').substring(0, 20), startX + colWidths[0] + colWidths[1], y);
      doc.text((pedido.filial_nome || '').substring(0, 15), startX + colWidths[0] + colWidths[1] + colWidths[2], y);
      doc.text(pedido.data_entrega || '', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
      doc.text(pedido.valor_total ? `R$ ${parseFloat(pedido.valor_total).toFixed(2)}` : 'R$ 0,00', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y);
      doc.text(pedido.status || '', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y);
      
      y += itemHeight;
    });

    // Finalizar documento
    doc.end();
  });
}

module.exports = PedidosComprasExportController;

