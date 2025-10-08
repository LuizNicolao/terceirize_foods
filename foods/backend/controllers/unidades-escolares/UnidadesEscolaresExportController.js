/**
 * Controller de Exportação de Unidades Escolares
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class UnidadesEscolaresExportController {
  // Exportar unidades escolares para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Unidades Escolares');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo_escola', width: 15 },
        { header: 'Nome da Escola', key: 'nome_escola', width: 40 },
        { header: 'Cidade', key: 'cidade', width: 25 },
        { header: 'Estado', key: 'estado', width: 10 },
        { header: 'Rota', key: 'rota_nome', width: 25 },
        { header: 'Ordem Entrega', key: 'ordem_entrega', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Data Cadastro', key: 'criado_em', width: 20 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Buscar unidades escolares com filtros
      const { search, status, rota_id, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ue.codigo_escola LIKE ? OR ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND ue.status = ?';
        params.push(status);
      }

      if (rota_id && rota_id !== 'todos') {
        whereClause += ' AND ue.rota_id = ?';
        params.push(rota_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          ue.id,
          ue.codigo_escola,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.ordem_entrega,
          ue.status,
          ue.criado_em,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        ${whereClause}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
        LIMIT ${parseInt(limit)}
      `;

      const unidades = await executeQuery(query, params);

      // Adicionar dados
      unidades.forEach(unidade => {
        worksheet.addRow({
          id: unidade.id,
          codigo_escola: unidade.codigo_escola,
          nome_escola: unidade.nome_escola,
          cidade: unidade.cidade,
          estado: unidade.estado,
          rota_nome: unidade.rota_nome || 'Sem rota',
          ordem_entrega: unidade.ordem_entrega || 0,
          status: unidade.status === 'ativo' ? 'Ativo' : 'Inativo',
          criado_em: unidade.criado_em ? new Date(unidade.criado_em).toLocaleDateString('pt-BR') : ''
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_escolares_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar unidades escolares para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as unidades escolares'
      });
    }
  }

  // Exportar unidades escolares para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=unidades_escolares_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Unidades Escolares', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar unidades escolares
      const { search, status, rota_id, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (ue.codigo_escola LIKE ? OR ue.nome_escola LIKE ? OR ue.cidade LIKE ? OR ue.estado LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND ue.status = ?';
        params.push(status);
      }

      if (rota_id && rota_id !== 'todos') {
        whereClause += ' AND ue.rota_id = ?';
        params.push(rota_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND r.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          ue.id,
          ue.codigo_escola,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.ordem_entrega,
          ue.status,
          ue.criado_em,
          r.nome as rota_nome
        FROM unidades_escolares ue
        LEFT JOIN rotas r ON ue.rota_id = r.id
        ${whereClause}
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
        LIMIT ${parseInt(limit)}
      `;

      const unidades = await executeQuery(query, params);

      // Adicionar unidades ao PDF
      unidades.forEach((unidade, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${unidade.nome_escola}`);
        doc.fontSize(10).font('Helvetica');
        
        if (unidade.codigo_escola) {
          doc.text(`Código: ${unidade.codigo_escola}`);
        }
        
        doc.text(`Cidade/Estado: ${unidade.cidade} - ${unidade.estado}`);
        
        if (unidade.rota_nome) {
          doc.text(`Rota: ${unidade.rota_nome}`);
        }
        
        if (unidade.ordem_entrega) {
          doc.text(`Ordem de Entrega: ${unidade.ordem_entrega}`);
        }
        
        doc.text(`Status: ${unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
        
        if (unidade.criado_em) {
          doc.text(`Data Cadastro: ${new Date(unidade.criado_em).toLocaleDateString('pt-BR')}`);
        }
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar unidades escolares para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar as unidades escolares'
      });
    }
  }
}

module.exports = UnidadesEscolaresExportController;
