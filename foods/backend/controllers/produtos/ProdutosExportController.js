const { executeQuery } = require('../../config/database');

class ProdutosExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Produtos');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Marca', key: 'marca', width: 25 },
        { header: 'Unidade', key: 'unidade', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (p.nome LIKE ? OR p.codigo LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND p.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `
        SELECT p.id, p.codigo, p.nome, p.status, m.marca, u.sigla as unidade
        FROM produtos p
        LEFT JOIN marcas m ON p.marca_id = m.id
        LEFT JOIN unidades u ON p.unidade_id = u.id
        ${whereClause}
        ORDER BY p.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach(produto => {
        worksheet.addRow({
          id: produto.id,
          codigo: produto.codigo,
          nome: produto.nome,
          marca: produto.marca || '',
          unidade: produto.unidade || '',
          status: produto.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      res.setHeader('Content-Disposition', `attachment; filename=produtos_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Produtos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (p.nome LIKE ? OR p.codigo LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND p.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `
        SELECT p.id, p.codigo, p.nome, p.status, m.marca, u.sigla as unidade
        FROM produtos p
        LEFT JOIN marcas m ON p.marca_id = m.id
        LEFT JOIN unidades u ON p.unidade_id = u.id
        ${whereClause}
        ORDER BY p.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const produtos = await executeQuery(query, params);

      produtos.forEach((produto, index) => {
        if (index > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${produto.codigo} - ${produto.nome}`);
        doc.fontSize(10).font('Helvetica');
        if (produto.marca) doc.text(`Marca: ${produto.marca}`);
        if (produto.unidade) doc.text(`Unidade: ${produto.unidade}`);
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

module.exports = ProdutosExportController;
