const { executeQuery } = require('../../config/database');

const gerarNecessidade = async (req, res) => {
  try {
    const { escola_id, escola_nome, escola_rota, escola_codigo_teknisa, semana_consumo, semana_abastecimento, produtos } = req.body;

    // Debug: Log dos dados recebidos
    console.log('=== DADOS RECEBIDOS PARA GERAR NECESSIDADE ===');
    console.log('escola_id:', escola_id, typeof escola_id);
    console.log('escola_nome:', escola_nome, typeof escola_nome);
    console.log('semana_consumo:', semana_consumo, typeof semana_consumo);
    console.log('produtos:', produtos);
    console.log('produtos é array?', Array.isArray(produtos));
    console.log('produtos.length:', produtos ? produtos.length : 'null/undefined');
    console.log('===============================================');

    // Validar dados obrigatórios
    console.log('=== VALIDAÇÃO DOS DADOS ===');
    console.log('escola_id válido?', !!escola_id, escola_id);
    console.log('escola_nome válido?', !!escola_nome, escola_nome);
    console.log('semana_consumo válido?', !!semana_consumo, semana_consumo);
    console.log('produtos válido?', !!produtos, produtos);
    console.log('produtos é array?', Array.isArray(produtos));
    
    if (!escola_id || !escola_nome || !semana_consumo || !produtos || !Array.isArray(produtos)) {
      console.log('❌ ERRO DE VALIDAÇÃO - DADOS FALTANDO');
      console.log('escola_id:', escola_id, 'válido:', !!escola_id);
      console.log('escola_nome:', escola_nome, 'válido:', !!escola_nome);
      console.log('semana_consumo:', semana_consumo, 'válido:', !!semana_consumo);
      console.log('produtos:', produtos, 'válido:', !!produtos);
      console.log('produtos é array:', Array.isArray(produtos));
      
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios',
        message: 'Escola (id e nome), semana de consumo e produtos são obrigatórios'
      });
    }
    
    console.log('✅ VALIDAÇÃO PASSOU - DADOS VÁLIDOS');

    // Validar se há produtos válidos
    if (produtos.length === 0) {
      console.log('Nenhum produto enviado');
      return res.status(400).json({
        success: false,
        error: 'Nenhum produto',
        message: 'Nenhum produto foi enviado para processar'
      });
    }

    // Gerar ID único para esta necessidade
    const necessidadeId = `NEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Inserir necessidades para cada produto
    const necessidadesCriadas = [];
    
    console.log('=== PROCESSANDO PRODUTOS ===');
    console.log('Total de produtos a processar:', produtos.length);
    
    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];
      console.log(`--- Processando produto ${i + 1}/${produtos.length} ---`);
      console.log('Produto completo:', produto);
      
      const { produto_id, produto_nome, produto_unidade, ajuste } = produto;
      
      console.log('produto_id:', produto_id, typeof produto_id);
      console.log('produto_nome:', produto_nome, typeof produto_nome);
      console.log('produto_unidade:', produto_unidade, typeof produto_unidade);
      console.log('ajuste:', ajuste, typeof ajuste);

      // Validar dados do produto
      if (!produto_id || !produto_nome) {
        console.log('❌ Produto sem dados completos:', produto);
        continue; // Pular produto sem dados completos
      }
      
      console.log('✅ Produto válido, processando...');

      // Verificar se já existe necessidade para este produto/escola/semana
      const existing = await executeQuery(`
        SELECT id FROM necessidades 
        WHERE usuario_email = ? AND produto_id = ? AND escola_id = ? AND semana_consumo = ?
      `, [req.user.email, produto_id, escola_id, semana_consumo]);

      if (existing.length > 0) {
        // Atualizar necessidade existente
        await executeQuery(`
          UPDATE necessidades 
          SET ajuste = ?, semana_abastecimento = ?, data_atualizacao = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [ajuste || 0, semana_abastecimento || null, existing[0].id]);
        
        necessidadesCriadas.push({
          id: existing[0].id,
          produto: produto_nome,
          ajuste: ajuste || 0,
          status: 'atualizada'
        });
      } else {
        // Criar nova necessidade
        const result = await executeQuery(`
          INSERT INTO necessidades (
            usuario_email,
            usuario_id,
            produto_id,
            produto,
            produto_unidade,
            escola_id,
            escola,
            escola_rota,
            codigo_teknisa,
            ajuste, 
            semana_consumo,
            semana_abastecimento,
            status,
            observacoes,
            necessidade_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          req.user.email,
          req.user.id,
          produto_id,
          produto_nome,
          produto_unidade || '',
          escola_id,
          escola_nome,
          escola_rota || '',
          escola_codigo_teknisa || '',
          ajuste || 0, 
          semana_consumo,
          semana_abastecimento || null,
          'NEC',
          null,
          necessidadeId
        ]);

        necessidadesCriadas.push({
          id: result.insertId,
          produto: produto_nome,
          ajuste: ajuste || 0,
          status: 'criada'
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Necessidade gerada com sucesso! ${necessidadesCriadas.length} produtos processados.`,
      data: {
        necessidade_id: necessidadeId,
        escola: escola_nome,
        semana_consumo,
        necessidades: necessidadesCriadas
      }
    });
  } catch (error) {
    console.error('Erro ao gerar necessidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao gerar necessidade'
    });
  }
};

module.exports = {
  gerarNecessidade
};
