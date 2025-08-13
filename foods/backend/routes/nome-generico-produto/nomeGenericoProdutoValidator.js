/**
 * Validações para Nomes Genéricos de Produtos
 * Implementa validações com Yup para criação e atualização
 */

const yup = require('yup');

// Validações comuns
const commonValidations = {
  id: yup.object({
    params: yup.object({
      id: yup.number().integer().positive().required('ID é obrigatório')
    })
  }),

  search: yup.object({
    query: yup.object({
      search: yup.string().optional()
    })
  }),

  pagination: yup.object({
    query: yup.object({
      page: yup.number().integer().min(1).optional(),
      limit: yup.number().integer().min(1).max(100).optional()
    })
  })
};

// Validações específicas para nomes genéricos
const nomeGenericoProdutoValidations = [
  yup.object({
    body: yup.object({
      nome: yup
        .string()
        .required('Nome é obrigatório')
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .trim(),
      
      descricao: yup
        .string()
        .required('Descrição é obrigatória')
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .trim(),
      
      status: yup
        .string()
        .oneOf(['ativo', 'inativo'], 'Status deve ser ativo ou inativo')
        .default('ativo')
    })
  })
];

const nomeGenericoProdutoAtualizacaoValidations = [
  yup.object({
    params: yup.object({
      id: yup.number().integer().positive().required('ID é obrigatório')
    }),
    body: yup.object({
      nome: yup
        .string()
        .optional()
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .trim(),
      
      descricao: yup
        .string()
        .optional()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .trim(),
      
      status: yup
        .string()
        .oneOf(['ativo', 'inativo'], 'Status deve ser ativo ou inativo')
        .optional()
    })
  })
];

// Middleware para tratar erros de validação
const handleValidationErrors = (req, res, next) => {
  try {
    // Aplicar validações
    const validations = req.route.stack
      .filter(layer => layer.name === 'validate')
      .map(layer => layer.handle);

    validations.forEach(validation => {
      validation(req, res, () => {});
    });

    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors
      });
    }
    next(error);
  }
};

module.exports = {
  commonValidations,
  nomeGenericoProdutoValidations,
  nomeGenericoProdutoAtualizacaoValidations,
  handleValidationErrors
};
