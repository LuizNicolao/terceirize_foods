const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { query } = require('../../config/database');

// Schema de validação para login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

const login = async (req, res) => {
  try {
    // Validar dados de entrada
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }

    const { email, senha } = value;

    // Buscar usuário no banco
    const usuarios = await query(
      'SELECT id, email, nome, senha, tipo_usuario, rota, setor, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    const usuario = usuarios[0];

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        error: 'Conta desativada',
        message: 'Sua conta foi desativada. Entre em contato com o administrador'
      });
    }

    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo_usuario: usuario.tipo_usuario,
        rota: usuario.rota
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha) e token
    const usuarioResponse = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo_usuario: usuario.tipo_usuario,
      rota: usuario.rota,
      setor: usuario.setor
    };

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioResponse
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao processar login'
    });
  }
};

const verify = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar dados atualizados do usuário
    const usuarios = await query(
      'SELECT id, email, nome, tipo_usuario, rota, setor, ativo FROM usuarios WHERE email = ? AND ativo = 1',
      [decoded.email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe ou foi desativado'
      });
    }

    res.json({
      message: 'Token válido',
      usuario: usuarios[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'O token fornecido não é válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Sua sessão expirou'
      });
    }

    console.error('Erro na verificação do token:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao verificar token'
    });
  }
};

const logout = (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso',
    note: 'Para invalidar o token, o cliente deve removê-lo do armazenamento local'
  });
};

module.exports = {
  login,
  verify,
  logout
};
