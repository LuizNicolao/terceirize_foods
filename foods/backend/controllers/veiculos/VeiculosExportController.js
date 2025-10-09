const { executeQuery } = require('../../config/database');

class VeiculosExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Veículos');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Placa', key: 'placa', width: 15 },
        { header: 'Modelo', key: 'modelo', width: 30 },
        { header: 'Marca', key: 'marca', width: 20 },
        { header: 'Ano', key: 'ano', width: 10 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (placa LIKE ? OR modelo LIKE ? OR marca LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const veiculos = await executeQuery(`SELECT id, placa, modelo, marca, ano, status FROM veiculos ${where} ORDER BY placa ASC LIMIT ${parseInt(limit)}`, params);
      veiculos.forEach(v => ws.addRow({ id: v.id, placa: v.placa, modelo: v.modelo, marca: v.marca, ano: v.ano, status: v.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=veiculos_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=veiculos_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Veículos', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (placa LIKE ? OR modelo LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const veiculos = await executeQuery(`SELECT id, placa, modelo, marca, ano, status FROM veiculos ${where} ORDER BY placa ASC LIMIT ${parseInt(limit)}`, params);
      veiculos.forEach((v, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${v.placa} - ${v.modelo}`);
        doc.fontSize(10).font('Helvetica');
        if (v.marca) doc.text(`Marca: ${v.marca}`);
        if (v.ano) doc.text(`Ano: ${v.ano}`);
        doc.text(`Status: ${v.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = VeiculosExportController;
