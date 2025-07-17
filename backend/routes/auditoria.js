const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { getAuditLogs } = require('../utils/audit');

const router = express.Router();

// Rota sem autenticação para teste
router.get('/public-test', (req, res) => {
  res.json({ 
    message: 'Rota pública funcionando',
    timestamp: new Date().toISOString()
  });
});

// Aplicar autenticação em todas as outras rotas
router.use(authenticateToken);

// Rota simples para testar se a autenticação está funcionando
router.get('/ping', (req, res) => {
  res.json({ 
    message: 'Ping funcionando',
    user: req.user,
    headers: {
      authorization: req.headers.authorization ? 'presente' : 'ausente'
    }
  });
});

// Rota de teste para verificar se a tabela existe
router.get('/test', async (req, res) => {
  try {
    const { executeQuery } = require('../config/database');
    
    const result = await executeQuery('SELECT COUNT(*) as total FROM auditoria_acoes');
    
    res.json({ 
      message: 'Tabela auditoria_acoes existe',
      total: result[0].total 
    });
  } catch (error) {
    console.error('=== ERRO NO TESTE ===');
    console.error('Erro ao testar tabela:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao acessar tabela de auditoria',
      message: error.message 
    });
  }
});

// Rota de teste para verificar a função getAuditLogs
router.get('/test-function', async (req, res) => {
  try {
    const { getAuditLogs } = require('../utils/audit');
    
    const logs = await getAuditLogs({ limit: 5, offset: 0 });
    
    res.json({ 
      message: 'Função getAuditLogs funcionando',
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
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro na função getAuditLogs',
      message: error.message 
    });
  }
});

// Listar logs de auditoria
router.get('/', async (req, res) => {
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
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores e coordenadores nível III podem visualizar logs de auditoria.' });
    }

    console.log('Usuário tem permissão, buscando logs...');

    // Buscar logs com todos os filtros disponíveis
    const { 
      limit = 100, 
      offset = 0,
      data_inicio,
      data_fim,
      acao,
      recurso,
      usuario_id
    } = req.query;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Adicionar filtros opcionais
    if (data_inicio) filters.data_inicio = data_inicio;
    if (data_fim) filters.data_fim = data_fim;
    if (acao) filters.acao = acao;
    if (recurso) filters.recurso = recurso;
    if (usuario_id) filters.usuario_id = parseInt(usuario_id);

    console.log('Buscando logs de auditoria com filtros:', filters);
    const logs = await getAuditLogs(filters);
    console.log('Logs encontrados:', logs.length);

    res.json({
      logs,
      total: logs.length,
      filters
    });

  } catch (error) {
    console.error('=== ERRO NA AUDITORIA ===');
    console.error('Erro ao buscar logs de auditoria:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Buscar logs de auditoria por usuário específico
router.get('/usuario/:usuarioId', checkPermission('visualizar'), async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verificar se usuário é administrador ou está consultando seus próprios logs
    if (req.user.tipo_de_acesso !== 'administrador' && req.user.id !== parseInt(usuarioId)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const filters = {
      usuario_id: parseInt(usuarioId),
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const logs = await getAuditLogs(filters);

    res.json({
      logs,
      total: logs.length,
      usuario_id: usuarioId
    });

  } catch (error) {
    console.error('Erro ao buscar logs de auditoria do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de auditoria (apenas administradores)
router.get('/estatisticas', checkPermission('visualizar'), async (req, res) => {
  try {
    // Verificar se usuário é administrador
    if (req.user.tipo_de_acesso !== 'administrador') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem visualizar estatísticas.' });
    }

    const { executeQuery } = require('../config/database');

    // Estatísticas por ação
    const acoesStats = await executeQuery(`
      SELECT acao, COUNT(*) as total
      FROM auditoria_acoes
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY acao
      ORDER BY total DESC
    `);

    // Estatísticas por recurso
    const recursosStats = await executeQuery(`
      SELECT recurso, COUNT(*) as total
      FROM auditoria_acoes
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY recurso
      ORDER BY total DESC
    `);

    // Usuários mais ativos
    const usuariosAtivos = await executeQuery(`
      SELECT 
        u.nome,
        u.email,
        COUNT(a.id) as total_acoes
      FROM auditoria_acoes a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY a.usuario_id
      ORDER BY total_acoes DESC
      LIMIT 10
    `);

    // Ações hoje
    const acoesHoje = await executeQuery(`
      SELECT COUNT(*) as total
      FROM auditoria_acoes
      WHERE DATE(timestamp) = CURDATE()
    `);

    res.json({
      acoes_stats: acoesStats,
      recursos_stats: recursosStats,
      usuarios_ativos: usuariosAtivos,
      acoes_hoje: acoesHoje[0].total
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar logs de auditoria para XLSX
router.get('/export/xlsx', async (req, res) => {
  try {
    // Verificar se usuário tem permissão para visualizar auditoria
    if (req.user.tipo_de_acesso !== 'administrador' && 
        !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores e coordenadores nível III podem exportar logs de auditoria.' });
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar logs de auditoria para PDF
router.get('/export/pdf', async (req, res) => {
  try {
    // Verificar se usuário tem permissão para visualizar auditoria
    if (req.user.tipo_de_acesso !== 'administrador' && 
        !(req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III')) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores e coordenadores nível III podem exportar logs de auditoria.' });
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
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 