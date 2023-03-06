const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../middlewares/senhaToken');

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

    let teste = ''
    if (tipo === "entrada") {
        teste = "positivo";
    }

    if (tipo === "saida") {
        teste = "negativo";
    }

    try {
        const novaTransacao = await pool.query(
            `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6) returning *`,
            [descricao, valor, data, categoria_id, req.usuario.id, tipo]
        );

        // const dadosDaTransacao = {
        //     id: rows[0].id,
        //     tipo: teste,
        //     descricao,
        //     valor,
        //     data,
        //     usuario_id: req.usuario.id,
        //     categoria_id,
        //     categoria_nome
        // }

        return res.status(201).json(novaTransacao);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listagemDeTransacoes = async (req, res) => {
    try {
        const { rows, rowCount } = await pool.query(
            `select * from transacoes where usuario_id = $1`,
            [req.usuario.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: `Transações não encontradas!` });
        }

        return res.json(rows);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listarTransacaoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const transacoesDoUsuario = await pool.query(
            `select * from transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        if (transacoesDoUsuario.rowCount === 0) {
            return res.status(404).json({ mensagem: `Transação não encontrada!` });
        }

        return res.json(transacoesDoUsuario.rows);

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
    cadastroDeTransacao,
    listagemDeTransacoes,
    listarTransacaoPorId
}