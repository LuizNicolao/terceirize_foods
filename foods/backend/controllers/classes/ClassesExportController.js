/**
 * Controller de Exportação de Classes
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class ClassesExportController {
  // Exportar classes para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Classes');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Subgrupo', key: 'subgrupo_nome', width: 30 },
        { header: 'Grupo', key: 'grupo_nome', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Buscar classes com filtros
      const { search, status, grupo_id, subgrupo_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND c.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND c.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND g.id = ?';
        params.push(grupo_id);
      }

      if (subgrupo_id && subgrupo_id !== 'todos') {
        whereClause += ' AND c.subgrupo_id = ?';
        params.push(subgrupo_id);
      }

      const query = `
        SELECT 
          c.id,
          c.nome,
          c.status,
          s.nome as subgrupo_nome,
          g.nome as grupo_nome
        FROM classes c
        LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
        LEFT JOIN grupos g ON s.grupo_id = g.id
        ${whereClause}
        ORDER BY c.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const classes = await executeQuery(query, params);

      // Adicionar dados
      classes.forEach(classe => {
        worksheet.addRow({
          id: classe.id,
          nome: classe.nome,
          subgrupo_nome: classe.subgrupo_nome || 'Sem subgrupo',
          grupo_nome: classe.grupo_nome || 'Sem grupo',
          status: classe.status === 1 ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=classes_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar classes para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as classes'
      });
    }
  }

  // Exportar classes para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=classes_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Classes', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar classes
      const { search, status, grupo_id, subgrupo_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND c.nome LIKE ?';
        params.push(`%${search}%`);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND c.status = ?';
        params.push(status === 'ativo' ? 1 : 0);
      }

      if (grupo_id && grupo_id !== 'todos') {
        whereClause += ' AND g.id = ?';
        params.push(grupo_id);
      }

      if (subgrupo_id && subgrupo_id !== 'todos') {
        whereClause += ' AND c.subgrupo_id = ?';
        params.push(subgrupo_id);
      }

      const query = `
        SELECT 
          c.id,
          c.nome,
          c.status,
          s.nome as subgrupo_nome,
          g.nome as grupo_nome
        FROM classes c
        LEFT JOIN subgrupos s ON c.subgrupo_id = s.id
        LEFT JOIN grupos g ON s.grupo_id = g.id
        ${whereClause}
        ORDER BY c.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const classes = await executeQuery(query, params);

      // Adicionar classes ao PDF
      classes.forEach((classe, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(classe.nome);
        doc.fontSize(10).font('Helvetica');
        
        if (classe.subgrupo_nome) {
          doc.text(`Subgrupo: ${classe.subgrupo_nome}`);
        }
        
        if (classe.grupo_nome) {
          doc.text(`Grupo: ${classe.grupo_nome}`);
        }
        
        doc.text(`Status: ${classe.status === 1 ? 'Ativo' : 'Inativo'}`);
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar classes para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as classes'
      });
    }
  }
}

module.exports = ClassesExportController;
