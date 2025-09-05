/**
 * Controller CRUD para Períodos de Refeição
 * Implementa as operações básicas de CRUD
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class PeriodosRefeicaoCRUDController {
  /**
   * Listar todos os períodos de refeição com paginação e filtros
   */
  static async listar(req, res) {
    try {
      const { search, status, filial_id } = req.query;
      const pagination = req.pagination;

      // Construir query base
      let query = `
        SELECT 
          pr.id,
          pr.nome,
          pr.codigo,
          pr.descricao,
          pr.status,
          pr.observacoes,
          pr.data_cadastro,
          pr.data_atualizacao,
          COUNT(prf.filial_id) as total_filiais
        FROM periodos_refeicao pr
        LEFT JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE 1=1`;

      const queryParams = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (pr.nome LIKE ? OR pr.codigo LIKE ? OR pr.descricao LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        query += ` AND pr.status = ?`;
        queryParams.push(status);
      }

      if (filial_id) {
        query += ` AND pr.id IN (SELECT periodo_refeicao_id FROM periodos_refeicao_filiais WHERE filial_id = ?)`;
        queryParams.push(filial_id);
      }

      // Agrupar por período
      query += ` GROUP BY pr.id`;

      // Ordenação
      query += ` ORDER BY pr.nome ASC`;

      // Aplicar paginação manualmente
      const limit = pagination.limit;
      const offset = pagination.offset;
      const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

      const periodos = await executeQuery(paginatedQuery, queryParams);

      // Buscar total de registros para paginação
      let countQuery = `
        SELECT COUNT(DISTINCT pr.id) as total
        FROM periodos_refeicao pr
        LEFT JOIN periodos_refeicao_filiais prf ON pr.id = prf.periodo_refeicao_id
        WHERE 1=1`;

      const countParams = [];

      if (search) {
        countQuery += ` AND (pr.nome LIKE ? OR pr.codigo LIKE ? OR pr.descricao LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        countQuery += ` AND pr.status = ?`;
        countParams.push(status);
      }

      if (filial_id) {
        countQuery += ` AND pr.id IN (SELECT periodo_refeicao_id FROM periodos_refeicao_filiais WHERE filial_id = ?)`;
        countParams.push(filial_id);
      }

      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = countResult[0].total;

      // Calcular informações de paginação
      const totalPages = Math.ceil(totalItems / pagination.limit);

      res.json({
        success: true,
        data: periodos,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalItems,
          itemsPerPage: pagination.limit
        }
      });
    } catch (error) {
      console.error('Erro ao listar períodos de refeição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar período de refeição por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      // Buscar período
      const periodos = await executeQuery(
        'SELECT * FROM periodos_refeicao WHERE id = ?',
        [id]
      );

      if (periodos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Período de refeição não encontrado'
        });
      }

      // Buscar filiais vinculadas
      const filiais = await executeQuery(
        `SELECT 
          f.id,
          f.filial,
          prf.data_vinculacao
        FROM periodos_refeicao_filiais prf
        JOIN filiais f ON prf.filial_id = f.id
        WHERE prf.periodo_refeicao_id = ?
        ORDER BY f.filial ASC`,
        [id]
      );

      res.json({
        success: true,
        data: {
          ...periodos[0],
          filiais
        }
      });
    } catch (error) {
      console.error('Erro ao buscar período de refeição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar novo período de refeição
   */
  static async criar(req, res) {
    try {
      const { nome, codigo, descricao, status, observacoes, filiais } = req.body;

      // Verificar se já existe período com o mesmo nome
      const existingPeriodo = await executeQuery(
        'SELECT id FROM periodos_refeicao WHERE nome = ?',
        [nome]
      );

      if (existingPeriodo.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um período de refeição com este nome'
        });
      }

      // Verificar se já existe período com o mesmo código
      if (codigo) {
        const existingCodigo = await executeQuery(
          'SELECT id FROM periodos_refeicao WHERE codigo = ?',
          [codigo]
        );

        if (existingCodigo.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Já existe um período de refeição com este código'
          });
        }
      }

      // Inserir período
      const insertResult = await executeQuery(
        `INSERT INTO periodos_refeicao (nome, codigo, descricao, status, observacoes)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, codigo, descricao, status, observacoes]
      );

      const periodoId = insertResult.insertId;

      // Vincular filiais se fornecidas
      if (filiais && filiais.length > 0) {
        for (const filialId of filiais) {
          await executeQuery(
            'INSERT INTO periodos_refeicao_filiais (periodo_refeicao_id, filial_id, data_vinculacao) VALUES (?, ?, NOW())',
            [periodoId, filialId]
          );
        }
      }

      // Buscar período criado
      const novoPeriodo = await executeQuery(
        'SELECT * FROM periodos_refeicao WHERE id = ?',
        [periodoId]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'criar', 'periodos_refeicao', {
          resourceId: periodoId,
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
        message: 'Período de refeição criado com sucesso',
        data: novoPeriodo[0]
      });
    } catch (error) {
      console.error('Erro ao criar período de refeição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar período de refeição existente
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, codigo, descricao, status, observacoes, filiais } = req.body;

      // Verificar se o período existe
      const existingPeriodo = await executeQuery(
        'SELECT id, nome FROM periodos_refeicao WHERE id = ?',
        [id]
      );

      if (existingPeriodo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Período de refeição não encontrado'
        });
      }

      // Verificar se já existe período com o mesmo nome (exceto o atual)
      const existingNome = await executeQuery(
        'SELECT id FROM periodos_refeicao WHERE nome = ? AND id != ?',
        [nome, id]
      );

      if (existingNome.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um período de refeição com este nome'
        });
      }

      // Verificar se já existe período com o mesmo código (exceto o atual)
      if (codigo) {
        const existingCodigo = await executeQuery(
          'SELECT id FROM periodos_refeicao WHERE codigo = ? AND id != ?',
          [codigo, id]
        );

        if (existingCodigo.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Já existe um período de refeição com este código'
          });
        }
      }

      // Construir query de atualização
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

      updateFields.push('data_atualizacao = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE periodos_refeicao SET ${updateFields.join(', ')} WHERE id = ?`;
      await executeQuery(updateQuery, updateValues);

      // Atualizar filiais se fornecidas
      if (filiais !== undefined) {
        // Buscar filiais atuais
        const filiaisAtuais = await executeQuery(
          'SELECT filial_id FROM periodos_refeicao_filiais WHERE periodo_refeicao_id = ?',
          [id]
        );
        const filiaisAtuaisIds = filiaisAtuais.map(f => f.filial_id);

        // Verificar se alguma filial está sendo removida
        const filiaisRemovidas = filiaisAtuaisIds.filter(filialId => !filiais.includes(filialId));

        if (filiaisRemovidas.length > 0) {
          // Verificar se há unidades escolares vinculadas nas filiais que serão removidas
          for (const filialId of filiaisRemovidas) {
            const unidadesVinculadas = await executeQuery(
              `SELECT COUNT(*) as total 
               FROM unidades_escolares_periodos_refeicao uepr
               INNER JOIN unidades_escolares ue ON uepr.unidade_escolar_id = ue.id
               WHERE uepr.periodo_refeicao_id = ? AND ue.filial_id = ?`,
              [id, filialId]
            );

            if (unidadesVinculadas[0].total > 0) {
              // Buscar nome da filial para a mensagem de erro
              const filialInfo = await executeQuery(
                'SELECT filial FROM filiais WHERE id = ?',
                [filialId]
              );
              const nomeFilial = filialInfo[0]?.filial || 'filial';

              return res.status(400).json({
                success: false,
                message: `Não é possível remover a filial "${nomeFilial}" pois existem unidades escolares vinculadas a este período de refeição nesta filial`
              });
            }
          }
        }

        // Remover vínculos existentes
        await executeQuery('DELETE FROM periodos_refeicao_filiais WHERE periodo_refeicao_id = ?', [id]);

        // Adicionar novos vínculos
        if (filiais.length > 0) {
          for (const filialId of filiais) {
            await executeQuery(
              'INSERT INTO periodos_refeicao_filiais (periodo_refeicao_id, filial_id, data_vinculacao) VALUES (?, ?, NOW())',
              [id, filialId]
            );
          }
        }
      }

      // Buscar período atualizado
      const periodoAtualizado = await executeQuery(
        'SELECT * FROM periodos_refeicao WHERE id = ?',
        [id]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'editar', 'periodos_refeicao', {
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
        message: 'Período de refeição atualizado com sucesso',
        data: periodoAtualizado[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar período de refeição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir período de refeição
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o período existe
      const existingPeriodo = await executeQuery(
        'SELECT id, nome FROM periodos_refeicao WHERE id = ?',
        [id]
      );

      if (existingPeriodo.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Período de refeição não encontrado'
        });
      }

      // Verificar se há unidades escolares vinculadas
      const unidadesVinculadas = await executeQuery(
        'SELECT COUNT(*) as total FROM unidades_escolares_periodos_refeicao WHERE periodo_refeicao_id = ?',
        [id]
      );

      if (unidadesVinculadas[0].total > 0) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível excluir este período de refeição pois existem unidades escolares vinculadas a ele'
        });
      }

      // Excluir o período (as filiais serão excluídas automaticamente por CASCADE)
      await executeQuery('DELETE FROM periodos_refeicao WHERE id = ?', [id]);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'excluir', 'periodos_refeicao', {
          resourceId: id,
          nome: existingPeriodo[0].nome
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
      }

      res.json({
        success: true,
        message: 'Período de refeição excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir período de refeição:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = PeriodosRefeicaoCRUDController;
