const yup = require('yup');

// Validação para criar/atualizar padrão
const criarPadraoSchema = yup.object().shape({
  escola_id: yup.number().integer().positive().required('Escola é obrigatória'),
  grupo_id: yup.number().integer().positive().required('Grupo é obrigatório'),
  produto_id: yup.number().integer().positive().required('Produto é obrigatório'),
  quantidade: yup.number().min(0, 'Quantidade deve ser maior ou igual a zero').required('Quantidade é obrigatória')
});

// Validação para salvar padrão completo
const salvarPadraoSchema = yup.object().shape({
  escola_id: yup.number().integer().positive().required('Escola é obrigatória'),
  grupo_id: yup.number().integer().positive().required('Grupo é obrigatório'),
  produtos: yup.array().of(
    yup.object().shape({
      produto_id: yup.number().integer().positive().required('Produto é obrigatório'),
      quantidade: yup.number().min(0, 'Quantidade deve ser maior ou igual a zero').required('Quantidade é obrigatória')
    })
  ).min(1, 'Pelo menos um produto deve ser informado')
});

// Validação para buscar por escola e grupo
const buscarPorEscolaGrupoSchema = yup.object().shape({
  escola_id: yup.number().integer().positive().required('Escola é obrigatória'),
  grupo_id: yup.number().integer().positive().required('Grupo é obrigatório')
});

module.exports = {
  criarPadraoSchema,
  salvarPadraoSchema,
  buscarPorEscolaGrupoSchema
};
