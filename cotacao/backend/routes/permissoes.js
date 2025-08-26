const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authenticateToken: auth } = require('../middleware/auth');

// GET /api/permissoes/usuario/:id - Buscar permissões de um usuário
router.get('/usuario/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const permissoes = await executeQuery(`
      SELECT 
        screen,
        can_view,
        can_create,
        can_edit,
        can_delete
      FROM user_permissions 
      WHERE user_id = ?
      ORDER BY screen
    `, [id]);

    res.json({
      success: true,
      permissoes: permissoes
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/permissoes/telas - Listar todas as telas disponíveis
router.get('/telas', auth, async (req, res) => {
  try {
    const telas = await executeQuery(`
      SELECT DISTINCT screen
      FROM user_permissions 
      ORDER BY screen
    `);

    res.json({
      success: true,
      telas: telas.map(tela => tela.screen)
    });
  } catch (error) {
    console.error('Erro ao buscar telas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// POST /api/permissoes/usuario/:id - Atualizar permissões de um usuário
router.post('/usuario/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;

    // Primeiro, remover todas as permissões existentes do usuário
    await executeQuery('DELETE FROM user_permissions WHERE user_id = ?', [id]);

    // Inserir as novas permissões
    for (const permissao of permissoes) {
      await executeQuery(`
        INSERT INTO user_permissions (user_id, screen, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        permissao.screen,
        permissao.can_view ? 1 : 0,
        permissao.can_create ? 1 : 0,
        permissao.can_edit ? 1 : 0,
        permissao.can_delete ? 1 : 0
      ]);
    }

    res.json({
      success: true,
      message: 'Permissões atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
