const { executeQuery, executeTransaction } = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse, STATUS_CODES } = require('../../middleware/responseHandler');
const axios = require('axios');

/**
 * Controller CRUD de Contratos
 * Responsável por operações de Create, Update e Delete
 */
class ContratosCRUDController {
  /**
   * Gerar código automático do contrato
   */
  static async gerarCodigoContrato() {
    const [ultimo] = await executeQuery(
      `SELECT codigo 
       FROM contratos 
       WHERE codigo LIKE 'CTR-%' 
       ORDER BY id DESC 
       LIMIT 1`
    );

    if (ultimo) {
      const numero = parseInt(ultimo.codigo.substring(4));
      const proximo = 'CTR-' + String(numero + 1).padStart(6, '0');
      return proximo;
    }
    return 'CTR-000001';
  }

  /**
   * Buscar dados do Foods API e retornar com nome
   */
  static async buscarDadosDoFoods(tipo, id, authToken) {
    try {
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      let endpoint = '';
      let nomeField = '';

      switch (tipo) {
        case 'cliente':
          endpoint = `/clientes/${id}`;
          nomeField = 'razao_social';
          break;
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
   * Criar novo contrato
   */
  static async criar(req, res) {
    try {
      const {
        nome,
        cliente_id,
        filial_id,
        centro_custo_id,
        status = 'ativo'
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Validar campos obrigatórios
      if (!nome || !nome.trim()) {
        return errorResponse(res, 'Nome do contrato é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      if (!cliente_id) {
        return errorResponse(res, 'Cliente é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      if (!filial_id) {
        return errorResponse(res, 'Filial é obrigatória', STATUS_CODES.BAD_REQUEST);
      }

      if (!centro_custo_id) {
        return errorResponse(res, 'Centro de custo é obrigatório', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar nomes do Foods API
      const [clienteInfo, filialInfo, centroCustoInfo] = await Promise.all([
        ContratosCRUDController.buscarDadosDoFoods('cliente', cliente_id, req.headers.authorization),
        ContratosCRUDController.buscarDadosDoFoods('filial', filial_id, req.headers.authorization),
        ContratosCRUDController.buscarDadosDoFoods('centro_custo', centro_custo_id, req.headers.authorization)
      ]);

      if (!clienteInfo) {
        return errorResponse(res, 'Cliente não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
      }

      if (!filialInfo) {
        return errorResponse(res, 'Filial não encontrada no sistema Foods', STATUS_CODES.BAD_REQUEST);
      }

      if (!centroCustoInfo) {
        return errorResponse(res, 'Centro de custo não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
      }

      // Gerar código automático
      const codigo = await ContratosCRUDController.gerarCodigoContrato();

      // Inserir contrato
      const result = await executeQuery(
        `INSERT INTO contratos (
          codigo, nome, cliente_id, cliente_nome, filial_id, filial_nome,
          centro_custo_id, centro_custo_nome, status, usuario_criador_id, usuario_atualizador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          nome.trim(),
          cliente_id,
          clienteInfo.nome,
          filial_id,
          filialInfo.nome,
          centro_custo_id,
          centroCustoInfo.nome,
          status,
          usuarioId,
          usuarioId
        ]
      );

      const contratoId = result.insertId;

      // Buscar contrato criado
      const contratoCriado = await ContratosCRUDController.buscarContratoCompleto(contratoId);

      return successResponse(
        res,
        contratoCriado,
        'Contrato criado com sucesso',
        STATUS_CODES.CREATED
      );
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      return errorResponse(res, 'Erro ao criar contrato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Atualizar contrato
   */
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        cliente_id,
        filial_id,
        centro_custo_id,
        status
      } = req.body;

      const usuarioId = req.user?.id || null;

      // Verificar se contrato existe
      const contratoExiste = await executeQuery(
        'SELECT id FROM contratos WHERE id = ?',
        [id]
      );

      if (contratoExiste.length === 0) {
        return notFoundResponse(res, 'Contrato não encontrado');
      }

      const updateFields = [];
      const updateValues = [];

      if (nome !== undefined) {
        updateFields.push('nome = ?');
        updateValues.push(nome.trim());
      }

      if (cliente_id !== undefined) {
        const clienteInfo = await ContratosCRUDController.buscarDadosDoFoods('cliente', cliente_id, req.headers.authorization);
        if (!clienteInfo) {
          return errorResponse(res, 'Cliente não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('cliente_id = ?');
        updateFields.push('cliente_nome = ?');
        updateValues.push(cliente_id);
        updateValues.push(clienteInfo.nome);
      }

      if (filial_id !== undefined) {
        const filialInfo = await ContratosCRUDController.buscarDadosDoFoods('filial', filial_id, req.headers.authorization);
        if (!filialInfo) {
          return errorResponse(res, 'Filial não encontrada no sistema Foods', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('filial_id = ?');
        updateFields.push('filial_nome = ?');
        updateValues.push(filial_id);
        updateValues.push(filialInfo.nome);
      }

      if (centro_custo_id !== undefined) {
        const centroCustoInfo = await ContratosCRUDController.buscarDadosDoFoods('centro_custo', centro_custo_id, req.headers.authorization);
        if (!centroCustoInfo) {
          return errorResponse(res, 'Centro de custo não encontrado no sistema Foods', STATUS_CODES.BAD_REQUEST);
        }
        updateFields.push('centro_custo_id = ?');
        updateFields.push('centro_custo_nome = ?');
        updateValues.push(centro_custo_id);
        updateValues.push(centroCustoInfo.nome);
      }

      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length > 0) {
        updateFields.push('usuario_atualizador_id = ?');
        updateFields.push('atualizado_em = NOW()');
        updateValues.push(usuarioId);

        await executeQuery(
          `UPDATE contratos SET ${updateFields.join(', ')} WHERE id = ?`,
          [...updateValues, id]
        );
      }

      // Buscar contrato atualizado
      const contratoAtualizado = await ContratosCRUDController.buscarContratoCompleto(id);

      return successResponse(
        res,
        contratoAtualizado,
        'Contrato atualizado com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      return errorResponse(res, 'Erro ao atualizar contrato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Excluir contrato
   */
  static async excluir(req, res) {
    try {
      const { id } = req.params;

      // Verificar se contrato existe
      const contratoExiste = await executeQuery(
        'SELECT id FROM contratos WHERE id = ?',
        [id]
      );

      if (contratoExiste.length === 0) {
        return notFoundResponse(res, 'Contrato não encontrado');
      }

      // Excluir contrato (CASCADE vai excluir os vínculos)
      await executeQuery('DELETE FROM contratos WHERE id = ?', [id]);

      return successResponse(
        res,
        null,
        'Contrato excluído com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      return errorResponse(res, 'Erro ao excluir contrato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar contrato por ID
   */
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const contrato = await ContratosCRUDController.buscarContratoCompleto(id);

      if (!contrato) {
        return notFoundResponse(res, 'Contrato não encontrado');
      }

      return successResponse(res, contrato, 'Contrato encontrado com sucesso', STATUS_CODES.OK);
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      return errorResponse(res, 'Erro ao buscar contrato', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buscar contrato completo com vínculos
   */
  static async buscarContratoCompleto(id) {
    const contratos = await executeQuery(
      `SELECT 
        id,
        codigo,
        nome,
        cliente_id,
        cliente_nome,
        filial_id,
        filial_nome,
        centro_custo_id,
        centro_custo_nome,
        status,
        usuario_criador_id,
        usuario_atualizador_id,
        criado_em,
        atualizado_em
      FROM contratos
      WHERE id = ?`,
      [id]
    );

    if (contratos.length === 0) {
      return null;
    }

    const contrato = contratos[0];

    // Buscar unidades vinculadas
    const unidadesVinculadas = await executeQuery(
      `SELECT 
        id,
        cozinha_industrial_id,
        unidade_nome,
        status,
        criado_em
      FROM cozinha_industrial_contratos_unidades
      WHERE contrato_id = ?`,
      [id]
    );

    // Buscar produtos vinculados
    const produtosVinculados = await executeQuery(
      `SELECT 
        id,
        produto_comercial_id,
        produto_comercial_nome,
        valor_unitario,
        status,
        criado_em
      FROM cozinha_industrial_contratos_produtos
      WHERE contrato_id = ?`,
      [id]
    );

    contrato.unidades_vinculadas = unidadesVinculadas;
    contrato.produtos_vinculados = produtosVinculados;

    return contrato;
  }

  /**
   * Vincular unidades escolares ao contrato
   */
  static async vincularUnidades(req, res) {
    try {
      const { id } = req.params;
      const { cozinha_industrial_ids } = req.body;
      const usuarioId = req.user?.id || null;

      // Verificar se contrato existe
      const contratoExiste = await executeQuery(
        'SELECT id FROM contratos WHERE id = ?',
        [id]
      );

      if (contratoExiste.length === 0) {
        return notFoundResponse(res, 'Contrato não encontrado');
      }

      if (!Array.isArray(cozinha_industrial_ids) || cozinha_industrial_ids.length === 0) {
        return errorResponse(res, 'Deve informar pelo menos uma unidade escolar', STATUS_CODES.BAD_REQUEST);
      }

      // Buscar nomes das unidades do Foods API
      const unidadesComNomes = [];
      for (const unidadeId of cozinha_industrial_ids) {
        const unidadeInfo = await ContratosCRUDController.buscarDadosDoFoods('unidade', unidadeId, req.headers.authorization);
        if (unidadeInfo) {
          unidadesComNomes.push({
            id: unidadeId,
            nome: unidadeInfo.nome
          });
        }
      }

      if (unidadesComNomes.length === 0) {
        return errorResponse(res, 'Nenhuma unidade escolar válida encontrada', STATUS_CODES.BAD_REQUEST);
      }

      // Remover vínculos existentes
      await executeQuery(
        'DELETE FROM cozinha_industrial_contratos_unidades WHERE contrato_id = ?',
        [id]
      );

      // Criar novos vínculos
      const vinculosQueries = unidadesComNomes.map(unidade => ({
        sql: `INSERT INTO cozinha_industrial_contratos_unidades 
              (contrato_id, cozinha_industrial_id, unidade_nome, status, usuario_criador_id, usuario_atualizador_id) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        params: [parseInt(id), parseInt(unidade.id), unidade.nome, 'ativo', usuarioId, usuarioId]
      }));

      if (vinculosQueries.length > 0) {
        await executeTransaction(vinculosQueries);
      }

      // Buscar contrato atualizado
      const contratoAtualizado = await ContratosCRUDController.buscarContratoCompleto(id);

      return successResponse(
        res,
        contratoAtualizado,
        'Unidades vinculadas com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao vincular unidades:', error);
      return errorResponse(res, 'Erro ao vincular unidades', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Vincular produtos comerciais ao contrato
   */
  static async vincularProdutos(req, res) {
    try {
      const { id } = req.params;
      const { produtos } = req.body; // Array de { produto_comercial_id, valor_unitario }
      const usuarioId = req.user?.id || null;

      // Verificar se contrato existe
      const contratoExiste = await executeQuery(
        'SELECT id FROM contratos WHERE id = ?',
        [id]
      );

      if (contratoExiste.length === 0) {
        return notFoundResponse(res, 'Contrato não encontrado');
      }

      if (!Array.isArray(produtos) || produtos.length === 0) {
        return errorResponse(res, 'Deve informar pelo menos um produto comercial', STATUS_CODES.BAD_REQUEST);
      }

      // Validar e buscar nomes dos produtos do Foods API
      const produtosComNomes = [];
      for (const produto of produtos) {
        if (!produto.produto_comercial_id || !produto.valor_unitario) {
          return errorResponse(res, 'Todos os produtos devem ter produto_comercial_id e valor_unitario', STATUS_CODES.BAD_REQUEST);
        }

        const produtoInfo = await ContratosCRUDController.buscarDadosDoFoods('produto_comercial', produto.produto_comercial_id, req.headers.authorization);
        if (!produtoInfo) {
          return errorResponse(res, `Produto comercial ${produto.produto_comercial_id} não encontrado no sistema Foods`, STATUS_CODES.BAD_REQUEST);
        }

        produtosComNomes.push({
          id: produto.produto_comercial_id,
          nome: produtoInfo.nome,
          valor_unitario: parseFloat(produto.valor_unitario)
        });
      }

      // Remover vínculos existentes
      await executeQuery(
        'DELETE FROM cozinha_industrial_contratos_produtos WHERE contrato_id = ?',
        [id]
      );

      // Criar novos vínculos
      const vinculosQueries = produtosComNomes.map(produto => ({
        sql: `INSERT INTO cozinha_industrial_contratos_produtos 
              (contrato_id, produto_comercial_id, produto_comercial_nome, valor_unitario, status, usuario_criador_id, usuario_atualizador_id) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [parseInt(id), parseInt(produto.id), produto.nome, produto.valor_unitario, 'ativo', usuarioId, usuarioId]
      }));

      if (vinculosQueries.length > 0) {
        await executeTransaction(vinculosQueries);
      }

      // Buscar contrato atualizado
      const contratoAtualizado = await ContratosCRUDController.buscarContratoCompleto(id);

      return successResponse(
        res,
        contratoAtualizado,
        'Produtos vinculados com sucesso',
        STATUS_CODES.OK
      );
    } catch (error) {
      console.error('Erro ao vincular produtos:', error);
      return errorResponse(res, 'Erro ao vincular produtos', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = ContratosCRUDController;

