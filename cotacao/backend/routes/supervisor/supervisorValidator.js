const yup = require('yup');

// Validação para listar cotações pendentes do supervisor
const supervisorValidation = [
  (req, res, next) => {
    const schema = yup.object({
      page: yup.number().positive().integer(),
      limit: yup.number().positive().integer().max(100),
      search: yup.string().max(100),
      status: yup.string().oneOf(['em_analise', 'aguardando_aprovacao_supervisor'])
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

// Validação para análise de cotação pelo supervisor
const analiseValidation = [
  (req, res, next) => {
    const schema = yup.object({
      status: yup.string().required().oneOf(['aguardando_aprovacao']),
      observacoes: yup.string().max(1000),
      justificativa: yup.string().max(1000),
      decisao: yup.string().required().oneOf(['enviar_gestor']),
      produtosSelecionados: yup.array().optional()
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

module.exports = {
  supervisorValidation,
  analiseValidation,
  cotacaoValidation
};
