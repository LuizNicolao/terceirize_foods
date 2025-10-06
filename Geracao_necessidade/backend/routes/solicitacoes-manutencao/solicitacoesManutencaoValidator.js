const yup = require('yup');

// Validador para criar solicitação
const criarSolicitacaoSchema = yup.object().shape({
  data_solicitacao: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .required('Data da solicitação é obrigatória'),
  
  escola_id: yup.number()
    .integer('ID da escola deve ser um número inteiro')
    .positive('ID da escola deve ser positivo')
    .required('Escola é obrigatória'),
  
  cidade: yup.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(255, 'Cidade deve ter no máximo 255 caracteres')
    .required('Cidade é obrigatória'),
  
  nutricionista_email: yup.string()
    .email('Email do nutricionista deve ser válido')
    .required('Email do nutricionista é obrigatório'),
  
  manutencao_descricao: yup.string()
    .min(10, 'Descrição da manutenção deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição da manutenção deve ter no máximo 1000 caracteres')
    .required('Descrição da manutenção é obrigatória'),
  
  fornecedor: yup.string()
    .max(255, 'Fornecedor deve ter no máximo 255 caracteres')
    .nullable()
    .optional(),
  
  valor: yup.mixed()
    .test('is-number-or-empty', 'Valor deve ser um número positivo ou vazio', function(value) {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    })
    .nullable()
    .optional(),
  
  data_servico: yup.string()
    .test('date-format', 'Data do serviço deve estar no formato YYYY-MM-DD', function(value) {
      if (!value || value === '') return true; // Aceita vazio
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    })
    .nullable()
    .optional(),
  
  numero_ordem_servico: yup.string()
    .max(100, 'Número da ordem de serviço deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  status: yup.string()
    .oneOf(['Pendente', 'Aprovado', 'Reprovado', 'Pendente manutencao', 'Concluido'], 'Status deve ser um dos valores válidos')
    .default('Pendente'),
  
  observacoes: yup.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .nullable()
    .optional(),
  
  foto_equipamento: yup.string()
    .max(500, 'URL da foto deve ter no máximo 500 caracteres')
    .nullable()
    .optional()
});

// Validador para atualizar solicitação
const atualizarSolicitacaoSchema = yup.object().shape({
  data_solicitacao: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .nullable()
    .optional(),
  
  escola_id: yup.number()
    .integer('ID da escola deve ser um número inteiro')
    .positive('ID da escola deve ser positivo')
    .nullable()
    .optional(),
  
  cidade: yup.string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(255, 'Cidade deve ter no máximo 255 caracteres')
    .nullable()
    .optional(),
  
  nutricionista_email: yup.string()
    .email('Email do nutricionista deve ser válido')
    .nullable()
    .optional(),
  
  manutencao_descricao: yup.string()
    .min(10, 'Descrição da manutenção deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição da manutenção deve ter no máximo 1000 caracteres')
    .nullable()
    .optional(),
  
  fornecedor: yup.string()
    .max(255, 'Fornecedor deve ter no máximo 255 caracteres')
    .nullable()
    .optional(),
  
  valor: yup.mixed()
    .test('is-number-or-empty', 'Valor deve ser um número positivo ou vazio', function(value) {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= 0;
    })
    .nullable()
    .optional(),
  
  data_servico: yup.string()
    .test('date-format', 'Data do serviço deve estar no formato YYYY-MM-DD', function(value) {
      if (!value || value === '') return true; // Aceita vazio
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    })
    .nullable()
    .optional(),
  
  numero_ordem_servico: yup.string()
    .max(100, 'Número da ordem de serviço deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  status: yup.string()
    .oneOf(['Pendente', 'Aprovado', 'Reprovado', 'Pendente manutencao', 'Concluido'], 'Status deve ser um dos valores válidos')
    .nullable()
    .optional(),
  
  observacoes: yup.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .nullable()
    .optional(),
  
  foto_equipamento: yup.string()
    .max(500, 'URL da foto deve ter no máximo 500 caracteres')
    .nullable()
    .optional()
});

// Middleware para validar criar solicitação
const validateCriarSolicitacao = async (req, res, next) => {
  try {
    await criarSolicitacaoSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados enviados',
      details: error.errors
    });
  }
};

// Middleware para validar atualizar solicitação
const validateAtualizarSolicitacao = async (req, res, next) => {
  try {
    await atualizarSolicitacaoSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados enviados',
      details: error.errors
    });
  }
};

module.exports = {
  validateCriarSolicitacao,
  validateAtualizarSolicitacao
};
