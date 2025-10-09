const { executeQuery } = require('../../config/database');

class MarcasExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Marcas');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Marca', key: 'marca', width: 30 },
        { header: 'Fabricante', key: 'fabricante', width: 40 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (marca LIKE ? OR fabricante LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `SELECT id, marca, fabricante, status FROM marcas ${whereClause} ORDER BY marca ASC LIMIT ${parseInt(limit)}`;
      const marcas = await executeQuery(query, params);

      marcas.forEach(marca => {
        worksheet.addRow({
          id: marca.id,
          marca: marca.marca,
          fabricante: marca.fabricante || '',
          status: marca.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=marcas_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar marcas:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=marcas_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Marcas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (marca LIKE ? OR fabricante LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `SELECT id, marca, fabricante, status FROM marcas ${whereClause} ORDER BY marca ASC LIMIT ${parseInt(limit)}`;
      const marcas = await executeQuery(query, params);

      marcas.forEach((marca, index) => {
        if (index > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(marca.marca);
        doc.fontSize(10).font('Helvetica');
        if (marca.fabricante) doc.text(`Fabricante: ${marca.fabricante}`);
        doc.text(`Status: ${marca.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar marcas:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = MarcasExportController;
