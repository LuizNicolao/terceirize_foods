const { executeQuery } = require('../../config/database');
const { calcularStatusEntrega } = require('../../utils/recebimentosUtils');

const criar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      escola_id, 
      data_recebimento, 
      tipo_recebimento, 
      tipo_entrega, 
      pendencia_anterior, 
      precisa_reentrega, 
      observacoes,
      produtos 
    } = req.body;

    // Validar campos obrigatórios
    if (!escola_id || !data_recebimento || !tipo_recebimento || !tipo_entrega || !pendencia_anterior) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'É necessário informar escola, data, tipo de recebimento, tipo de entrega e pendência anterior'
      });
    }

    // Verificar se a escola existe
    // TODO: Verificar se escola existe via API do foods ou validar de outra forma
    // const escolaExiste = await executeQuery('SELECT id FROM escolas WHERE id = ? AND ativo = 1', [escola_id]);
    // TODO: Implementar validação de escola
    // if (escolaExiste.length === 0) {
    if (false) { // Temporário: sempre passa na validação
      return res.status(400).json({
        error: 'Escola inválida',
        message: 'A escola selecionada não existe ou está inativa'
      });
    }

    // Se for recebimento parcial, validar produtos
    if (tipo_recebimento === 'Parcial') {
      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({
          error: 'Produtos obrigatórios',
          message: 'Para recebimento parcial, é necessário informar pelo menos um produto'
        });
      }

      if (!precisa_reentrega) {
        return res.status(400).json({
          error: 'Campo obrigatório',
          message: 'Para recebimento parcial, é necessário informar se precisa de reentrega'
        });
      }
    }

    // Buscar dados da escola via API do Foods
    let escola_nome = null;
    let escola_rota = null;
    let escola_cidade = null;
    
    try {
      const axios = require('axios');
      const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
      
      const response = await axios.get(`${foodsApiUrl}/unidades-escolares/${escola_id}`, {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
        },
        timeout: 5000 // Timeout de 5 segundos
      });
      
      if (response.data && response.data.success) {
        const escola = response.data.data;
        escola_nome = escola.nome_escola || escola.nome;
        escola_rota = escola.rota_nome || escola.rota || 'N/A';
        escola_cidade = escola.cidade || '';
      }
    } catch (apiError) {
      console.error('Erro ao buscar dados da escola:', apiError);
      // Continuar sem os dados da escola se a API falhar
    }

    // Calcular status de entrega
    const statusEntrega = calcularStatusEntrega(data_recebimento, tipo_entrega);

    // Inserir recebimento
    const resultado = await executeQuery(`
      INSERT INTO recebimentos_escolas (
        escola_id, escola_nome, escola_rota, escola_cidade, usuario_id, data_recebimento, tipo_recebimento, 
        tipo_entrega, status_entrega, pendencia_anterior, precisa_reentrega, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [escola_id, escola_nome, escola_rota, escola_cidade, userId, data_recebimento, tipo_recebimento, tipo_entrega, statusEntrega, pendencia_anterior, precisa_reentrega, observacoes]);

    const recebimentoId = resultado.insertId;

    // Se for recebimento parcial, inserir produtos
    if (tipo_recebimento === 'Parcial' && produtos.length > 0) {
      for (const produto of produtos) {
        if (produto.produto_id && produto.quantidade > 0) {
          // Buscar dados do produto via API do Foods
          let produto_nome = null;
          let produto_unidade_medida = null;
          let produto_tipo = null;
          
          try {
            const axios = require('axios');
            const foodsApiUrl = process.env.FOODS_API_URL || 'http://localhost:3001';
            
            const response = await axios.get(`${foodsApiUrl}/produto-origem/${produto.produto_id}`, {
              headers: {
                'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`
              }
            });
            
            if (response.data && response.data.success) {
              const produtoData = response.data.data;
              produto_nome = produtoData.nome;
              produto_unidade_medida = produtoData.unidade_medida_nome || 'UN';
              
              // Mapear grupo_nome para os valores do ENUM
              const mapeamentoTipo = {
                'HORTI': 'Horti',
                'PAO': 'Pao',
                'PERECIVEIS': 'Pereciveis',
                'BASE': 'Base Seca',
                'LIMP': 'Limpeza'
              };
              
              produto_tipo = mapeamentoTipo[produtoData.grupo_nome] || 'Horti';
            }
          } catch (apiError) {
            console.error('Erro ao buscar dados do produto:', apiError);
            // Continuar sem os dados do produto se a API falhar
          }
          
          await executeQuery(`
            INSERT INTO recebimentos_produtos (
              recebimento_id, produto_id, produto_nome, produto_unidade_medida, 
              produto_tipo, quantidade, precisa_reentrega
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            recebimentoId, 
            produto.produto_id, 
            produto_nome, 
            produto_unidade_medida, 
            produto_tipo, 
            produto.quantidade, 
            produto.precisa_reentrega || 'Não'
          ]);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recebimento criado com sucesso',
      data: { id: recebimentoId }
    });
  } catch (error) {
    console.error('Erro ao criar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar recebimento'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { id } = req.params;
    const { 
      escola_id, 
      data_recebimento, 
      tipo_recebimento, 
      tipo_entrega, 
      pendencia_anterior, 
      precisa_reentrega, 
      observacoes,
      produtos 
    } = req.body;

    // Verificar se o recebimento existe
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userType === 'Nutricionista') {
      whereClause += ' AND usuario_id = ?';
      params.push(userId);
    }

    const recebimentoExiste = await executeQuery(`
      SELECT id FROM recebimentos_escolas ${whereClause}
    `, params);

    if (recebimentoExiste.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado ou você não tem permissão para editá-lo'
      });
    }

    // Validar campos obrigatórios
    if (!escola_id || !data_recebimento || !tipo_recebimento || !tipo_entrega || !pendencia_anterior) {
      return res.status(400).json({
        error: 'Campos obrigatórios',
        message: 'É necessário informar escola, data, tipo de recebimento, tipo de entrega e pendência anterior'
      });
    }

    // Verificar se a escola existe
    // TODO: Verificar se escola existe via API do foods ou validar de outra forma
    // const escolaExiste = await executeQuery('SELECT id FROM escolas WHERE id = ? AND ativo = 1', [escola_id]);
    // TODO: Implementar validação de escola
    // if (escolaExiste.length === 0) {
    if (false) { // Temporário: sempre passa na validação
      return res.status(400).json({
        error: 'Escola inválida',
        message: 'A escola selecionada não existe ou está inativa'
      });
    }

    // Se for recebimento parcial, validar produtos
    if (tipo_recebimento === 'Parcial') {
      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({
          error: 'Produtos obrigatórios',
          message: 'Para recebimento parcial, é necessário informar pelo menos um produto'
        });
      }

      if (!precisa_reentrega) {
        return res.status(400).json({
          error: 'Campo obrigatório',
          message: 'Para recebimento parcial, é necessário informar se precisa de reentrega'
        });
      }
    }

    // Calcular status de entrega
    const statusEntrega = calcularStatusEntrega(data_recebimento, tipo_entrega);

    // Atualizar recebimento
    await executeQuery(`
      UPDATE recebimentos_escolas SET
        escola_id = ?, data_recebimento = ?, tipo_recebimento = ?,
        tipo_entrega = ?, status_entrega = ?, pendencia_anterior = ?, precisa_reentrega = ?,
        observacoes = ?, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [escola_id, data_recebimento, tipo_recebimento, tipo_entrega, statusEntrega, pendencia_anterior, precisa_reentrega, observacoes, id]);

    // Se for recebimento parcial, atualizar produtos
    if (tipo_recebimento === 'Parcial') {
      // Deletar produtos existentes
      await executeQuery('DELETE FROM recebimentos_produtos WHERE recebimento_id = ?', [id]);

      // Inserir novos produtos
      for (const produto of produtos) {
        if (produto.produto_id && produto.quantidade > 0) {
          await executeQuery(`
            INSERT INTO recebimentos_produtos (recebimento_id, produto_id, quantidade)
            VALUES (?, ?, ?)
          `, [id, produto.produto_id, produto.quantidade]);
        }
      }
    } else {
      // Se mudou para completo, deletar produtos
      await executeQuery('DELETE FROM recebimentos_produtos WHERE recebimento_id = ?', [id]);
    }

    res.json({
      success: true,
      message: 'Recebimento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar recebimento'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.tipo_de_acesso;
    const { id } = req.params;

    // Verificar se o recebimento existe
    let whereClause = 'WHERE id = ?';
    let params = [id];

    if (userType === 'Nutricionista') {
      whereClause += ' AND usuario_id = ?';
      params.push(userId);
    }

    const recebimentoExiste = await executeQuery(`
      SELECT id FROM recebimentos_escolas ${whereClause}
    `, params);

    if (recebimentoExiste.length === 0) {
      return res.status(404).json({
        error: 'Recebimento não encontrado',
        message: 'Recebimento não encontrado ou você não tem permissão para deletá-lo'
      });
    }

    // Deletar recebimento (produtos serão deletados automaticamente por CASCADE)
    await executeQuery('DELETE FROM recebimentos_escolas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Recebimento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar recebimento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar recebimento'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar
};
