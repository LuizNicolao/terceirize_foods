/**
 * Controller de Exportação de Subgrupos
 */

const { executeQuery } = require('../../config/database');

class SubgruposExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Subgrupos');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Grupo', key: 'grupo_nome', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, grupo_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (s.nome LIKE ? OR s.codigo LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND s.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND s.grupo_id = ?';
        params.push(grupo_id);
      }

      const query = `
        SELECT s.id, s.codigo, s.nome, s.status, g.nome as grupo_nome
        FROM subgrupos s
        LEFT JOIN grupos g ON s.grupo_id = g.id
        ${whereClause}
        ORDER BY s.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const subgrupos = await executeQuery(query, params);

      subgrupos.forEach(sub => {
        worksheet.addRow({
          id: sub.id,
          codigo: sub.codigo,
          nome: sub.nome,
          grupo_nome: sub.grupo_nome || 'Sem grupo',
          status: sub.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=subgrupos_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar subgrupos:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=subgrupos_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Subgrupos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, grupo_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (s.nome LIKE ? OR s.codigo LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND s.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND s.grupo_id = ?';
        params.push(grupo_id);
      }

      const query = `
        SELECT s.id, s.codigo, s.nome, s.status, g.nome as grupo_nome
        FROM subgrupos s
        LEFT JOIN grupos g ON s.grupo_id = g.id
        ${whereClause}
        ORDER BY s.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const subgrupos = await executeQuery(query, params);

      subgrupos.forEach((sub, index) => {
        if (index > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${sub.codigo} - ${sub.nome}`);
        doc.fontSize(10).font('Helvetica');
        if (sub.grupo_nome) doc.text(`Grupo: ${sub.grupo_nome}`);
        doc.text(`Status: ${sub.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar subgrupos:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = SubgruposExportController;
