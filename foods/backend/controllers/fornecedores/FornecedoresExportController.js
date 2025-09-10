/**
 * Controller de Exportação de Fornecedores
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class FornecedoresExportController {
  // Exportar fornecedores para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fornecedores');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Razão Social', key: 'razao_social', width: 40 },
        { header: 'Nome Fantasia', key: 'nome_fantasia', width: 30 },
        { header: 'CNPJ', key: 'cnpj', width: 20 },
        { header: 'Logradouro', key: 'logradouro', width: 30 },
        { header: 'Número', key: 'numero', width: 10 },
        { header: 'Bairro', key: 'bairro', width: 20 },
        { header: 'Município', key: 'municipio', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'CEP', key: 'cep', width: 15 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
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

      // Buscar fornecedores com filtros
      const { search, page = 1, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const query = `
        SELECT 
          id,
          razao_social,
          nome_fantasia,
          cnpj,
          logradouro,
          numero,
          bairro,
          municipio,
          uf,
          cep,
          telefone,
          email,
          status,
          criado_em
        FROM fornecedores 
        ${whereClause}
        ORDER BY razao_social ASC
        LIMIT ${parseInt(limit)}
      `;

      const fornecedores = await executeQuery(query, params);

      // Adicionar dados
      fornecedores.forEach(fornecedor => {
        worksheet.addRow({
          id: fornecedor.id,
          razao_social: fornecedor.razao_social,
          nome_fantasia: fornecedor.nome_fantasia,
          cnpj: fornecedor.cnpj,
          logradouro: fornecedor.logradouro,
          numero: fornecedor.numero,
          bairro: fornecedor.bairro,
          municipio: fornecedor.municipio,
          uf: fornecedor.uf,
          cep: fornecedor.cep,
          telefone: fornecedor.telefone,
          email: fornecedor.email,
          contato: fornecedor.contato,
          status: fornecedor.status === 1 ? 'Ativo' : 'Inativo',
          created_at: new Date(fornecedor.created_at).toLocaleDateString('pt-BR')
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=fornecedores_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar fornecedores para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os fornecedores'
      });
    }
  }

  // Exportar fornecedores para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=fornecedores_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Fornecedores', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar fornecedores
      const { search, page = 1, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const query = `
        SELECT 
          id,
          razao_social,
          nome_fantasia,
          cnpj,
          logradouro,
          numero,
          bairro,
          municipio,
          uf,
          cep,
          telefone,
          email,
          status,
          criado_em
        FROM fornecedores 
        ${whereClause}
        ORDER BY razao_social ASC
        LIMIT ${parseInt(limit)}
      `;

      const fornecedores = await executeQuery(query, params);

      // Adicionar fornecedores ao PDF
      fornecedores.forEach((fornecedor, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${fornecedor.razao_social}`);
        doc.fontSize(10).font('Helvetica');
        
        if (fornecedor.nome_fantasia) {
          doc.text(`Nome Fantasia: ${fornecedor.nome_fantasia}`);
        }
        
        doc.text(`CNPJ: ${fornecedor.cnpj}`);
        
        if (fornecedor.logradouro) {
          doc.text(`Endereço: ${fornecedor.logradouro}, ${fornecedor.numero || ''} - ${fornecedor.bairro || ''}`);
        }
        
        if (fornecedor.municipio) {
          doc.text(`Município: ${fornecedor.municipio} - ${fornecedor.uf}`);
        }
        
        if (fornecedor.cep) {
          doc.text(`CEP: ${fornecedor.cep}`);
        }
        
        if (fornecedor.telefone) {
          doc.text(`Telefone: ${fornecedor.telefone}`);
        }
        
        if (fornecedor.email) {
          doc.text(`Email: ${fornecedor.email}`);
        }
        
        if (fornecedor.contato) {
          doc.text(`Contato: ${fornecedor.contato}`);
        }
        
        doc.text(`Status: ${fornecedor.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.text(`Data Cadastro: ${new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}`);
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar fornecedores para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os fornecedores'
      });
    }
  }
}

module.exports = FornecedoresExportController;
