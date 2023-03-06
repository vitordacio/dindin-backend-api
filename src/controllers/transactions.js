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

    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({
            mensagem: `Campo 'tipo' não informado corretamente!`
        });
    }

    try {
        const novaTransacao = await pool.query(
            `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6) returning *`,
            [descricao, valor, data, categoria_id, req.usuario.id, tipo]
        );

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
            return res.status(404).json({
                mensagem: `Transações não encontradas!`
            });
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

    if (!id) {
        return res.status(400).json({ mensagem: `Parâmetro não encontrado!` })
    }

    try {
        const transacoesDoUsuario = await pool.query(
            `select * from transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        if (transacoesDoUsuario.rowCount === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        return res.json(transacoesDoUsuario.rows);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
        });
    }
}

const atualizarTransacaoPorId = async (req, res) => {
    const { id } = req.params;
    const {
        descricao,
        valor,
        data,
        categoria_id,
        tipo
    } = req.body;

    if (!id) {
        return res.status(400).json({ mensagem: `Parâmetro não encontrado!` })
    }

    if (validacaoDeCamposObrigatorio(descricao, valor, data, categoria_id, tipo) === false) {
        return res.status(400).json({
            mensagem: `Todos os campos obrigatórios devem ser informados!`
        });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({
            mensagem: `Campo 'tipo' não informado corretamente!`
        });
    }

    try {
        const { rowCount } = await pool.query(
            `select * from transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        const atualizarTransacao = `
            update transacao set descricao = $1,
            valor = $2,
            data = $3,
            categoria_id = $4,
            tipo = $5  
            where id = $6
            `;

        await pool.query(atualizarTransacao, [descricao, valor, data, categoria_id, tipo, id]);

        return res.status(204).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
        });
    }
}

const delecaoDeTransacaoPorId = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ mensagem: `Parâmetro não encontrado!` })
    }

    try {
        const { rowCount } = await pool.query(
            `select * from transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        await pool.query(
            `delete transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        return res.status(204).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
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
    listarTransacaoPorId,
    atualizarTransacaoPorId,
    delecaoDeTransacaoPorId
}