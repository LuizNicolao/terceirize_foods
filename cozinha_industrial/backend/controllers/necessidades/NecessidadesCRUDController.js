const { executeQuery, pool } = require('../../config/database');
const { successResponse, errorResponse, STATUS_CODES, asyncHandler } = require('../../middleware/responseHandler');

/**
 * Controller CRUD de Necessidades
 * Responsável por operações de Delete
 */
class NecessidadesCRUDController {
  /**
   * Excluir necessidade
   * DELETE /necessidades/:id
   */
  static excluir = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar se existe
      const [necessidades] = await connection.execute(
        `SELECT id, codigo FROM necessidades WHERE id = ?`,
        [id]
      );

      if (necessidades.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Necessidade não encontrada', STATUS_CODES.NOT_FOUND);
      }

      // Deletar (os itens serão deletados automaticamente por CASCADE)
      await connection.execute(
        `DELETE FROM necessidades WHERE id = ?`,
        [id]
      );

      await connection.commit();

      return successResponse(res, {
        message: 'Necessidade excluída com sucesso'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao excluir necessidade:', error);
      return errorResponse(
        res, 
        'Erro ao excluir necessidade: ' + error.message, 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    } finally {
      connection.release();
    }
  });
}

module.exports = NecessidadesCRUDController;
