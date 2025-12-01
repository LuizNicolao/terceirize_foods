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
      const { search, status, usuario_id, supervisor_id, coordenador_id, email, filial_id } = req.query;
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

      if (email) {
        query += ` AND u.email = ?`;
        queryParams.push(email);
      }

      if (filial_id) {
        query += ` AND rn.usuario_id IN (
          SELECT uf.usuario_id 
          FROM usuarios_filiais uf 
          WHERE uf.filial_id = ?
        )`;
        queryParams.push(filial_id);
      }

      // Aplicar ordenação
      const { sortField, sortDirection } = req.query;
      let orderBy = 'rn.criado_em DESC';
      if (sortField && sortDirection) {
        const validFields = ['codigo', 'usuario_nome', 'supervisor_nome', 'coordenador_nome', 'status', 'criado_em', 'atualizado_em'];
        if (validFields.includes(sortField)) {
          const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
          
          // Mapear campos para colunas do banco
          const fieldMap = {
            'codigo': 'rn.codigo',
            'usuario_nome': 'u.nome',
            'supervisor_nome': 's.nome',
            'coordenador_nome': 'c.nome',
            'status': 'rn.status',
            'criado_em': 'rn.criado_em',
            'atualizado_em': 'rn.atualizado_em'
          };
          
          orderBy = `${fieldMap[sortField]} ${direction}`;
        }
      }

      // Query para contar total de registros
      // Query de contagem simplificada (seguindo o padrão das outras páginas)
      let countQuery = `SELECT COUNT(*) as total FROM rotas_nutricionistas rn LEFT JOIN usuarios u ON rn.usuario_id = u.id WHERE 1=1`;
      if (search) countQuery += ` AND (rn.codigo LIKE ? OR rn.observacoes LIKE ?)`;
      if (status) countQuery += ` AND rn.status = ?`;
      if (usuario_id) countQuery += ` AND rn.usuario_id = ?`;
      if (supervisor_id) countQuery += ` AND rn.supervisor_id = ?`;
      if (coordenador_id) countQuery += ` AND rn.coordenador_id = ?`;
      if (email) countQuery += ` AND u.email = ?`;
      if (filial_id) countQuery += ` AND rn.usuario_id IN (SELECT uf.usuario_id FROM usuarios_filiais uf WHERE uf.filial_id = ?)`;
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

      if (email) {
        countParams.push(email);
      }

      if (filial_id) {
        countParams.push(filial_id);
      }
      
      const countResult = await executeQuery(countQuery, countParams);
      const totalItems = parseInt(countResult[0]?.total) || 0;

      // Calcular estatísticas (ativos/inativos) com os mesmos filtros
      let statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN rn.status = 'ativo' THEN 1 END) as rotas_ativas,
          COUNT(CASE WHEN rn.status = 'inativo' THEN 1 END) as rotas_inativas
        FROM rotas_nutricionistas rn
        LEFT JOIN usuarios u ON rn.usuario_id = u.id
        WHERE 1=1
      `;
      
      // Aplicar os mesmos filtros na query de estatísticas
      if (search) {
        statsQuery += ` AND (rn.codigo LIKE ? OR rn.observacoes LIKE ?)`;
      }
      if (status) {
        statsQuery += ` AND rn.status = ?`;
      }
      if (usuario_id) {
        statsQuery += ` AND rn.usuario_id = ?`;
      }
      if (supervisor_id) {
        statsQuery += ` AND rn.supervisor_id = ?`;
      }
      if (coordenador_id) {
        statsQuery += ` AND rn.coordenador_id = ?`;
      }
      if (email) {
        statsQuery += ` AND u.email = ?`;
      }
      if (filial_id) {
        statsQuery += ` AND rn.usuario_id IN (SELECT uf.usuario_id FROM usuarios_filiais uf WHERE uf.filial_id = ?)`;
      }
      
      const statsResult = await executeQuery(statsQuery, countParams);
      const statistics = statsResult[0] || {
        total: totalItems,
        rotas_ativas: 0,
        rotas_inativas: 0
      };

      // Aplicar ordenação
      query += ` ORDER BY ${orderBy}`;
        
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
          rotas: rotas,
          pagination: {
            currentPage: pagination.page,
            totalPages,
            totalItems,
            itemsPerPage: pagination.limit
          },
          statistics: {
            total: parseInt(statistics.total) || 0,
            rotas_ativas: parseInt(statistics.rotas_ativas) || 0,
            rotas_inativas: parseInt(statistics.rotas_inativas) || 0
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

      // Vincular unidades escolares à rota nutricionista usando a nova tabela normalizada
      if (escolas_responsaveis) {
        // Aceitar tanto array quanto string separada por vírgula
        let escolasIds = [];
        if (Array.isArray(escolas_responsaveis)) {
          escolasIds = escolas_responsaveis.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
        } else if (typeof escolas_responsaveis === 'string' && escolas_responsaveis.trim()) {
          escolasIds = escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
        }
        
        // Inserir relacionamentos na nova tabela
        for (const escolaId of escolasIds) {
            // Verificar se a unidade escolar existe
            const unidadeExistente = await executeQuery(
            'SELECT id FROM unidades_escolares WHERE id = ?',
              [escolaId]
            );

            if (unidadeExistente.length > 0) {
            // Inserir na tabela normalizada
            try {
              await executeQuery(
                'INSERT INTO rotas_nutricionistas_escolas (rota_nutricionista_id, unidade_escolar_id) VALUES (?, ?)',
                [novaRotaId, escolaId]
              );
            } catch (error) {
              // Ignorar erro de duplicata (já existe o relacionamento)
              if (error.code !== 'ER_DUP_ENTRY') {
                throw error;
              }
            }
          }
        }
      }

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

      // Atualizar vínculos das unidades escolares se escolas_responsaveis foi alterado
      // Usar a nova tabela normalizada
      if (escolas_responsaveis !== undefined) {
        // Primeiro, remover vínculos antigos desta rota nutricionista da tabela normalizada
        await executeQuery(
          'DELETE FROM rotas_nutricionistas_escolas WHERE rota_nutricionista_id = ?',
          [id]
        );

        // Depois, adicionar novos vínculos na tabela normalizada
        if (escolas_responsaveis) {
          // Aceitar tanto array quanto string separada por vírgula
          let escolasIds = [];
          if (Array.isArray(escolas_responsaveis)) {
            escolasIds = escolas_responsaveis.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
          } else if (typeof escolas_responsaveis === 'string' && escolas_responsaveis.trim()) {
            escolasIds = escolas_responsaveis.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
          }
          
          for (const escolaId of escolasIds) {
              // Verificar se a unidade escolar existe
              const unidadeExistente = await executeQuery(
                'SELECT id FROM unidades_escolares WHERE id = ?',
                [escolaId]
              );

              if (unidadeExistente.length > 0) {
              // Inserir na tabela normalizada
              try {
                await executeQuery(
                  'INSERT INTO rotas_nutricionistas_escolas (rota_nutricionista_id, unidade_escolar_id) VALUES (?, ?)',
                  [id, escolaId]
                );
              } catch (error) {
                // Ignorar erro de duplicata (já existe o relacionamento)
                if (error.code !== 'ER_DUP_ENTRY') {
                  throw error;
                }
              }
            }
          }
        }
      }

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

  /**
   * Buscar escolas disponíveis para rotas nutricionistas
   * Exclui escolas já vinculadas a outras rotas nutricionistas (exceto a rota atual se estiver editando)
   */
  static async buscarEscolasDisponiveis(req, res) {
    try {
      const { filialId } = req.params;
      const { rotaId } = req.query;

      if (!filialId) {
        return res.status(400).json({
          success: false,
          error: 'Filial é obrigatória',
          message: 'ID da filial é obrigatório'
        });
      }

      // Buscar todas as escolas vinculadas a outras rotas nutricionistas
      // Usa a nova tabela rotas_nutricionistas_escolas (normalizada)
      let escolasVinculadasQuery = `
        SELECT DISTINCT rne.unidade_escolar_id as escola_id
        FROM rotas_nutricionistas_escolas rne
        INNER JOIN rotas_nutricionistas rn ON rne.rota_nutricionista_id = rn.id
        WHERE rn.status = 'ativo'
      `;

      const escolasVinculadasParams = [];

      // Se estiver editando, excluir a rota atual da lista de escolas vinculadas
      if (rotaId) {
        escolasVinculadasQuery += ` AND rn.id != ?`;
        escolasVinculadasParams.push(rotaId);
      }

      const escolasVinculadas = await executeQuery(escolasVinculadasQuery, escolasVinculadasParams);
      const escolasVinculadasIds = escolasVinculadas
        .map(e => e.escola_id)
        .filter(id => id && !isNaN(id) && id > 0);

      // Query para buscar escolas disponíveis da filial
      let query = `
        SELECT 
          ue.id,
          ue.codigo_teknisa,
          ue.nome_escola,
          ue.cidade,
          ue.estado,
          ue.endereco,
          ue.numero,
          ue.bairro,
          ue.centro_distribuicao,
          ue.status
        FROM unidades_escolares ue
        WHERE ue.filial_id = ? 
          AND ue.status = 'ativo'
      `;

      const params = [filialId];

      // Excluir escolas já vinculadas a outras rotas nutricionistas
      if (escolasVinculadasIds.length > 0) {
        const placeholders = escolasVinculadasIds.map(() => '?').join(',');
        query += ` AND ue.id NOT IN (${placeholders})`;
        params.push(...escolasVinculadasIds);
      }

      query += ` ORDER BY ue.nome_escola ASC`;

      const escolas = await executeQuery(query, params);

      res.json({
        success: true,
        data: escolas
      });

    } catch (error) {
      console.error('Erro ao buscar escolas disponíveis para rota nutricionista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as escolas disponíveis'
      });
    }
  }
}

module.exports = RotasNutricionistasCRUDController;
