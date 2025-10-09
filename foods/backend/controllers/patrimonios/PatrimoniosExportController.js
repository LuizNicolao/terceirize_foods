const { executeQuery } = require('../../config/database');

class PatrimoniosExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Patrimônios');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Número', key: 'numero_patrimonio', width: 20 },
        { header: 'Produto', key: 'produto', width: 40 },
        { header: 'Unidade Escolar', key: 'unidade_escolar', width: 40 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (p.numero_patrimonio LIKE ? OR pr.nome LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND p.status = ?'; params.push(status); }

      const patrimonios = await executeQuery(`
        SELECT p.id, p.numero_patrimonio, p.status, pr.nome as produto, ue.nome_escola as unidade_escolar
        FROM patrimonios p
        LEFT JOIN produtos pr ON p.produto_id = pr.id
        LEFT JOIN unidades_escolares ue ON p.unidade_escolar_id = ue.id
        ${where} ORDER BY p.numero_patrimonio ASC LIMIT ${parseInt(limit)}
      `, params);
      
      patrimonios.forEach(p => ws.addRow({ id: p.id, numero_patrimonio: p.numero_patrimonio, produto: p.produto || '', unidade_escolar: p.unidade_escolar || '', status: p.status === 'ativo' ? 'Ativo' : 'Inativo' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=patrimonios_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=patrimonios_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Patrimônios', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (p.numero_patrimonio LIKE ? OR pr.nome LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND p.status = ?'; params.push(status); }

      const patrimonios = await executeQuery(`
        SELECT p.id, p.numero_patrimonio, p.status, pr.nome as produto, ue.nome_escola as unidade_escolar
        FROM patrimonios p
        LEFT JOIN produtos pr ON p.produto_id = pr.id
        LEFT JOIN unidades_escolares ue ON p.unidade_escolar_id = ue.id
        ${where} ORDER BY p.numero_patrimonio ASC LIMIT ${parseInt(limit)}
      `, params);
      
      patrimonios.forEach((p, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`Patrimônio: ${p.numero_patrimonio}`);
        doc.fontSize(10).font('Helvetica');
        if (p.produto) doc.text(`Produto: ${p.produto}`);
        if (p.unidade_escolar) doc.text(`Unidade: ${p.unidade_escolar}`);
        doc.text(`Status: ${p.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = PatrimoniosExportController;
