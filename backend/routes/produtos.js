const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Listar produtos
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome,
             c.nome as classe_nome, m.marca as marca_nome, m.fabricante as fabricante_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.codigo_barras LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.nome ASC';

    const produtos = await executeQuery(query, params);

    res.json(produtos);

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const produtos = await executeQuery(
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome,
              c.nome as classe_nome, m.marca as marca_nome, m.fabricante as fabricante_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       WHERE p.id = ?`,
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produtos[0]);

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar produto
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'produtos'),
  body('codigo_produto').optional().isLength({ min: 1, max: 10 }).withMessage('Código do produto deve ter entre 1 e 10 caracteres'),
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('codigo_barras').optional().isLength({ min: 8, max: 50 }).withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
  body('preco_custo').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser um número positivo'),
  body('preco_venda').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser um número positivo'),
  body('estoque_atual').optional().isInt({ min: 0 }).withMessage('Estoque atual deve ser um número inteiro positivo'),
  body('estoque_minimo').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo'),
  body('quantidade').optional().isFloat({ min: 0 }).withMessage('Quantidade deve ser um número positivo'),
  body('peso_liquido').optional().isFloat({ min: 0 }).withMessage('Peso líquido deve ser um número positivo'),
  body('peso_bruto').optional().isFloat({ min: 0 }).withMessage('Peso bruto deve ser um número positivo'),
  body('comprimento').optional().isFloat({ min: 0 }).withMessage('Comprimento deve ser um número positivo'),
  body('largura').optional().isFloat({ min: 0 }).withMessage('Largura deve ser um número positivo'),
  body('altura').optional().isFloat({ min: 0 }).withMessage('Altura deve ser um número positivo'),
  body('volume').optional().isFloat({ min: 0 }).withMessage('Volume deve ser um número positivo'),
  body('aliquota_icms').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota ICMS deve ser entre 0 e 100'),
  body('aliquota_ipi').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota IPI deve ser entre 0 e 100'),
  body('aliquota_pis').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota PIS deve ser entre 0 e 100'),
  body('aliquota_cofins').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota COFINS deve ser entre 0 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const {
      codigo_produto, nome, descricao, codigo_barras, referencia, referencia_externa, referencia_mercado,
      unidade_id, quantidade, grupo_id, subgrupo_id, classe_id, marca_id, agrupamento_n3, agrupamento_n4,
      peso_liquido, peso_bruto, marca, fabricante, informacoes_adicionais, prazo_validade, unidade_validade,
      regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, altura, volume,
      integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, aliquota_icms, aliquota_ipi, aliquota_pis,
      aliquota_cofins, preco_custo, preco_venda, estoque_atual, estoque_minimo, fornecedor_id, status
    } = req.body;

    // Verificar se código do produto já existe
    if (codigo_produto) {
      const existingProduto = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_produto = ?',
        [codigo_produto]
      );

      if (existingProduto.length > 0) {
        return res.status(400).json({ error: 'Código do produto já cadastrado' });
      }
    }

    // Verificar se código de barras já existe
    if (codigo_barras) {
      const existingProduto = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_barras = ?',
        [codigo_barras]
      );

      if (existingProduto.length > 0) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
    }

    // Inserir produto
    const result = await executeQuery(
      `INSERT INTO produtos (
        codigo_produto, nome, descricao, codigo_barras, referencia, referencia_externa, referencia_mercado,
        unidade_id, quantidade, grupo_id, subgrupo_id, classe_id, marca_id, agrupamento_n3, agrupamento_n4,
        peso_liquido, peso_bruto, marca, fabricante, informacoes_adicionais, prazo_validade, unidade_validade,
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, altura, volume,
        integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, aliquota_icms, aliquota_ipi, aliquota_pis,
        aliquota_cofins, preco_custo, preco_venda, estoque_atual, estoque_minimo, fornecedor_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_produto, nome, descricao, codigo_barras, referencia, referencia_externa, referencia_mercado,
        unidade_id, quantidade, grupo_id, subgrupo_id, classe_id, marca_id, agrupamento_n3, agrupamento_n4,
        peso_liquido, peso_bruto, marca, fabricante, informacoes_adicionais, prazo_validade, unidade_validade,
        regra_palet_un, ficha_homologacao, registro_especifico, comprimento, largura, altura, volume,
        integracao_senior, ncm, cest, cfop, ean, cst_icms, csosn, aliquota_icms, aliquota_ipi, aliquota_pis,
        aliquota_cofins, preco_custo, preco_venda, estoque_atual, estoque_minimo, fornecedor_id, status
      ]
    );

    const newProduto = await executeQuery(
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome,
              c.nome as classe_nome, m.marca as marca_nome, m.fabricante as fabricante_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN classes c ON p.classe_id = c.id
       LEFT JOIN marcas m ON p.marca_id = m.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Produto criado com sucesso',
      produto: newProduto[0]
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'produtos'),
  body('codigo_produto').optional().isLength({ min: 1, max: 10 }).withMessage('Código do produto deve ter entre 1 e 10 caracteres'),
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('codigo_barras').optional().isLength({ min: 8, max: 50 }).withMessage('Código de barras deve ter entre 8 e 50 caracteres'),
  body('preco_custo').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser um número positivo'),
  body('preco_venda').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser um número positivo'),
  body('estoque_atual').optional().isInt({ min: 0 }).withMessage('Estoque atual deve ser um número inteiro positivo'),
  body('estoque_minimo').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo'),
  body('quantidade').optional().isFloat({ min: 0 }).withMessage('Quantidade deve ser um número positivo'),
  body('peso_liquido').optional().isFloat({ min: 0 }).withMessage('Peso líquido deve ser um número positivo'),
  body('peso_bruto').optional().isFloat({ min: 0 }).withMessage('Peso bruto deve ser um número positivo'),
  body('comprimento').optional().isFloat({ min: 0 }).withMessage('Comprimento deve ser um número positivo'),
  body('largura').optional().isFloat({ min: 0 }).withMessage('Largura deve ser um número positivo'),
  body('altura').optional().isFloat({ min: 0 }).withMessage('Altura deve ser um número positivo'),
  body('volume').optional().isFloat({ min: 0 }).withMessage('Volume deve ser um número positivo'),
  body('aliquota_icms').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota ICMS deve ser entre 0 e 100'),
  body('aliquota_ipi').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota IPI deve ser entre 0 e 100'),
  body('aliquota_pis').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota PIS deve ser entre 0 e 100'),
  body('aliquota_cofins').optional().isFloat({ min: 0, max: 100 }).withMessage('Alíquota COFINS deve ser entre 0 e 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verificar se código do produto já existe (se estiver sendo alterado)
    if (updateData.codigo_produto) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_produto = ? AND id != ?',
        [updateData.codigo_produto, id]
      );

      if (codigoCheck.length > 0) {
        return res.status(400).json({ error: 'Código do produto já cadastrado' });
      }
    }

    // Verificar se código de barras já existe (se estiver sendo alterado)
    if (updateData.codigo_barras) {
      const codigoCheck = await executeQuery(
        'SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?',
        [updateData.codigo_barras, id]
      );

      if (codigoCheck.length > 0) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateParams.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE produtos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar produto atualizado
    const updatedProduto = await executeQuery(
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.id_fornecedor = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({
      message: 'Produto atualizado com sucesso',
      produto: updatedProduto[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir produto
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'produtos')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se produto existe
    const existingProduto = await executeQuery(
      'SELECT id FROM produtos WHERE id = ?',
      [id]
    );

    if (existingProduto.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await executeQuery('DELETE FROM produtos WHERE id = ?', [id]);

    res.json({ message: 'Produto excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 