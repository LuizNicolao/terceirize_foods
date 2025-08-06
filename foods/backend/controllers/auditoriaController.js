const { executeQuery } = require('../config/database');
const { getAuditLogs } = require('../utils/audit');

class AuditoriaController {
  // Listar logs de auditoria com filtros
  async listarLogs(req, res) {
    try {
      console.log('=== INÍCIO DA REQUISIÇÃO DE AUDITORIA ===');
      console.log('Usuário atual:', {
        id: req.user.id,
        nome: req.user.nome,
        tipo_de_acesso: req.user.tipo_de_acesso,
        nivel_de_acesso: req.user.nivel_de_acesso
      });

      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores e coordenadores nível III podem visualizar logs de auditoria.' 
        });
      }

      console.log('Usuário tem permissão, buscando logs...');

      // Buscar logs com todos os filtros disponíveis
      const { 
        page = 1,
        limit = 100, 
        offset = 0,
        data_inicio,
        data_fim,
        acao,
        recurso,
        usuario_id,
        periodo
      } = req.query;

      const actualOffset = offset || (page - 1) * limit;
      
      const filters = {
        limit: parseInt(limit),
        offset: parseInt(actualOffset)
      };

      // Processar período se fornecido
      let dataInicioProcessada = data_inicio;
      let dataFimProcessada = data_fim;
      
      if (periodo && !data_inicio && !data_fim) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          case 'todos':
            // Não aplicar filtro de data
            break;
          default:
            // Período personalizado - usar datas fornecidas
            break;
        }
        
        if (periodo !== 'todos') {
          dataInicioProcessada = dataInicio.toISOString().split('T')[0];
          dataFimProcessada = hoje.toISOString().split('T')[0];
        }
      }
      
      // Adicionar filtros opcionais
      if (dataInicioProcessada) filters.data_inicio = dataInicioProcessada;
      if (dataFimProcessada) filters.data_fim = dataFimProcessada;
      if (acao) filters.acao = acao;
      if (recurso) filters.recurso = recurso;
      if (usuario_id) filters.usuario_id = parseInt(usuario_id);

      console.log('Buscando logs de auditoria com filtros:', filters);
      const logs = await getAuditLogs(filters);
      console.log('Logs encontrados:', logs.length);

      // Buscar total de registros para paginação
      let totalCount = 0;
      try {
        const countQuery = `
          SELECT COUNT(*) as total
          FROM auditoria_acoes aa
          LEFT JOIN usuarios u ON aa.usuario_id = u.id
          WHERE 1=1
          ${dataInicioProcessada ? 'AND aa.timestamp >= ?' : ''}
          ${dataFimProcessada ? 'AND aa.timestamp <= ?' : ''}
          ${acao ? 'AND aa.acao = ?' : ''}
          ${recurso ? 'AND aa.recurso = ?' : ''}
          ${usuario_id ? 'AND aa.usuario_id = ?' : ''}
        `;
        
        const countParams = [];
        if (dataInicioProcessada) countParams.push(dataInicioProcessada);
        if (dataFimProcessada) countParams.push(dataFimProcessada);
        if (acao) countParams.push(acao);
        if (recurso) countParams.push(recurso);
        if (usuario_id) countParams.push(parseInt(usuario_id));

        const countResult = await executeQuery(countQuery, countParams);
        totalCount = countResult[0].total;
      } catch (error) {
        console.error('Erro ao contar total de logs:', error);
      }

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          data_inicio: data_inicio || null,
          data_fim: data_fim || null,
          acao: acao || null,
          recurso: recurso || null,
          usuario_id: usuario_id || null
        }
      });

    } catch (error) {
      console.error('=== ERRO NA AUDITORIA ===');
      console.error('Erro ao buscar logs de auditoria:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os logs de auditoria'
      });
    }
  }

  // Buscar logs de auditoria por usuário específico
  async buscarLogsPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const { 
        page = 1,
        limit = 50, 
        offset = 0 
      } = req.query;

      // Verificar se usuário é administrador ou está consultando seus próprios logs
      if (req.user.tipo_de_acesso !== 'administrador' && req.user.id !== parseInt(usuarioId)) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado',
          message: 'Você só pode visualizar seus próprios logs de auditoria'
        });
      }

      const actualOffset = offset || (page - 1) * limit;

      const filters = {
        usuario_id: parseInt(usuarioId),
        limit: parseInt(limit),
        offset: parseInt(actualOffset)
      };

      const logs = await getAuditLogs(filters);

      // Buscar total de registros para paginação
      let totalCount = 0;
      try {
        const countResult = await executeQuery(
          'SELECT COUNT(*) as total FROM auditoria_acoes WHERE usuario_id = ?',
          [parseInt(usuarioId)]
        );
        totalCount = countResult[0].total;
      } catch (error) {
        console.error('Erro ao contar total de logs do usuário:', error);
      }

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        usuario_id: parseInt(usuarioId)
      });

    } catch (error) {
      console.error('Erro ao buscar logs de auditoria do usuário:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os logs de auditoria do usuário'
      });
    }
  }

  // Buscar logs de auditoria por recurso específico
  async buscarLogsPorRecurso(req, res) {
    try {
      const { recurso } = req.params;
      const { 
        page = 1,
        limit = 50, 
        offset = 0 
      } = req.query;

      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores e coordenadores nível III podem visualizar logs de auditoria.' 
        });
      }

      const actualOffset = offset || (page - 1) * limit;

      const filters = {
        recurso: recurso,
        limit: parseInt(limit),
        offset: parseInt(actualOffset)
      };

      const logs = await getAuditLogs(filters);

      // Buscar total de registros para paginação
      let totalCount = 0;
      try {
        const countResult = await executeQuery(
          'SELECT COUNT(*) as total FROM auditoria_acoes WHERE recurso = ?',
          [recurso]
        );
        totalCount = countResult[0].total;
      } catch (error) {
        console.error('Erro ao contar total de logs do recurso:', error);
      }

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        recurso: recurso
      });

    } catch (error) {
      console.error('Erro ao buscar logs de auditoria do recurso:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os logs de auditoria do recurso'
      });
    }
  }

  // Buscar logs de auditoria por ação específica
  async buscarLogsPorAcao(req, res) {
    try {
      const { acao } = req.params;
      const { 
        page = 1,
        limit = 50, 
        offset = 0 
      } = req.query;

      // Verificar se usuário tem permissão para visualizar auditoria
      if (req.user.tipo_de_acesso !== 'administrador' && 
          !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores e coordenadores nível III podem visualizar logs de auditoria.' 
        });
      }

      const actualOffset = offset || (page - 1) * limit;

      const filters = {
        acao: acao,
        limit: parseInt(limit),
        offset: parseInt(actualOffset)
      };

      const logs = await getAuditLogs(filters);

      // Buscar total de registros para paginação
      let totalCount = 0;
      try {
        const countResult = await executeQuery(
          'SELECT COUNT(*) as total FROM auditoria_acoes WHERE acao = ?',
          [acao]
        );
        totalCount = countResult[0].total;
      } catch (error) {
        console.error('Erro ao contar total de logs da ação:', error);
      }

      // Calcular metadados de paginação
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        acao: acao
      });

    } catch (error) {
      console.error('Erro ao buscar logs de auditoria da ação:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os logs de auditoria da ação'
      });
    }
  }

  // Estatísticas de auditoria (apenas administradores)
  async obterEstatisticas(req, res) {
    try {
      // Verificar se usuário é administrador
      if (req.user.tipo_de_acesso !== 'administrador') {
        return res.status(403).json({ 
          success: false,
          error: 'Acesso negado', 
          message: 'Apenas administradores podem visualizar estatísticas de auditoria.' 
        });
      }

      const { periodo = 30 } = req.query;

      // Estatísticas por ação
      const acoesStats = await executeQuery(`
        SELECT acao, COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY acao
        ORDER BY total DESC
      `, [parseInt(periodo)]);

      // Estatísticas por recurso
      const recursosStats = await executeQuery(`
        SELECT recurso, COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY recurso
        ORDER BY total DESC
      `, [parseInt(periodo)]);

      // Usuários mais ativos
      const usuariosAtivos = await executeQuery(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          COUNT(a.id) as total_acoes
        FROM auditoria_acoes a
        JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY a.usuario_id
        ORDER BY total_acoes DESC
        LIMIT 10
      `, [parseInt(periodo)]);

      // Ações hoje
      const acoesHoje = await executeQuery(`
        SELECT COUNT(*) as total
        FROM auditoria_acoes
        WHERE DATE(timestamp) = CURDATE()
      `);

      // Ações na última semana
      const acoesUltimaSemana = await executeQuery(`
        SELECT COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      // Ações no último mês
      const acoesUltimoMes = await executeQuery(`
        SELECT COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      // Distribuição por hora do dia (últimos 7 dias)
      const distribuicaoHora = await executeQuery(`
        SELECT 
          HOUR(timestamp) as hora,
          COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY HOUR(timestamp)
        ORDER BY hora
      `);

      // Distribuição por dia da semana (últimos 30 dias)
      const distribuicaoDia = await executeQuery(`
        SELECT 
          DAYNAME(timestamp) as dia_semana,
          COUNT(*) as total
        FROM auditoria_acoes
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DAYNAME(timestamp)
        ORDER BY FIELD(DAYNAME(timestamp), 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
      `);

      res.json({
        success: true,
        data: {
          periodo_dias: parseInt(periodo),
          acoes_stats: acoesStats,
          recursos_stats: recursosStats,
          usuarios_ativos: usuariosAtivos,
          resumo: {
            acoes_hoje: acoesHoje[0].total,
            acoes_ultima_semana: acoesUltimaSemana[0].total,
            acoes_ultimo_mes: acoesUltimoMes[0].total
          },
          distribuicao_hora: distribuicaoHora,
          distribuicao_dia: distribuicaoDia
        }
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de auditoria:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas de auditoria'
      });
    }
  }

  // Exportar logs de auditoria para XLSX
  async exportarXLSX(req, res) {
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
        { header: 'Data/Hora', key: 'timestamp', width: 20 },
        { header: 'Usuário', key: 'usuario_nome', width: 25 },
        { header: 'Ação', key: 'acao', width: 15 },
        { header: 'Recurso', key: 'recurso', width: 20 },
        { header: 'IP', key: 'ip_address', width: 15 },
        { header: 'Mudanças', key: 'mudancas', width: 50 }
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
        let mudancas = '';
        if (log.detalhes && log.detalhes.changes) {
          mudancas = Object.entries(log.detalhes.changes)
            .map(([field, change]) => `${field}: ${change.from} → ${change.to}`)
            .join('; ');
        }

        worksheet.addRow({
          timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
          usuario_nome: log.usuario_nome || 'Usuário não encontrado',
          acao: log.acao,
          recurso: log.recurso,
          ip_address: log.ip_address || '',
          mudancas: mudancas
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
  async exportarPDF(req, res) {
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
        doc.fontSize(14).text(`${index + 1}. ${log.acao.toUpperCase()} - ${log.recurso}`, { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10).text(`Data/Hora: ${new Date(log.timestamp).toLocaleString('pt-BR')}`);
        doc.text(`Usuário: ${log.usuario_nome || 'Usuário não encontrado'}`);
        doc.text(`IP: ${log.ip_address || 'Não informado'}`);
        
        if (log.detalhes && log.detalhes.changes) {
          doc.moveDown(0.5);
          doc.fontSize(10).text('Mudanças Realizadas:', { underline: true });
          Object.entries(log.detalhes.changes).forEach(([field, change]) => {
            doc.fontSize(9).text(`  • ${field}: ${change.from} → ${change.to}`);
          });
        }
        
        doc.moveDown(2);
      });

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

  // Teste de conectividade da auditoria
  async testarConectividade(req, res) {
    try {
      const result = await executeQuery('SELECT COUNT(*) as total FROM auditoria_acoes');
      
      res.json({ 
        success: true,
        message: 'Tabela auditoria_acoes existe e está acessível',
        total: result[0].total 
      });
    } catch (error) {
      console.error('=== ERRO NO TESTE ===');
      console.error('Erro ao testar tabela:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao acessar tabela de auditoria',
        message: error.message 
      });
    }
  }

  // Teste da função getAuditLogs
  async testarFuncao(req, res) {
    try {
      const logs = await getAuditLogs({ limit: 5, offset: 0 });
      
      res.json({ 
        success: true,
        message: 'Função getAuditLogs funcionando corretamente',
        total: logs.length,
        sample: logs[0] ? {
          id: logs[0].id,
          usuario_id: logs[0].usuario_id,
          acao: logs[0].acao,
          recurso: logs[0].recurso
        } : null
      });
    } catch (error) {
      console.error('=== ERRO NO TESTE DA FUNÇÃO ===');
      console.error('Erro ao testar getAuditLogs:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro na função getAuditLogs',
        message: error.message 
      });
    }
  }
}

module.exports = new AuditoriaController(); 