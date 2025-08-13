/**
 * Controller de Estatísticas de Ajudantes
 * Responsável por relatórios e estatísticas
 */

const { executeQuery } = require('../../config/database');

class AjudantesStatsController {
  // Buscar ajudantes disponíveis (ativos e não em férias/licença)
  static async buscarAjudantesDisponiveis(req, res) {
    try {
      const query = `
        SELECT 
          a.id, a.nome, a.cpf, a.telefone, a.email, 
          a.status, a.filial_id,
          f.filial as filial_nome
        FROM ajudantes a
        LEFT JOIN filiais f ON a.filial_id = f.id
        WHERE a.status = 'ativo'
        ORDER BY a.nome ASC
      `;

      const ajudantes = await executeQuery(query);

      res.json({
        success: true,
        data: ajudantes
      });

    } catch (error) {
      console.error('Erro ao buscar ajudantes disponíveis:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar os ajudantes disponíveis'
      });
    }
  }
}

module.exports = AjudantesStatsController;
