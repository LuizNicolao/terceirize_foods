const { executeQuery } = require('../../config/database');

class ProdutoGenericoExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produtos Genéricos');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Classe', key: 'classe', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND pg.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND pg.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND pg.classe_id = ?';
        params.push(classe_id);
      }

      const query = `
        SELECT pg.id, pg.nome, pg.status, c.nome as classe
        FROM produto_generico pg
        LEFT JOIN classes c ON pg.classe_id = c.id
        ${whereClause}
        ORDER BY pg.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach(produto => {
        worksheet.addRow({
          id: produto.id,
          nome: produto.nome,
          classe: produto.classe || '',
          status: produto.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=produto_generico_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=produto_generico_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Produtos Genéricos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, classe_id, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND pg.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND pg.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (classe_id && classe_id !== 'todos') {
        whereClause += ' AND pg.classe_id = ?';
        params.push(classe_id);
      }

      const query = `
        SELECT pg.id, pg.nome, pg.status, c.nome as classe
        FROM produto_generico pg
        LEFT JOIN classes c ON pg.classe_id = c.id
        ${whereClause}
        ORDER BY pg.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach((produto, index) => {
        if (index > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(produto.nome);
        doc.fontSize(10).font('Helvetica');
        if (produto.classe) doc.text(`Classe: ${produto.classe}`);
        doc.text(`Status: ${produto.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = ProdutoGenericoExportController;
