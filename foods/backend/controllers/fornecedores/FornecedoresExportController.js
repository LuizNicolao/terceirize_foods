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
        { header: 'Inscrição Estadual', key: 'inscricao_estadual', width: 20 },
        { header: 'Endereço', key: 'endereco', width: 40 },
        { header: 'Cidade', key: 'cidade', width: 20 },
        { header: 'UF', key: 'uf', width: 10 },
        { header: 'CEP', key: 'cep', width: 15 },
        { header: 'Telefone', key: 'telefone', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Contato', key: 'contato', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Data Cadastro', key: 'created_at', width: 20 }
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
          inscricao_estadual,
          endereco,
          cidade,
          uf,
          cep,
          telefone,
          email,
          contato,
          status,
          created_at
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
          inscricao_estadual: fornecedor.inscricao_estadual,
          endereco: fornecedor.endereco,
          cidade: fornecedor.cidade,
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
          inscricao_estadual,
          endereco,
          cidade,
          uf,
          cep,
          telefone,
          email,
          contato,
          status,
          created_at
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
        
        if (fornecedor.inscricao_estadual) {
          doc.text(`Inscrição Estadual: ${fornecedor.inscricao_estadual}`);
        }
        
        if (fornecedor.endereco) {
          doc.text(`Endereço: ${fornecedor.endereco}, ${fornecedor.cidade} - ${fornecedor.uf}`);
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
