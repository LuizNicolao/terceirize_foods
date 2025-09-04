/**
 * Controller CRUD para Rotas Nutricionistas
 * Implementa as operações básicas de CRUD
 */

const { executeQuery } = require('../../config/database');
const { logAction } = require('../../utils/audit');

class RotasNutricionistasCRUDController {
  /**
   * Listar todas as rotas nutricionistas com paginação e filtros
   */
    static async listar(req, res) {
    try {
      const { search, status, usuario_id, supervisor_id, coordenador_id } = req.query;
      const pagination = req.pagination;

              // Construir query base
        let query = `
        SELECT 
          rn.id,
          rn.codigo,
          rn.usuario_id,
          rn.supervisor_id,
          rn.coordenador_id,
          rn.escolas_responsaveis,
          rn.status,
          rn.observacoes,
          rn.criado_em,
          rn.atualizado_em,
          u.nome as usuario_nome,
          u.email as usuario_email,
          s.nome as supervisor_nome,
          s.email as supervisor_email,
          c.nome as coordenador_nome,
          c.email as coordenador_email
        FROM rotas_nutricionistas rn
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN usuarios s ON rn.supervisor_id = s.id
        LEFT JOIN usuarios c ON rn.coordenador_id = c.id
        WHERE 1=1`;

      const queryParams = [];

      // Aplicar filtros
      if (search) {
        query += ` AND (rn.codigo LIKE ? OR rn.observacoes LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (status) {
        query += ` AND rn.status = ?`;
        queryParams.push(status);
      }

      if (usuario_id) {
        query += ` AND rn.usuario_id = ?`;
        queryParams.push(usuario_id);
      }

      if (supervisor_id) {
        query += ` AND rn.supervisor_id = ?`;
        queryParams.push(supervisor_id);
      }

      if (coordenador_id) {
        query += ` AND rn.coordenador_id = ?`;
        queryParams.push(coordenador_id);
      }

      // Query para contar total de registros
      // Query de contagem simplificada (seguindo o padrão das outras páginas)
      const countQuery = `SELECT COUNT(*) as total FROM rotas_nutricionistas rn WHERE 1=1${search ? ' AND (rn.codigo LIKE ? OR rn.observacoes LIKE ?)' : ''}${status ? ' AND rn.status = ?' : ''}${usuario_id ? ' AND rn.usuario_id = ?' : ''}${supervisor_id ? ' AND rn.supervisor_id = ?' : ''}${coordenador_id ? ' AND rn.coordenador_id = ?' : ''}`;
      const countParams = [];
      
      // Aplicar os mesmos filtros na query de contagem
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      if (status) {
        countParams.push(status);
      }
      
      if (usuario_id) {
        countParams.push(usuario_id);
      }
      
      if (supervisor_id) {
        countParams.push(supervisor_id);
      }
      
      if (coordenador_id) {
        countParams.push(coordenador_id);
      }
      
      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = parseInt(countResult[0]?.total) || 0;

              // Aplicar paginação e ordenação
        query += ` ORDER BY rn.criado_em DESC`;
        
                // Aplicar paginação manualmente (seguindo o padrão das outras páginas)
        const limit = pagination.limit;
        const offset = pagination.offset;
        const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;
        

        
              // Executar query principal
      const rotas = await executeQuery(paginatedQuery, queryParams);
      
      // Calcular informações de paginação usando o middleware
      const totalPages = Math.ceil(totalItems / pagination.limit);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'listar', 'rotas-nutricionistas', {
          search,
          status,
          usuario_id,
          supervisor_id,
          coordenador_id,
          page: pagination.page,
          limit: pagination.limit
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }


      
      const response = {
        success: true,
        data: {
          rotas,
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
      console.error('Erro ao listar rotas nutricionistas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar rota nutricionista por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          rn.id,
          rn.codigo,
          rn.usuario_id,
          rn.supervisor_id,
          rn.coordenador_id,
          rn.escolas_responsaveis,
          rn.status,
          rn.observacoes,
          rn.criado_em,
          rn.atualizado_em,
          u.nome as usuario_nome,
          u.email as usuario_email,
          s.nome as supervisor_nome,
          s.email as supervisor_email,
          c.nome as coordenador_nome,
          c.email as coordenador_email
        FROM rotas_nutricionistas rn
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN usuarios s ON rn.supervisor_id = s.id
        LEFT JOIN usuarios c ON rn.coordenador_id = c.id
        WHERE rn.id = ?
      `;

      const rotas = await executeQuery(query, [id]);

      if (rotas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rota nutricionista não encontrada'
        });
      }

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'visualizar', 'rotas-nutricionistas', { resourceId: id });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }

      res.json({
        success: true,
        data: rotas[0]
      });
    } catch (error) {
      console.error('Erro ao buscar rota nutricionista:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Criar nova rota nutricionista
   */
  static async criar(req, res) {
    try {
      const { codigo, usuario_id, supervisor_id, coordenador_id, escolas_responsaveis, status = 'ativo', observacoes } = req.body;

      // Verificar se o código já existe
      const existingRotas = await executeQuery(
        'SELECT id FROM rotas_nutricionistas WHERE codigo = ?',
        [codigo]
      );

      if (existingRotas.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Código já existe para outra rota nutricionista'
        });
      }

      // Inserir nova rota nutricionista
      const result = await executeQuery(
        'INSERT INTO rotas_nutricionistas (codigo, usuario_id, supervisor_id, coordenador_id, escolas_responsaveis, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [codigo, usuario_id, supervisor_id, coordenador_id, escolas_responsaveis, status, observacoes]
      );

      const novaRotaId = result.insertId;

      // Buscar a rota criada
      const rotas = await executeQuery(
        'SELECT * FROM rotas_nutricionistas WHERE id = ?',
        [novaRotaId]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'criar', 'rotas-nutricionistas', {
          resourceId: novaRotaId,
          codigo,
          usuario_id,
          supervisor_id,
          coordenador_id,
          escolas_responsaveis,
          status,
          observacoes
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }

      res.status(201).json({
        success: true,
        message: 'Rota nutricionista criada com sucesso',
        data: rotas[0]
      });
    } catch (error) {
      console.error('Erro ao criar rota nutricionista:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar rota nutricionista existente
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { codigo, usuario_id, supervisor_id, coordenador_id, escolas_responsaveis, status, observacoes } = req.body;

      // Verificar se a rota existe
      const existingRotas = await executeQuery(
        'SELECT id FROM rotas_nutricionistas WHERE id = ?',
        [id]
      );

      if (existingRotas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rota nutricionista não encontrada'
        });
      }

      // Verificar se o código já existe para outra rota
      if (codigo) {
        const duplicateRotas = await executeQuery(
          'SELECT id FROM rotas_nutricionistas WHERE codigo = ? AND id != ?',
          [codigo, id]
        );

        if (duplicateRotas.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Código já existe para outra rota nutricionista'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];

      if (codigo !== undefined) {
        updateFields.push('codigo = ?');
        updateValues.push(codigo);
      }

      if (usuario_id !== undefined) {
        updateFields.push('usuario_id = ?');
        updateValues.push(usuario_id);
      }

      if (supervisor_id !== undefined) {
        updateFields.push('supervisor_id = ?');
        updateValues.push(supervisor_id);
      }

      if (coordenador_id !== undefined) {
        updateFields.push('coordenador_id = ?');
        updateValues.push(coordenador_id);
      }

      if (escolas_responsaveis !== undefined) {
        updateFields.push('escolas_responsaveis = ?');
        updateValues.push(escolas_responsaveis);
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

      updateFields.push('atualizado_em = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE rotas_nutricionistas SET ${updateFields.join(', ')} WHERE id = ?`;
      await executeQuery(updateQuery, updateValues);

      // Buscar a rota atualizada
      const rotas = await executeQuery(
        'SELECT * FROM rotas_nutricionistas WHERE id = ?',
        [id]
      );

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'editar', 'rotas-nutricionistas', {
          resourceId: id,
          codigo,
          usuario_id,
          supervisor_id,
          coordenador_id,
          escolas_responsaveis,
          status,
          observacoes
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }

      res.json({
        success: true,
        message: 'Rota nutricionista atualizada com sucesso',
        data: rotas[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar rota nutricionista:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar rotas nutricionistas ativas
   */
  static async buscarRotasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          rn.id,
          rn.codigo,
          rn.usuario_id,
          rn.supervisor_id,
          rn.coordenador_id,
          rn.escolas_responsaveis,
          rn.status,
          rn.observacoes,
          u.nome as usuario_nome,
          u.email as usuario_email,
          s.nome as supervisor_nome,
          s.email as supervisor_email,
          c.nome as coordenador_nome,
          c.email as coordenador_email
        FROM rotas_nutricionistas rn
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        LEFT JOIN usuarios s ON rn.supervisor_id = s.id
        LEFT JOIN usuarios c ON rn.coordenador_id = c.id
        WHERE rn.status = 'ativo'
        ORDER BY rn.codigo ASC
      `;

      const rotas = await executeQuery(query);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'visualizar', 'rotas-nutricionistas', { action: 'buscar_ativas' });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }

      res.json({
        success: true,
        data: rotas
      });
    } catch (error) {
      console.error('Erro ao buscar rotas nutricionistas ativas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Excluir rota nutricionista
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a rota existe
      const existingRotas = await executeQuery(
        'SELECT id, codigo FROM rotas_nutricionistas WHERE id = ?',
        [id]
      );

      if (existingRotas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rota nutricionista não encontrada'
        });
      }

      // Excluir a rota
      await executeQuery('DELETE FROM rotas_nutricionistas WHERE id = ?', [id]);

      // Criar log de auditoria
      try {
        await logAction(req.user.id, 'excluir', 'rotas-nutricionistas', {
          resourceId: id,
          codigo: existingRotas[0].codigo
        });
      } catch (auditError) {
        console.error('Erro ao criar log de auditoria:', auditError);
        // Não falhar a operação principal se a auditoria falhar
      }

      res.json({
        success: true,
        message: 'Rota nutricionista excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir rota nutricionista:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = RotasNutricionistasCRUDController;
