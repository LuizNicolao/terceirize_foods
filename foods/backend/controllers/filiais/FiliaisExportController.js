const { executeQuery } = require('../../config/database');

class FiliaisExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Filiais');
      ws.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo_filial', width: 15 },
        { header: 'Nome', key: 'filial', width: 40 },
        { header: 'Razão Social', key: 'razao_social', width: 50 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Logradouro', key: 'logradouro', width: 40 },
        { header: 'Número', key: 'numero', width: 15 },
        { header: 'Bairro', key: 'bairro', width: 30 },
        { header: 'CEP', key: 'cep', width: 15 },
        { header: 'Cidade', key: 'cidade', width: 30 },
        { header: 'Estado', key: 'estado', width: 10 },
        { header: 'Endereço Completo', key: 'endereco_completo', width: 80 },
        { header: 'Supervisão', key: 'supervisao', width: 30 },
        { header: 'Coordenação', key: 'coordenacao', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (filial LIKE ? OR codigo_filial LIKE ? OR cnpj LIKE ? OR razao_social LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const filiais = await executeQuery(`
        SELECT 
          id, 
          codigo_filial, 
          filial, 
          razao_social,
          cnpj, 
          logradouro,
          numero,
          bairro,
          cep,
          cidade, 
          estado,
          supervisao,
          coordenacao,
          status 
        FROM filiais 
        ${where} 
        ORDER BY filial ASC 
        LIMIT ${parseInt(limit)}
      `, params);

      filiais.forEach(f => {
        // Montar endereço completo
        const enderecoCompleto = [
          f.logradouro || '',
          f.numero ? `nº ${f.numero}` : '',
          f.bairro || '',
          f.cidade || '',
          f.estado || '',
          f.cep ? `CEP: ${f.cep}` : ''
        ].filter(Boolean).join(', ');

        ws.addRow({ 
          id: f.id, 
          codigo_filial: f.codigo_filial, 
          filial: f.filial,
          razao_social: f.razao_social || '',
          cnpj: f.cnpj || '', 
          logradouro: f.logradouro || '',
          numero: f.numero || '',
          bairro: f.bairro || '',
          cep: f.cep || '',
          cidade: f.cidade || '', 
          estado: f.estado || '',
          endereco_completo: enderecoCompleto || '',
          supervisao: f.supervisao || '',
          coordenacao: f.coordenacao || '',
          status: f.status === 1 ? 'Ativo' : 'Inativo' 
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=filiais_${new Date().toISOString().split('T')[0]}.xlsx`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=filiais_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);
      doc.fontSize(20).text('Relatório de Filiais', { align: 'center' });
      doc.moveDown(2);

      const { search, status, limit = 1000 } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (search) { where += ' AND (filial LIKE ? OR codigo_filial LIKE ? OR razao_social LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      if (status && status !== 'todos') { where += ' AND status = ?'; params.push(status === 'ativo' ? 1 : 0); }

      const filiais = await executeQuery(`
        SELECT 
          id, 
          codigo_filial, 
          filial, 
          razao_social,
          cnpj, 
          logradouro,
          numero,
          bairro,
          cep,
          cidade, 
          estado,
          supervisao,
          coordenacao,
          status 
        FROM filiais 
        ${where} 
        ORDER BY filial ASC 
        LIMIT ${parseInt(limit)}
      `, params);

      filiais.forEach((f, i) => {
        if (i > 0) {
          doc.moveDown(2);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(1);
        }
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${f.codigo_filial} - ${f.filial}`);
        doc.fontSize(10).font('Helvetica');
        
        if (f.razao_social) {
          doc.text(`Razão Social: ${f.razao_social}`);
        }
        
        doc.text(`CNPJ: ${f.cnpj || 'N/A'}`);
        doc.moveDown(0.5);
        
        // Endereço completo
        const enderecoParts = [];
        if (f.logradouro) enderecoParts.push(f.logradouro);
        if (f.numero) enderecoParts.push(`nº ${f.numero}`);
        if (f.bairro) enderecoParts.push(f.bairro);
        if (f.cidade) enderecoParts.push(f.cidade);
        if (f.estado) enderecoParts.push(f.estado);
        if (f.cep) enderecoParts.push(`CEP: ${f.cep}`);
        
        if (enderecoParts.length > 0) {
          doc.font('Helvetica-Bold').text('Endereço:');
          doc.font('Helvetica').text(enderecoParts.join(', '));
        } else {
          doc.font('Helvetica-Bold').text('Endereço:');
          doc.font('Helvetica').text('N/A');
        }
        
        doc.moveDown(0.5);
        
        if (f.supervisao) {
          doc.text(`Supervisão: ${f.supervisao}`);
        }
        
        if (f.coordenacao) {
          doc.text(`Coordenação: ${f.coordenacao}`);
        }
        
        doc.moveDown(0.5);
        doc.text(`Status: ${f.status === 1 ? 'Ativo' : 'Inativo'}`);
      });
      
      doc.end();
    } catch (error) { res.status(500).json({ success: false, error: 'Erro interno' }); }
  }
}

module.exports = FiliaisExportController;
