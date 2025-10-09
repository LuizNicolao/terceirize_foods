const { executeQuery } = require('../../config/database');

class AjudantesExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Ajudantes');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'CPF', key: 'cpf', width: 20 },
        { header: 'Telefone', key: 'telefone', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR cpf LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const ajudantes = await executeQuery(`SELECT id, nome, cpf, telefone, status FROM ajudantes ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      ajudantes.forEach(a => ws.addRow({ id: a.id, nome: a.nome, cpf: a.cpf, telefone: a.telefone, status: a.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=ajudantes_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ajudantes_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Ajudantes', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR cpf LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const ajudantes = await executeQuery(`SELECT id, nome, cpf, telefone, status FROM ajudantes ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      ajudantes.forEach((a, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(a.nome);
        doc.fontSize(10).font('Helvetica');
        doc.text(`CPF: ${a.cpf || 'N/A'}`);
        if (a.telefone) doc.text(`Telefone: ${a.telefone}`);
        doc.text(`Status: ${a.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = AjudantesExportController;
