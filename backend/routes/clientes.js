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
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ error: 'CNPJ deve ter 14 dígitos' });
    }
    let dadosCNPJ = null;
    try {
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
          telefone: (() => {
            let telefone = null;
            if (response.data.ddd_telefone_1 && response.data.telefone_1) {
              telefone = `${response.data.ddd_telefone_1}${response.data.telefone_1}`;
            } else if (response.data.telefone) {
              telefone = response.data.telefone;
            } else if (response.data.ddd_telefone_1) {
              telefone = response.data.ddd_telefone_1;
            }
            if (telefone) {
              telefone = telefone.toString().replace(/undefined/g, '');
              telefone = telefone.replace(/\D/g, '');
              return telefone.length >= 10 ? telefone : null;
            }
            return null;
          })(),
          email: response.data.email
        };
      }
    } catch (error) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de consulta CNPJ temporariamente indisponível. Tente novamente em alguns minutos.',
        details: 'As APIs externas estão com problemas de conectividade.'
      });
    }
    if (dadosCNPJ) {
      res.json({ success: true, data: dadosCNPJ });
    } else {
      res.status(404).json({ success: false, error: 'CNPJ não encontrado ou dados indisponíveis' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Listar clientes
router.get('/', checkPermission('visualizar'), async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = `SELECT id, cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status, criado_em, atualizado_em FROM clientes WHERE 1=1`;
    let params = [];
    if (search) {
      query += ' AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY razao_social ASC';
    const clientes = await executeQuery(query, params);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar cliente por ID
router.get('/:id', checkPermission('visualizar'), async (req, res) => {
  try {
    const { id } = req.params;
    const clientes = await executeQuery('SELECT * FROM clientes WHERE id = ?', [id]);
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(clientes[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar cliente
router.post('/', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'clientes'),
  body('cnpj').custom((value) => {
    if (!value) throw new Error('CNPJ é obrigatório');
    const cnpjLimpo = value.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) throw new Error('CNPJ deve ter 14 dígitos');
    return true;
  }).withMessage('CNPJ inválido'),
  body('razao_social').custom((value) => {
    if (!value || value.trim().length < 3) throw new Error('Razão social deve ter pelo menos 3 caracteres');
    return true;
  }).withMessage('Razão social deve ter pelo menos 3 caracteres'),
  body('email').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) throw new Error('Email inválido');
    }
    return true;
  }).withMessage('Email inválido'),
  body('uf').optional().isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 caracteres'),
  body('status').optional().custom((value) => {
    if (value !== undefined && value !== null && value !== '') {
      const statusValue = value.toString();
      if (!['0', '1'].includes(statusValue)) throw new Error('Status deve ser 0 (Inativo) ou 1 (Ativo)');
    }
    return true;
  }).withMessage('Status deve ser 0 (Inativo) ou 1 (Ativo)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    const { cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status } = req.body;
    // Verificar se CNPJ já existe
    const existingCliente = await executeQuery('SELECT id FROM clientes WHERE cnpj = ?', [cnpj]);
    if (existingCliente.length > 0) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    // Inserir cliente
    const result = await executeQuery(
      `INSERT INTO clientes (cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status || 1]
    );
    const newCliente = await executeQuery('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Cliente criado com sucesso', cliente: newCliente[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar cliente
router.put('/:id', [
  checkPermission('editar'),
  auditChangesMiddleware(AUDIT_ACTIONS.UPDATE, 'clientes'),
  body('cnpj').optional().custom((value) => {
    if (value) {
      const cnpjLimpo = value.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) throw new Error('CNPJ deve ter 14 dígitos');
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
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    const { id } = req.params;
    const { cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status } = req.body;
    // Verificar se cliente existe
    const existingCliente = await executeQuery('SELECT id FROM clientes WHERE id = ?', [id]);
    if (existingCliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    // Verificar se CNPJ já existe (se estiver sendo alterado)
    if (cnpj) {
      const cnpjCheck = await executeQuery('SELECT id FROM clientes WHERE cnpj = ? AND id != ?', [cnpj, id]);
      if (cnpjCheck.length > 0) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }
    // Construir query de atualização
    const updateFields = [];
    const updateParams = [];
    if (cnpj) { updateFields.push('cnpj = ?'); updateParams.push(cnpj); }
    if (razao_social) { updateFields.push('razao_social = ?'); updateParams.push(razao_social); }
    if (nome_fantasia !== undefined) { updateFields.push('nome_fantasia = ?'); updateParams.push(nome_fantasia); }
    if (logradouro !== undefined) { updateFields.push('logradouro = ?'); updateParams.push(logradouro); }
    if (numero !== undefined) { updateFields.push('numero = ?'); updateParams.push(numero); }
    if (cep !== undefined) { updateFields.push('cep = ?'); updateParams.push(cep); }
    if (bairro !== undefined) { updateFields.push('bairro = ?'); updateParams.push(bairro); }
    if (municipio !== undefined) { updateFields.push('municipio = ?'); updateParams.push(municipio); }
    if (uf) { updateFields.push('uf = ?'); updateParams.push(uf); }
    if (email !== undefined) { updateFields.push('email = ?'); updateParams.push(email); }
    if (telefone !== undefined) { updateFields.push('telefone = ?'); updateParams.push(telefone); }
    if (status !== undefined) { updateFields.push('status = ?'); updateParams.push(status); }
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    updateParams.push(id);
    await executeQuery(`UPDATE clientes SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    const updatedCliente = await executeQuery('SELECT * FROM clientes WHERE id = ?', [id]);
    res.json({ message: 'Cliente atualizado com sucesso', cliente: updatedCliente[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir cliente
router.delete('/:id', [
  checkPermission('excluir'),
  auditMiddleware(AUDIT_ACTIONS.DELETE, 'clientes')
], async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar se cliente existe
    const existingCliente = await executeQuery('SELECT id FROM clientes WHERE id = ?', [id]);
    if (existingCliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    await executeQuery('DELETE FROM clientes WHERE id = ?', [id]);
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Importar clientes via Excel
router.post('/importar', [
  checkPermission('criar'),
  auditMiddleware(AUDIT_ACTIONS.CREATE, 'clientes')
], async (req, res) => {
  try {
    const { dados } = req.body;
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      return res.status(400).json({ error: 'Dados inválidos para importação' });
    }
    const resultados = { sucessos: 0, erros: 0, detalhes: [] };
    for (let i = 0; i < dados.length; i++) {
      const linha = dados[i];
      const numeroLinha = i + 2;
      try {
        const cliente = {
          cnpj: linha.CNPJ || linha.cnpj || '',
          razao_social: linha['RAZAO SOCIAL'] || linha['razao_social'] || linha['RAZÃO SOCIAL'] || '',
          nome_fantasia: linha['NOME FANTASIA'] || linha['nome_fantasia'] || '',
          logradouro: linha.LOGRADOURO || linha.logradouro || '',
          numero: linha.NÚMERO || linha.NUMERO || linha.numero || '',
          cep: linha.CEP || linha.cep || '',
          bairro: linha.BAIRRO || linha.bairro || '',
          municipio: linha.MUNICIPIO || linha.municipio || '',
          uf: linha.UF || linha.uf || '',
          email: linha.EMAIL || linha.email || '',
          telefone: linha.TELEFONE || linha.telefone || '',
          status: 1
        };
        if (!cliente.cnpj || cliente.cnpj.trim() === '') throw new Error('CNPJ é obrigatório');
        if (!cliente.razao_social || cliente.razao_social.trim() === '') throw new Error('Razão social é obrigatória');
        const cnpjLimpo = cliente.cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) throw new Error('CNPJ deve ter 14 dígitos');
        const existingCliente = await executeQuery('SELECT id FROM clientes WHERE cnpj = ?', [cnpjLimpo]);
        if (existingCliente.length > 0) throw new Error('CNPJ já cadastrado');
        await executeQuery(
          `INSERT INTO clientes (cnpj, razao_social, nome_fantasia, logradouro, numero, cep, bairro, municipio, uf, email, telefone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [cnpjLimpo, cliente.razao_social, cliente.nome_fantasia, cliente.logradouro, cliente.numero, cliente.cep, cliente.bairro, cliente.municipio, cliente.uf, cliente.email, cliente.telefone, cliente.status]
        );
        resultados.sucessos++;
        resultados.detalhes.push({ linha: numeroLinha, status: 'sucesso', mensagem: 'Cliente importado com sucesso' });
      } catch (error) {
        resultados.erros++;
        resultados.detalhes.push({ linha: numeroLinha, status: 'erro', mensagem: error.message });
      }
    }
    res.json({ message: `Importação concluída. ${resultados.sucessos} sucessos, ${resultados.erros} erros.`, resultados });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 