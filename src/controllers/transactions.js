const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bearer = 'bearer';

const cadastroDeTransacao = async (req, res) => {
    const {
        descricao,
        valor,
        data,
        categoria_id,
        tipo
    } = req.body;

    if (validacaoDeCamposObrigatorio(descricao, valor, data, categoria_id, tipo) === false) {
        return res.status(400).json({
            mensagem: `Todos os campos obrigatórios devem ser informados!`
        });
    }

    if (tipo === "entrada") {
        const test = "positivo";
    }

    if (tipo === "saida") {
        const test = "negativo";
    }
    try {
        const novaTransacao = await pool.query(
            `insert into transacoes (descricao, valor, data, categoria_id, tipo) values ($1, $2, $3, $4, $5) returning *`,
            [descricao, valor, data, categoria_id, tipo]
        );

        const dadosDaTransacao = {
            id: rows[0].id,
            tipo,
            descricao,
            valor,
            data,
            usuario_id,
            categoria_id,
            categoria_nome
        }

        return res.status(201).json(dadosDaTransacao);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listagemDeTransacoes = async (req, res) => {
    if (!token) {
        return res.status(401).json({ mensagem: `nop` });
    }

    try {
        const transacoesDoUsuario = await pool.query(
            `select * from transacoes where usuario_id = id`
        );

        return res.json(transacoesDoUsuario);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }

}

const validacaoDeCamposObrigatorio = (
    descricao,
    valor,
    data,
    categoria_id,
    tipo
) => {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return false;
    }

    return true;
}

module.exports = {
    cadastroDeTransacao
}