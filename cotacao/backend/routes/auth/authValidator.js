const yup = require('yup');

/**
 * Validações para autenticação
 * Utiliza Yup para validação de dados
 */

const authValidations = {
  // Validação para login
  login: async (req, res, next) => {
    try {
      const schema = yup.object().shape({
        email: yup
          .string()
          .email('Email inválido')
          .required('Email é obrigatório'),
        password: yup
          .string()
          .min(6, 'Senha deve ter pelo menos 6 caracteres')
          .required('Senha é obrigatória')
      });

      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          details: error.errors
        }
      });
    }
  },

  // Validação para refresh token
  refresh: async (req, res, next) => {
    try {
      const schema = yup.object().shape({
        refreshToken: yup
          .string()
          .required('Refresh token é obrigatório')
      });

      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          details: error.errors
        }
      });
    }
  },

  // Validação para alterar senha
  changePassword: async (req, res, next) => {
    try {
      const schema = yup.object().shape({
        currentPassword: yup
          .string()
          .required('Senha atual é obrigatória'),
        newPassword: yup
          .string()
          .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
          .required('Nova senha é obrigatória'),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref('newPassword'), null], 'Senhas devem ser iguais')
          .required('Confirmação de senha é obrigatória')
      });

      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          details: error.errors
        }
      });
    }
  },

  // Validação para esqueci minha senha
  forgotPassword: async (req, res, next) => {
    try {
      const schema = yup.object().shape({
        email: yup
          .string()
          .email('Email inválido')
          .required('Email é obrigatório')
      });

      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          details: error.errors
        }
      });
    }
  },

  // Validação para redefinir senha
  resetPassword: async (req, res, next) => {
    try {
      const schema = yup.object().shape({
        token: yup
          .string()
          .required('Token é obrigatório'),
        newPassword: yup
          .string()
          .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
          .required('Nova senha é obrigatória'),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref('newPassword'), null], 'Senhas devem ser iguais')
          .required('Confirmação de senha é obrigatória')
      });

      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        error: {
          message: 'Dados inválidos',
          details: error.errors
        }
      });
    }
  }
};

module.exports = {
  authValidations
};
