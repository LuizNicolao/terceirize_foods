const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Tipos de Receitas
 * Segue padrão de excelência do sistema
 */
class TiposReceitasCRUDController {
  /**
   * Criar novo tipo de receita
   */
  static async criar(req, res) {
    try {
      const {
        tipo_receita,
        descricao = null,
        status = 1
      } = req.body;

      // Validar campos obrigatórios
      if (!tipo_receita || tipo_receita.trim() === '') {
        return errorResponse(res, 'Tipo de receita é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Gerar código do tipo de receita automaticamente
      const ultimoTipo = await executeQuery(
        'SELECT codigo FROM tipos_receitas ORDER BY id DESC LIMIT 1'
      );

      let proximoNumero = 1;
      if (ultimoTipo.length > 0) {
        const ultimoCodigo = ultimoTipo[0].codigo;
        if (ultimoCodigo && ultimoCodigo.startsWith('TR')) {
          const numero = parseInt(ultimoCodigo.substring(2));
          if (!isNaN(numero)) {
            proximoNumero = numero + 1;
          }
        }
      }

      const codigo = `TR${proximoNumero.toString().padStart(3, '0')}`;

      // Inserir tipo de receita
      const result = await executeQuery(
        `INSERT INTO tipos_receitas (
          codigo, tipo_receita, descricao, status
        ) VALUES (?, ?, ?, ?)`,
        [codigo, tipo_receita, descricao, status]
      );

      const tipoReceitaId = result.insertId;

      // Buscar tipo de receita criado
      const tipoReceitaCriado = await TiposReceitasCRUDController.buscarTipoReceitaCompleto(tipoReceitaId);

      return successResponse(
        res,
        tipoReceitaCriado,
        'Tipo de receita criado com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar tipo de receita:', error);
      return errorResponse(res, 'Erro ao criar tipo de receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de receita por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const tipoReceita = await TiposReceitasCRUDController.buscarTipoReceitaCompleto(id);

      if (!tipoReceita) {
        return notFoundResponse(res, 'Tipo de receita não encontrado');
      }

      return successResponse(res, tipoReceita, 'Tipo de receita encontrado com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar tipo de receita:', error);
      return errorResponse(res, 'Erro ao buscar tipo de receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar tipo de receita
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        tipo_receita,
        descricao,
        status
      } = req.body;

      // Verificar se o tipo de receita existe
      const tipoExiste = await executeQuery(
        'SELECT id, codigo FROM tipos_receitas WHERE id = ?',
        [id]
      );

      if (tipoExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de receita não encontrado');
      }

      // Atualizar tipo de receita
      const updateFields = [];
      const updateValues = [];

      if (tipo_receita !== undefined) {
        updateFields.push('tipo_receita = ?');
        updateValues.push(tipo_receita);
      }
      if (descricao !== undefined) {
        updateFields.push('descricao = ?');
        updateValues.push(descricao);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('data_atualizacao = NOW()');
        updateValues.push(id);

        await executeQuery(
          `UPDATE tipos_receitas SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Buscar tipo de receita atualizado
      const tipoReceitaAtualizado = await TiposReceitasCRUDController.buscarTipoReceitaCompleto(id);

      return successResponse(
        res,
        tipoReceitaAtualizado,
        'Tipo de receita atualizado com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar tipo de receita:', error);
      return errorResponse(res, 'Erro ao atualizar tipo de receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir tipo de receita
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o tipo de receita existe
      const tipoExiste = await executeQuery(
        'SELECT id FROM tipos_receitas WHERE id = ?',
        [id]
      );

      if (tipoExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de receita não encontrado');
      }

      // Excluir tipo de receita
      await executeQuery('DELETE FROM tipos_receitas WHERE id = ?', [id]);

      return successResponse(
        res,
        { id: parseInt(id) },
        'Tipo de receita excluído com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir tipo de receita:', error);
      return errorResponse(res, 'Erro ao excluir tipo de receita', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de receita completo por ID
   */
  static async buscarTipoReceitaCompleto(id) {
    const tipos = await executeQuery(
      `SELECT 
        id,
        codigo,
        tipo_receita,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_receitas
      WHERE id = ?`,
      [id]
    );

    if (tipos.length === 0) {
      return null;
    }

    return tipos[0];
  }
}

module.exports = TiposReceitasCRUDController;

