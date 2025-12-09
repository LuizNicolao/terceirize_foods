const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');

/**
 * Controller CRUD para Tipos de Pratos
 * Segue padrão de excelência do sistema
 */
class TiposPratosCRUDController {
  /**
   * Criar novo tipo de prato
   */
  static async criar(req, res) {
    try {
      const {
        tipo_prato,
        descricao = null,
        status = 1
      } = req.body;

      // Validar campos obrigatórios
      if (!tipo_prato || tipo_prato.trim() === '') {
        return errorResponse(res, 'Tipo de prato é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Gerar código do tipo de prato automaticamente
      const ultimoTipo = await executeQuery(
        'SELECT codigo FROM tipos_pratos ORDER BY id DESC LIMIT 1'
      );

      let proximoNumero = 1;
      if (ultimoTipo.length > 0) {
        const ultimoCodigo = ultimoTipo[0].codigo;
        if (ultimoCodigo && ultimoCodigo.startsWith('TP')) {
          const numero = parseInt(ultimoCodigo.substring(2));
          if (!isNaN(numero)) {
            proximoNumero = numero + 1;
          }
        }
      }

      const codigo = `TP${proximoNumero.toString().padStart(3, '0')}`;

      // Inserir tipo de prato
      const result = await executeQuery(
        `INSERT INTO tipos_pratos (
          codigo, tipo_prato, descricao, status
        ) VALUES (?, ?, ?, ?)`,
        [codigo, tipo_prato, descricao, status]
      );

      const tipoPratoId = result.insertId;

      // Buscar tipo de prato criado
      const tipoPratoCriado = await TiposPratosCRUDController.buscarTipoPratoCompleto(tipoPratoId);

      return successResponse(
        res,
        tipoPratoCriado,
        'Tipo de prato criado com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar tipo de prato:', error);
      return errorResponse(res, 'Erro ao criar tipo de prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de prato por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const tipoPrato = await TiposPratosCRUDController.buscarTipoPratoCompleto(id);

      if (!tipoPrato) {
        return notFoundResponse(res, 'Tipo de prato não encontrado');
      }

      return successResponse(res, tipoPrato, 'Tipo de prato encontrado com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar tipo de prato:', error);
      return errorResponse(res, 'Erro ao buscar tipo de prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar tipo de prato
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        tipo_prato,
        descricao,
        status
      } = req.body;

      // Verificar se o tipo de prato existe
      const tipoExiste = await executeQuery(
        'SELECT id, codigo FROM tipos_pratos WHERE id = ?',
        [id]
      );

      if (tipoExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de prato não encontrado');
      }

      // Atualizar tipo de prato
      const updateFields = [];
      const updateValues = [];

      if (tipo_prato !== undefined) {
        updateFields.push('tipo_prato = ?');
        updateValues.push(tipo_prato);
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
          `UPDATE tipos_pratos SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Buscar tipo de prato atualizado
      const tipoPratoAtualizado = await TiposPratosCRUDController.buscarTipoPratoCompleto(id);

      return successResponse(
        res,
        tipoPratoAtualizado,
        'Tipo de prato atualizado com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar tipo de prato:', error);
      return errorResponse(res, 'Erro ao atualizar tipo de prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir tipo de prato
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o tipo de prato existe
      const tipoExiste = await executeQuery(
        'SELECT id FROM tipos_pratos WHERE id = ?',
        [id]
      );

      if (tipoExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de prato não encontrado');
      }

      // Excluir tipo de prato
      await executeQuery('DELETE FROM tipos_pratos WHERE id = ?', [id]);

      return successResponse(
        res,
        { id: parseInt(id) },
        'Tipo de prato excluído com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir tipo de prato:', error);
      return errorResponse(res, 'Erro ao excluir tipo de prato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de prato completo por ID
   */
  static async buscarTipoPratoCompleto(id) {
    const tipos = await executeQuery(
      `SELECT 
        id,
        codigo,
        tipo_prato,
        descricao,
        status,
        data_cadastro,
        data_atualizacao
      FROM tipos_pratos
      WHERE id = ?`,
      [id]
    );

    if (tipos.length === 0) {
      return null;
    }

    return tipos[0];
  }
}

module.exports = TiposPratosCRUDController;

