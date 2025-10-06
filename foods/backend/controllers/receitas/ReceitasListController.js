/**
 * Controller de Listagem de Receitas
 * Implementa operações de listagem e busca de receitas
 */

class ReceitasListController {
  /**
   * Listar receitas com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { page, limit, search, status, mes, ano, unidade_escolar_id } = req.query;
      
      const filtros = {
        search,
        status,
        mes: mes ? parseInt(mes) : undefined,
        ano: ano ? parseInt(ano) : undefined,
        unidade_escolar_id: unidade_escolar_id ? parseInt(unidade_escolar_id) : undefined
      };

      const resultado = await ReceitasListController.listarReceitas({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        filtros
      });

      res.json({
        success: true,
        data: {
          receitas: resultado.receitas,
          totalPages: resultado.totalPages,
          totalItems: resultado.totalItems,
          estatisticas: resultado.estatisticas
        },
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar receita por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const receita = await ReceitasListController.buscarReceitaPorId(parseInt(id));

      if (!receita) {
        return res.status(404).json({
          success: false,
          error: 'Receita não encontrada'
        });
      }

      res.json({
        success: true,
        data: receita
      });
    } catch (error) {
      console.error('Erro ao buscar receita:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // ===== MÉTODOS DE LÓGICA DE NEGÓCIO =====

  /**
   * Listar receitas com paginação e filtros
   */
  static async listarReceitas({ page = 1, limit = 20, filtros = {} }) {
    try {
      // Importar função de execução de query
      const { executeQuery } = require('../../config/database');
      
      // Construir query para buscar receitas
      let whereConditions = ['1=1'];
      let params = [];
      
      if (filtros.search) {
        whereConditions.push('(nome LIKE ? OR descricao LIKE ?)');
        params.push(`%${filtros.search}%`, `%${filtros.search}%`);
      }
      
      if (filtros.status) {
        whereConditions.push('status = ?');
        params.push(filtros.status);
      }
      
      const whereClause = whereConditions.join(' AND ');
      const offset = (page - 1) * limit;
      
      // Query principal
      const query = `
        SELECT 
          id,
          codigo_interno,
          codigo_referencia,
          nome,
          descricao,
          texto_extraido,
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
        WHERE ${whereClause}
        ORDER BY criado_em DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const receitas = await executeQuery(query, params);
      
      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM receitas_processadas 
        WHERE ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, params);
      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Calcular estatísticas
      const estatisticas = {
        total_receitas: totalItems,
        receitas_pendentes: 0,
        receitas_aprovados: 0,
        receitas_rejeitados: 0,
        receitas_ativos: 0
      };
      
      // Contar por status
      receitas.forEach(receita => {
        switch(receita.status) {
          case 'pendente':
            estatisticas.receitas_pendentes++;
            break;
          case 'aprovado':
            estatisticas.receitas_aprovados++;
            break;
          case 'rejeitado':
            estatisticas.receitas_rejeitados++;
            break;
          case 'ativo':
            estatisticas.receitas_ativos++;
            break;
        }
      });
      
      return {
        receitas,
        totalPages,
        totalItems,
        estatisticas,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
      
    } catch (error) {
      console.error('Erro no service de listar receitas:', error);
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
          texto_extraido,
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
      console.error('Erro no service de buscar receita por ID:', error);
      throw error;
    }
  }
}

module.exports = ReceitasListController;
