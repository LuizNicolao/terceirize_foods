const { executeQuery } = require('../../config/database');

class NecessidadesMerendaExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Necessidades Merenda');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Unidade Escolar', key: 'unidade', width: 40 },
        { header: 'Produto', key: 'produto', width: 40 },
        { header: 'Quantidade', key: 'quantidade', width: 15 },
        { header: 'Data', key: 'data', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, unidade_id, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (ue.nome_escola LIKE ? OR p.nome LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (unidade_id && unidade_id !== 'todos') { where += ' AND nm.unidade_escolar_id = ?'; params.push(unidade_id); }

      const necessidades = await executeQuery(`
        SELECT nm.id, ue.nome_escola as unidade, p.nome as produto, nm.quantidade, nm.data
        FROM necessidades_merenda nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        ${where} ORDER BY nm.data DESC LIMIT ${parseInt(limit)}
      `, params);
      
      necessidades.forEach(n => ws.addRow({ id: n.id, unidade: n.unidade, produto: n.produto, quantidade: n.quantidade, data: n.data ? new Date(n.data).toLocaleDateString('pt-BR') : '' }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=necessidades_merenda_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=necessidades_merenda_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Necessidades Merenda', { align: 'center' });
      doc.moveDown(2);

      const { search, unidade_id, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (ue.nome_escola LIKE ? OR p.nome LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (unidade_id && unidade_id !== 'todos') { where += ' AND nm.unidade_escolar_id = ?'; params.push(unidade_id); }

      const necessidades = await executeQuery(`
        SELECT nm.id, ue.nome_escola as unidade, p.nome as produto, nm.quantidade, nm.data
        FROM necessidades_merenda nm
        LEFT JOIN unidades_escolares ue ON nm.unidade_escolar_id = ue.id
        LEFT JOIN produtos p ON nm.produto_id = p.id
        ${where} ORDER BY nm.data DESC LIMIT ${parseInt(limit)}
      `, params);
      
      necessidades.forEach((n, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(n.unidade);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Produto: ${n.produto}`);
        doc.text(`Quantidade: ${n.quantidade}`);
        doc.text(`Data: ${n.data ? new Date(n.data).toLocaleDateString('pt-BR') : 'N/A'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = NecessidadesMerendaExportController;