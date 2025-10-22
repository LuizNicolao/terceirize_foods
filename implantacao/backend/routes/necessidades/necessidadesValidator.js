const yup = require('yup');

// Validador para criar necessidade individual
const criarNecessidadeSchema = yup.object().shape({
  produto: yup.string().required('Produto é obrigatório'),
  escola: yup.string().required('Escola é obrigatória'),
  quantidade: yup.number()
    .positive('Quantidade deve ser positiva')
    .required('Quantidade é obrigatória'),
  tipo_entrega: yup.string().required('Tipo de entrega é obrigatório')
});

// Validador para gerar necessidade
const gerarNecessidadeSchema = yup.object().shape({
  escola_id: yup.number()
    .integer('ID da escola deve ser um número inteiro')
    .positive('ID da escola deve ser positivo')
    .required('ID da escola é obrigatório'),
  
  escola_nome: yup.string()
    .required('Nome da escola é obrigatório'),
  
  escola_rota: yup.string()
    .nullable()
    .optional(),
  
  escola_codigo_teknisa: yup.string()
    .nullable()
    .optional(),
  
  semana_consumo: yup.string()
    .matches(/^\d{2}\/\d{2} a \d{2}\/\d{2}$/, 'Semana deve estar no formato DD/MM a DD/MM')
    .required('Semana de consumo é obrigatória'),
  
  semana_abastecimento: yup.string()
    .nullable()
    .optional(),
  
  produtos: yup.array()
    .of(
      yup.object().shape({
        produto_id: yup.number()
          .integer('ID do produto deve ser um número inteiro')
          .positive('ID do produto deve ser positivo')
          .required('ID do produto é obrigatório'),
        
        produto_nome: yup.string()
          .required('Nome do produto é obrigatório'),
        
        produto_unidade: yup.string()
          .nullable()
          .optional(),
        
        ajuste: yup.number()
          .min(0, 'Ajuste não pode ser negativo')
          .required('Ajuste é obrigatório')
      })
    )
    .min(1, 'Pelo menos um produto deve ser informado')
    .required('Lista de produtos é obrigatória')
});

// Validador para atualizar necessidade
const atualizarNecessidadeSchema = yup.object().shape({
  produto: yup.string(),
  escola: yup.string(),
  quantidade: yup.number().positive('Quantidade deve ser positiva'),
  tipo_entrega: yup.string()
}).test(
  'at-least-one-field',
  'Pelo menos um campo deve ser informado para atualização',
  function(value) {
    return Object.keys(value).length > 0;
  }
);

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
  validateCriarNecessidade: validate(criarNecessidadeSchema),
  validateGerarNecessidade: validate(gerarNecessidadeSchema),
  validateAtualizarNecessidade: validate(atualizarNecessidadeSchema)
};
