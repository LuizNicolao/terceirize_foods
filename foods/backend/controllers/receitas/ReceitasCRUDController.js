/**
 * Controller CRUD de Receitas
 * Implementa operações de criação, atualização e exclusão de receitas
 */

class ReceitasCRUDController {
  /**
   * Criar novo receita
   */
  static async criar(req, res) {
    try {
      const dados = req.body;
      const receita = await ReceitasCRUDController.criarReceita(dados);

      res.status(201).json({
        success: true,
        data: receita,
        message: 'Receita criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const receita = await ReceitasCRUDController.atualizarReceita(parseInt(id), dados);

      if (!receita) {
        return res.status(404).json({
          success: false,
          error: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        data: receita,
        message: 'Receita atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir receita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;
      const sucesso = await ReceitasCRUDController.excluirReceita(parseInt(id));

      if (!sucesso) {
        return res.status(404).json({
          success: false,
          error: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Receita excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }


  // ===== MÉTODOS DE LÓGICA DE NEGÓCIO =====

  /**
   * Criar novo receita
   */
  static async criarReceita(dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      // Gerar código interno único
      const codigoInterno = `REC-${Date.now()}`;
      
      const query = `
        INSERT INTO receitas_processadas (
          codigo_interno, codigo_referencia, nome, descricao, texto_extraido, ingredientes,
          origem, tipo, status, observacoes, criado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        codigoInterno,
        dados.codigo_referencia,
        dados.nome,
        dados.descricao || null,
        dados.texto_extraido || null,
        dados.ingredientes || null,
        dados.origem || 'manual',
        dados.tipo,
        dados.status || 'ativo',
        dados.observacoes || null,
        dados.criado_por || null
      ];
      
      const result = await executeQuery(query, params);
      
      // Buscar a receita criada
      const receitaCriada = await ReceitasCRUDController.buscarReceitaPorId(result.insertId);
      
      return receitaCriada;
    } catch (error) {
      console.error('Erro no service de criar receita:', error);
      throw error;
    }
  }

  /**
   * Atualizar receita
   */
  static async atualizarReceita(id, dados) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        UPDATE receitas_processadas SET
          codigo_referencia = ?,
          nome = ?,
          descricao = ?,
          texto_extraido = ?,
          ingredientes = ?,
          tipo = ?,
          status = ?,
          observacoes = ?,
          atualizado_por = ?
        WHERE id = ?
      `;
      
      const params = [
        dados.codigo_referencia,
        dados.nome,
        dados.descricao || null,
        dados.texto_extraido || null,
        dados.ingredientes || null,
        dados.tipo,
        dados.status,
        dados.observacoes || null,
        dados.atualizado_por || null,
        id
      ];
      
      await executeQuery(query, params);
      
      // Buscar a receita atualizada
      const receitaAtualizada = await ReceitasCRUDController.buscarReceitaPorId(id);
      
      return receitaAtualizada;
    } catch (error) {
      console.error('Erro no service de atualizar receita:', error);
      throw error;
    }
  }

  /**
   * Excluir receita
   */
  static async excluirReceita(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `DELETE FROM receitas_processadas WHERE id = ?`;
      await executeQuery(query, [id]);
      
      return true;
    } catch (error) {
      console.error('Erro no service de excluir receita:', error);
      throw error;
    }
  }

  /**
   * Buscar receita por ID
   */
  static async buscarReceitaPorId(id) {
    try {
      const { executeQuery } = require('../../config/database');
      
      const query = `
        SELECT 
          id,
          codigo_interno,
          codigo_referencia,
          nome,
          descricao,
          ingredientes,
          origem,
          tipo,
          status,
          observacoes,
          criado_em,
          atualizado_em,
          criado_por,
          atualizado_por
        FROM receitas_processadas 
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [id]);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar receita por ID:', error);
      throw error;
    }
  }

  /**
   * Processar PDF de receita e extrair ingredientes
   */
  static async processarPDF(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo PDF é obrigatório'
        });
      }

      // Aqui você pode implementar o processamento real do PDF
      // Por enquanto, vamos simular a extração
      const dadosExtraidos = {
        nome: 'Receita Extraída do PDF',
        descricao: 'Receita extraída automaticamente do PDF',
        texto_extraido_pdf: 'Texto extraído do PDF...',
        ingredientes: [
          { nome: 'Ingrediente 1', quantidade: '100g' },
          { nome: 'Ingrediente 2', quantidade: '200ml' }
        ],
        instrucoes: 'Instruções de preparo extraídas do PDF...'
      };

      res.json({
        success: true,
        data: dadosExtraidos,
        message: 'PDF processado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

}

module.exports = ReceitasCRUDController;
