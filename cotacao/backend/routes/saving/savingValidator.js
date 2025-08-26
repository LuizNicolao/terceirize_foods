const yup = require('yup');

// Schema para criação de saving
const criarSavingSchema = yup.object().shape({
    produto_id: yup.number().required('ID do produto é obrigatório'),
    fornecedor_id: yup.number().required('ID do fornecedor é obrigatório'),
    valor_anterior: yup.number().positive('Valor anterior deve ser positivo').required('Valor anterior é obrigatório'),
    valor_atual: yup.number().positive('Valor atual deve ser positivo').required('Valor atual é obrigatório'),
    quantidade: yup.number().positive('Quantidade deve ser positiva').required('Quantidade é obrigatória'),
    tipo: yup.string().oneOf(['preco', 'prazo_entrega', 'prazo_pagamento'], 'Tipo deve ser preco, prazo_entrega ou prazo_pagamento').required('Tipo é obrigatório'),
    observacoes: yup.string().max(500, 'Observações deve ter no máximo 500 caracteres'),
    cotacao_id: yup.number().required('ID da cotação é obrigatório')
});

// Schema para atualização de saving
const atualizarSavingSchema = yup.object().shape({
    valor_anterior: yup.number().positive('Valor anterior deve ser positivo'),
    valor_atual: yup.number().positive('Valor atual deve ser positivo'),
    quantidade: yup.number().positive('Quantidade deve ser positiva'),
    observacoes: yup.string().max(500, 'Observações deve ter no máximo 500 caracteres'),
    status: yup.string().oneOf(['pendente', 'aprovado', 'rejeitado'], 'Status deve ser pendente, aprovado ou rejeitado')
});

// Schema para aprovação/rejeição
const aprovarRejeitarSavingSchema = yup.object().shape({
    motivo: yup.string().required('Motivo é obrigatório').max(500, 'Motivo deve ter no máximo 500 caracteres'),
    observacoes: yup.string().max(500, 'Observações deve ter no máximo 500 caracteres')
});

// Schema para filtros de listagem
const listarSavingSchema = yup.object().shape({
    pagina: yup.number().positive('Página deve ser positiva').default(1),
    limite: yup.number().positive('Limite deve ser positivo').max(100, 'Limite máximo é 100').default(10),
    comprador: yup.number().positive('ID do comprador deve ser positivo'),
    status: yup.string().oneOf(['pendente', 'aprovado', 'rejeitado'], 'Status deve ser pendente, aprovado ou rejeitado'),
    tipo: yup.string().oneOf(['preco', 'prazo_entrega', 'prazo_pagamento'], 'Tipo deve ser preco, prazo_entrega ou prazo_pagamento'),
    data_inicio: yup.date('Data início deve ser uma data válida'),
    data_fim: yup.date('Data fim deve ser uma data válida')
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
                message: 'Erro de validação',
                errors
            });
        }
    };
};

// Middleware de validação para query params
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.query, { abortEarly: false });
            next();
        } catch (error) {
            const errors = error.inner.map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Erro de validação',
                errors
            });
        }
    };
};

module.exports = {
    criarSavingSchema,
    atualizarSavingSchema,
    aprovarRejeitarSavingSchema,
    listarSavingSchema,
    validate,
    validateQuery
};
