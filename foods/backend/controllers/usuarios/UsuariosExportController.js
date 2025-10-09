const { executeQuery } = require('../../config/database');

class UsuariosExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Usuários');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Tipo de Acesso', key: 'tipo_de_acesso', width: 20 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, tipo_de_acesso, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }
      if (tipo_de_acesso && tipo_de_acesso !== 'todos') { where += ' AND tipo_de_acesso = ?'; params.push(tipo_de_acesso); }

      const usuarios = await executeQuery(`SELECT id, nome, email, tipo_de_acesso, status FROM usuarios ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      usuarios.forEach(u => ws.addRow({ id: u.id, nome: u.nome, email: u.email, tipo_de_acesso: u.tipo_de_acesso, status: u.status === 1 ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Usuários', { align: 'center' });
      doc.moveDown(2);

      const { search, status, tipo_de_acesso, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (nome LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }
      if (tipo_de_acesso && tipo_de_acesso !== 'todos') { where += ' AND tipo_de_acesso = ?'; params.push(tipo_de_acesso); }

      const usuarios = await executeQuery(`SELECT id, nome, email, tipo_de_acesso, status FROM usuarios ${where} ORDER BY nome ASC LIMIT ${parseInt(limit)}`, params);
      usuarios.forEach((u, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(u.nome);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Email: ${u.email}`);
        doc.text(`Tipo de Acesso: ${u.tipo_de_acesso}`);
        doc.text(`Status: ${u.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = UsuariosExportController;
