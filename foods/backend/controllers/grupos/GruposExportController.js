/**
 * Controller de Exportação de Grupos
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class GruposExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Grupos');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Descrição', key: 'descricao', width: 50 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (nome LIKE ? OR codigo LIKE ? OR descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `SELECT id, codigo, nome, descricao, status FROM grupos ${whereClause} ORDER BY nome ASC LIMIT ${parseInt(limit)}`;
      const grupos = await executeQuery(query, params);

      grupos.forEach(grupo => {
        worksheet.addRow({
          id: grupo.id,
          codigo: grupo.codigo,
          nome: grupo.nome,
          descricao: grupo.descricao || '',
          status: grupo.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=grupos_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar grupos para XLSX:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=grupos_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Grupos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (nome LIKE ? OR codigo LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      const query = `SELECT id, codigo, nome, descricao, status FROM grupos ${whereClause} ORDER BY nome ASC LIMIT ${parseInt(limit)}`;
      const grupos = await executeQuery(query, params);

      grupos.forEach((grupo, index) => {
        if (index > 0) doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold').text(`${grupo.codigo} - ${grupo.nome}`);
        doc.fontSize(10).font('Helvetica');
        if (grupo.descricao) doc.text(`Descrição: ${grupo.descricao}`);
        doc.text(`Status: ${grupo.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar grupos para PDF:', error);
      res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  }
}

module.exports = GruposExportController;
