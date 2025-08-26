const { executeQuery } = require('../../config/database');

class CotacoesAnaliseController {
  // POST /api/cotacoes/:id/analisar - Analisar cotação
  static async analisarCotacao(req, res) {
    try {
      const { id } = req.params;
      const { status, observacoes, justificativa } = req.body;

      const query = `
        UPDATE cotacoes 
        SET status = ?, observacoes = ?, justificativa = ?, data_analise = NOW()
        WHERE id = ?
      `;

      const result = await executeQuery(query, [status, observacoes, justificativa, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }

      res.json({ message: 'Cotação analisada com sucesso' });
    } catch (error) {
      console.error('Erro ao analisar cotação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = CotacoesAnaliseController;
