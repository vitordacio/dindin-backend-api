const joi = require('joi')

const schemaLogin = joi.object({
    email: joi.string().required().messages({
        'any.required': 'O campo email é obrigatório',
        'string.empty': 'O campo email é obrigatório',
        'string.base': 'O campo email precisa ser uma string'
    }),
    senha: joi.string().required().messages({
        'any.required': 'O campo senha é obrigatório',
        'string.empty': 'O campo senha é obrigatório',
        'string.base': 'O campo senha precisa ser uma string'
    })
})

module.exports = schemaLogin