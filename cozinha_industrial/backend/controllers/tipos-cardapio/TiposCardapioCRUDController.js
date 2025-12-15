const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const axios = require('axios');

/**
 * Controller CRUD de Tipos de Cardápio
 * Responsável por operações de Create, Update e Delete
 */
class TiposCardapioCRUDController {
  /**
   * Buscar dados do Foods API e retornar com nome
   */
  static async buscarDadosDoFoods(tipo, id, authToken) {
    try {
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      let endpoint = '';
      let nomeField = '';

      switch (tipo) {
        case 'filial':
          endpoint = `/filiais/${id}`;
          nomeField = 'filial';
          break;
        case 'centro_custo':
          endpoint = `/centro-custo/${id}`;
          nomeField = 'nome';
          break;
        case 'unidade':
          endpoint = `/unidades-escolares/${id}`;
          nomeField = 'nome_escola';
          break;
        case 'produto_comercial':
          endpoint = `/produto-comercial/${id}`;
          nomeField = 'nome_comercial';
          break;
        default:
          return null;
      }

      const response = await axios.get(`${foodsApiUrl}${endpoint}`, {
        headers: {
          'Authorization': authToken || ''
        },
        timeout: 5000
      });

      if (response.data && response.data.success) {
        const data = response.data.data || response.data;
        return {
          id: data.id,
          nome: data[nomeField] || data.nome || `ID ${id}`
        };
      }

      return null;
    } catch (error) {
      console.warn(`Erro ao buscar ${tipo} ${id} do foods:`, error.message);
      return null;
    }
  }

  /**
   * Criar novo tipo de cardápio
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        filial_id,
        centro_custo_id,
        contrato_id,
        unidades_ids = [],
        produtos_comerciais = [],
        vinculos = []
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Validar campos obrigatórios
      if (!filial_id) {
        return errorResponse(res, 'Filial é obrigatória', STATUS_CODES.BAD_REQUEST);
      }

      if (!centro_custo_id) {
        return errorResponse(res, 'Centro de custo é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      if (!contrato_id) {
        return errorResponse(res, 'Contrato é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Verificar se contrato existe
      const contratoExiste = await executeQuery(
        'SELECT id, nome FROM contratos WHERE id = ?',
        [contrato_id]
      );

      if (contratoExiste.length === 0) {
        return errorResponse(res, 'Contrato não encontrado', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar nomes do Foods API
      const [filialInfo, centroCustoInfo] = await Promise.all([
        TiposCardapioCRUDController.buscarDadosDoFoods('filial', filial_id, req.headers.authorization),
        TiposCardapioCRUDController.buscarDadosDoFoods('centro_custo', centro_custo_id, req.headers.authorization)
      ]);

      if (!filialInfo) {
        return errorResponse(res, 'Filial não encontrada no sistema Foods', STATUS_CODES.BAD_REQUEST);
      }

      if (!centroCustoInfo) {
        return errorResponse(res, 'Centro de custo não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
      }

      // Inserir tipo de cardápio
      const result = await executeQuery(
        `INSERT INTO tipos_cardapio (
          filial_id, filial_nome, centro_custo_id, centro_custo_nome,
          contrato_id, contrato_nome, usuario_criador_id, usuario_atualizador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          filial_id,
          filialInfo.nome,
          centro_custo_id,
          centroCustoInfo.nome,
          contrato_id,
          contratoExiste[0].nome,
          usuarioId,
          usuarioId
        ]
      );

      const tipoCardapioId = result.insertId;

      // Vincular unidades se fornecidas
      if (Array.isArray(unidades_ids) && unidades_ids.length > 0) {
        const unidadesComNomes = [];
        for (const unidadeId of unidades_ids) {
          const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
          if (unidadeInfo) {
            unidadesComNomes.push({
              id: unidadeId,
              nome: unidadeInfo.nome
            });
          }
        }

        if (unidadesComNomes.length > 0) {
          const vinculosUnidadesQueries = unidadesComNomes.map(unidade => ({
            sql: `INSERT INTO tipos_cardapio_unidades 
                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) 
                  VALUES (?, ?, ?, ?, ?)`,
            params: [tipoCardapioId, parseInt(unidade.id), unidade.nome, usuarioId, usuarioId]
          }));

          await executeTransaction(vinculosUnidadesQueries);
        }
      }

      // Vincular produtos comerciais se fornecidos
      if (Array.isArray(produtos_comerciais) && produtos_comerciais.length > 0) {
        const produtosComNomes = [];
        for (const produto of produtos_comerciais) {
          if (!produto.produto_comercial_id) {
            continue;
          }

          const produtoInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('produto_comercial', produto.produto_comercial_id, req.headers.authorization);
          if (produtoInfo) {
            produtosComNomes.push({
              id: produto.produto_comercial_id,
              nome: produtoInfo.nome
            });
          }
        }

        if (produtosComNomes.length > 0) {
          const vinculosProdutosQueries = produtosComNomes.map(produto => ({
            sql: `INSERT INTO tipos_cardapio_produtos 
                  (tipo_cardapio_id, produto_comercial_id, produto_comercial_nome, usuario_criador_id, usuario_atualizador_id) 
                  VALUES (?, ?, ?, ?, ?)`,
            params: [tipoCardapioId, parseInt(produto.id), produto.nome, usuarioId, usuarioId]
          }));

          await executeTransaction(vinculosProdutosQueries);
        }
      }

      // Vincular unidades e produtos (vínculos específicos)
      // Extrair unidades únicas dos vínculos e salvar apenas na tabela tipos_cardapio_unidades
      if (Array.isArray(vinculos) && vinculos.length > 0) {
        // Extrair unidades únicas dos vínculos
        const unidadesUnicas = new Set();
        vinculos.forEach(vinculo => {
          if (vinculo.unidade_id) {
            unidadesUnicas.add(vinculo.unidade_id);
          }
        });

        // Buscar informações das unidades e salvar na tabela tipos_cardapio_unidades
        const unidadesComNomes = [];
        for (const unidadeId of unidadesUnicas) {
          const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
          if (unidadeInfo) {
            unidadesComNomes.push({
              id: unidadeId,
              nome: unidadeInfo.nome
            });
          }
        }

        if (unidadesComNomes.length > 0) {
          const vinculosUnidadesQueries = unidadesComNomes.map(unidade => ({
            sql: `INSERT INTO tipos_cardapio_unidades 
                  (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) 
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                    unidade_nome = VALUES(unidade_nome),
                    usuario_atualizador_id = VALUES(usuario_atualizador_id)`,
            params: [tipoCardapioId, parseInt(unidade.id), unidade.nome, usuarioId, usuarioId]
          }));

          await executeTransaction(vinculosUnidadesQueries);
        }
      }

      // Criar vínculos na tabela cozinha_industrial_tipos_cardapio (similar a cozinha_industrial_periodos_atendimento)
      // Isso permite que as unidades vinculadas ao tipo de cardápio fiquem disponíveis na tela de quantidades servidas
      // Buscar todas as unidades vinculadas ao tipo de cardápio (de unidades_ids e vinculos)
      const todasUnidadesVinculadas = new Set();
      
      // Adicionar unidades de unidades_ids
      if (Array.isArray(unidades_ids) && unidades_ids.length > 0) {
        unidades_ids.forEach(id => todasUnidadesVinculadas.add(id));
      }
      
      // Adicionar unidades de vinculos
      if (Array.isArray(vinculos) && vinculos.length > 0) {
        vinculos.forEach(vinculo => {
          if (vinculo.unidade_id) {
            todasUnidadesVinculadas.add(vinculo.unidade_id);
          }
        });
      }

      // Criar vínculos na tabela cozinha_industrial_tipos_cardapio
      if (todasUnidadesVinculadas.size > 0) {
        const vinculosCozinhaIndustrial = [];
        
        for (const unidadeId of todasUnidadesVinculadas) {
          // Buscar informações da unidade do Foods
          const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
          if (unidadeInfo) {
            const unidadeNome = unidadeInfo.nome_escola || unidadeInfo.nome || null;
            
            vinculosCozinhaIndustrial.push({
              sql: `INSERT INTO cozinha_industrial_tipos_cardapio 
                    (cozinha_industrial_id, unidade_nome, tipo_cardapio_id, status, usuario_criador_id, usuario_atualizador_id) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                      status = 'ativo',
                      unidade_nome = VALUES(unidade_nome),
                      usuario_atualizador_id = VALUES(usuario_atualizador_id),
                      atualizado_em = CURRENT_TIMESTAMP`,
              params: [parseInt(unidadeId), unidadeNome, tipoCardapioId, 'ativo', usuarioId, usuarioId]
            });
          }
        }

        if (vinculosCozinhaIndustrial.length > 0) {
          try {
            await executeTransaction(vinculosCozinhaIndustrial);
          } catch (error) {
            // Se a tabela não existir ainda, apenas logar o erro mas não falhar
            if (error.code === 'ER_NO_SUCH_TABLE' && error.sqlMessage?.includes('cozinha_industrial_tipos_cardapio')) {
              console.warn('Tabela cozinha_industrial_tipos_cardapio não existe ainda. Vínculos não foram criados. A tabela será criada quando o SQL for gerado.');
            } else {
              throw error; // Re-lançar outros erros
            }
          }
        }
      }

      // Buscar tipo de cardápio criado
      const tipoCardapioCriado = await TiposCardapioCRUDController.buscarTipoCardapioCompleto(tipoCardapioId);

      return successResponse(
        res,
        tipoCardapioCriado,
        'Tipo de cardápio criado com sucesso',
        STATUS_CODES.CREATED
      );
    } catch (error) {
      console.error('Erro ao criar tipo de cardápio:', error);
      return errorResponse(res, 'Erro ao criar tipo de cardápio', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar tipo de cardápio
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        filial_id,
        centro_custo_id,
        contrato_id,
        unidades_ids,
        produtos_comerciais,
        vinculos
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Verificar se tipo de cardápio existe
      const tipoCardapioExiste = await executeQuery(
        'SELECT id FROM tipos_cardapio WHERE id = ?',
        [id]
      );

      if (tipoCardapioExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de cardápio não encontrado');
      }

      const updateFields = [];
      const updateValues = [];

      if (filial_id !== undefined) {
        const filialInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('filial', filial_id, req.headers.authorization);
        if (!filialInfo) {
          return errorResponse(res, 'Filial não encontrada no sistema Foods', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('filial_id = ?');
        updateFields.push('filial_nome = ?');
        updateValues.push(filial_id);
        updateValues.push(filialInfo.nome);
      }

      if (centro_custo_id !== undefined) {
        const centroCustoInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('centro_custo', centro_custo_id, req.headers.authorization);
        if (!centroCustoInfo) {
          return errorResponse(res, 'Centro de custo não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('centro_custo_id = ?');
        updateFields.push('centro_custo_nome = ?');
        updateValues.push(centro_custo_id);
        updateValues.push(centroCustoInfo.nome);
      }

      if (contrato_id !== undefined) {
        const contratoExiste = await executeQuery(
          'SELECT id, nome FROM contratos WHERE id = ?',
          [contrato_id]
        );
        if (contratoExiste.length === 0) {
          return errorResponse(res, 'Contrato não encontrado', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('contrato_id = ?');
        updateFields.push('contrato_nome = ?');
        updateValues.push(contrato_id);
        updateValues.push(contratoExiste[0].nome);
      }

      if (updateFields.length > 0) {
        updateFields.push('usuario_atualizador_id = ?');
        updateFields.push('atualizado_em = NOW()');
        updateValues.push(usuarioId);

        await executeQuery(
          `UPDATE tipos_cardapio SET ${updateFields.join(', ')} WHERE id = ?`,
          [...updateValues, id]
        );
      }

      // Atualizar unidades se fornecidas
      if (unidades_ids !== undefined) {
        // Remover vínculos existentes
        await executeQuery(
          'DELETE FROM tipos_cardapio_unidades WHERE tipo_cardapio_id = ?',
          [id]
        );

        // Criar novos vínculos
        if (Array.isArray(unidades_ids) && unidades_ids.length > 0) {
          const unidadesComNomes = [];
          for (const unidadeId of unidades_ids) {
            const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
            if (unidadeInfo) {
              unidadesComNomes.push({
                id: unidadeId,
                nome: unidadeInfo.nome
              });
            }
          }

          if (unidadesComNomes.length > 0) {
            const vinculosUnidadesQueries = unidadesComNomes.map(unidade => ({
              sql: `INSERT INTO tipos_cardapio_unidades 
                    (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) 
                    VALUES (?, ?, ?, ?, ?)`,
              params: [parseInt(id), parseInt(unidade.id), unidade.nome, usuarioId, usuarioId]
            }));

            await executeTransaction(vinculosUnidadesQueries);
          }
        }
      }

      // Atualizar produtos comerciais se fornecidos
      if (produtos_comerciais !== undefined) {
        // Remover vínculos existentes
        await executeQuery(
          'DELETE FROM tipos_cardapio_produtos WHERE tipo_cardapio_id = ?',
          [id]
        );

        // Criar novos vínculos
        if (Array.isArray(produtos_comerciais) && produtos_comerciais.length > 0) {
          const produtosComNomes = [];
          for (const produto of produtos_comerciais) {
            if (!produto.produto_comercial_id) {
              continue;
            }

            const produtoInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('produto_comercial', produto.produto_comercial_id, req.headers.authorization);
            if (produtoInfo) {
              produtosComNomes.push({
                id: produto.produto_comercial_id,
                nome: produtoInfo.nome
              });
            }
          }

          if (produtosComNomes.length > 0) {
            const vinculosProdutosQueries = produtosComNomes.map(produto => ({
              sql: `INSERT INTO tipos_cardapio_produtos 
                    (tipo_cardapio_id, produto_comercial_id, produto_comercial_nome, usuario_criador_id, usuario_atualizador_id) 
                    VALUES (?, ?, ?, ?, ?)`,
              params: [parseInt(id), parseInt(produto.id), produto.nome, usuarioId, usuarioId]
            }));

            await executeTransaction(vinculosProdutosQueries);
          }
        }
      }

      // Atualizar vínculos unidades-produtos se fornecidos
      // Extrair unidades únicas dos vínculos e salvar apenas na tabela tipos_cardapio_unidades
      if (vinculos !== undefined) {
        // Remover todas as unidades vinculadas e recriar apenas as que têm vínculos
        await executeQuery(
          'DELETE FROM tipos_cardapio_unidades WHERE tipo_cardapio_id = ?',
          [id]
        );

        // Criar novos vínculos apenas com unidades que têm produtos selecionados
        if (Array.isArray(vinculos) && vinculos.length > 0) {
          // Extrair unidades únicas dos vínculos
          const unidadesUnicas = new Set();
          vinculos.forEach(vinculo => {
            if (vinculo.unidade_id) {
              unidadesUnicas.add(vinculo.unidade_id);
            }
          });

          // Buscar informações das unidades e salvar na tabela tipos_cardapio_unidades
          const unidadesComNomes = [];
          for (const unidadeId of unidadesUnicas) {
            const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
            if (unidadeInfo) {
              unidadesComNomes.push({
                id: unidadeId,
                nome: unidadeInfo.nome
              });
            }
          }

          if (unidadesComNomes.length > 0) {
            const vinculosUnidadesQueries = unidadesComNomes.map(unidade => ({
              sql: `INSERT INTO tipos_cardapio_unidades 
                    (tipo_cardapio_id, unidade_id, unidade_nome, usuario_criador_id, usuario_atualizador_id) 
                    VALUES (?, ?, ?, ?, ?)`,
              params: [parseInt(id), parseInt(unidade.id), unidade.nome, usuarioId, usuarioId]
            }));

            await executeTransaction(vinculosUnidadesQueries);
          }
        }
      }

      // Atualizar vínculos na tabela cozinha_industrial_tipos_cardapio
      // Buscar todas as unidades vinculadas ao tipo de cardápio (de unidades_ids e vinculos)
      const todasUnidadesVinculadas = new Set();
      
      // Adicionar unidades de unidades_ids
      if (unidades_ids !== undefined && Array.isArray(unidades_ids) && unidades_ids.length > 0) {
        unidades_ids.forEach(id => todasUnidadesVinculadas.add(id));
      }
      
      // Adicionar unidades de vinculos
      if (vinculos !== undefined && Array.isArray(vinculos) && vinculos.length > 0) {
        vinculos.forEach(vinculo => {
          if (vinculo.unidade_id) {
            todasUnidadesVinculadas.add(vinculo.unidade_id);
          }
        });
      }

      // Atualizar vínculos na tabela cozinha_industrial_tipos_cardapio
      if (unidades_ids !== undefined || vinculos !== undefined) {
        try {
          // Marcar todos os vínculos existentes como inativos
          await executeQuery(
            'UPDATE cozinha_industrial_tipos_cardapio SET status = ?, usuario_atualizador_id = ?, atualizado_em = CURRENT_TIMESTAMP WHERE tipo_cardapio_id = ?',
            ['inativo', usuarioId, id]
          );

          // Criar/atualizar vínculos ativos para as unidades vinculadas
          if (todasUnidadesVinculadas.size > 0) {
            const vinculosCozinhaIndustrial = [];
            
            for (const unidadeId of todasUnidadesVinculadas) {
              // Buscar informações da unidade do Foods
              const unidadeInfo = await TiposCardapioCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
              if (unidadeInfo) {
                const unidadeNome = unidadeInfo.nome_escola || unidadeInfo.nome || null;
                
                vinculosCozinhaIndustrial.push({
                  sql: `INSERT INTO cozinha_industrial_tipos_cardapio 
                        (cozinha_industrial_id, unidade_nome, tipo_cardapio_id, status, usuario_criador_id, usuario_atualizador_id) 
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                          status = 'ativo',
                          unidade_nome = VALUES(unidade_nome),
                          usuario_atualizador_id = VALUES(usuario_atualizador_id),
                          atualizado_em = CURRENT_TIMESTAMP`,
                  params: [parseInt(unidadeId), unidadeNome, id, 'ativo', usuarioId, usuarioId]
                });
              }
            }

            if (vinculosCozinhaIndustrial.length > 0) {
              await executeTransaction(vinculosCozinhaIndustrial);
            }
          }
        } catch (error) {
          // Se a tabela não existir ainda, apenas logar o erro mas não falhar
          if (error.code === 'ER_NO_SUCH_TABLE' && error.sqlMessage?.includes('cozinha_industrial_tipos_cardapio')) {
            console.warn('Tabela cozinha_industrial_tipos_cardapio não existe ainda. Vínculos não foram atualizados. A tabela será criada quando o SQL for gerado.');
          } else {
            throw error; // Re-lançar outros erros
          }
        }
      }

      // Buscar tipo de cardápio atualizado
      const tipoCardapioAtualizado = await TiposCardapioCRUDController.buscarTipoCardapioCompleto(id);

      return successResponse(
        res,
        tipoCardapioAtualizado,
        'Tipo de cardápio atualizado com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao atualizar tipo de cardápio:', error);
      return errorResponse(res, 'Erro ao atualizar tipo de cardápio', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir tipo de cardápio
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se tipo de cardápio existe
      const tipoCardapioExiste = await executeQuery(
        'SELECT id FROM tipos_cardapio WHERE id = ?',
        [id]
      );

      if (tipoCardapioExiste.length === 0) {
        return notFoundResponse(res, 'Tipo de cardápio não encontrado');
      }

      // Excluir tipo de cardápio (CASCADE vai excluir os vínculos)
      await executeQuery('DELETE FROM tipos_cardapio WHERE id = ?', [id]);

      return successResponse(
        res,
        null,
        'Tipo de cardápio excluído com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao excluir tipo de cardápio:', error);
      return errorResponse(res, 'Erro ao excluir tipo de cardápio', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de cardápio por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const tipoCardapio = await TiposCardapioCRUDController.buscarTipoCardapioCompleto(id);

      if (!tipoCardapio) {
        return notFoundResponse(res, 'Tipo de cardápio não encontrado');
      }

      return successResponse(res, tipoCardapio, 'Tipo de cardápio encontrado com sucesso', STATUS_CODES.OK);
    } catch (error) {
      console.error('Erro ao buscar tipo de cardápio:', error);
      return errorResponse(res, 'Erro ao buscar tipo de cardápio', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar tipo de cardápio completo com vínculos
   */
  static async buscarTipoCardapioCompleto(id) {
    const tiposCardapio = await executeQuery(
      `SELECT 
        id,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        contrato_id,
        contrato_nome,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM tipos_cardapio
      WHERE id = ?`,
      [id]
    );

    if (tiposCardapio.length === 0) {
      return null;
    }

    const tipoCardapio = tiposCardapio[0];

    // Buscar unidades vinculadas
    const unidadesVinculadas = await executeQuery(
      `SELECT 
        id,
        unidade_id,
        unidade_nome,
        criado_em
      FROM tipos_cardapio_unidades
      WHERE tipo_cardapio_id = ?`,
      [id]
    );

    // Buscar produtos vinculados
    const produtosVinculados = await executeQuery(
      `SELECT 
        id,
        produto_comercial_id,
        produto_comercial_nome,
        criado_em
      FROM tipos_cardapio_produtos
      WHERE tipo_cardapio_id = ?`,
      [id]
    );

    tipoCardapio.unidades_vinculadas = unidadesVinculadas;
    tipoCardapio.produtos_vinculados = produtosVinculados;

    return tipoCardapio;
  }
}

module.exports = TiposCardapioCRUDController;

