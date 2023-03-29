const jwt = require('jsonwebtoken');
const knex = require('../connection/api');

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            mensagem: `Requisição não autorizada!`
        });
    }

    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, process.env.JWT_PASSWORD);

        const user = await knex('usuarios').where({ id })

        if (user.length === 0) {
            return res.status(401).json({
                mensagem: `Requisição não autorizada!`
            });
        }

        const { senha, ...usuario } = user[0];

        req.usuario = usuario;

        next();

    } catch (err) {
        return res.status(401).json({
            mensagem: `Requisição não autorizada!`
        });
    }
}

module.exports = verificarLogin;