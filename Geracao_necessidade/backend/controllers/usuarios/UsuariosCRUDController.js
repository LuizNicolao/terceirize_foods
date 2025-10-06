const bcrypt = require('bcryptjs');
const { query } = require('../../config/database');

const criar = async (req, res) => {
  try {
    const { email, nome, senha, tipo_usuario, rota, setor } = req.body;

    // Verificar se email já existe
    const existing = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Conflito',
        message: 'Já existe um usuário com este email',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Criptografar senha
    const saltRounds = 12;
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    // Buscar o próximo ID disponível
    const maxIdResult = await query('SELECT MAX(id) as max_id FROM usuarios');
    const nextId = (maxIdResult[0]?.max_id || 0) + 1;

    // Inserir novo usuário com ID manual
    const result = await query(`
      INSERT INTO usuarios (id, email, nome, senha, tipo_usuario, rota, setor, ativo, data_cadastro)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [nextId, email, nome, senhaCriptografada, tipo_usuario, rota || null, setor || null]);

    // Buscar o usuário criado para retornar os dados completos
    const novoUsuario = await query(`
      SELECT 
        id, 
        email, 
        nome, 
        tipo_usuario, 
        rota, 
        setor, 
        ativo, 
        data_cadastro
      FROM usuarios 
      WHERE id = ?
    `, [nextId]);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario[0],
      id: nextId
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao criar usuário',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, senha, tipo_usuario, rota, setor, ativo } = req.body;

    // Verificar se usuário existe
    const existing = await query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Não encontrado',
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar se email já existe em outro usuário
    if (email) {
      const emailExists = await query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailExists.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: 'Já existe outro usuário com este email',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (senha) {
      // Criptografar nova senha
      const saltRounds = 12;
      const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
      updates.push('senha = ?');
      values.push(senhaCriptografada);
    }
    if (tipo_usuario) {
      updates.push('tipo_usuario = ?');
      values.push(tipo_usuario);
    }
    if (rota !== undefined) {
      updates.push('rota = ?');
      values.push(rota);
    }
    if (setor !== undefined) {
      updates.push('setor = ?');
      values.push(setor);
    }
    if (ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Nenhum campo válido foi fornecido para atualização',
        code: 'NO_FIELDS_TO_UPDATE'
      });
    }

    values.push(id);

    await query(`
      UPDATE usuarios 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    // Buscar o usuário atualizado para retornar os dados completos
    const usuarioAtualizado = await query(`
      SELECT 
        id, 
        email, 
        nome, 
        tipo_usuario, 
        rota, 
        setor, 
        ativo, 
        data_cadastro
      FROM usuarios 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar usuário',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existing = await query(
      'SELECT id, nome FROM usuarios WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Não encontrado',
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Deletar usuário
    await query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Usuário ${existing[0].nome} deletado com sucesso`,
      data: { id: parseInt(id), nome: existing[0].nome }
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar usuário',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarios = await query(`
      SELECT 
        id, 
        email, 
        nome, 
        tipo_usuario, 
        rota, 
        setor, 
        ativo, 
        data_cadastro
      FROM usuarios 
      WHERE id = ?
    `, [id]);

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Não encontrado',
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuário',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  criar,
  atualizar,
  deletar,
  buscarPorId
};
