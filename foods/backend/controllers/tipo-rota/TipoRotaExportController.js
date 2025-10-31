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
        const grupoIdNum = parseInt(grupo_id);
        whereClause += ' AND FIND_IN_SET(?, tr.grupo_id) > 0';
        params.push(grupoIdNum);
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
          tr.grupo_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id) as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        ${whereClause}
        ORDER BY tr.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

      // Processar cada registro para parsear grupos_id e buscar nomes
      const TipoRotaCRUDController = require('./TipoRotaCRUDController');
      const tipoRotas = await Promise.all(
        tipoRotasRaw.map(async (tr) => {
          // Parsear grupos_id da string
          const gruposIds = TipoRotaCRUDController.gruposToArray(tr.grupo_id);
          
          // Buscar nomes dos grupos se houver grupos
          let gruposNomes = [];
          if (gruposIds.length > 0) {
            const gruposPlaceholders = gruposIds.map(() => '?').join(',');
            const grupos = await executeQuery(
              `SELECT nome FROM grupos WHERE id IN (${gruposPlaceholders}) ORDER BY nome ASC`,
              gruposIds
            );
            gruposNomes = grupos.map(g => g.nome);
          }

          return {
            id: tr.id,
            nome: tr.nome,
            filial_nome: tr.filial_nome || 'Sem filial',
            grupos: gruposNomes,
            total_unidades: tr.total_unidades || 0,
            status: tr.status
          };
        })
      );

      const tipoRotasOrdenados = tipoRotas
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, parseInt(limit));

      // Adicionar dados
      tipoRotasOrdenados.forEach(tipoRota => {
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
        const grupoIdNum = parseInt(grupo_id);
        whereClause += ' AND FIND_IN_SET(?, tr.grupo_id) > 0';
        params.push(grupoIdNum);
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
          tr.grupo_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.tipo_rota_id = tr.id) as total_unidades
        FROM tipo_rota tr
        LEFT JOIN filiais f ON tr.filial_id = f.id
        ${whereClause}
        ORDER BY tr.nome ASC
      `;

      const tipoRotasRaw = await executeQuery(query, params);

      // Processar cada registro para parsear grupos_id e buscar nomes
      const TipoRotaCRUDController = require('./TipoRotaCRUDController');
      const tipoRotas = await Promise.all(
        tipoRotasRaw.map(async (tr) => {
          // Parsear grupos_id da string
          const gruposIds = TipoRotaCRUDController.gruposToArray(tr.grupo_id);
          
          // Buscar nomes dos grupos se houver grupos
          let gruposNomes = [];
          if (gruposIds.length > 0) {
            const gruposPlaceholders = gruposIds.map(() => '?').join(',');
            const grupos = await executeQuery(
              `SELECT nome FROM grupos WHERE id IN (${gruposPlaceholders}) ORDER BY nome ASC`,
              gruposIds
            );
            gruposNomes = grupos.map(g => g.nome);
          }

          return {
            id: tr.id,
            nome: tr.nome,
            filial_nome: tr.filial_nome || 'Sem filial',
            grupos: gruposNomes,
            total_unidades: tr.total_unidades || 0,
            status: tr.status
          };
        })
      );

      const tipoRotasOrdenados = tipoRotas
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .slice(0, parseInt(limit));

      // Adicionar tipos de rota ao PDF
      tipoRotasOrdenados.forEach((tipoRota, index) => {
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

