const yup = require('yup');

// Schema de validação para cotação
const cotacaoSchema = yup.object().shape({
  comprador: yup.string().required('Comprador é obrigatório'),
  local_entrega: yup.string().required('Local de entrega é obrigatório'),
  tipo_compra: yup.string()
    .oneOf(['programada', 'emergencial', 'tag'], 'Tipo de compra inválido')
    .required('Tipo de compra é obrigatório'),
  motivo_emergencial: yup.string().when('tipo_compra', {
    is: 'emergencial',
    then: yup.string().required('Motivo emergencial é obrigatório para compras emergenciais'),
    otherwise: yup.string().optional()
  }),
  justificativa: yup.string().optional(),
  produtos: yup.array().of(
    yup.object().shape({
      nome: yup.string().required('Nome do produto é obrigatório'),
      qtde: yup.number().positive('Quantidade deve ser positiva').required('Quantidade é obrigatória'),
      un: yup.string().required('Unidade é obrigatória'),
      prazo_entrega: yup.string().optional(),
      ult_valor_aprovado: yup.number().positive('Valor deve ser positivo').optional(),
      ult_fornecedor_aprovado: yup.string().optional(),
      valor_anterior: yup.number().min(0, 'Valor anterior deve ser maior ou igual a zero').optional(),
      valor_unitario: yup.number().min(0, 'Valor unitário deve ser maior ou igual a zero').optional(),
      difal: yup.number().min(0, 'DIFAL deve ser maior ou igual a zero').optional(),
      ipi: yup.number().min(0, 'IPI deve ser maior ou igual a zero').optional(),
      data_entrega_fn: yup.string().optional(),
      total: yup.number().min(0, 'Total deve ser maior ou igual a zero').optional()
    })
  ).min(1, 'Pelo menos um produto é obrigatório')
});

// Middleware de validação
const validateCotacao = async (req, res, next) => {
  try {
    await cotacaoSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errors = error.inner.map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }
};

module.exports = {
  validateCotacao,
  cotacaoSchema
};
