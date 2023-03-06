const jwt = require('jsonwebtoken');
const senhaJwt = require('../passwordToken');
const pool = require('../connection/connection');

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            mensagem: `Requisição não autorizada!`
        });
    }

    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, senhaJwt);

        const { rows, rowCount } = await pool.query(
            `select * from usuarios where id = $1`,
            [id]);

        if (rowCount === 0) {
            return res.status(401).json({
                mensagem: `Requisição não autorizada!`
            });
        }

        const { senha, ...usuario } = rows[0];

        req.usuario = usuario;

        next();

    } catch (err) {
        return res.status(401).json({
            mensagem: `Requisição não autorizada!`
        });
    }
}

module.exports = verificarLogin;