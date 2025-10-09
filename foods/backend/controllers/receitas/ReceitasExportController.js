const { executeQuery } = require('../../config/database');

class ReceitasExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Receitas');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Tipo Cardápio', key: 'tipo_cardapio', width: 25 },
        { header: 'Rendimento', key: 'rendimento', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND r.nome LIKE ?'; params.push(`%${search}%`); }
      if (status && status !== 'todos') { where += ' AND r.status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const receitas = await executeQuery(`
        SELECT r.id, r.nome, r.rendimento, r.status, tc.nome as tipo_cardapio
        FROM receitas r
        LEFT JOIN tipos_cardapio tc ON r.tipo_cardapio_id = tc.id
        ${where} ORDER BY r.nome ASC LIMIT ${parseInt(limit)}
      `, params);
      
      receitas.forEach(r => ws.addRow({ id: r.id, nome: r.nome, tipo_cardapio: r.tipo_cardapio || '', rendimento: r.rendimento, status: r.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=receitas_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receitas_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Receitas', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND r.nome LIKE ?'; params.push(`%${search}%`); }
      if (status && status !== 'todos') { where += ' AND r.status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const receitas = await executeQuery(`
        SELECT r.id, r.nome, r.rendimento, r.status, tc.nome as tipo_cardapio
        FROM receitas r
        LEFT JOIN tipos_cardapio tc ON r.tipo_cardapio_id = tc.id
        ${where} ORDER BY r.nome ASC LIMIT ${parseInt(limit)}
      `, params);
      
      receitas.forEach((r, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(r.nome);
        doc.fontSize(10).font('Helvetica');
        if (r.tipo_cardapio) doc.text(`Tipo: ${r.tipo_cardapio}`);
        doc.text(`Rendimento: ${r.rendimento || 'N/A'}`);
        doc.text(`Status: ${r.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = ReceitasExportController;