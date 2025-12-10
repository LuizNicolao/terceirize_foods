const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const axios = require('axios');

/**
 * Controller CRUD para Períodos de Atendimento
 * Segue padrão de excelência do sistema
 */
class PeriodosAtendimentoCRUDController {
  /**
   * Criar novo período de atendimento
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        codigo,
        status = 'ativo'
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Verificar se código já existe
      const codigoExiste = await executeQuery(
        'SELECT id FROM periodos_atendimento WHERE codigo = ?',
        [codigo]
      );

      if (codigoExiste.length > 0) {
        return errorResponse(res, 'Código já existe', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se nome já existe
      const nomeExiste = await executeQuery(
        'SELECT id FROM periodos_atendimento WHERE nome = ?',
        [nome]
      );

      if (nomeExiste.length > 0) {
        return errorResponse(res, 'Nome já existe', STATUS_CODES.BAD_REQUEST);
      }

      // Inserir período de atendimento
      const result = await executeQuery(
        `INSERT INTO periodos_atendimento (
          nome, codigo, status, usuario_criador_id, usuario_atualizador_id
        ) VALUES (?, ?, ?, ?, ?)`,
        [nome, codigo, status, usuarioId, usuarioId]
      );

      const periodoId = result.insertId;

      // Buscar período criado
      const periodoCriado = await PeriodosAtendimentoCRUDController.buscarPeriodoCompleto(periodoId);

      return successResponse(
        res,
        periodoCriado,
        'Período de atendimento criado com sucesso',
        STATUS_CODES.CREATED
      );

    } catch (error) {
      console.error('Erro ao criar período de atendimento:', error);
      return errorResponse(res, 'Erro ao criar período de atendimento', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar período de atendimento por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const periodo = await PeriodosAtendimentoCRUDController.buscarPeriodoCompleto(id);

      if (!periodo) {
        return notFoundResponse(res, 'Período de atendimento não encontrado');
      }

      return successResponse(res, periodo, 'Período de atendimento encontrado com sucesso', STATUS_CODES.OK);

    } catch (error) {
      console.error('Erro ao buscar período de atendimento:', error);
      return errorResponse(res, 'Erro ao buscar período de atendimento', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar período de atendimento
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        codigo,
        status
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Verificar se o período existe
      const periodoExiste = await executeQuery(
        'SELECT id FROM periodos_atendimento WHERE id = ?',
        [id]
      );

      if (periodoExiste.length === 0) {
        return notFoundResponse(res, 'Período de atendimento não encontrado');
      }

      // Verificar se código já existe (se foi alterado)
      if (codigo) {
        const codigoExiste = await executeQuery(
          'SELECT id FROM periodos_atendimento WHERE codigo = ? AND id != ?',
          [codigo, id]
        );

        if (codigoExiste.length > 0) {
          return errorResponse(res, 'Código já existe', STATUS_CODES.BAD_REQUEST);
        }
      }

      // Verificar se nome já existe (se foi alterado)
      if (nome) {
        const nomeExiste = await executeQuery(
          'SELECT id FROM periodos_atendimento WHERE nome = ? AND id != ?',
          [nome, id]
        );

        if (nomeExiste.length > 0) {
          return errorResponse(res, 'Nome já existe', STATUS_CODES.BAD_REQUEST);
        }
      }

      // Atualizar período de atendimento
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
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('usuario_atualizador_id = ?');
        updateFields.push('atualizado_em = NOW()');
        updateValues.push(usuarioId);
        updateValues.push(id);

        await executeQuery(
          `UPDATE periodos_atendimento SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      // Buscar período atualizado
      const periodoAtualizado = await PeriodosAtendimentoCRUDController.buscarPeriodoCompleto(id);

      return successResponse(
        res,
        periodoAtualizado,
        'Período de atendimento atualizado com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao atualizar período de atendimento:', error);
      return errorResponse(res, 'Erro ao atualizar período de atendimento', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir período de atendimento
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o período existe
      const periodoExiste = await executeQuery(
        'SELECT id FROM periodos_atendimento WHERE id = ?',
        [id]
      );

      if (periodoExiste.length === 0) {
        return notFoundResponse(res, 'Período de atendimento não encontrado');
      }

      // Verificar se há unidades vinculadas
      const unidadesVinculadas = await executeQuery(
        'SELECT COUNT(*) as total FROM cozinha_industrial_periodos_atendimento WHERE periodo_atendimento_id = ?',
        [id]
      );

      if (unidadesVinculadas[0].total > 0) {
        return errorResponse(
          res,
          `Não é possível excluir o período pois existem ${unidadesVinculadas[0].total} unidade(s) vinculada(s)`,
          STATUS_CODES.BAD_REQUEST
        );
      }

      // Excluir período de atendimento
      await executeQuery('DELETE FROM periodos_atendimento WHERE id = ?', [id]);

      return successResponse(
        res,
        { id: parseInt(id) },
        'Período de atendimento excluído com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao excluir período de atendimento:', error);
      return errorResponse(res, 'Erro ao excluir período de atendimento', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Vincular unidades escolares a um período de atendimento
   */
  static async vincularUnidades(req, res) {
    try {
      const { id } = req.params;
      const { cozinha_industrial_ids } = req.body;

      const usuarioId = req.user?.id || null;

      // Verificar se o período existe
      const periodoExiste = await executeQuery(
        'SELECT id FROM periodos_atendimento WHERE id = ?',
        [id]
      );

      if (periodoExiste.length === 0) {
        return notFoundResponse(res, 'Período de atendimento não encontrado');
      }

      // Validar que cozinha_industrial_ids é um array
      if (!Array.isArray(cozinha_industrial_ids)) {
        return errorResponse(res, 'cozinha_industrial_ids deve ser um array', STATUS_CODES.BAD_REQUEST);
      }
      
      // Permitir array vazio para desativar todos os vínculos (soft delete)
      if (cozinha_industrial_ids.length === 0) {
        // Marcar todos os vínculos existentes como inativos (soft delete)
        await executeQuery(
          'UPDATE cozinha_industrial_periodos_atendimento SET status = ?, usuario_atualizador_id = ?, atualizado_em = CURRENT_TIMESTAMP WHERE periodo_atendimento_id = ?',
          ['inativo', usuarioId, id]
        );
        
        const periodoAtualizado = await PeriodosAtendimentoCRUDController.buscarPeriodoCompleto(id);
        periodoAtualizado.unidades_vinculadas = [];
        
        return successResponse(
          res,
          periodoAtualizado,
          'Todos os vínculos foram desativados com sucesso',
          STATUS_CODES.OK
        );
      }

      // Buscar unidades escolares do foods_db para validar
      const unidadesValidas = await PeriodosAtendimentoCRUDController.buscarUnidadesEscolaresDoFoods(
        cozinha_industrial_ids,
        req.headers.authorization
      );

      if (unidadesValidas.length === 0) {
        // Tentar buscar informações das unidades para dar uma mensagem mais detalhada
        const unidadesInfo = [];
        for (const unidadeId of cozinha_industrial_ids) {
          try {
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
            const response = await axios.get(`${foodsApiUrl}/api/unidades-escolares/${unidadeId}`, {
              headers: {
                'Authorization': req.headers.authorization || ''
              },
              timeout: 3000
            });
            
            if (response.data && response.data.success && response.data.data) {
              const unidade = response.data.data;
              unidadesInfo.push({
                id: unidadeId,
                nome: unidade.nome_escola || unidade.nome || `ID ${unidadeId}`,
                filial_nome: unidade.filial_nome || 'Não informado',
                status: unidade.status || 'desconhecido'
              });
            }
          } catch (error) {
            unidadesInfo.push({
              id: unidadeId,
              nome: `ID ${unidadeId}`,
              filial_nome: error.response?.status === 404 ? 'Não encontrada' : 'Erro ao buscar',
              status: 'erro'
            });
          }
        }
        
        const mensagemDetalhada = unidadesInfo.length > 0
          ? `Nenhuma unidade escolar válida encontrada. Unidades verificadas: ${unidadesInfo.map(u => `${u.nome} (Filial: ${u.filial_nome})`).join(', ')}. Verifique se as unidades pertencem à filial CD TOLEDO e estão ativas no sistema Foods.`
          : 'Nenhuma unidade escolar válida encontrada. Verifique se as unidades pertencem à filial CD TOLEDO e estão ativas no sistema Foods.';
        
        return errorResponse(res, mensagemDetalhada, STATUS_CODES.BAD_REQUEST);
      }
      
      // Se algumas unidades foram encontradas mas não todas, avisar
      if (unidadesValidas.length < cozinha_industrial_ids.length) {
        const unidadesNaoEncontradas = cozinha_industrial_ids.filter(id => !unidadesValidas.includes(id));
        console.warn(`Algumas unidades não foram encontradas ou não pertencem à filial CD TOLEDO: ${unidadesNaoEncontradas.join(', ')}`);
      }

      // Buscar nomes das unidades do Foods API antes de inserir/atualizar
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      const authToken = req.headers.authorization;
      
      let todasUnidadesFoods = [];
      try {
        const response = await axios.get(`${foodsApiUrl}/unidades-escolares`, {
          params: {
            status: 'ativo',
            limit: 10000
          },
          headers: {
            'Authorization': authToken || ''
          },
          timeout: 5000
        });

        if (response.data) {
          if (response.data.success) {
            todasUnidadesFoods = response.data.data?.items || response.data.data || [];
          } else if (Array.isArray(response.data)) {
            todasUnidadesFoods = response.data;
          } else if (Array.isArray(response.data.data)) {
            todasUnidadesFoods = response.data.data;
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar unidades do Foods para obter nomes:', error.message);
      }

      // Criar mapa de unidades por ID
      const unidadesMap = new Map();
      if (Array.isArray(todasUnidadesFoods)) {
        todasUnidadesFoods.forEach(u => {
          unidadesMap.set(u.id, u);
        });
      }

      // Primeiro, marcar todos os vínculos existentes deste período como inativos
      await executeQuery(
        'UPDATE cozinha_industrial_periodos_atendimento SET status = ?, usuario_atualizador_id = ?, atualizado_em = CURRENT_TIMESTAMP WHERE periodo_atendimento_id = ?',
        ['inativo', usuarioId, id]
      );

      // Depois, inserir/atualizar vínculos selecionados como ativos
      // Usar INSERT ... ON DUPLICATE KEY UPDATE para atualizar vínculos existentes
      if (unidadesValidas.length > 0) {
        const vinculosQueries = unidadesValidas.map(unidadeId => {
          const unidadeFoods = unidadesMap.get(parseInt(unidadeId));
          const unidadeNome = unidadeFoods?.nome_escola || unidadeFoods?.nome || null;
          
          return {
            sql: `INSERT INTO cozinha_industrial_periodos_atendimento 
              (cozinha_industrial_id, unidade_nome, periodo_atendimento_id, status, usuario_criador_id, usuario_atualizador_id) 
              VALUES (?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                status = 'ativo',
                unidade_nome = VALUES(unidade_nome),
                usuario_atualizador_id = VALUES(usuario_atualizador_id),
                atualizado_em = CURRENT_TIMESTAMP`,
            params: [parseInt(unidadeId), unidadeNome, parseInt(id), 'ativo', usuarioId, usuarioId]
          };
        });
        
        await executeTransaction(vinculosQueries);
      }

      // Buscar período atualizado com unidades vinculadas
      const periodoAtualizado = await PeriodosAtendimentoCRUDController.buscarPeriodoCompleto(id);
      const unidadesVinculadas = await executeQuery(
        `SELECT 
          cipa.id,
          cipa.cozinha_industrial_id,
          cipa.unidade_nome,
          cipa.status,
          cipa.criado_em
        FROM cozinha_industrial_periodos_atendimento cipa
        WHERE cipa.periodo_atendimento_id = ?`,
        [id]
      );

      // Formatar unidades vinculadas com informações completas
      const unidadesComNomes = unidadesVinculadas.map(vinculo => ({
        ...vinculo,
        unidade_escolar: {
          id: vinculo.cozinha_industrial_id,
          nome_escola: vinculo.unidade_nome || `ID ${vinculo.cozinha_industrial_id}`,
          codigo_teknisa: null,
          cidade: null,
          filial_nome: null
        }
      }));

      periodoAtualizado.unidades_vinculadas = unidadesComNomes;

      return successResponse(
        res,
        periodoAtualizado,
        'Unidades vinculadas com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao vincular unidades:', error);
      return errorResponse(res, 'Erro ao vincular unidades', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Desvincular unidade de um período de atendimento
   */
  static async desvincularUnidade(req, res) {
    try {
      const { id, unidadeId } = req.params;

      // Verificar se o vínculo existe
      const vinculoExiste = await executeQuery(
        'SELECT id FROM cozinha_industrial_periodos_atendimento WHERE periodo_atendimento_id = ? AND cozinha_industrial_id = ?',
        [id, unidadeId]
      );

      if (vinculoExiste.length === 0) {
        return notFoundResponse(res, 'Vínculo não encontrado');
      }

      // Remover vínculo
      await executeQuery(
        'DELETE FROM cozinha_industrial_periodos_atendimento WHERE periodo_atendimento_id = ? AND cozinha_industrial_id = ?',
        [id, unidadeId]
      );

      return successResponse(
        res,
        { periodo_id: parseInt(id), unidade_id: parseInt(unidadeId) },
        'Unidade desvinculada com sucesso',
        STATUS_CODES.OK
      );

    } catch (error) {
      console.error('Erro ao desvincular unidade:', error);
      return errorResponse(res, 'Erro ao desvincular unidade', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar período completo por ID
   */
  static async buscarPeriodoCompleto(id) {
    const periodos = await executeQuery(
      `SELECT 
        id,
        nome,
        codigo,
        status,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM periodos_atendimento
      WHERE id = ?`,
      [id]
    );

    if (periodos.length === 0) {
      return null;
    }

    return periodos[0];
  }

  /**
   * Buscar unidades escolares do foods_db e filtrar por CD TOLEDO
   * Usa a mesma abordagem do sistema de implantação: busca todas as unidades de uma vez
   */
  static async buscarUnidadesEscolaresDoFoods(unidadeIds, authToken) {
    try {
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      
      // Buscar todas as unidades ativas de uma vez (como no sistema de implantação)
      // Isso evita problemas de permissão que podem ocorrer ao buscar por ID individual
      let todasUnidades = [];
      let page = 1;
      let hasMore = true;
      const limit = 100;
      
      while (hasMore && page <= 50) {
        try {
          // Usar o mesmo padrão do sistema de implantação: /unidades-escolares (sem /api/)
          const response = await axios.get(`${foodsApiUrl}/unidades-escolares`, {
            params: {
              status: 'ativo',
              page,
              limit
            },
            headers: {
              'Authorization': authToken || ''
            },
            timeout: 5000
          });

          if (response.data) {
            // Lidar com diferentes formatos de resposta
            let unidades = [];
            if (response.data.success) {
              unidades = response.data.data?.items || response.data.data || [];
            } else if (Array.isArray(response.data)) {
              unidades = response.data;
            } else if (Array.isArray(response.data.data)) {
              unidades = response.data.data;
            }
            
            if (Array.isArray(unidades) && unidades.length > 0) {
              todasUnidades = todasUnidades.concat(unidades);
              hasMore = unidades.length === limit;
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error('Erro ao buscar unidades escolares do foods:', error.message);
          hasMore = false;
        }
      }

      // Criar um mapa de unidades por ID para busca rápida
      const unidadesMap = new Map();
      todasUnidades.forEach(unidade => {
        unidadesMap.set(unidade.id, unidade);
      });

      // Validar as unidades solicitadas
      const unidadesValidas = [];
      const unidadesInvalidas = [];
      
      for (const unidadeId of unidadeIds) {
        const unidade = unidadesMap.get(parseInt(unidadeId));
        
        if (!unidade) {
          unidadesInvalidas.push({
            id: unidadeId,
            nome: `ID ${unidadeId}`,
            filial_nome: null,
            motivo: 'Unidade não encontrada no sistema Foods ou não está ativa'
          });
          continue;
        }
        
        // Filtrar apenas unidades da filial CD TOLEDO
        if (unidade.filial_nome) {
          const filialNome = unidade.filial_nome.toLowerCase().trim();
          if (filialNome.includes('cd toledo') || 
              filialNome === 'toledo' ||
              filialNome.includes('toledo')) {
            unidadesValidas.push(parseInt(unidadeId));
          } else {
            // Unidade encontrada mas não pertence à filial CD TOLEDO
            unidadesInvalidas.push({
              id: unidadeId,
              nome: unidade.nome_escola || unidade.nome || `ID ${unidadeId}`,
              filial_nome: unidade.filial_nome,
              motivo: `Pertence à filial "${unidade.filial_nome}" e não à CD TOLEDO`
            });
            console.warn(`Unidade ${unidadeId} (${unidade.nome_escola || unidade.nome}) pertence à filial "${unidade.filial_nome}" e não à CD TOLEDO`);
          }
        } else {
          // Unidade encontrada mas não tem informação de filial
          unidadesInvalidas.push({
            id: unidadeId,
            nome: unidade.nome_escola || unidade.nome || `ID ${unidadeId}`,
            filial_nome: null,
            motivo: 'Não possui informação de filial'
          });
          console.warn(`Unidade ${unidadeId} (${unidade.nome_escola || unidade.nome}) não possui informação de filial`);
        }
      }

      // Log detalhado para debug
      if (unidadesInvalidas.length > 0) {
        console.log('Unidades inválidas encontradas:', unidadesInvalidas);
      }

      return unidadesValidas;
    } catch (error) {
      console.error('Erro ao buscar unidades escolares do foods:', error);
      return [];
    }
  }
}

module.exports = PeriodosAtendimentoCRUDController;

