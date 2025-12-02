const { executeQuery } = require('../../config/database');

class AlmoxarifadoExportController {
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Almoxarifados');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Filial', key: 'filial_nome', width: 30 },
        { header: 'Código Filial', key: 'codigo_filial', width: 15 },
        { header: 'Tipo Vínculo', key: 'tipo_vinculo', width: 20 },
        { header: 'Unidade Escolar', key: 'unidade_escolar_nome', width: 40 },
        { header: 'Código Unidade', key: 'unidade_escolar_codigo', width: 20 },
        { header: 'Centro de Custo', key: 'centro_custo_nome', width: 30 },
        { header: 'Código Centro Custo', key: 'centro_custo_codigo', width: 20 },
        { header: 'Observações', key: 'observacoes', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Criado em', key: 'criado_em', width: 20 },
        { header: 'Atualizado em', key: 'atualizado_em', width: 20 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

      const { search, status, filial_id, centro_custo_id, tipo_vinculo, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (search) {
        whereClause += ' AND (LOWER(a.nome) LIKE ? OR LOWER(a.codigo) LIKE ? OR LOWER(a.observacoes) LIKE ? OR LOWER(f.filial) LIKE ? OR LOWER(cc.nome) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status !== undefined && status !== '' && status !== 'todos') {
        whereClause += ' AND a.status = ?';
        const statusValue = status === 1 || status === '1' || status === 'ativo' ? 1 : 0;
        params.push(statusValue);
      }

      if (filial_id) {
        whereClause += ' AND a.filial_id = ?';
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereClause += ' AND a.centro_custo_id = ?';
        params.push(centro_custo_id);
      }

      if (tipo_vinculo) {
        if (tipo_vinculo === 'filial') {
          whereClause += ' AND a.tipo_vinculo = ? AND (a.unidade_escolar_id IS NULL OR a.unidade_escolar_id = 0)';
          params.push('filial');
        } else if (tipo_vinculo === 'unidade_escolar') {
          whereClause += ' AND a.tipo_vinculo = ?';
          params.push('unidade_escolar');
        }
      }

      const query = `
        SELECT 
          a.id, 
          a.codigo,
          a.nome, 
          a.filial_id,
          f.filial as filial_nome,
          f.codigo_filial,
          a.tipo_vinculo,
          a.unidade_escolar_id,
          ue.nome_escola as unidade_escolar_nome,
          ue.codigo_teknisa as unidade_escolar_codigo,
          a.centro_custo_id,
          cc.codigo as centro_custo_codigo,
          cc.nome as centro_custo_nome,
          a.observacoes,
          a.status, 
          a.criado_em,
          a.atualizado_em
        FROM almoxarifado a
        LEFT JOIN filiais f ON a.filial_id = f.id
        LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
        LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
        ${whereClause}
        ORDER BY a.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const almoxarifados = await executeQuery(query, params);

      almoxarifados.forEach(almoxarifado => {
        worksheet.addRow({
          id: almoxarifado.id,
          codigo: almoxarifado.codigo || '',
          nome: almoxarifado.nome || '',
          filial_nome: almoxarifado.filial_nome || '',
          codigo_filial: almoxarifado.codigo_filial || '',
          tipo_vinculo: almoxarifado.tipo_vinculo === 'filial' ? 'Filial' : 
                       almoxarifado.tipo_vinculo === 'unidade_escolar' ? 'Unidade Escolar' : '',
          unidade_escolar_nome: almoxarifado.unidade_escolar_nome || '',
          unidade_escolar_codigo: almoxarifado.unidade_escolar_codigo || '',
          centro_custo_nome: almoxarifado.centro_custo_nome || '',
          centro_custo_codigo: almoxarifado.centro_custo_codigo || '',
          observacoes: almoxarifado.observacoes || '',
          status: almoxarifado.status === 1 ? 'Ativo' : 'Inativo',
          criado_em: almoxarifado.criado_em ? new Date(almoxarifado.criado_em).toLocaleString('pt-BR') : '',
          atualizado_em: almoxarifado.atualizado_em ? new Date(almoxarifado.atualizado_em).toLocaleString('pt-BR') : ''
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=almoxarifados_${new Date().toISOString().split('T')[0]}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=almoxarifados_${new Date().toISOString().split('T')[0]}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Relatório de Almoxarifados', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      const { search, status, filial_id, centro_custo_id, tipo_vinculo, limit = 1000 } = req.query;
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (search) {
        whereClause += ' AND (LOWER(a.nome) LIKE ? OR LOWER(a.codigo) LIKE ? OR LOWER(a.observacoes) LIKE ? OR LOWER(f.filial) LIKE ? OR LOWER(cc.nome) LIKE ?)';
        const searchTerm = `%${search.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (status !== undefined && status !== '' && status !== 'todos') {
        whereClause += ' AND a.status = ?';
        const statusValue = status === 1 || status === '1' || status === 'ativo' ? 1 : 0;
        params.push(statusValue);
      }

      if (filial_id) {
        whereClause += ' AND a.filial_id = ?';
        params.push(filial_id);
      }

      if (centro_custo_id) {
        whereClause += ' AND a.centro_custo_id = ?';
        params.push(centro_custo_id);
      }

      if (tipo_vinculo) {
        if (tipo_vinculo === 'filial') {
          whereClause += ' AND a.tipo_vinculo = ? AND (a.unidade_escolar_id IS NULL OR a.unidade_escolar_id = 0)';
          params.push('filial');
        } else if (tipo_vinculo === 'unidade_escolar') {
          whereClause += ' AND a.tipo_vinculo = ?';
          params.push('unidade_escolar');
        }
      }

      const query = `
        SELECT 
          a.id, 
          a.codigo,
          a.nome, 
          a.filial_id,
          f.filial as filial_nome,
          f.codigo_filial,
          a.tipo_vinculo,
          a.unidade_escolar_id,
          ue.nome_escola as unidade_escolar_nome,
          ue.codigo_teknisa as unidade_escolar_codigo,
          a.centro_custo_id,
          cc.codigo as centro_custo_codigo,
          cc.nome as centro_custo_nome,
          a.observacoes,
          a.status, 
          a.criado_em,
          a.atualizado_em
        FROM almoxarifado a
        LEFT JOIN filiais f ON a.filial_id = f.id
        LEFT JOIN unidades_escolares ue ON a.unidade_escolar_id = ue.id
        LEFT JOIN centro_custo cc ON a.centro_custo_id = cc.id
        ${whereClause}
        ORDER BY a.nome ASC
        LIMIT ${parseInt(limit)}
      `;

      const almoxarifados = await executeQuery(query, params);

      almoxarifados.forEach((almoxarifado, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(`${almoxarifado.codigo || ''} - ${almoxarifado.nome || ''}`);
        doc.fontSize(10).font('Helvetica');
        
        if (almoxarifado.filial_nome) {
          doc.text(`Filial: ${almoxarifado.filial_nome}${almoxarifado.codigo_filial ? ` (${almoxarifado.codigo_filial})` : ''}`);
        }
        
        if (almoxarifado.tipo_vinculo) {
          const tipoVinculoTexto = almoxarifado.tipo_vinculo === 'filial' ? 'Filial' : 
                                   almoxarifado.tipo_vinculo === 'unidade_escolar' ? 'Unidade Escolar' : '';
          doc.text(`Tipo Vínculo: ${tipoVinculoTexto}`);
        }
        
        if (almoxarifado.unidade_escolar_nome) {
          doc.text(`Unidade Escolar: ${almoxarifado.unidade_escolar_nome}${almoxarifado.unidade_escolar_codigo ? ` (${almoxarifado.unidade_escolar_codigo})` : ''}`);
        }
        
        if (almoxarifado.centro_custo_nome) {
          doc.text(`Centro de Custo: ${almoxarifado.centro_custo_nome}${almoxarifado.centro_custo_codigo ? ` (${almoxarifado.centro_custo_codigo})` : ''}`);
        }
        
        if (almoxarifado.observacoes) {
          doc.text(`Observações: ${almoxarifado.observacoes}`);
        }
        
        doc.text(`Status: ${almoxarifado.status === 1 ? 'Ativo' : 'Inativo'}`);
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
}

module.exports = AlmoxarifadoExportController;

