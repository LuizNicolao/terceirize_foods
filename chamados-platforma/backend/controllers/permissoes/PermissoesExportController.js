const { executeQuery } = require('../../config/database');

class PermissoesExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Permissões');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Usuário', key: 'usuario', width: 40 },
        { header: 'Tela', key: 'tela', width: 30 },
        { header: 'Visualizar', key: 'visualizar', width: 12 },
        { header: 'Criar', key: 'criar', width: 12 },
        { header: 'Editar', key: 'editar', width: 12 },
        { header: 'Excluir', key: 'excluir', width: 12 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { usuario_id, tela, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (usuario_id && usuario_id !== 'todos') { where += ' AND p.usuario_id = ?'; params.push(usuario_id); }
      if (tela && tela !== 'todos') { where += ' AND p.tela = ?'; params.push(tela); }

      const permissoes = await executeQuery(`
        SELECT p.id, u.nome as usuario, p.tela, p.visualizar, p.criar, p.editar, p.excluir
        FROM permissoes p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        ${where} ORDER BY u.nome, p.tela ASC LIMIT ${parseInt(limit)}
      `, params);
      
      permissoes.forEach(p => ws.addRow({ 
        id: p.id, usuario: p.usuario, tela: p.tela, 
        visualizar: p.visualizar ? 'Sim' : 'Não', 
        criar: p.criar ? 'Sim' : 'Não', 
        editar: p.editar ? 'Sim' : 'Não', 
        excluir: p.excluir ? 'Sim' : 'Não' 
      }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=permissoes_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=permissoes_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Permissões', { align: 'center' });
      doc.moveDown(2);

      const { usuario_id, tela, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (usuario_id && usuario_id !== 'todos') { where += ' AND p.usuario_id = ?'; params.push(usuario_id); }
      if (tela && tela !== 'todos') { where += ' AND p.tela = ?'; params.push(tela); }

      const permissoes = await executeQuery(`
        SELECT p.id, u.nome as usuario, p.tela, p.visualizar, p.criar, p.editar, p.excluir
        FROM permissoes p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        ${where} ORDER BY u.nome, p.tela ASC LIMIT ${parseInt(limit)}
      `, params);
      
      permissoes.forEach((p, i) => {
        if (i > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${p.usuario} - ${p.tela}`);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Visualizar: ${p.visualizar ? 'Sim' : 'Não'} | Criar: ${p.criar ? 'Sim' : 'Não'} | Editar: ${p.editar ? 'Sim' : 'Não'} | Excluir: ${p.excluir ? 'Sim' : 'Não'}`);
      });
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = PermissoesExportController;
