const { executeQuery } = require('../../config/database');

class FiliaisExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Filiais');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo_filial', width: 15 },
        { header: 'Nome', key: 'filial', width: 40 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Cidade', key: 'cidade', width: 25 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (filial LIKE ? OR codigo_filial LIKE ? OR cnpj LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const filiais = await executeQuery(`SELECT id, codigo_filial, filial, cnpj, cidade, status FROM filiais ${where} ORDER BY filial ASC LIMIT ${parseInt(limit)}`, params);
      filiais.forEach(f => ws.addRow({ id: f.id, codigo_filial: f.codigo_filial, filial: f.filial, cnpj: f.cnpj, cidade: f.cidade, status: f.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=filiais_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Filiais', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (filial LIKE ? OR codigo_filial LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const filiais = await executeQuery(`SELECT id, codigo_filial, filial, cnpj, cidade, status FROM filiais ${where} ORDER BY filial ASC LIMIT ${parseInt(limit)}`, params);
      filiais.forEach((f, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${f.codigo_filial} - ${f.filial}`);
        doc.fontSize(10).font('Helvetica');
        doc.text(`CNPJ: ${f.cnpj || 'N/A'}`);
        doc.text(`Cidade: ${f.cidade || 'N/A'}`);
        doc.text(`Status: ${f.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = FiliaisExportController;
