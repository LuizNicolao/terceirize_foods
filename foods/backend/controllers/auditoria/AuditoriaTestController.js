/**
 * Controller de Testes de Auditoria
 * Responsável por testes de conectividade e funcionalidade da auditoria
 */

const { executeQuery } = require('../../config/database');

class AuditoriaTestController {
  // Teste de conectividade da auditoria
  static async testarConectividade(req, res) {
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
  static async testarGetAuditLogs(req, res) {
    try {
      const { getAuditLogs } = require('../../utils/audit');
      
      const filters = {
        limit: 5,
        offset: 0
      };
      
      const logs = await getAuditLogs(filters);
      
      res.json({
        success: true,
        message: 'Função getAuditLogs funcionando corretamente',
        totalLogs: logs.length,
        sampleLog: logs[0] || null
      });
    } catch (error) {
      console.error('Erro ao testar getAuditLogs:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao testar getAuditLogs',
        message: error.message
      });
    }
  }

  // Teste de permissões de auditoria
  static async testarPermissoes(req, res) {
    try {
      const userInfo = {
        id: req.user.id,
        nome: req.user.nome,
        tipo_de_acesso: req.user.tipo_de_acesso,
        nivel_de_acesso: req.user.nivel_de_acesso
      };

      const temPermissao = req.user.tipo_de_acesso === 'administrador' || 
                          (req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III');

      res.json({
        success: true,
        message: 'Teste de permissões concluído',
        userInfo,
        temPermissao,
        podeVisualizar: temPermissao,
        podeExportar: temPermissao
      });
    } catch (error) {
      console.error('Erro ao testar permissões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao testar permissões',
        message: error.message
      });
    }
  }

  // Teste completo da auditoria
  static async testarCompleto(req, res) {
    try {
      const results = {
        conectividade: null,
        getAuditLogs: null,
        permissoes: null
      };

      // Teste 1: Conectividade
      try {
        const conectividadeResult = await executeQuery('SELECT COUNT(*) as total FROM auditoria_acoes');
        results.conectividade = {
          success: true,
          total: conectividadeResult[0].total
        };
      } catch (error) {
        results.conectividade = {
          success: false,
          error: error.message
        };
      }

      // Teste 2: getAuditLogs
      try {
        const { getAuditLogs } = require('../../utils/audit');
        const logs = await getAuditLogs({ limit: 1, offset: 0 });
        results.getAuditLogs = {
          success: true,
          totalLogs: logs.length
        };
      } catch (error) {
        results.getAuditLogs = {
          success: false,
          error: error.message
        };
      }

      // Teste 3: Permissões
      try {
        const temPermissao = req.user.tipo_de_acesso === 'administrador' || 
                            (req.user.tipo_de_acesso === 'coordenador' && req.user.nivel_de_acesso === 'III');
        
        results.permissoes = {
          success: true,
          userInfo: {
            id: req.user.id,
            nome: req.user.nome,
            tipo_de_acesso: req.user.tipo_de_acesso,
            nivel_de_acesso: req.user.nivel_de_acesso
          },
          temPermissao
        };
      } catch (error) {
        results.permissoes = {
          success: false,
          error: error.message
        };
      }

      const todosSucessos = Object.values(results).every(result => result.success);

      res.json({
        success: todosSucessos,
        message: todosSucessos ? 'Todos os testes passaram' : 'Alguns testes falharam',
        results
      });

    } catch (error) {
      console.error('Erro no teste completo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro no teste completo',
        message: error.message
      });
    }
  }
}

module.exports = AuditoriaTestController;
