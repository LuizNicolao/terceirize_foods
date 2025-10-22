const yup = require('yup');

// Validador para configurar dias úteis
const configurarDiasUteisSchema = yup.object().shape({
  ano: yup.number()
    .integer('Ano deve ser um número inteiro')
    .min(2020, 'Ano deve ser maior que 2020')
    .max(2030, 'Ano deve ser menor que 2030')
    .required('Ano é obrigatório'),
  
  dias_uteis: yup.array()
    .of(yup.number().integer().min(1).max(7))
    .min(1, 'Pelo menos um dia da semana deve ser selecionado')
    .required('Dias úteis são obrigatórios')
});

// Validador para configurar dias de abastecimento
const configurarDiasAbastecimentoSchema = yup.object().shape({
  ano: yup.number()
    .integer('Ano deve ser um número inteiro')
    .min(2020, 'Ano deve ser maior que 2020')
    .max(2030, 'Ano deve ser menor que 2030')
    .required('Ano é obrigatório'),
  
  dias_abastecimento: yup.array()
    .of(yup.number().integer().min(1).max(7))
    .min(1, 'Pelo menos um dia da semana deve ser selecionado')
    .required('Dias de abastecimento são obrigatórios')
});

// Validador para configurar dias de consumo
const configurarDiasConsumoSchema = yup.object().shape({
  ano: yup.number()
    .integer('Ano deve ser um número inteiro')
    .min(2020, 'Ano deve ser maior que 2020')
    .max(2030, 'Ano deve ser menor que 2030')
    .required('Ano é obrigatório'),
  
  dias_consumo: yup.array()
    .of(yup.number().integer().min(1).max(7))
    .min(1, 'Pelo menos um dia da semana deve ser selecionado')
    .required('Dias de consumo são obrigatórios')
});

// Validador para adicionar feriado
const adicionarFeriadoSchema = yup.object().shape({
  data: yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .required('Data é obrigatória'),
  
  nome_feriado: yup.string()
    .min(3, 'Nome do feriado deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do feriado deve ter no máximo 100 caracteres')
    .required('Nome do feriado é obrigatório'),
  
  observacoes: yup.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .nullable()
});

// Middleware de validação
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Erro de validação',
        details: errors
      });
    }
  };
};

module.exports = {
  validateConfigurarDiasUteis: validate(configurarDiasUteisSchema),
  validateConfigurarDiasAbastecimento: validate(configurarDiasAbastecimentoSchema),
  validateConfigurarDiasConsumo: validate(configurarDiasConsumoSchema),
  validateAdicionarFeriado: validate(adicionarFeriadoSchema)
};
