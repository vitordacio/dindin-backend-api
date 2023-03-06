const pool = require('../connection/connection');
const { validacaoDeCamposObrigatoriosDeTransacao } = require('../helpers/validations');

const cadastroDeTransacao = async (req, res) => {
    const {
        descricao,
        valor,
        data,
        categoria_id,
        tipo
    } = req.body;

    if (validacaoDeCamposObrigatoriosDeTransacao(descricao, valor, data, categoria_id, tipo) === false) {
        return res.status(400).json({
            mensagem: `Todos os campos obrigatórios devem ser informados!`
        });
    }

    const tiposDeTransacao = ["entrada", "saida"];

    if (!tiposDeTransacao.includes(tipo)) {
        return res.status(400).json({
            mensagem: `Campo 'tipo' não informado corretamente!`
        });
    }

    try {
        const novaTransacao = await pool.query(
            `insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6) returning *`,
            [descricao, valor, data, categoria_id, req.usuario.id, tipo]
        );

        const transacao = novaTransacao.rows[0];

        const transacaoRealizada = await pool.query(
            `select transacoes.*, categorias.descricao as categoria_nome from transacoes join categorias on transacoes.categoria_id = categorias.id where transacoes.id = $1`,
            [transacao.id])
        return res.status(201).json(transacaoRealizada.rows[0]);

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
        return res.status(400).json({
            mensagem: `Parâmetro não encontrado!`
        });
    }

    if (validacaoDeCamposObrigatoriosDeTransacao(descricao, valor, data, categoria_id, tipo) === false) {
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
            update transacoes set descricao = $1,
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
            mensagem: `Erro interno do servidor!${err}`
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
            `delete from transacoes where id = $1 and usuario_id = $2`,
            [id, req.usuario.id]
        );

        return res.status(204).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const extratoDeTransacoes = async (req, res) => {

    const { rows, rowCount } = await pool.query(
        `select * from transacoes where usuario_id = $1`,
        [req.usuario.id]
    );

    if (rowCount === 0) {
        return res.status(404).json({
            mensagem: `Transações não encontradas!`
        });
    }

    const transacoesTipoEntrada = rows.filter(transacao => transacao.tipo === "entrada");
    const transacoesTipoSaida = rows.filter(transacao => transacao.tipo === "saida");
    const valorInicial = 0;

    const entrada = transacoesTipoEntrada.reduce(
        (acumulador, valorAtual) => acumulador + valorAtual.valor,
        valorInicial
    );

    const saida = transacoesTipoSaida.reduce(
        (acumulador, valorAtual) => acumulador + valorAtual.valor,
        valorInicial
    );

    const valorDasTransacoes = {
        entrada,
        saida
    }

    return res.json(valorDasTransacoes);
}

module.exports = {
    cadastroDeTransacao,
    listagemDeTransacoes,
    listarTransacaoPorId,
    atualizarTransacaoPorId,
    delecaoDeTransacaoPorId,
    extratoDeTransacoes
}