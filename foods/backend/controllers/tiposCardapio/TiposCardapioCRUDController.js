/**
 * Controller CRUD para Tipos de Cardápio
 * Implementa as operações básicas de CRUD
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class TiposCardapioCRUDController {
  /**
   * Listar todos os tipos de cardápio com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { search, status, filial_id } = req.query;
      const pagination = req.pagination;

      // Construir query base
      let query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status,
          tc.observacoes,
          tc.created_at,
          tc.updated_at,
          COUNT(tcf.filial_id) as total_filiais
        FROM tipos_cardapio tc
        LEFT JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        WHERE 1=1`;

      const queryParams = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (tc.nome LIKE ? OR tc.codigo LIKE ? OR tc.descricao LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        query += ` AND tc.status = ?`;
        queryParams.push(status);
      }

      if (filial_id) {
        query += ` AND tc.id IN (SELECT tipo_cardapio_id FROM tipos_cardapio_filiais WHERE filial_id = ?)`;
        queryParams.push(filial_id);
      }

      // Agrupar por tipo de cardápio
      query += ` GROUP BY tc.id`;

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(DISTINCT tc.id) as total 
        FROM tipos_cardapio tc
        LEFT JOIN tipos_cardapio_filiais tcf ON tc.id = tcf.tipo_cardapio_id
        WHERE 1=1${search ? ' AND (tc.nome LIKE ? OR tc.codigo LIKE ? OR tc.descricao LIKE ?)' : ''}${status ? ' AND tc.status = ?' : ''}${filial_id ? ' AND tc.id IN (SELECT tipo_cardapio_id FROM tipos_cardapio_filiais WHERE filial_id = ?)' : ''}`;
      
      const countParams = [];
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (status) {
        countParams.push(status);
      }
      if (filial_id) {
        countParams.push(filial_id);
      }

      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = parseInt(countResult[0]?.total) || 0;

      // Aplicar paginação e ordenação
      query += ` ORDER BY tc.nome ASC`;
      
      // Aplicar paginação manualmente
      const limit = pagination.limit;
      const offset = pagination.offset;
      const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

      // Executar query principal
      const tipos = await executeQuery(paginatedQuery, queryParams);
      
      // Calcular informações de paginação
      const totalPages = Math.ceil(totalItems / pagination.limit);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'listar', 'tipos_cardapio', {
          search,
          status,
          filial_id,
          page: pagination.page,
          limit: pagination.limit
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      const response = {
        success: true,
        data: {
          tipos,
          pagination: {
            currentPage: pagination.page,
            totalPages,
            totalItems,
            itemsPerPage: pagination.limit
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro ao listar tipos de cardápio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar tipo de cardápio por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          tc.id,
          tc.nome,
          tc.codigo,
          tc.descricao,
          tc.status,
          tc.observacoes,
          tc.created_at,
          tc.updated_at
        FROM tipos_cardapio tc
        WHERE tc.id = ?
      `;

      const tipos = await executeQuery(query, [id]);

      if (tipos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de cardápio não encontrado'
        });
      }

      // Buscar filiais vinculadas
      const filiaisQuery = `
        SELECT 
          f.id,
          f.filial,
          tcf.data_vinculo
        FROM tipos_cardapio_filiais tcf
        JOIN filiais f ON tcf.filial_id = f.id
        WHERE tcf.tipo_cardapio_id = ?
        ORDER BY f.filial ASC
      `;

      const filiais = await executeQuery(filiaisQuery, [id]);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'visualizar', 'tipos_cardapio', { resourceId: id });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      res.json({
        success: true,
        data: {
          ...tipos[0],
          filiais
        }
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar novo tipo de cardápio
   */
  static async criar(req, res) {
    try {
      const { nome, codigo, descricao, status = 'ativo', observacoes, filiais = [] } = req.body;

      // Verificar se o código já existe (se fornecido)
      if (codigo) {
        const existingTipos = await executeQuery(
          'SELECT id FROM tipos_cardapio WHERE codigo = ?',
          [codigo]
        );

        if (existingTipos.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Código já existe para outro tipo de cardápio'
          });
        }
      }

      // Inserir novo tipo de cardápio
      const result = await executeQuery(
        'INSERT INTO tipos_cardapio (nome, codigo, descricao, status, observacoes) VALUES (?, ?, ?, ?, ?)',
        [nome, codigo, descricao, status, observacoes]
      );

      const novoTipoId = result.insertId;

      // Vincular filiais se fornecidas
      if (filiais.length > 0) {
        for (const filialId of filiais) {
          await executeQuery(
            'INSERT INTO tipos_cardapio_filiais (tipo_cardapio_id, filial_id) VALUES (?, ?)',
            [novoTipoId, filialId]
          );
        }
      }

      // Buscar o tipo criado
      const tipos = await executeQuery(
        'SELECT * FROM tipos_cardapio WHERE id = ?',
        [novoTipoId]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'criar', 'tipos_cardapio', {
          resourceId: novoTipoId,
          nome,
          codigo,
          descricao,
          status,
          observacoes,
          filiais
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      res.status(201).json({
        success: true,
        message: 'Tipo de cardápio criado com sucesso',
        data: tipos[0]
      });
    } catch (error) {
      console.error('Erro ao criar tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar tipo de cardápio existente
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, codigo, descricao, status, observacoes, filiais = [] } = req.body;

      // Verificar se o tipo existe
      const existingTipos = await executeQuery(
        'SELECT id FROM tipos_cardapio WHERE id = ?',
        [id]
      );

      if (existingTipos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de cardápio não encontrado'
        });
      }

      // Verificar se o código já existe para outro tipo
      if (codigo) {
        const duplicateTipos = await executeQuery(
          'SELECT id FROM tipos_cardapio WHERE codigo = ? AND id != ?',
          [codigo, id]
        );

        if (duplicateTipos.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Código já existe para outro tipo de cardápio'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateValues.push(nome);
      }

      if (codigo !== undefined) {
        updateFields.push('codigo = ?');
        updateValues.push(codigo);
      }

      if (descricao !== undefined) {
        updateFields.push('descricao = ?');
        updateValues.push(descricao);
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (observacoes !== undefined) {
        updateFields.push('observacoes = ?');
        updateValues.push(observacoes);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE tipos_cardapio SET ${updateFields.join(', ')} WHERE id = ?`;
      await executeQuery(updateQuery, updateValues);

      // Atualizar filiais se fornecidas
      if (filiais !== undefined) {
        // Remover vínculos existentes
        await executeQuery('DELETE FROM tipos_cardapio_filiais WHERE tipo_cardapio_id = ?', [id]);

        // Adicionar novos vínculos
        if (filiais.length > 0) {
          for (const filialId of filiais) {
            await executeQuery(
              'INSERT INTO tipos_cardapio_filiais (tipo_cardapio_id, filial_id) VALUES (?, ?)',
              [id, filialId]
            );
          }
        }
      }

      // Buscar o tipo atualizado
      const tipos = await executeQuery(
        'SELECT * FROM tipos_cardapio WHERE id = ?',
        [id]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'editar', 'tipos_cardapio', {
          resourceId: id,
          nome,
          codigo,
          descricao,
          status,
          observacoes,
          filiais
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      res.json({
        success: true,
        message: 'Tipo de cardápio atualizado com sucesso',
        data: tipos[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir tipo de cardápio
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o tipo existe
      const existingTipos = await executeQuery(
        'SELECT id, nome FROM tipos_cardapio WHERE id = ?',
        [id]
      );

      if (existingTipos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de cardápio não encontrado'
        });
      }

      // Verificar se há unidades escolares vinculadas
      const unidadesVinculadas = await executeQuery(
        'SELECT COUNT(*) as total FROM unidades_escolares_tipos_cardapio WHERE tipo_cardapio_id = ?',
        [id]
      );

      if (unidadesVinculadas[0].total > 0) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível excluir este tipo de cardápio pois existem unidades escolares vinculadas a ele'
        });
      }

      // Excluir o tipo (as filiais serão excluídas automaticamente por CASCADE)
      await executeQuery('DELETE FROM tipos_cardapio WHERE id = ?', [id]);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'excluir', 'tipos_cardapio', {
          resourceId: id,
          nome: existingTipos[0].nome
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      res.json({
        success: true,
        message: 'Tipo de cardápio excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir tipo de cardápio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = TiposCardapioCRUDController;
