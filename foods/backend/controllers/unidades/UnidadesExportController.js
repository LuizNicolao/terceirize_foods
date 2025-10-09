const { executeQuery } = require('../../config/database');

class UnidadesExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Unidades');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Sigla', key: 'sigla', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR sigla LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const unidades = await executeQuery(`SELECT id, nome, sigla, status FROM unidades ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      unidades.forEach(u => ws.addRow({ id: u.id, nome: u.nome, sigla: u.sigla, status: u.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Unidades', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR sigla LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const unidades = await executeQuery(`SELECT id, nome, sigla, status FROM unidades ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      unidades.forEach((u, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${u.nome} (${u.sigla})`);
        doc.fontSize(10).font('Helvetica').text(`Status: ${u.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = UnidadesExportController;
