const { executeQuery } = require('../../config/database');

class TiposCardapioExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Tipos de Cardápio');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR codigo LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

      const tipos = await executeQuery(`SELECT id, codigo, nome, status FROM tipos_cardapio ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      tipos.forEach(t => ws.addRow({ id: t.id, codigo: t.codigo, nome: t.nome, status: t.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=tipos_cardapio_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=tipos_cardapio_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Tipos de Cardápio', { align: 'center' });
      doc.moveDown(2);

      const { search, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR codigo LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

      const tipos = await executeQuery(`SELECT id, codigo, nome, status FROM tipos_cardapio ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      tipos.forEach((t, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${t.codigo} - ${t.nome}`);
        doc.fontSize(10).font('Helvetica').text(`Status: ${t.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = TiposCardapioExportController;
