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
      SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN grupos g ON p.grupo_id = g.id
      LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
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
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
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
  body('nome').isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('preco_custo').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser um número positivo'),
  body('preco_venda').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser um número positivo'),
  body('estoque_atual').optional().isInt({ min: 0 }).withMessage('Estoque atual deve ser um número inteiro positivo'),
  body('estoque_minimo').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo')
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
      nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, estoque_atual, estoque_minimo,
      fornecedor_id, grupo_id, unidade_id, status
    } = req.body;

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
      `INSERT INTO produtos (nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, 
                            estoque_atual, estoque_minimo, fornecedor_id, grupo_id, unidade_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, codigo_barras, fator_conversao, preco_custo, preco_venda, estoque_atual, estoque_minimo, 
       fornecedor_id, grupo_id, unidade_id, status]
    );

    const newProduto = await executeQuery(
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
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
  body('nome').optional().isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('preco_custo').optional().isFloat({ min: 0 }).withMessage('Preço de custo deve ser um número positivo'),
  body('preco_venda').optional().isFloat({ min: 0 }).withMessage('Preço de venda deve ser um número positivo'),
  body('estoque_atual').optional().isInt({ min: 0 }).withMessage('Estoque atual deve ser um número inteiro positivo'),
  body('estoque_minimo').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro positivo')
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
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
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

// Gerar PDF do produto
router.get('/:id/pdf', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados completos do produto
    const produtos = await executeQuery(
      `SELECT p.*, f.razao_social as fornecedor_nome, g.nome as grupo_nome, sg.nome as subgrupo_nome, u.nome as unidade_nome
       FROM produtos p
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN subgrupos sg ON p.subgrupo_id = sg.id
       LEFT JOIN unidades u ON p.unidade_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = produtos[0];

    // Gerar HTML do PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Produto - ${produto.nome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            color: #4CAF50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            font-size: 18px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          .info-value {
            font-size: 14px;
            color: #333;
            word-wrap: break-word;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .status-active {
            color: #4CAF50;
            font-weight: bold;
          }
          .status-inactive {
            color: #f44336;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FICHA TÉCNICA DO PRODUTO</h1>
          <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Hora: ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="section">
          <h2>INFORMAÇÕES BÁSICAS</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nome do Produto</div>
              <div class="info-value">${produto.nome || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Código do Produto</div>
              <div class="info-value">${produto.codigo_produto || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Código de Barras</div>
              <div class="info-value">${produto.codigo_barras || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Grupo</div>
              <div class="info-value">${produto.grupo_nome || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Subgrupo</div>
              <div class="info-value">${produto.subgrupo_nome || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value ${produto.status === 1 ? 'status-active' : 'status-inactive'}">
                ${produto.status === 1 ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>INFORMAÇÕES DO PRODUTO</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Marca</div>
              <div class="info-value">${produto.marca || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fabricante</div>
              <div class="info-value">${produto.fabricante || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Referência Interna</div>
              <div class="info-value">${produto.referencia || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Referência Externa</div>
              <div class="info-value">${produto.referencia_externa || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Referência de Mercado</div>
              <div class="info-value">${produto.referencia_mercado || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Integração Senior</div>
              <div class="info-value">${produto.integracao_senior || 'Não informado'}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Informações Adicionais</div>
              <div class="info-value">${produto.informacoes_adicionais || 'Não informado'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>UNIDADE E DIMENSÕES</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Unidade de Medida</div>
              <div class="info-value">${produto.unidade_nome || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Regra Palet (Unidades)</div>
              <div class="info-value">${produto.regra_palet_un || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peso Líquido (kg)</div>
              <div class="info-value">${produto.peso_liquido || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peso Bruto (kg)</div>
              <div class="info-value">${produto.peso_bruto || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Comprimento (cm)</div>
              <div class="info-value">${produto.comprimento || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Largura (cm)</div>
              <div class="info-value">${produto.largura || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Altura (cm)</div>
              <div class="info-value">${produto.altura || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Volume (cm³)</div>
              <div class="info-value">${produto.volume || 'Não informado'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>TRIBUTAÇÃO</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">CST ICMS</div>
              <div class="info-value">${produto.cst_icms || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CSOSN</div>
              <div class="info-value">${produto.csosn || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Alíquota ICMS (%)</div>
              <div class="info-value">${produto.aliquota_icms || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Alíquota IPI (%)</div>
              <div class="info-value">${produto.aliquota_ipi || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Alíquota PIS (%)</div>
              <div class="info-value">${produto.aliquota_pis || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Alíquota COFINS (%)</div>
              <div class="info-value">${produto.aliquota_cofins || 'Não informado'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>DOCUMENTOS E REGISTROS</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Ficha de Homologação</div>
              <div class="info-value">${produto.ficha_homologacao || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Registro Específico</div>
              <div class="info-value">${produto.registro_especifico || 'Não informado'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Prazo de Validade</div>
              <div class="info-value">${produto.prazo_validade ? `${produto.prazo_validade} ${produto.unidade_validade || ''}` : 'Não informado'}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Sistema de Gestão de Produtos - Terceirize Foods</p>
          <p>Documento gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="produto_${produto.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);

    // Usar puppeteer para gerar PDF (se disponível) ou retornar HTML
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({ 
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      await browser.close();
      res.send(pdf);
    } catch (error) {
      console.log('Puppeteer não disponível, retornando HTML');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }

  } catch (error) {
    console.error('Erro ao gerar PDF do produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 