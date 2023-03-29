const joi = require('joi')

const schemaCadastrarTransacao = joi.object({
    descricao: joi.string().required().messages({
        'any.required': 'O campo descricao é obrigatório',
        'string.empty': 'O campo descricao é obrigatório',
        'string.base': 'O campo descricao precisa ser uma string'
    }),
    valor: joi.number().required().messages({
        'any.required': 'O campo valor é obrigatório',
        'number.empty': 'O campo valor é obrigatório',
        'number.base': 'O campo valor precisa ser um number'
    }),
    data: joi.date().required().messages({
        'any.required': 'O campo data é obrigatório',
        'date.empty': 'O campo data é obrigatório',
        'date.base': 'O campo data precisa ser uma date'
    }),
    categoria_id: joi.number().required().messages({
        'any.required': 'O campo categoria_id é obrigatório',
        'number.empty': 'O campo categoria_id é obrigatório',
        'number.base': 'O campo categoria_id precisa ser uma number'
    }),
    tipo: joi.string().required().messages({
        'any.required': 'O campo tipo é obrigatório',
        'string.empty': 'O campo tipo é obrigatório',
        'string.base': 'O campo tipo precisa ser uma string'
    }),
})

module.exports = schemaCadastrarTransacao