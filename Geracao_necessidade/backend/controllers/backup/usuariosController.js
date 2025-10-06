const { query } = require('../config/database');

const listar = async (req, res) => {
  try {
    // Usar pagination do middleware ou fallback para query params
    const page = req.pagination?.page || parseInt(req.query.page) || 1;
    const limit = req.pagination?.limit || parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Garantir que os valores sejam números válidos
    const limitNum = parseInt(limit) || 10;
    const offsetNum = parseInt(offset) || 0;

    console.log('Parâmetros de paginação:', { page, limit: limitNum, offset: offsetNum });

    // Buscar usuários com paginação
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
      ORDER BY nome ASC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `);

    // Contar total de usuários
    const totalResult = await query('SELECT COUNT(*) as total FROM usuarios');
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: usuarios,
      total: total
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários'
    });
  }
};

const buscar = async (req, res) => {
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
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuário'
    });
  }
};

const criar = async (req, res) => {
  try {
    const { email, nome, senha, tipo_usuario, rota, setor } = req.body;

    // Validar dados obrigatórios
    if (!email || !nome || !senha || !tipo_usuario) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Email, nome, senha e tipo de usuário são obrigatórios'
      });
    }

    // Verificar se email já existe
    const existing = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: 'Email já existe',
        message: 'Já existe um usuário com este email'
      });
    }

    // Inserir novo usuário
    const result = await query(`
      INSERT INTO usuarios (email, nome, senha, tipo_usuario, rota, setor, ativo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [email, nome, senha, tipo_usuario, rota || null, setor || null]);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar usuário'
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
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe em outro usuário
    if (email) {
      const emailExists = await query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailExists.length > 0) {
        return res.status(400).json({
          error: 'Email já existe',
          message: 'Já existe outro usuário com este email'
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
      updates.push('senha = ?');
      values.push(senha);
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
        error: 'Nenhum campo para atualizar',
        message: 'Nenhum campo válido foi fornecido para atualização'
      });
    }

    values.push(id);

    await query(`
      UPDATE usuarios 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar usuário'
    });
  }
};

const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existing = await query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Deletar usuário
    await query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar usuário'
    });
  }
};

const buscarPorEmail = async (req, res) => {
  try {
    const { email } = req.params;

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
      WHERE email LIKE ?
      ORDER BY nome ASC
    `, [`%${email}%`]);

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Erro ao buscar usuários por email:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar usuários por email'
    });
  }
};

module.exports = {
  listar,
  buscar,
  criar,
  atualizar,
  deletar,
  buscarPorEmail
};
