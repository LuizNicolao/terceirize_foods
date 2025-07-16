const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { getAuditLogs } = require('../utils/audit');

const router = express.Router();

// Rota sem autenticação para teste
router.get('/public-test', (req, res) => {
  console.log('=== TESTE PÚBLICO ===');
  res.json({ 
    message: 'Rota pública funcionando',
    timestamp: new Date().toISOString()
  });
});

// Aplicar autenticação em todas as outras rotas
router.use(authenticateToken);

// Rota simples para testar se a autenticação está funcionando
router.get('/ping', (req, res) => {
  console.log('=== PING AUDITORIA ===');
  console.log('Headers:', req.headers);
  console.log('Authorization:', req.headers.authorization);
  console.log('Usuário autenticado:', req.user);
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
    console.log('=== TESTE DA TABELA AUDITORIA ===');
    const { executeQuery } = require('../config/database');
    console.log('executeQuery importado com sucesso');
    
    const result = await executeQuery('SELECT COUNT(*) as total FROM auditoria_acoes');
    console.log('Resultado da query:', result);
    
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
    console.log('=== TESTE DA FUNÇÃO getAuditLogs ===');
    const { getAuditLogs } = require('../utils/audit');
    console.log('getAuditLogs importado com sucesso');
    
    const logs = await getAuditLogs({ limit: 5, offset: 0 });
    console.log('Logs retornados:', logs.length);
    
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

    // Buscar logs diretamente sem filtros complexos
    const { 
      limit = 100, 
      offset = 0 
    } = req.query;

    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

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

module.exports = router; 