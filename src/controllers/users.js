const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../passwordToken');
const { validacaoDeCamposObrigatorios } = require('../helpers/validations');
const knex = require('../connection/api');

const cadastroDeUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!validacaoDeCamposObrigatorios(nome, email, senha)) {
        return res.status(400).json({ mensagem: ` Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!` });
    }

    try {
        const emailExistente = await knex('usuarios').where({ email })

        if (emailExistente.length > 0) {
            return res.status(400).json({
                mensagem: `Já existe usuário cadastrado com o e-mail informado!`
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await knex('usuarios').insert({ nome, email, senha: senhaCriptografada }).returning('*')

        const { senha: _, ...usuario } = novoUsuario[0];

        return res.status(201).json(usuario);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const loginDeUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await knex('usuarios').where({ email })

        if (usuario.length === 0) {
            return res.status(400).json({
                mensagem: `E-mail ou senha invalidos!`
            });
        }

        const { senha: senhaDoUsuario, ...usuarioLogado } = usuario[0];

        const senhaValida = await bcrypt.compare(senha, senhaDoUsuario);

        if (!senhaValida) {
            return res.status(400).json({
                mensagem: `E-mail ou senha invalidos!`
            })
        }

        const token = jwt.sign({ id: usuarioLogado.id }, process.env.JWT_PASSWORD, { expiresIn: '24h' });

        return res.json({
            usuario: usuarioLogado,
            token
        });

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const perfilDeUsuario = async (req, res) => {
    try {
        return res.json(req.usuario);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const atualizacaoDeUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.usuario;

    if (!validacaoDeCamposObrigatorios(nome, email, senha)) {
        return res.status(400).json({
            mensagem: `Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!`
        });
    }

    try {
        const emailExistente = await knex('usuarios').where({ email }).whereNot('id', id)

        if (emailExistente.length > 0) {
            return res.status(400).json({
                mensagem: `Já existe usuário cadastrado com o e-mail informado!`
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuarioEncontrado = await knex('usuarios').where({ id })

        if (usuarioEncontrado.length === 0) {
            return res.status(404).json({
                mensagem: `Usuário não encontrado!`
            })
        }

        await knex('usuarios').update({ nome, email, senha }).where({ id })
        return res.status(204).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listagemDeCategorias = async (req, res) => {
    try {
        const categoriasCadastradas = await knex('categorias')

        return res.json(categoriasCadastradas);
    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

module.exports = {
    cadastroDeUsuario,
    loginDeUsuario,
    perfilDeUsuario,
    atualizacaoDeUsuario,
    listagemDeCategorias
}