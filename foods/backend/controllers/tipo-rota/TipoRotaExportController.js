/**
 * Controller de Exportação de Tipo de Rota
 * Responsável por gerar relatórios em XLSX e PDF
 */

const { executeQuery } = require('../../config/database');

class TipoRotaExportController {
  // Exportar tipos de rota para XLSX
  static async exportarXLSX(req, res) {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Tipos de Rota');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 40 },
        { header: 'Filial', key: 'filial_nome', width: 30 },
        { header: 'Grupos', key: 'grupos_nome', width: 50 },
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

      // Buscar tipos de rota com filtros
      const { search, status, grupo_id, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND tr.nome LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND tr.status = ?';
        params.push(status);
      }

      if (grupo_id) {
        whereClause += ' AND tr.grupo_id = ?';
        params.push(grupo_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND tr.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          tr.id,
          tr.nome,
          tr.status,
          tr.filial_id,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          g.id as grupo_id_valor,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id) as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        ${whereClause}
        ORDER BY tr.nome ASC, g.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

      // Agrupar por nome + filial_id
      const tipoRotasAgrupados = {};
      
      tipoRotasRaw.forEach(tr => {
        const chave = `${tr.nome}|${tr.filial_id}`;
        
        if (!tipoRotasAgrupados[chave]) {
          tipoRotasAgrupados[chave] = {
            id: tr.id,
            nome: tr.nome,
            filial_nome: tr.filial_nome || 'Sem filial',
            grupos: [],
            total_unidades: 0,
            status: tr.status
          };
        }
        
        if (tr.grupo_nome && !tipoRotasAgrupados[chave].grupos.includes(tr.grupo_nome)) {
          tipoRotasAgrupados[chave].grupos.push(tr.grupo_nome);
        }
        
        tipoRotasAgrupados[chave].total_unidades = Math.max(
          tipoRotasAgrupados[chave].total_unidades,
          tr.total_unidades || 0
        );
      });

      const tipoRotas = Object.values(tipoRotasAgrupados)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, parseInt(limit));

      // Adicionar dados
      tipoRotas.forEach(tipoRota => {
        worksheet.addRow({
          id: tipoRota.id,
          nome: tipoRota.nome,
          filial_nome: tipoRota.filial_nome,
          grupos_nome: tipoRota.grupos.join(', ') || 'Sem grupo',
          total_unidades: tipoRota.total_unidades,
          status: tipoRota.status === 'ativo' ? 'Ativo' : 'Inativo'
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=tipos_rota_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar tipos de rota para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os tipos de rota'
      });
    }
  }

  // Exportar tipos de rota para PDF
  static async exportarPDF(req, res) {
    try {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=tipos_rota_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Tipos de Rota', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar tipos de rota
      const { search, status, grupo_id, filial_id, limit = 1000 } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (search) {
        whereClause += ' AND tr.nome LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm);
      }

      if (status && status !== 'todos') {
        whereClause += ' AND tr.status = ?';
        params.push(status);
      }

      if (grupo_id) {
        whereClause += ' AND tr.grupo_id = ?';
        params.push(grupo_id);
      }

      if (filial_id && filial_id !== 'todos') {
        whereClause += ' AND tr.filial_id = ?';
        params.push(filial_id);
      }

      const query = `
        SELECT 
          tr.id,
          tr.nome,
          tr.status,
          tr.filial_id,
          f.filial as filial_nome,
          g.nome as grupo_nome,
          g.id as grupo_id_valor,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id) as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        LEFT JOIN grupos g ON tr.grupo_id = g.id
        ${whereClause}
        ORDER BY tr.nome ASC, g.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

      // Agrupar por nome + filial_id
      const tipoRotasAgrupados = {};
      
      tipoRotasRaw.forEach(tr => {
        const chave = `${tr.nome}|${tr.filial_id}`;
        
        if (!tipoRotasAgrupados[chave]) {
          tipoRotasAgrupados[chave] = {
            id: tr.id,
            nome: tr.nome,
            filial_nome: tr.filial_nome || 'Sem filial',
            grupos: [],
            total_unidades: 0,
            status: tr.status
          };
        }
        
        if (tr.grupo_nome && !tipoRotasAgrupados[chave].grupos.includes(tr.grupo_nome)) {
          tipoRotasAgrupados[chave].grupos.push(tr.grupo_nome);
        }
        
        tipoRotasAgrupados[chave].total_unidades = Math.max(
          tipoRotasAgrupados[chave].total_unidades,
          tr.total_unidades || 0
        );
      });

      const tipoRotas = Object.values(tipoRotasAgrupados)
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, parseInt(limit));

      // Adicionar tipos de rota ao PDF
      tipoRotas.forEach((tipoRota, index) => {
        if (index > 0) doc.moveDown(2);
        
        doc.fontSize(14).font('Helvetica-Bold').text(tipoRota.nome);
        doc.fontSize(10).font('Helvetica');
        
        if (tipoRota.filial_nome) {
          doc.text(`Filial: ${tipoRota.filial_nome}`);
        }
        
        if (tipoRota.grupos && tipoRota.grupos.length > 0) {
          doc.text(`Grupos: ${tipoRota.grupos.join(', ')}`);
        } else {
          doc.text(`Grupos: Sem grupo`);
        }
        
        doc.text(`Total de Unidades: ${tipoRota.total_unidades || 0}`);
        doc.text(`Status: ${tipoRota.status === 'ativo' ? 'Ativo' : 'Inativo'}`);
        
        // Linha separadora
        doc.moveDown();
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar tipos de rota para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os tipos de rota'
      });
    }
  }
}

module.exports = TipoRotaExportController;

