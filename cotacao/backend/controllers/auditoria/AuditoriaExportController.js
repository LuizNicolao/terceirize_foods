/**
 * Controller de Exportação de Auditoria
 * Responsável por exportar logs de auditoria em diferentes formatos
 */

const { executeQuery } = require('../../config/database');
const { getAuditLogs } = require('../../utils/audit');
const { errorResponse } = require('../../middleware/responseHandler');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class AuditoriaExportController {
  // Exportar logs de auditoria em Excel
  static async exportarXLSX(req, res) {
    try {
      // Verificar permissão
      // Temporariamente permitir acesso para todos os usuários autenticados
      // if (req.user.role !== 'administrador') {
      //   return errorResponse(res, 'Apenas administradores podem exportar logs de auditoria.', 403);
      // }

      const { 
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id
      } = req.query;

      const filters = { limit: 10000 }; // Limite alto para exportação

      // Adicionar filtros opcionais
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      const logs = await getAuditLogs(filters);

      // Criar workbook do Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Auditoria');

      // Definir colunas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Usuário ID', key: 'usuario_id', width: 15 },
        { header: 'Nome do Usuário', key: 'usuario_nome', width: 25 },
        { header: 'Email do Usuário', key: 'usuario_email', width: 30 },
        { header: 'Ação', key: 'acao', width: 20 },
        { header: 'Recurso', key: 'recurso', width: 20 },
        { header: 'IP Address', key: 'ip_address', width: 15 },
        { header: 'Data/Hora', key: 'timestamp', width: 20 },
        { header: 'Detalhes', key: 'detalhes', width: 50 }
      ];

      // Adicionar dados
      logs.forEach(log => {
        worksheet.addRow({
          id: log.id,
          usuario_id: log.usuario_id,
          usuario_nome: log.usuario_nome || 'N/A',
          usuario_email: log.usuario_email || 'N/A',
          acao: log.acao,
          recurso: log.recurso,
          ip_address: log.ip_address || 'N/A',
          timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
          detalhes: log.detalhes ? JSON.stringify(log.detalhes, null, 2) : 'N/A'
        });
      });

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=auditoria.xlsx');

      // Enviar arquivo
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar auditoria em Excel:', error);
      return errorResponse(res, 'Erro ao exportar dados de auditoria', 500);
    }
  }

  // Exportar logs de auditoria em PDF
  static async exportarPDF(req, res) {
    try {
      // Verificar permissão
      // Temporariamente permitir acesso para todos os usuários autenticados
      // if (req.user.role !== 'administrador') {
      //   return errorResponse(res, 'Apenas administradores podem exportar logs de auditoria.', 403);
      // }

      const { 
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id
      } = req.query;

      const filters = { limit: 1000 }; // Limite menor para PDF

      // Adicionar filtros opcionais
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      const logs = await getAuditLogs(filters);

      // Criar documento PDF
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=auditoria.pdf');

      // Pipe para response
      doc.pipe(res);

      // Adicionar título
      doc.fontSize(20).text('Relatório de Auditoria', { align: 'center' });
      doc.moveDown();

      // Adicionar filtros aplicados
      const filtrosAplicados = [];
      if (data_inicio) filtrosAplicados.push(`Data início: ${data_inicio}`);
      if (data_fim) filtrosAplicados.push(`Data fim: ${data_fim}`);
      if (acao) filtrosAplicados.push(`Ação: ${acao}`);
      if (recurso) filtrosAplicados.push(`Recurso: ${recurso}`);
      if (usuario_id) filtrosAplicados.push(`Usuário ID: ${usuario_id}`);

      if (filtrosAplicados.length > 0) {
        doc.fontSize(12).text('Filtros aplicados:', { underline: true });
        filtrosAplicados.forEach(filtro => {
          doc.fontSize(10).text(`• ${filtro}`);
        });
        doc.moveDown();
      }

      // Adicionar estatísticas
      doc.fontSize(12).text(`Total de registros: ${logs.length}`, { underline: true });
      doc.moveDown();

      // Adicionar tabela de logs
      let yPosition = doc.y;
      const pageHeight = 700;
      const rowHeight = 60;

      logs.forEach((log, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 50;
        }

        // Cabeçalho do log
        doc.fontSize(10).font('Helvetica-Bold').text(`Log #${log.id}`, { underline: true });
        doc.moveDown(0.5);

        // Detalhes do log
        doc.fontSize(8).font('Helvetica');
        doc.text(`Usuário: ${log.usuario_nome || 'N/A'} (${log.usuario_email || 'N/A'})`);
        doc.text(`Ação: ${log.acao}`);
        doc.text(`Recurso: ${log.recurso}`);
        doc.text(`IP: ${log.ip_address || 'N/A'}`);
        doc.text(`Data/Hora: ${new Date(log.timestamp).toLocaleString('pt-BR')}`);
        
        if (log.detalhes) {
          doc.text('Detalhes:');
          const detalhesStr = JSON.stringify(log.detalhes, null, 2);
          doc.fontSize(6).text(detalhesStr, { width: 500 });
        }

        doc.moveDown();
        yPosition += rowHeight;
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar auditoria em PDF:', error);
      return errorResponse(res, 'Erro ao exportar dados de auditoria', 500);
    }
  }
}

module.exports = AuditoriaExportController;
