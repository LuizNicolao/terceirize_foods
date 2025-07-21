const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

console.log('🚀 Rotas de cotações carregadas - Endpoints disponíveis:');
console.log('  - GET /api/cotacoes/');
console.log('  - GET /api/cotacoes/pendentes-supervisor');
console.log('  - GET /api/cotacoes/teste-aprovacoes');
console.log('  - GET /api/cotacoes/aprovacoes');
console.log('  - GET /api/cotacoes/:id');
console.log('  - GET /api/cotacoes/stats/overview');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cotacao_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Função auxiliar para garantir valores padrão em produtos
const sanitizeProdutoData = (produto) => {
  // Garantir que todos os campos sejam tratados corretamente
  const sanitized = {
    id: produto.id !== undefined ? produto.id : null,
    nome: produto.nome !== undefined ? produto.nome : '',
    qtde: produto.qtde !== undefined ? produto.qtde : 0,
    un: produto.un !== undefined ? produto.un : '',
    prazoEntrega: produto.prazoEntrega !== undefined ? produto.prazoEntrega : (produto.prazo_entrega !== undefined ? produto.prazo_entrega : null),
    ultValorAprovado: produto.ultValorAprovado !== undefined ? produto.ultValorAprovado : (produto.ult_valor_aprovado !== undefined ? produto.ult_valor_aprovado : null),
    ultFornecedorAprovado: produto.ultFornecedorAprovado !== undefined ? produto.ultFornecedorAprovado : (produto.ult_fornecedor_aprovado !== undefined ? produto.ult_fornecedor_aprovado : null),
    valorAnterior: produto.valorAnterior !== undefined ? produto.valorAnterior : (produto.valor_anterior !== undefined ? produto.valor_anterior : 0),
    valorUnitario: produto.valorUnitario !== undefined ? produto.valorUnitario : (produto.valor_unitario !== undefined ? produto.valor_unitario : 0),
    difal: produto.difal !== undefined ? produto.difal : 0,
    ipi: produto.ipi !== undefined ? produto.ipi : 0,
    dataEntregaFn: produto.dataEntregaFn !== undefined ? produto.dataEntregaFn : (produto.data_entrega_fn !== undefined ? produto.data_entrega_fn : null),
    total: produto.total !== undefined ? produto.total : 0
  };



  return sanitized;
};

// GET /api/cotacoes - Listar todas as cotações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Buscar o nome do usuário no banco
    const [users] = await connection.execute(`
      SELECT name FROM users WHERE id = ?
    `, [req.user.id]);
    
    const userName = users.length > 0 ? users[0].name : 'Administrador';
    

    
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.comprador,
        c.local_entrega,
        c.tipo_compra,
        c.motivo_emergencial,
        c.justificativa,
        c.motivo_final,
        c.status,
        c.data_criacao,
        c.data_atualizacao,
        JSON_OBJECT(
          'totalProdutos', c.total_produtos,
          'produtosDuplicados', c.produtos_duplicados,
          'totalQuantidade', c.total_quantidade,
          'fornecedores', c.total_fornecedores
        ) as estatisticas
      FROM cotacoes c
      WHERE c.comprador = ?
      ORDER BY c.data_criacao DESC
    `, [userName]);

    await connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cotacoes/pendentes-supervisor - Buscar cotações pendentes para análise do supervisor
router.get('/pendentes-supervisor', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [cotacoes] = await connection.execute(`
      SELECT 
        c.id,
        c.comprador,
        c.local_entrega,
        c.tipo_compra,
        c.motivo_emergencial,
        c.justificativa,
        c.motivo_final,
        c.status,
        c.data_criacao as created_at,
        c.data_atualizacao as updated_at,
        JSON_OBJECT(
          'totalProdutos', c.total_produtos,
          'produtosDuplicados', c.produtos_duplicados,
          'totalQuantidade', c.total_quantidade,
          'fornecedores', c.total_fornecedores
        ) as estatisticas
      FROM cotacoes c
      WHERE c.status = 'em_analise'
      ORDER BY c.data_criacao DESC
    `);

    // Buscar fornecedores e produtos para cada cotação
    for (let cotacao of cotacoes) {
      const [fornecedores] = await connection.execute(`
        SELECT * FROM fornecedores WHERE cotacao_id = ?
      `, [cotacao.id]);

      // Buscar produtos dos fornecedores
      for (let fornecedor of fornecedores) {
        const [produtosFornecedor] = await connection.execute(`
          SELECT 
            id,
            produto_id,
            nome,
            qtde,
            un,
            prazo_entrega,
            ult_valor_aprovado,
            ult_fornecedor_aprovado,
            valor_anterior,
            valor_unitario,
            primeiro_valor,
            difal,
            ipi,
            data_entrega_fn,
            total
          FROM produtos_fornecedores 
          WHERE fornecedor_id = ?
        `, [fornecedor.id]);
        
        fornecedor.produtos = produtosFornecedor;
      }

      cotacao.fornecedores = fornecedores;
    }

    await connection.release();
    
    res.json(cotacoes);
  } catch (error) {
    console.error('Erro ao buscar cotações pendentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cotacoes/teste-aprovacoes - Endpoint de teste temporário
router.get('/teste-aprovacoes', authenticateToken, async (req, res) => {
  console.log('🔍 Endpoint de teste chamado por:', req.user.name);
  res.json({ 
    message: 'Endpoint funcionando', 
    user: req.user.name,
    timestamp: new Date().toISOString()
  });
});

// GET /api/cotacoes/aprovacoes - Buscar todas as cotações para aprovação
router.get('/aprovacoes', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Buscar todas as cotações com informações do usuário
    const [cotacoes] = await connection.execute(`
      SELECT 
        c.*,
        c.comprador as usuario_nome
      FROM cotacoes c
      ORDER BY 
        CASE 
          WHEN c.status = 'aguardando_aprovacao' THEN 1
          WHEN c.status = 'aguardando_aprovacao_supervisor' THEN 2
          WHEN c.status = 'pendente' THEN 3
          WHEN c.status = 'aprovado' THEN 4
          WHEN c.status = 'rejeitado' THEN 5
          ELSE 6
        END,
        c.data_criacao DESC
    `);

    // Calcular total de itens para cada cotação
    for (let cotacao of cotacoes) {
      const [fornecedores] = await connection.execute(`
        SELECT id FROM fornecedores WHERE cotacao_id = ?
      `, [cotacao.id]);

      let totalItens = 0;
      for (let fornecedor of fornecedores) {
        const [produtosCount] = await connection.execute(`
          SELECT COUNT(*) as total FROM produtos_fornecedores WHERE fornecedor_id = ?
        `, [fornecedor.id]);
        totalItens += produtosCount[0].total;
      }
      
      cotacao.total_itens = totalItens;
    }

    await connection.release();
    
    res.json(cotacoes);
  } catch (error) {
    console.error('Erro ao buscar cotações para aprovação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/cotacoes/:id - Buscar cotação específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Buscar o nome do usuário no banco
    const [users] = await connection.execute(`
      SELECT name FROM users WHERE id = ?
    `, [req.user.id]);
    
    const userName = users.length > 0 ? users[0].name : 'Administrador';
    

    
    // Buscar cotação
    const [cotacoes] = await connection.execute(`
      SELECT * FROM cotacoes WHERE id = ? AND comprador = ?
    `, [req.params.id, userName]);

    if (cotacoes.length === 0) {
      await connection.release();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];

    // Buscar produtos
    const [produtos] = await connection.execute(`
      SELECT * FROM produtos WHERE cotacao_id = ?
    `, [req.params.id]);

    // Buscar fornecedores
    const [fornecedores] = await connection.execute(`
      SELECT * FROM fornecedores WHERE cotacao_id = ?
    `, [req.params.id]);

    // Buscar produtos dos fornecedores
    for (let fornecedor of fornecedores) {
      const [produtosFornecedor] = await connection.execute(`
        SELECT 
          id,
          produto_id,
          nome,
          qtde,
          un,
          prazo_entrega,
          ult_valor_aprovado,
          ult_fornecedor_aprovado,
          valor_anterior,
          valor_unitario,
          primeiro_valor,
          difal,
          ipi,
          data_entrega_fn,
          total
        FROM produtos_fornecedores 
        WHERE fornecedor_id = ?
      `, [fornecedor.id]);
      
      fornecedor.produtos = produtosFornecedor;
    }

    // Buscar produtos em renegociação
    const [produtosRenegociacao] = await connection.execute(`
      SELECT 
        produto_id,
        produto_nome,
        fornecedor_nome,
        motivo
      FROM produtos_renegociacao 
      WHERE cotacao_id = ?
    `, [req.params.id]);

    await connection.release();
    
    res.json({
      ...cotacao,
      produtos,
      fornecedores,
      produtos_renegociar: produtosRenegociacao
    });
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cotacoes - Criar nova cotação
router.post('/', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      comprador,
      localEntrega,
      tipoCompra,
      motivoEmergencial,
      justificativa,
      motivoFinal,
      produtos,
      fornecedores,
      estatisticas,
      metadata
    } = req.body;
    


    // Inserir cotação
    const [cotacaoResult] = await connection.execute(`
      INSERT INTO cotacoes (
        comprador, local_entrega, tipo_compra, motivo_emergencial,
        justificativa, motivo_final, status, data_criacao,
        total_produtos, produtos_duplicados, total_quantidade, total_fornecedores
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendente', NOW(), ?, ?, ?, ?)
    `, [
      comprador || '', 
      localEntrega || '', 
      tipoCompra || '', 
      motivoEmergencial || '',
      justificativa || '', 
      motivoFinal || '', 
      (metadata && metadata.totalProdutosUnicos) || 0,
      (metadata && metadata.produtosDuplicadosConsolidados) || 0, 
      (metadata && metadata.totalQuantidade) || 0,
      (metadata && metadata.totalFornecedores) || 0
    ]);

    const cotacaoId = cotacaoResult.insertId;

    // Inserir produtos
    for (const produto of produtos) {
      await connection.execute(`
        INSERT INTO produtos (
          cotacao_id, produto_id, id_original, nome, qtde, un,
          entrega, prazo_entrega, is_duplicado, produtos_originais
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cotacaoId, 
        produto.id || null, 
        produto.idOriginal || null, 
        produto.nome || '',
        produto.qtde || 0, 
        produto.un || '', 
        produto.entrega || null, 
        produto.prazoEntrega || null,
        produto.isDuplicado || false, 
        JSON.stringify(produto.produtosOriginais || [])
      ]);
    }

    // Inserir fornecedores
    for (const fornecedor of fornecedores) {
      const [fornecedorResult] = await connection.execute(`
        INSERT INTO fornecedores (
          cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        cotacaoId, 
        fornecedor.id || null, 
        fornecedor.nome || '',
        fornecedor.tipoFrete || null, 
        fornecedor.valorFrete || 0,
        fornecedor.prazoPagamento || null, 
        fornecedor.frete || null
      ]);

      const fornecedorDbId = fornecedorResult.insertId;

      // Inserir produtos do fornecedor
      for (const produto of fornecedor.produtos) {
        const produtoSanitizado = sanitizeProdutoData(produto);
        
        await connection.execute(`
          INSERT INTO produtos_fornecedores (
            fornecedor_id, produto_id, nome, qtde, un, prazo_entrega,
            ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior,
            valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          fornecedorDbId, 
          produtoSanitizado.id, 
          produtoSanitizado.nome, 
          produtoSanitizado.qtde,
          produtoSanitizado.un, 
          produtoSanitizado.prazoEntrega, 
          produtoSanitizado.ultValorAprovado,
          produtoSanitizado.ultFornecedorAprovado, 
          produtoSanitizado.valorAnterior,
          produtoSanitizado.valorUnitario, 
          produtoSanitizado.valorUnitario > 0 ? produtoSanitizado.valorUnitario : 0, // primeiro_valor = valor inicial apenas se > 0
          produtoSanitizado.difal, 
          produtoSanitizado.ipi,
          produtoSanitizado.dataEntregaFn, 
          produtoSanitizado.total
        ]);
      }
    }

    await connection.commit();
    
    res.status(201).json({
      message: 'Cotação criada com sucesso',
      cotacaoId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// PUT /api/cotacoes/:id - Atualizar cotação
router.put('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar se a cotação existe e seu status atual
    const [cotacoes] = await connection.execute(`
      SELECT id, status FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];
    
    // Verificar se a cotação pode ser editada (apenas pendente ou renegociacao)
    if (cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao') {
      await connection.rollback();
      return res.status(403).json({ 
        message: `Não é possível editar uma cotação com status "${cotacao.status}". Apenas cotações pendentes ou em renegociação podem ser editadas.` 
      });
    }

    const { 
      comprador, 
      localEntrega, 
      tipoCompra, 
      motivoEmergencial, 
      justificativa, 
      motivoFinal,
      status, 
      fornecedores 
    } = req.body;



    // Atualizar dados básicos da cotação
    const cotacaoParams = [
      comprador || '', 
      localEntrega || '', 
      tipoCompra || '', 
      motivoEmergencial || '',
      justificativa || '', 
      motivoFinal || '',
      status || null,
      req.params.id
    ];

    // Verificar se algum parâmetro é undefined
    const undefinedCotacaoParams = cotacaoParams.map((param, index) => ({ param, index })).filter(({ param }) => param === undefined);
    if (undefinedCotacaoParams.length > 0) {
      console.error('Parâmetros undefined na query de cotação:', undefinedCotacaoParams);
      console.error('Todos os parâmetros da cotação:', cotacaoParams);
      throw new Error('Parâmetros undefined na atualização da cotação');
    }

    await connection.execute(`
      UPDATE cotacoes SET 
        comprador = ?, 
        local_entrega = ?, 
        tipo_compra = ?, 
        motivo_emergencial = ?, 
        justificativa = ?, 
        motivo_final = ?,
        status = COALESCE(?, status),
        data_atualizacao = NOW()
      WHERE id = ?
    `, cotacaoParams);

    // Processar fornecedores
    if (fornecedores) {
      for (const fornecedor of fornecedores) {
        // Verificar se é um fornecedor novo (sem ID numérico) ou existente
        const isNewFornecedor = !fornecedor.id || fornecedor.id.toString().startsWith('forn_');
        
        let fornecedorDbId;
        
        if (isNewFornecedor) {
          // Inserir novo fornecedor
          const [fornecedorResult] = await connection.execute(`
            INSERT INTO fornecedores (
              cotacao_id, fornecedor_id, nome, tipo_frete, valor_frete, prazo_pagamento, frete
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            req.params.id, 
            fornecedor.id || null, 
            fornecedor.nome || '',
            fornecedor.tipoFrete || null, 
            fornecedor.valorFrete || 0,
            fornecedor.prazoPagamento || null, 
            fornecedor.frete || null
          ]);
          
          fornecedorDbId = fornecedorResult.insertId;
          
          // Inserir produtos do novo fornecedor
          for (const produto of fornecedor.produtos) {
            const produtoSanitizado = sanitizeProdutoData(produto);
            
            await connection.execute(`
              INSERT INTO produtos_fornecedores (
                fornecedor_id, produto_id, nome, qtde, un, prazo_entrega,
                ult_valor_aprovado, ult_fornecedor_aprovado, valor_anterior,
                valor_unitario, primeiro_valor, difal, ipi, data_entrega_fn, total
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              fornecedorDbId, 
              produtoSanitizado.id, 
              produtoSanitizado.nome, 
              produtoSanitizado.qtde,
              produtoSanitizado.un, 
              produtoSanitizado.prazoEntrega, 
              produtoSanitizado.ultValorAprovado,
              produtoSanitizado.ultFornecedorAprovado, 
              produtoSanitizado.valorAnterior,
              produtoSanitizado.valorUnitario, 
              produtoSanitizado.valorUnitario > 0 ? produtoSanitizado.valorUnitario : 0,
              produtoSanitizado.difal, 
              produtoSanitizado.ipi,
              produtoSanitizado.dataEntregaFn, 
              produtoSanitizado.total
            ]);
          }
        } else {
          // Atualizar fornecedor existente
          await connection.execute(`
            UPDATE fornecedores SET
              nome = ?,
              tipo_frete = ?,
              valor_frete = ?,
              prazo_pagamento = ?,
              frete = ?
            WHERE id = ?
          `, [
            fornecedor.nome || '',
            fornecedor.tipoFrete || null,
            fornecedor.valorFrete || 0,
            fornecedor.prazoPagamento || null,
            fornecedor.frete || null,
            fornecedor.id
          ]);
          
          fornecedorDbId = fornecedor.id;
        }
        
        // Atualizar produtos do fornecedor (apenas para fornecedores existentes)
        if (!isNewFornecedor) {
          for (const produto of fornecedor.produtos) {
            // Garantir que nenhum campo seja undefined
            const produtoSanitizado = sanitizeProdutoData(produto);
            
            // Usar o ID da tabela produtos_fornecedores, não o produto_id
            const produtoFornecedorId = produto.id;

            // Garantir que todos os parâmetros sejam válidos antes da query
            const valorUnitario = produtoSanitizado.valorUnitario !== undefined ? produtoSanitizado.valorUnitario : 0;
            const prazoEntrega = produtoSanitizado.prazoEntrega !== undefined ? produtoSanitizado.prazoEntrega : null;
            const dataEntregaFn = produtoSanitizado.dataEntregaFn !== undefined ? produtoSanitizado.dataEntregaFn : null;
            const total = produtoSanitizado.total !== undefined ? produtoSanitizado.total : 0;



            // Verificar se produtoFornecedorId é válido
            if (!produtoFornecedorId) {
              console.error('Produto Fornecedor ID é undefined ou null:', produtoFornecedorId);
              continue; // Pular este produto se não tiver ID válido
            }

            // Verificar se todos os parâmetros são válidos
            const params = [
              valorUnitario, // Para comparação
              valorUnitario, // Novo valor unitário
              valorUnitario, // Para verificar se > 0
              valorUnitario, // Para primeiro_valor (apenas se for > 0)
              prazoEntrega, 
              dataEntregaFn, 
              total,
              produtoFornecedorId
            ];

            // Verificar se algum parâmetro é undefined
            const undefinedParams = params.map((param, index) => ({ param, index })).filter(({ param }) => param === undefined);
            if (undefinedParams.length > 0) {
              console.error('Parâmetros undefined encontrados:', undefinedParams);
              console.error('Todos os parâmetros:', params);
              continue; // Pular este produto se houver parâmetros undefined
            }

            // Query usando ID da tabela produtos_fornecedores
            await connection.execute(`
              UPDATE produtos_fornecedores SET
                valor_anterior = CASE 
                  WHEN valor_unitario != ? AND valor_unitario > 0 THEN valor_unitario 
                  ELSE valor_anterior 
                END,
                valor_unitario = ?, 
                primeiro_valor = CASE 
                  WHEN (primeiro_valor IS NULL OR primeiro_valor = 0) AND ? > 0 THEN ? 
                  ELSE primeiro_valor 
                END,
                prazo_entrega = ?, 
                data_entrega_fn = ?,
                total = ?
              WHERE id = ?
            `, params);
          }
        }
      }
    }

    await connection.commit();
    
    res.json({ message: 'Cotação atualizada com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// DELETE /api/cotacoes/:id - Excluir cotação
router.delete('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Excluir produtos dos fornecedores
    await connection.execute(`
      DELETE pf FROM produtos_fornecedores pf
      INNER JOIN fornecedores f ON pf.fornecedor_id = f.id
      WHERE f.cotacao_id = ?
    `, [req.params.id]);

    // Excluir fornecedores
    await connection.execute(`
      DELETE FROM fornecedores WHERE cotacao_id = ?
    `, [req.params.id]);

    // Excluir produtos
    await connection.execute(`
      DELETE FROM produtos WHERE cotacao_id = ?
    `, [req.params.id]);

    // Excluir cotação
    await connection.execute(`
      DELETE FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    await connection.commit();
    
    res.json({ message: 'Cotação excluída com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// GET /api/cotacoes/stats/overview - Estatísticas gerais
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_cotacoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as cotacoes_pendentes,
        COUNT(CASE WHEN status = 'em_analise' THEN 1 END) as cotacoes_em_analise,
        COUNT(CASE WHEN status = 'aprovada' THEN 1 END) as cotacoes_aprovadas,
        COUNT(CASE WHEN status = 'rejeitada' THEN 1 END) as cotacoes_rejeitadas,
        SUM(total_produtos) as total_produtos,
        SUM(total_quantidade) as total_quantidade,
        SUM(total_fornecedores) as total_fornecedores
      FROM cotacoes
      WHERE comprador = ?
    `, [req.user.name]);

    await connection.release();
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/cotacoes/:id/analise-supervisor - Enviar análise do supervisor
router.post('/:id/analise-supervisor', authenticateToken, async (req, res) => {
  console.log('🔍 Análise supervisor - Dados recebidos:', {
    cotacaoId: req.params.id,
    body: req.body,
    user: req.user
  });

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { observacoes, decisao, justificativa, supervisorId, dataAnalise } = req.body;

    // Verificar se a cotação existe
    const [cotacoes] = await connection.execute(`
      SELECT id, status FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    // Atualizar status da cotação
    let novoStatus = 'pendente';
    if (decisao === 'enviar_gestor') {
      novoStatus = 'aguardando_aprovacao';
    } else if (decisao === 'renegociacao') {
      novoStatus = 'renegociacao';
    }

    // Salvar justificativa e atualizar status
    await connection.execute(`
      UPDATE cotacoes SET 
        status = ?,
        justificativa = ?,
        data_atualizacao = NOW()
      WHERE id = ?
    `, [novoStatus, justificativa || observacoes, req.params.id]);

    // Se a decisão for renegociação, salvar os produtos selecionados
    if (decisao === 'renegociacao' && req.body.produtosSelecionados && req.body.produtosSelecionados.length > 0) {
      // Limpar produtos anteriores em renegociação
      await connection.execute(`
        DELETE FROM produtos_renegociacao WHERE cotacao_id = ?
      `, [req.params.id]);

      // Inserir novos produtos em renegociação
      for (const produto of req.body.produtosSelecionados) {
        console.log('🔍 Produto para renegociação:', produto);
        
        // Garantir que todos os campos tenham valores válidos
        const produtoId = produto.produto_id || produto.id || null;
        const produtoNome = produto.produto_nome || produto.nome || 'Produto sem nome';
        const fornecedorNome = produto.fornecedor_nome || produto.fornecedor || 'Fornecedor não informado';
        const motivo = justificativa || observacoes || 'Renegociação solicitada';
        
        await connection.execute(`
          INSERT INTO produtos_renegociacao (
            cotacao_id, produto_id, produto_nome, fornecedor_nome, motivo
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          req.params.id,
          produtoId,
          produtoNome,
          fornecedorNome,
          motivo
        ]);
      }
    }

    // Inserir análise do supervisor (se houver tabela para isso)
    // Por enquanto, vamos apenas atualizar o status

    await connection.commit();
    
    res.json({ 
      message: 'Análise do supervisor enviada com sucesso',
      status: novoStatus
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao enviar análise do supervisor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// POST /api/cotacoes/:id/enviar-supervisor - Enviar cotação para análise do supervisor
router.post('/:id/enviar-supervisor', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar se a cotação existe e está pendente
    const [cotacoes] = await connection.execute(`
      SELECT id, status FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];
    
    if (cotacao.status !== 'pendente' && cotacao.status !== 'renegociacao') {
      await connection.rollback();
      return res.status(400).json({ message: 'Apenas cotações pendentes ou em renegociação podem ser enviadas para análise' });
    }

    // Limpar produtos em renegociação se existirem
    await connection.execute(`
      DELETE FROM produtos_renegociacao WHERE cotacao_id = ?
    `, [req.params.id]);

    // Atualizar status para em_analise
    await connection.execute(`
      UPDATE cotacoes SET 
        status = 'em_analise',
        data_atualizacao = NOW()
      WHERE id = ?
    `, [req.params.id]);

    await connection.commit();
    
    res.json({ 
      message: 'Cotação enviada para análise do supervisor com sucesso',
      status: 'em_analise'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao enviar cotação para supervisor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// POST /api/cotacoes/:id/aprovar - Aprovar cotação
router.post('/:id/aprovar', authenticateToken, async (req, res) => {
  console.log('🔍 Aprovação - Dados recebidos:', {
    cotacaoId: req.params.id,
    body: req.body,
    user: req.user
  });

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { motivo } = req.body;

    // Verificar se a cotação existe
    const [cotacoes] = await connection.execute(`
      SELECT id, status, comprador, tipo_compra, motivo_emergencial, local_entrega FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];
    
    if (cotacao.status !== 'aguardando_aprovacao') {
      await connection.rollback();
      return res.status(400).json({ message: 'Apenas cotações aguardando aprovação podem ser aprovadas' });
    }

    // Atualizar status da cotação
    await connection.execute(`
      UPDATE cotacoes SET 
        status = 'aprovado',
        justificativa = ?,
        data_aprovacao = NOW(),
        data_atualizacao = NOW()
      WHERE id = ?
    `, [motivo || 'Aprovado pelo gestor', req.params.id]);

    // Criar registro de Saving
    await criarRegistroSaving(connection, req.params.id, req.user.id, cotacao, motivo);

    await connection.commit();
    
    res.json({ 
      message: 'Cotação aprovada com sucesso',
      status: 'aprovado'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao aprovar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// POST /api/cotacoes/:id/rejeitar - Rejeitar cotação
router.post('/:id/rejeitar', authenticateToken, async (req, res) => {
  console.log('🔍 Rejeição - Dados recebidos:', {
    cotacaoId: req.params.id,
    body: req.body,
    user: req.user
  });

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { motivo } = req.body;

    // Verificar se a cotação existe
    const [cotacoes] = await connection.execute(`
      SELECT id, status FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];
    
    if (cotacao.status !== 'aguardando_aprovacao') {
      await connection.rollback();
      return res.status(400).json({ message: 'Apenas cotações aguardando aprovação podem ser rejeitadas' });
    }

    // Atualizar status da cotação
    await connection.execute(`
      UPDATE cotacoes SET 
        status = 'rejeitado',
        justificativa = ?,
        data_atualizacao = NOW()
      WHERE id = ?
    `, [motivo || 'Rejeitado pelo gestor', req.params.id]);

    await connection.commit();
    
    res.json({ 
      message: 'Cotação rejeitada com sucesso',
      status: 'rejeitado'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao rejeitar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// POST /api/cotacoes/:id/renegociar - Renegociar cotação
router.post('/:id/renegociar', authenticateToken, async (req, res) => {
  console.log('🔍 Renegociação - Dados recebidos:', {
    cotacaoId: req.params.id,
    body: req.body,
    user: req.user
  });

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { motivo } = req.body;

    // Verificar se a cotação existe
    const [cotacoes] = await connection.execute(`
      SELECT id, status FROM cotacoes WHERE id = ?
    `, [req.params.id]);

    if (cotacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Cotação não encontrada' });
    }

    const cotacao = cotacoes[0];
    
    if (cotacao.status !== 'aguardando_aprovacao') {
      await connection.rollback();
      return res.status(400).json({ message: 'Apenas cotações aguardando aprovação podem ser renegociadas' });
    }

    // Atualizar status da cotação
    await connection.execute(`
      UPDATE cotacoes SET 
        status = 'renegociacao',
        justificativa = ?,
        data_atualizacao = NOW()
      WHERE id = ?
    `, [motivo || 'Renegociação solicitada pelo gestor', req.params.id]);

    await connection.commit();
    
    res.json({ 
      message: 'Cotação enviada para renegociação com sucesso',
      status: 'renegociacao'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao renegociar cotação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  } finally {
    await connection.release();
  }
});

// Função para criar registro de Saving
async function criarRegistroSaving(connection, cotacaoId, usuarioId, cotacao, motivo) {
  try {
    // Buscar todos os produtos da cotação aprovada
    const [fornecedores] = await connection.execute(`
      SELECT * FROM fornecedores WHERE cotacao_id = ?
    `, [cotacaoId]);

    let valorTotalInicial = 0;
    let valorTotalFinal = 0;
    let rodadas = 1;

    // Calcular valores totais e buscar produtos
    for (const fornecedor of fornecedores) {
      const [produtos] = await connection.execute(`
        SELECT 
          id,
          nome,
          qtde,
          valor_anterior,
          valor_unitario,
          primeiro_valor,
          prazo_entrega,
          data_entrega_fn
        FROM produtos_fornecedores 
        WHERE fornecedor_id = ?
      `, [fornecedor.id]);

      for (const produto of produtos) {
        const quantidade = parseFloat(produto.qtde) || 0;
        const valorInicial = parseFloat(produto.primeiro_valor) || 0;
        const valorFinal = parseFloat(produto.valor_unitario) || 0;

        valorTotalInicial += quantidade * valorInicial;
        valorTotalFinal += quantidade * valorFinal;
      }
    }

    // Calcular economia
    const economia = valorTotalInicial - valorTotalFinal;
    const economiaPercentual = valorTotalInicial > 0 ? (economia / valorTotalInicial * 100) : 0;

    // Buscar ID do usuário comprador
    const [usuarios] = await connection.execute(`
      SELECT id FROM users WHERE name = ?
    `, [cotacao.comprador]);

    const compradorId = usuarios.length > 0 ? usuarios[0].id : usuarioId;

    // Inserir registro na tabela saving
    const [savingResult] = await connection.execute(`
      INSERT INTO saving (
        cotacao_id, 
        usuario_id, 
        data_registro, 
        data_aprovacao,
        valor_total_inicial, 
        valor_total_final, 
        economia, 
        economia_percentual, 
        rodadas, 
        status, 
        observacoes,
        tipo,
        motivo_emergencial,
        centro_distribuicao
      ) VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, 'concluido', ?, ?, ?, ?)
    `, [
      cotacaoId,
      compradorId,
      valorTotalInicial,
      valorTotalFinal,
      economia,
      economiaPercentual,
      rodadas,
      `Cotação aprovada: ${motivo || 'Sem motivo informado'}`,
      cotacao.tipo_compra || 'programada',
      cotacao.motivo_emergencial || null,
      cotacao.local_entrega || 'CD CHAPECO'
    ]);

    const savingId = savingResult.insertId;

    // Inserir itens na tabela saving_itens
    for (const fornecedor of fornecedores) {
      const [produtos] = await connection.execute(`
        SELECT 
          id,
          nome,
          qtde,
          valor_anterior,
          valor_unitario,
          primeiro_valor,
          prazo_entrega,
          data_entrega_fn
        FROM produtos_fornecedores 
        WHERE fornecedor_id = ?
      `, [fornecedor.id]);

      for (const produto of produtos) {
        const quantidade = parseFloat(produto.qtde) || 0;
        const valorInicial = parseFloat(produto.primeiro_valor) || 0;
        const valorFinal = parseFloat(produto.valor_unitario) || 0;
        
        const economiaItem = (valorInicial - valorFinal) * quantidade;
        const economiaPercentualItem = valorInicial > 0 ? ((valorInicial - valorFinal) / valorInicial * 100) : 0;

        await connection.execute(`
          INSERT INTO saving_itens (
            saving_id, 
            item_id, 
            descricao,
            fornecedor,
            valor_unitario_inicial, 
            valor_unitario_final, 
            economia, 
            economia_percentual, 
            quantidade,
            prazo_entrega,
            data_entrega_fn
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          savingId,
          produto.id,
          produto.nome,
          fornecedor.nome,
          valorInicial,
          valorFinal,
          economiaItem,
          economiaPercentualItem,
          quantidade,
          produto.prazo_entrega,
          produto.data_entrega_fn
        ]);
      }
    }

    console.log(`✅ Registro de Saving criado para cotação #${cotacaoId}`);
  } catch (error) {
    console.error('❌ Erro ao criar registro de Saving:', error);
    throw error;
  }
}

module.exports = router; 