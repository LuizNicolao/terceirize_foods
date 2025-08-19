/**
 * Controller de Exportação de Auditoria
 * Responsável por gerar relatórios de auditoria em XLSX e PDF
 */

const { getAuditLogs } = require('../../utils/audit');

class AuditoriaExportController {
  // Exportar logs de auditoria para XLSX
  static async exportarXLSX(req, res) {
    try {
      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores e coordenadores nível III podem exportar logs de auditoria.' 
        });
      }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Auditoria');

      // Definir cabeçalhos
      worksheet.columns = [
        { header: 'Data/Hora', key: 'timestamp', width: 25 },
        { header: 'Usuário', key: 'usuario_nome', width: 30 },
        { header: 'Ação', key: 'acao', width: 20 },
        { header: 'Detalhes', key: 'detalhes', width: 60 }
      ];

      // Estilizar cabeçalhos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Buscar logs com filtros
      const { 
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id
      } = req.query;

      const filters = {};
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      const logs = await getAuditLogs(filters);

      // Adicionar dados
      logs.forEach(log => {
        let detalhes = '';
        
        if (log.detalhes) {
          if (log.detalhes.changes) {
            detalhes = Object.entries(log.detalhes.changes)
              .map(([field, change]) => `${field}: ${change.from || 'vazio'} → ${change.to || 'vazio'}`)
              .join('; ');
          } else if (typeof log.detalhes === 'object') {
            detalhes = Object.entries(log.detalhes)
              .map(([key, value]) => `${key}: ${value}`)
              .join('; ');
          } else {
            detalhes = String(log.detalhes);
          }
        }

        worksheet.addRow({
          timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
          usuario_nome: log.usuario_nome || 'Sistema',
          acao: log.acao === 'create' ? 'Criar' :
                log.acao === 'update' ? 'Editar' :
                log.acao === 'delete' ? 'Excluir' :
                log.acao === 'login' ? 'Login' :
                log.acao === 'view' ? 'Visualizar' : log.acao,
          detalhes: detalhes
        });
      });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Erro ao exportar auditoria para XLSX:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os logs de auditoria'
      });
    }
  }

  // Exportar logs de auditoria para PDF
  static async exportarPDF(req, res) {
    try {
      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores e coordenadores nível III podem exportar logs de auditoria.' 
        });
      }

      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50 });

      // Configurar resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=auditoria_${new Date().toISOString().split('T')[0]}.pdf`);

      // Pipe para response
      doc.pipe(res);

      // Título
      doc.fontSize(20).text('Relatório de Auditoria', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown(2);

      // Buscar logs com filtros
      const { 
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id
      } = req.query;

      const filters = {};
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      const logs = await getAuditLogs(filters);

      // Adicionar logs
      logs.forEach((log, index) => {
        if (index > 0) doc.moveDown(1);
        
        // Cabeçalho do log
        doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${log.acao.toUpperCase()}`, { underline: true });
        doc.moveDown(0.5);
        
        // Informações básicas
        doc.fontSize(10).font('Helvetica');
        doc.text(`Data/Hora: ${new Date(log.timestamp).toLocaleString('pt-BR')}`);
        doc.text(`Usuário: ${log.usuario_nome || 'Sistema'}`);
        
        // Detalhes
        if (log.detalhes) {
          doc.moveDown(0.5);
          
          if (log.detalhes.changes) {
            doc.fontSize(10).font('Helvetica-Bold').text('Mudanças Realizadas:');
            Object.entries(log.detalhes.changes).forEach(([field, change]) => {
              doc.fontSize(9).text(`  • ${field}: ${change.from || 'vazio'} → ${change.to || 'vazio'}`);
            });
          }
          
          if (log.detalhes.recurso) {
            doc.fontSize(10).font('Helvetica-Bold').text(`Recurso: ${log.detalhes.recurso}`);
          }
          
          if (log.detalhes.ip_address) {
            doc.fontSize(10).font('Helvetica-Bold').text(`IP: ${log.detalhes.ip_address}`);
          }
          
          // Outros detalhes
          const outrosDetalhes = Object.entries(log.detalhes).filter(([key]) => 
            !['changes', 'recurso', 'ip_address'].includes(key)
          );
          
          if (outrosDetalhes.length > 0) {
            doc.fontSize(10).font('Helvetica-Bold').text('Outros Detalhes:');
            outrosDetalhes.forEach(([key, value]) => {
              doc.fontSize(9).text(`  • ${key}: ${value}`);
            });
          }
        }
        
        // Linha separadora
        doc.moveDown(0.5);
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      });

      // Finalizar documento
      doc.end();

    } catch (error) {
      console.error('Erro ao exportar auditoria para PDF:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível exportar os logs de auditoria'
      });
    }
  }
}

module.exports = AuditoriaExportController;
