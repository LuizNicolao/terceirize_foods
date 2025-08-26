const yup = require('yup');

// Validação para listar cotações
const cotacoesValidation = [
  (req, res, next) => {
    const schema = yup.object({
      page: yup.number().positive().integer(),
      limit: yup.number().positive().integer().max(100),
      search: yup.string().max(100),
      status: yup.string().oneOf(['pendente', 'em_analise', 'aguardando_aprovacao', 'renegociacao', 'liberado_gerencia', 'aprovada', 'rejeitada']),
      data_inicio: yup.date(),
      data_fim: yup.date()
    });

    try {
      schema.validateSync(req.query, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Dados de filtro inválidos',
        errors: error.errors
      });
    }
  }
];

// Validação para ID de cotação
const cotacaoValidation = [
  (req, res, next) => {
    const schema = yup.object({
      id: yup.number().positive().integer().required()
    });

    try {
      schema.validateSync(req.params, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'ID de cotação inválido',
        errors: error.errors
      });
    }
  }
];

// Validação para criar cotação
const createCotacaoValidation = [
  (req, res, next) => {
    const schema = yup.object({
      comprador: yup.string().required().min(2).max(100),
      local_entrega: yup.string().required().min(2).max(100),
      tipo_compra: yup.string().required().oneOf(['programada', 'emergencial']),
      motivo_emergencial: yup.string().when('tipo_compra', {
        is: 'emergencial',
        then: yup.string().required().min(10).max(255)
      }),
      justificativa: yup.string().max(1000),
      fornecedores: yup.array().optional(),
      produtos: yup.array().optional()
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Dados de cotação inválidos',
        errors: error.errors
      });
    }
  }
];

// Validação para atualizar cotação
const updateCotacaoValidation = [
  (req, res, next) => {
    const schema = yup.object({
      comprador: yup.string().min(2).max(100),
      local_entrega: yup.string().min(2).max(100),
      tipo_compra: yup.string().oneOf(['programada', 'emergencial']),
      motivo_emergencial: yup.string().max(255),
      justificativa: yup.string().max(1000),
      status: yup.string().oneOf(['pendente', 'em_analise', 'aguardando_aprovacao', 'renegociacao', 'liberado_gerencia', 'aprovada', 'rejeitada'])
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Dados de cotação inválidos',
        errors: error.errors
      });
    }
  }
];

// Validação para análise de cotação
const analiseCotacaoValidation = [
  (req, res, next) => {
    const schema = yup.object({
      status: yup.string().required().oneOf(['aprovada', 'rejeitada', 'renegociacao', 'aguardando_aprovacao']),
      observacoes: yup.string().required().min(10).max(500),
      justificativa: yup.string().when('status', {
        is: 'rejeitada',
        then: yup.string().required().min(10).max(500)
      })
    });

    try {
      schema.validateSync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      return res.status(400).json({
        message: 'Dados de análise inválidos',
        errors: error.errors
      });
    }
  }
];

module.exports = {
  cotacoesValidation,
  cotacaoValidation,
  createCotacaoValidation,
  updateCotacaoValidation,
  analiseCotacaoValidation
};
