/**
 * Controller de Exportação de Rotas
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class RotasExportController {
  // Exportar rotas para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rotas');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Filial', key: 'filial_nome', width: 30 },
        { header: 'Tipo de Rota', key: 'tipo_rota_nome', width: 25 },
        { header: 'Frequência', key: 'frequencia_entrega', width: 15 },
        { header: 'Total Unidades', key: 'total_unidades', width: 15 },
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

      // Buscar rotas com filtros
      const { search, status, frequencia_entrega, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (r.codigo LIKE ? OR r.nome LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }

      if (frequencia_entrega) {
        whereClause += ' AND r.frequencia_entrega = ?';
        params.push(frequencia_entrega);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          r.id,
          r.codigo,
          r.nome,
          r.frequencia_entrega,
          r.status,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id IS NOT NULL AND ue.rota_id != "" AND FIND_IN_SET(r.id, ue.rota_id) > 0) as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        ${whereClause}
        ORDER BY r.codigo ASC
        LIMIT ${parseInt(limit)}
      `;

      const rotas = await executeQuery(query, params);

      // Adicionar dados
      rotas.forEach(rota => {
        worksheet.addRow({
          id: rota.id,
          codigo: rota.codigo,
          nome: rota.nome,
          filial_nome: rota.filial_nome || 'Sem filial',
          tipo_rota_nome: rota.tipo_rota_nome || 'Não informado',
          frequencia_entrega: rota.frequencia_entrega || 'N/A',
          total_unidades: rota.total_unidades || 0,
          status: rota.status === 'ativo' ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=rotas_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar rotas para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as rotas'
      });
    }
  }

  // Exportar rotas para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rotas_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Rotas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar rotas
      const { search, status, frequencia_entrega, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (r.codigo LIKE ? OR r.nome LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }

      if (frequencia_entrega) {
        whereClause += ' AND r.frequencia_entrega = ?';
        params.push(frequencia_entrega);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          r.id,
          r.codigo,
          r.nome,
          r.frequencia_entrega,
          r.status,
          f.filial as filial_nome,
          tr.nome as tipo_rota_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id IS NOT NULL AND ue.rota_id != "" AND FIND_IN_SET(r.id, ue.rota_id) > 0) as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        LEFT JOIN tipo_rota tr ON r.tipo_rota_id = tr.id
        ${whereClause}
        ORDER BY r.codigo ASC
        LIMIT ${parseInt(limit)}
      `;

      const rotas = await executeQuery(query, params);

      // Adicionar rotas ao PDF
      rotas.forEach((rota, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${rota.codigo} - ${rota.nome}`);
        doc.fontSize(10).font('Helvetica');
        
        if (rota.filial_nome) {
          doc.text(`Filial: ${rota.filial_nome}`);
        }
        
        if (rota.tipo_rota_nome) {
          doc.text(`Tipo de Rota: ${rota.tipo_rota_nome}`);
        }
        
        doc.text(`Frequência: ${rota.frequencia_entrega || 'N/A'}`);
        doc.text(`Total de Unidades: ${rota.total_unidades || 0}`);
        doc.text(`Status: ${rota.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar rotas para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as rotas'
      });
    }
  }
}

module.exports = RotasExportController;
