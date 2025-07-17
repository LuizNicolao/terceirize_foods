const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { auditMiddleware, auditChangesMiddleware, AUDIT_ACTIONS } = require('../utils/audit');
const axios = require('axios');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Buscar dados do CNPJ
router.get('/buscar-cnpj/:cnpj', checkPermission('visualizar'), async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    // Limpar CNPJ (remover pontos, traços e barras)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
    }

    // Tentar buscar dados do CNPJ usando API mais estável
    let dadosCNPJ = null;
    
    try {
      // Usar Brasil API que é mais confiável
      const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.data && response.data.razao_social) {
        dadosCNPJ = {
          razao_social: response.data.razao_social,
          nome_fantasia: response.data.nome_fantasia,
          logradouro: response.data.logradouro,
          numero: response.data.numero,
          bairro: response.data.bairro,
          municipio: response.data.municipio,
          uf: response.data.uf,
          cep: response.data.cep,
          telefone: response.data.ddd_telefone_1 ? `${response.data.ddd_telefone_1}${response.data.telefone_1}` : null,
          email: response.data.email
        };
      }
    } catch (error) {
      console.log('Erro ao buscar CNPJ na API externa:', error.message);
      
      // Se a API externa falhar, retornar erro específico
      return res.status(503).json({
        success: false,
        error: 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.',
        details: 'As APIs externas estão com problemas de conectividade.'
      });
    }

    if (dadosCNPJ) {
      res.json({
        success: true,
        data: dadosCNPJ
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'CNPJ não encontrado ou dados indisponíveis'
      });
    }

  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Listar fornecedores
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;

    let query = `
      SELECT id, cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
             bairro, municipio, uf, email, telefone, status, criado_em, atualizado_em 
      FROM fornecedores 
      WHERE 1=1
    `;
    let params = [];

    if (search) {
      query += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY razao_social ASC';

    const fornecedores = await executeQuery(query, params);

    res.json(fornecedores);

  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fornecedor por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedores = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    if (fornecedores.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json(fornecedores[0]);

  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar fornecedor
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'fornecedores'),
  body('cnpj').custom((value) => {
    const cnpjLimpo = value.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }
    return true;
  }).withMessage('CNPJ inválido'),
  body('razao_social').trim().isLength({ min: 3 }).withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('email').optional().trim().isEmail().withMessage('Email inválido'),
  body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres'),
  body('status').optional().isIn(['0', '1']).withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erros de validação:', errors.array());
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: errors.array() 
      });
    }

    console.log('Dados recebidos para criação:', req.body);

    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, cep,
      bairro, municipio, uf, email, telefone, status
    } = req.body;

    // Verificar se CNPJ já existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE cnpj = ?',
      [cnpj]
    );

    if (existingFornecedor.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    // Inserir fornecedor
    const result = await executeQuery(
      `INSERT INTO fornecedores (cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
                                bairro, municipio, uf, email, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cnpj, razao_social, nome_fantasia, logradouro, numero, cep, 
       bairro, municipio, uf, email, telefone, status || 1]
    );

    const newFornecedor = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Fornecedor criado com sucesso',
      fornecedor: newFornecedor[0]
    });

  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar fornecedor
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'fornecedores'),
  body('cnpj').optional().custom((value) => {
    if (value) {
      const cnpjLimpo = value.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }
    }
    return true;
  }).withMessage('CNPJ inválido'),
  body('razao_social').optional().isLength({ min: 3 }).withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres')
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
    const {
      cnpj, razao_social, nome_fantasia, logradouro, numero, cep,
      bairro, municipio, uf, email, telefone, status
    } = req.body;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (cnpj) {
      const cnpjCheck = await executeQuery(
        'SELECT id FROM fornecedores WHERE cnpj = ? AND id != ?',
        [cnpj, id]
      );

      if (cnpjCheck.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }

    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];

    if (cnpj) {
      updateFields.push('cnpj = ?');
      updateParams.push(cnpj);
    }
    if (razao_social) {
      updateFields.push('razao_social = ?');
      updateParams.push(razao_social);
    }
    if (nome_fantasia !== undefined) {
      updateFields.push('nome_fantasia = ?');
      updateParams.push(nome_fantasia);
    }
    if (logradouro !== undefined) {
      updateFields.push('logradouro = ?');
      updateParams.push(logradouro);
    }
    if (numero !== undefined) {
      updateFields.push('numero = ?');
      updateParams.push(numero);
    }
    if (cep !== undefined) {
      updateFields.push('cep = ?');
      updateParams.push(cep);
    }
    if (bairro !== undefined) {
      updateFields.push('bairro = ?');
      updateParams.push(bairro);
    }
    if (municipio !== undefined) {
      updateFields.push('municipio = ?');
      updateParams.push(municipio);
    }
    if (uf) {
      updateFields.push('uf = ?');
      updateParams.push(uf);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (telefone !== undefined) {
      updateFields.push('telefone = ?');
      updateParams.push(telefone);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updateParams.push(id);
    await executeQuery(
      `UPDATE fornecedores SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // Buscar fornecedor atualizado
    const updatedFornecedor = await executeQuery(
      'SELECT * FROM fornecedores WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Fornecedor atualizado com sucesso',
      fornecedor: updatedFornecedor[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir fornecedor
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'fornecedores')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se fornecedor existe
    const existingFornecedor = await executeQuery(
      'SELECT id FROM fornecedores WHERE id = ?',
      [id]
    );

    if (existingFornecedor.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // Verificar se há produtos vinculados
    const produtosVinculados = await executeQuery(
      'SELECT id FROM produtos WHERE id_fornecedor = ?',
      [id]
    );

    if (produtosVinculados.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir fornecedor com produtos vinculados' 
      });
    }

    await executeQuery('DELETE FROM fornecedores WHERE id = ?', [id]);

    res.json({ message: 'Fornecedor excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 