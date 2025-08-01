const { executeQuery } = require('../config/database');

class RotasController {
  // Listar rotas com paginação, busca e filtros
  async listarRotas(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status,
        tipo_rota,
        filial_id
      } = req.query;

      const offset = (page - 1) * limit;
      let whereConditions = ['1=1'];
      let params = [];

      // Filtro de busca
      if (search) {
        whereConditions.push('(r.codigo LIKE ? OR r.nome LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
      }

      // Filtro por status
      if (status !== undefined && status !== '') {
        whereConditions.push('r.status = ?');
        params.push(status);
      }

      // Filtro por tipo de rota
      if (tipo_rota) {
        whereConditions.push('r.tipo_rota = ?');
        params.push(tipo_rota);
      }

      // Filtro por filial
      if (filial_id) {
        whereConditions.push('r.filial_id = ?');
        params.push(filial_id);
      }

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
      `;
      const countResult = await executeQuery(countQuery, params);
      const total = countResult[0].total;

      // Query principal
      const query = `
        SELECT 
          r.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY r.codigo ASC
        LIMIT ? OFFSET ?
      `;

      const rotas = await executeQuery(query, [...params, Number(limit), Number(offset)]);

      // Calcular metadados de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: rotas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          search: search || null,
          status: status !== undefined && status !== '' ? status : null,
          tipo_rota: tipo_rota || null,
          filial_id: filial_id || null
        }
      });

    } catch (error) {
      console.error('Erro ao listar rotas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar as rotas'
      });
    }
  }

  // Buscar rota por ID
  async buscarRotaPorId(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          r.*,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.id = ?
      `;

      const rotas = await executeQuery(query, [id]);

      if (rotas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada no sistema'
        });
      }

      res.json({
        success: true,
        data: rotas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar a rota'
      });
    }
  }

  // Criar rota
  async criarRota(req, res) {
    try {
      const {
        filial_id,
        codigo,
        nome,
        distancia_km = 0.00,
        status = 'ativo',
        tipo_rota = 'semanal',
        custo_diario = 0.00,
        observacoes
      } = req.body;

      // Validações específicas
      if (!codigo || codigo.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Código inválido',
          message: 'O código deve ter pelo menos 3 caracteres'
        });
      }

      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se código já existe na filial
      const existingCodigo = await executeQuery(
        'SELECT id FROM rotas WHERE codigo = ? AND filial_id = ?',
        [codigo.trim(), filial_id]
      );

      if (existingCodigo.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Código já cadastrado',
          message: 'Já existe uma rota com este código nesta filial'
        });
      }

      // Verificar se a filial existe
      const filial = await executeQuery(
        'SELECT id FROM filiais WHERE id = ?',
        [filial_id]
      );

      if (filial.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Filial não encontrada',
          message: 'A filial especificada não foi encontrada'
        });
      }

      // Inserir rota
      const insertQuery = `
        INSERT INTO rotas (
          filial_id, codigo, nome, distancia_km, status, 
          tipo_rota, custo_diario, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(insertQuery, [
        filial_id,
        codigo.trim(),
        nome.trim(),
        distancia_km,
        status,
        tipo_rota,
        custo_diario,
        observacoes ? observacoes.trim() : null
      ]);

      // Buscar rota criada
      const newRota = await executeQuery(
        'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Rota criada com sucesso',
        data: newRota[0]
      });

    } catch (error) {
      console.error('Erro ao criar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível criar a rota'
      });
    }
  }

  // Atualizar rota
  async atualizarRota(req, res) {
    try {
      const { id } = req.params;
      const {
        filial_id,
        codigo,
        nome,
        distancia_km,
        status,
        tipo_rota,
        custo_diario,
        observacoes
      } = req.body;

      // Verificar se a rota existe
      const existingRota = await executeQuery(
        'SELECT * FROM rotas WHERE id = ?',
        [id]
      );

      if (existingRota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada'
        });
      }

      // Validações específicas
      if (codigo && codigo.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Código inválido',
          message: 'O código deve ter pelo menos 3 caracteres'
        });
      }

      if (nome && nome.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Nome inválido',
          message: 'O nome deve ter pelo menos 3 caracteres'
        });
      }

      // Verificar se código já existe em outra rota da mesma filial
      if (codigo) {
        const codigoCheck = await executeQuery(
          'SELECT id FROM rotas WHERE codigo = ? AND filial_id = ? AND id != ?',
          [codigo.trim(), filial_id || existingRota[0].filial_id, id]
        );

        if (codigoCheck.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código já cadastrado',
            message: 'Já existe outra rota com este código nesta filial'
          });
        }
      }

      // Verificar se a filial existe (se fornecida)
      if (filial_id) {
        const filial = await executeQuery(
          'SELECT id FROM filiais WHERE id = ?',
          [filial_id]
        );

        if (filial.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Filial não encontrada',
            message: 'A filial especificada não foi encontrada'
          });
        }
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateParams = [];

      if (filial_id !== undefined) {
        updateFields.push('filial_id = ?');
        updateParams.push(filial_id);
      }
      if (codigo !== undefined) {
        updateFields.push('codigo = ?');
        updateParams.push(codigo.trim());
      }
      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateParams.push(nome.trim());
      }
      if (distancia_km !== undefined) {
        updateFields.push('distancia_km = ?');
        updateParams.push(distancia_km);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }
      if (tipo_rota !== undefined) {
        updateFields.push('tipo_rota = ?');
        updateParams.push(tipo_rota);
      }
      if (custo_diario !== undefined) {
        updateFields.push('custo_diario = ?');
        updateParams.push(custo_diario);
      }
      if (observacoes !== undefined) {
        updateFields.push('observacoes = ?');
        updateParams.push(observacoes ? observacoes.trim() : null);
      }

      // Sempre atualizar o timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
          message: 'Nenhum campo foi fornecido para atualização'
        });
      }

      updateParams.push(id);
      await executeQuery(
        `UPDATE rotas SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      // Buscar rota atualizada
      const updatedRota = await executeQuery(
        'SELECT r.*, f.filial as filial_nome FROM rotas r LEFT JOIN filiais f ON r.filial_id = f.id WHERE r.id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Rota atualizada com sucesso',
        data: updatedRota[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível atualizar a rota'
      });
    }
  }

  // Excluir rota
  async excluirRota(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a rota existe
      const rota = await executeQuery(
        'SELECT * FROM rotas WHERE id = ?',
        [id]
      );

      if (rota.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Rota não encontrada',
          message: 'A rota especificada não foi encontrada'
        });
      }

      // Verificar se há unidades escolares vinculadas
      const unidadesVinculadas = await executeQuery(
        'SELECT COUNT(*) as total FROM unidades_escolares WHERE rota_id = ?',
        [id]
      );

      if (unidadesVinculadas[0].total > 0) {
        return res.status(400).json({
          success: false,
          error: 'Rota em uso',
          message: 'Não é possível excluir a rota pois existem unidades escolares vinculadas a ela'
        });
      }

      // Excluir rota
      await executeQuery('DELETE FROM rotas WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Rota excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao excluir rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível excluir a rota'
      });
    }
  }

  // Buscar rotas ativas
  async buscarRotasAtivas(req, res) {
    try {
      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query);

      res.json({
        success: true,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao buscar rotas ativas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas ativas'
      });
    }
  }

  // Buscar rotas por filial
  async buscarRotasPorFilial(req, res) {
    try {
      const { filialId } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.filial_id = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [filialId]);

      res.json({
        success: true,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por filial:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por filial'
      });
    }
  }

  // Buscar rotas por tipo
  async buscarRotasPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      const query = `
        SELECT 
          r.id, r.codigo, r.nome, r.distancia_km, r.tipo_rota, 
          r.custo_diario, r.filial_id,
          f.filial as filial_nome,
          (SELECT COUNT(*) FROM unidades_escolares ue WHERE ue.rota_id = r.id AND ue.status = 'ativo') as total_unidades
        FROM rotas r
        LEFT JOIN filiais f ON r.filial_id = f.id
        WHERE r.tipo_rota = ? AND r.status = 'ativo'
        ORDER BY r.codigo ASC
      `;

      const rotas = await executeQuery(query, [tipo]);

      res.json({
        success: true,
        data: rotas
      });

    } catch (error) {
      console.error('Erro ao buscar rotas por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as rotas por tipo'
      });
    }
  }

  // Listar tipos de rota
  async listarTiposRota(req, res) {
    try {
      const query = `
        SELECT DISTINCT tipo_rota 
        FROM rotas 
        WHERE tipo_rota IS NOT NULL AND tipo_rota != ''
        ORDER BY tipo_rota ASC
      `;

      const tipos = await executeQuery(query);

      res.json({
        success: true,
        data: tipos.map(item => item.tipo_rota)
      });

    } catch (error) {
      console.error('Erro ao listar tipos de rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível listar os tipos de rota'
      });
    }
  }

  // Buscar unidades escolares de uma rota
  async buscarUnidadesEscolaresRota(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ue.id, ue.codigo_teknisa, ue.nome_escola, ue.cidade, ue.estado,
          ue.endereco, ue.ordem_entrega, ue.status
        FROM unidades_escolares ue
        WHERE ue.rota_id = ? AND ue.status = 'ativo'
        ORDER BY ue.ordem_entrega ASC, ue.nome_escola ASC
      `;

      const unidades = await executeQuery(query, [id]);

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      console.error('Erro ao buscar unidades escolares da rota:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as unidades escolares da rota'
      });
    }
  }

  // Buscar estatísticas das rotas
  async buscarEstatisticasRotas(req, res) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_rotas,
          COUNT(CASE WHEN status = 'ativo' THEN 1 END) as rotas_ativas,
          COUNT(CASE WHEN status = 'inativo' THEN 1 END) as rotas_inativas,
          COUNT(CASE WHEN tipo_rota = 'semanal' THEN 1 END) as rotas_semanais,
          COUNT(CASE WHEN tipo_rota = 'quinzenal' THEN 1 END) as rotas_quinzenais,
          COUNT(CASE WHEN tipo_rota = 'mensal' THEN 1 END) as rotas_mensais,
          COUNT(CASE WHEN tipo_rota = 'transferencia' THEN 1 END) as rotas_transferencia,
          SUM(distancia_km) as distancia_total,
          SUM(custo_diario) as custo_total_diario
        FROM rotas
      `;

      const estatisticas = await executeQuery(query);

      res.json({
        success: true,
        data: estatisticas[0]
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas das rotas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: 'Não foi possível buscar as estatísticas das rotas'
      });
    }
  }
}

module.exports = new RotasController(); 