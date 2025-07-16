const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { getAuditLogs } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

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
    console.error('Erro ao testar tabela:', error);
    res.status(500).json({ 
      error: 'Erro ao acessar tabela de auditoria',
      message: error.message 
    });
  }
});

// Listar logs de auditoria
router.get('/', checkPermission('visualizar'), async (req, res) => {
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

    // Teste simples primeiro - apenas contar registros
    const { executeQuery } = require('../config/database');
    console.log('Executando query de teste...');
    
    const countResult = await executeQuery('SELECT COUNT(*) as total FROM auditoria_acoes');
    console.log('Total de registros na auditoria:', countResult[0].total);

    // Se chegou até aqui, vamos buscar os logs
    const { 
      usuario_id, 
      acao, 
      recurso, 
      data_inicio, 
      data_fim, 
      limit = 100, 
      offset = 0 
    } = req.query;

    const filters = {
      usuario_id: usuario_id ? parseInt(usuario_id) : null,
      acao,
      recurso,
      data_inicio,
      data_fim,
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