const knex = require('../connection/api');
const pool = require('../connection/connection');

const cadastroDeTransacao = async (req, res) => {
    const {
        descricao,
        valor,
        data,
        categoria_id,
        tipo
    } = req.body;

    const tiposDeTransacao = ["entrada", "saida"];

    if (!tiposDeTransacao.includes(tipo)) {
        return res.status(400).json({
            mensagem: `Campo 'tipo' não informado corretamente!`
        });
    }

    try {
        const novaTransacao = await knex('transacoes').insert({ descricao, valor, data, categoria_id, usuario_id: req.usuario.id, tipo }).returning('*')

        const transacaoRealizada = await knex('transacoes').join('categorias', 'transacoes.categoria_id', '=', 'categorias.id').select('transacoes.*', 'categorias.descricao as categoria_nome').where('transacoes.id', '=', `${novaTransacao[0].id}`)
        return res.status(201).json(transacaoRealizada[0]);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listagemDeTransacoes = async (req, res) => {
    const { id } = req.usuario;
    try {
        const transacaoRealizada = await knex('transacoes').join('categorias', 'transacoes.categoria_id', '=', 'categorias.id').select('transacoes.*', 'categorias.descricao as categoria_nome').where('transacoes.usuario_id', '=', `${id}`)

        return res.status(201).json(transacaoRealizada);
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
        const transacaoDoUsuario = await knex('transacoes').join('categorias', 'transacoes.categoria_id', '=', 'categorias.id').select('transacoes.*', 'categorias.descricao as categoria_nome').where('transacoes.id', '=', `${id}`).andWhere('transacoes.usuario_id', '=', `${req.usuario.id}`)

        if (transacaoDoUsuario.length === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        return res.status(201).json(transacaoDoUsuario[0]);
    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
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

    const tiposDeTransacao = ["entrada", "saida"];

    if (!tiposDeTransacao.includes(tipo)) {
        return res.status(400).json({
            mensagem: `Campo 'tipo' não informado corretamente!`
        });
    }

    try {
        const transacao = await knex('transacoes').where({ id }).andWhere({ usuario_id: req.usuario.id })

        if (transacao.length === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        await knex('transacoes').update({ descricao, valor, data, categoria_id, tipo }).where({ id })

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
        const transacao = await knex('transacoes').where({ id }).andWhere({ usuario_id: req.usuario.id })

        if (transacao.length === 0) {
            return res.status(404).json({
                mensagem: `Transação não encontrada!`
            });
        }

        await knex('transacoes').del().where({ id }).andWhere({ usuario_id: req.usuario.id })

        return res.status(204).json();
    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const extratoDeTransacoes = async (req, res) => {
    try {
        const transacoes = await knex('transacoes').where({ usuario_id: req.usuario.id })

        const transacoesTipoEntrada = transacoes.filter(transacao => transacao.tipo === "entrada");
        const transacoesTipoSaida = transacoes.filter(transacao => transacao.tipo === "saida");
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

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

module.exports = {
    cadastroDeTransacao,
    listagemDeTransacoes,
    listarTransacaoPorId,
    atualizarTransacaoPorId,
    delecaoDeTransacaoPorId,
    extratoDeTransacoes
}