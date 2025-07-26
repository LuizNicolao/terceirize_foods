const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/motoristas/export/xlsx - Exportar motoristas para XLSX
router.get('/export/xlsx', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        f.filial as filial_nome
      FROM motoristas m
      LEFT JOIN filiais f ON m.filial_id = f.id
      ORDER BY m.nome
    `;
    
    const motoristas = await executeQuery(query);
    
    // Aqui você implementaria a lógica de exportação para XLSX
    // Por enquanto, retornamos um JSON
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=motoristas.xlsx');
    res.json(motoristas);
  } catch (error) {
    console.error('Erro ao exportar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/motoristas/export/pdf - Exportar motoristas para PDF
router.get('/export/pdf', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        f.filial as filial_nome
      FROM motoristas m
      LEFT JOIN filiais f ON m.filial_id = f.id
      ORDER BY m.nome
    `;
    
    const motoristas = await executeQuery(query);
    
    // Aqui você implementaria a lógica de exportação para PDF
    // Por enquanto, retornamos um JSON
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=motoristas.pdf');
    res.json(motoristas);
  } catch (error) {
    console.error('Erro ao exportar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/motoristas - Listar todos os motoristas
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        f.filial as filial_nome
      FROM motoristas m
      LEFT JOIN filiais f ON m.filial_id = f.id
      ORDER BY m.nome
    `;
    
    const motoristas = await executeQuery(query);
    res.json(motoristas);
  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/motoristas/:id - Buscar motorista por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        m.*,
        f.filial as filial_nome
      FROM motoristas m
      LEFT JOIN filiais f ON m.filial_id = f.id
      WHERE m.id = ?
    `;
    
    const motoristas = await executeQuery(query, [id]);
    
    if (motoristas.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }
    
    res.json(motoristas[0]);
  } catch (error) {
    console.error('Erro ao buscar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/motoristas - Criar novo motorista
router.post('/', async (req, res) => {
  try {
    const {
      nome, cpf, cnh, categoria_cnh, telefone, email, endereco,
      status, data_admissao, observacoes, filial_id
    } = req.body;

    // Verificar se o CPF já existe
    if (cpf) {
      const existingMotorista = await executeQuery(
        'SELECT id FROM motoristas WHERE cpf = ?',
        [cpf]
      );

      if (existingMotorista.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
    }

    const query = `
      INSERT INTO motoristas (
        nome, cpf, cnh, categoria_cnh, telefone, email, endereco,
        status, data_admissao, observacoes, filial_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      nome, cpf, cnh, categoria_cnh, telefone, email, endereco,
      status, data_admissao, observacoes, filial_id
    ]);

    // Log de auditoria
    await logAction(req.user.id, 'CREATE', 'motoristas', {
      requestBody: req.body,
      resourceId: result.insertId
    });

    res.status(201).json({ 
      message: 'Motorista criado com sucesso',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/motoristas/:id - Atualizar motorista
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, cpf, cnh, categoria_cnh, telefone, email, endereco,
      status, data_admissao, observacoes, filial_id
    } = req.body;

    // Verificar se o motorista existe
    const existingMotorista = await executeQuery(
      'SELECT * FROM motoristas WHERE id = ?',
      [id]
    );

    if (existingMotorista.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    // Verificar se o CPF já existe (exceto para o motorista atual)
    if (cpf) {
      const existingCPF = await executeQuery(
        'SELECT id FROM motoristas WHERE cpf = ? AND id != ?',
        [cpf, id]
      );

      if (existingCPF.length > 0) {
        return res.status(400).json({ error: 'CPF já cadastrado para outro motorista' });
      }
    }

    const query = `
      UPDATE motoristas SET 
        nome = ?, cpf = ?, cnh = ?, categoria_cnh = ?, telefone = ?, 
        email = ?, endereco = ?, status = ?, data_admissao = ?, 
        observacoes = ?, filial_id = ?
      WHERE id = ?
    `;

    await executeQuery(query, [
      nome, cpf, cnh, categoria_cnh, telefone, email, endereco,
      status, data_admissao, observacoes, filial_id, id
    ]);

    // Log de auditoria
    await logAction(req.user.id, 'UPDATE', 'motoristas', {
      requestBody: req.body,
      resourceId: id,
      previousData: existingMotorista[0]
    });

    res.json({ message: 'Motorista atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/motoristas/:id - Excluir motorista
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o motorista existe
    const existingMotorista = await executeQuery(
      'SELECT * FROM motoristas WHERE id = ?',
      [id]
    );

    if (existingMotorista.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }

    await executeQuery('DELETE FROM motoristas WHERE id = ?', [id]);

    // Log de auditoria
    await logAction(req.user.id, 'DELETE', 'motoristas', {
      resourceId: id,
      previousData: existingMotorista[0]
    });

    res.json({ message: 'Motorista excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 