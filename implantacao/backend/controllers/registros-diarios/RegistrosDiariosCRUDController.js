const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

/**
 * Controller CRUD para Registros Diários de Refeições
 */
class RegistrosDiariosCRUDController {
  
  /**
   * Criar registro diário (salva 5 registros de uma vez - um para cada tipo de refeição)
   */
  static async criar(req, res) {
    try {
      const { escola_id, nutricionista_id, data, quantidades, escola_nome } = req.body;
      
      // quantidades = { lanche_manha: 80, almoco: 250, lanche_tarde: 75, parcial: 30, eja: 20 }
      
      const tiposRefeicao = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial', 'eja'];
      const registrosInseridos = [];
      
      for (const tipo of tiposRefeicao) {
        const valor = quantidades[tipo] || 0;
        
        // Verificar se já existe registro para essa data/escola/tipo
        const existente = await executeQuery(
          'SELECT id FROM registros_diarios WHERE escola_id = ? AND data = ? AND tipo_refeicao = ?',
          [escola_id, data, tipo]
        );
        
        if (existente.length > 0) {
          // Atualizar existente (incluindo nome da escola)
          await executeQuery(
            'UPDATE registros_diarios SET valor = ?, nutricionista_id = ?, escola_nome = ?, data_atualizacao = NOW() WHERE id = ?',
            [valor, nutricionista_id, escola_nome, existente[0].id]
          );
          registrosInseridos.push({ id: existente[0].id, tipo, valor, acao: 'atualizado' });
        } else {
          // Inserir novo (incluindo nome da escola)
          const result = await executeQuery(
            'INSERT INTO registros_diarios (escola_id, escola_nome, nutricionista_id, data, tipo_refeicao, valor) VALUES (?, ?, ?, ?, ?, ?)',
            [escola_id, escola_nome, nutricionista_id, data, tipo, valor]
          );
          registrosInseridos.push({ id: result.insertId, tipo, valor, acao: 'criado' });
        }
      }
      
      // Buscar média atualizada
      const media = await executeQuery(
        'SELECT * FROM media_escolas WHERE escola_id = ?',
        [escola_id]
      );
      
      // Registrar auditoria
      await logAction(
        req.user?.id,
        'create',
        'registros_diarios',
        {
          escola_id,
          escola_nome,
          data,
          quantidades,
          registros_inseridos: registrosInseridos.length,
          acoes: registrosInseridos.map(r => r.acao)
        },
        req.ip
      );
      
      res.json({
        success: true,
        message: 'Registros salvos com sucesso',
        data: {
          registros: registrosInseridos,
          media: media[0] || null
        }
      });
    } catch (error) {
      console.error('Erro ao criar registros diários:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao criar registros diários'
      });
    }
  }
  
  /**
   * Buscar registros de uma escola em uma data específica
   */
  static async buscarPorEscolaData(req, res) {
    try {
      const { escola_id, data } = req.query;
      
      if (!escola_id || !data) {
        return res.status(400).json({
          success: false,
          error: 'escola_id e data são obrigatórios'
        });
      }
      
      const registros = await executeQuery(
        `SELECT * FROM registros_diarios 
         WHERE escola_id = ? AND data = ? AND ativo = 1
         ORDER BY tipo_refeicao`,
        [escola_id, data]
      );
      
      // Transformar em objeto com chaves por tipo de refeição
      const quantidades = {
        lanche_manha: 0,
        almoco: 0,
        lanche_tarde: 0,
        parcial: 0,
        eja: 0
      };
      
      registros.forEach(reg => {
        quantidades[reg.tipo_refeicao] = reg.valor;
      });
      
      res.json({
        success: true,
        data: {
          registros: registros,
          quantidades: quantidades
        }
      });
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao buscar registros'
      });
    }
  }
  
  /**
   * Excluir registros de uma data específica
   */
  static async excluir(req, res) {
    try {
      const { escola_id, data } = req.body;
      
      if (!escola_id || !data) {
        return res.status(400).json({
          success: false,
          error: 'escola_id e data são obrigatórios'
        });
      }
      
      // Buscar registros antes de deletar (para auditoria)
      const registrosAntigos = await executeQuery(
        'SELECT * FROM registros_diarios WHERE escola_id = ? AND data = ?',
        [escola_id, data]
      );
      
      await executeQuery(
        'DELETE FROM registros_diarios WHERE escola_id = ? AND data = ?',
        [escola_id, data]
      );
      
      // Registrar auditoria
      await logAction(
        req.user?.id,
        'delete',
        'registros_diarios',
        {
          escola_id,
          data,
          registros_deletados: registrosAntigos.length,
          valores_deletados: registrosAntigos
        },
        req.ip
      );
      
      res.json({
        success: true,
        message: 'Registros excluídos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro ao excluir registros'
      });
    }
  }
}

module.exports = RegistrosDiariosCRUDController;

