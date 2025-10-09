const { executeQuery } = require('../../config/database');

class ClientesExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Clientes');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Razão Social', key: 'razao_social', width: 40 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Município', key: 'municipio', width: 25 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, uf, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (razao_social LIKE ? OR cnpj LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }
      if (uf && uf !== 'todos') { where += ' AND uf = ?'; params.push(uf); }

      const clientes = await executeQuery(`SELECT id, razao_social, cnpj, municipio, uf, status FROM clientes ${where} ORDER BY razao_social ASC LIMIT ${parseInt(limit)}`, params);
      clientes.forEach(c => ws.addRow({ id: c.id, razao_social: c.razao_social, cnpj: c.cnpj, municipio: c.municipio, uf: c.uf, status: c.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=clientes_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Clientes', { align: 'center' });
      doc.moveDown(2);

      const { search, status, uf, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (razao_social LIKE ? OR cnpj LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }
      if (uf && uf !== 'todos') { where += ' AND uf = ?'; params.push(uf); }

      const clientes = await executeQuery(`SELECT id, razao_social, cnpj, municipio, uf, status FROM clientes ${where} ORDER BY razao_social ASC LIMIT ${parseInt(limit)}`, params);
      clientes.forEach((c, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(c.razao_social);
        doc.fontSize(10).font('Helvetica');
        doc.text(`CNPJ: ${c.cnpj || 'N/A'}`);
        doc.text(`Município/UF: ${c.municipio}/${c.uf}`);
        doc.text(`Status: ${c.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = ClientesExportController;
