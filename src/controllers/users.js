const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../passwordToken');
const { validacaoDeCamposObrigatorios } = require('../helpers/validations');

const cadastroDeUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!validacaoDeCamposObrigatorios(nome, email, senha)) {
        return res.status(400).json({ mensagem: ` Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!` });
    }

    try {
        const emailExistente = await pool.query(
            `select * from usuarios where usuarios.email = $1`,
            [email]
        );

        if (emailExistente.rowCount > 0) {
            return res.status(400).json({
                mensagem: `Já existe usuário cadastrado com o e-mail informado!`
            });
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await pool.query(
            `insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *`,
            [nome, email, senhaCriptografada]
        );

        const { senha: _, ...usuario } = novoUsuario.rows[0];

        return res.status(201).json(usuario);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const loginDeUsuario = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: `É necessário preencher todos os campos!`
        });
    }

    try {
        const usuario = await pool.query(
            `select * from usuarios where email = $1`,
            [email]
        );

        if (usuario.rowCount === 0) {
            return res.status(400).json({
                mensagem: `E-mail ou senha invalidos!`
            });
        }

        const { senha: senhaDoUsuario, ...usuarioLogado } = usuario.rows[0];

        const senhaValida = await bcrypt.compare(senha, senhaDoUsuario);

        if (!senhaValida) {
            return res.status(400).json({
                mensagem: `E-mail ou senha invalidos!`
            })
        }

        const token = jwt.sign({ id: usuarioLogado.id }, senhaJwt, {
            expiresIn: '24h',
        });

        return res.json({
            usuario: usuarioLogado,
            token
        });

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
        });
    }
}

const perfilDeUsuario = async (req, res) => {
    return res.json(req.usuario);
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
        const emailExistente = await pool.query(
            `select * from usuarios where usuarios.email = $1 and not usuarios.id = $2`,
            [email, req.usuario.id]
        );

        if (emailExistente.rowCount > 0) {
            return res.status(400).json({
                mensagem: `Já existe usuário cadastrado com o e-mail informado!`
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { rowCount } = await pool.query(
            'select * from usuarios where id = $1',
            [id]
        )

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: `Usuário não encontrado!`
            })
        }

        const atualizarUsuario = `
            update usuarios set 
            nome = $1,
            email = $2,
            senha = $3  
            where id = $4
            `;

        await pool.query(atualizarUsuario, [nome, email, senhaCriptografada, id]);

        return res.status(204).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const listagemDeCategorias = async (req, res) => {
    try {
        const categoriasCadastradas = await pool.query(
            `select * from categorias`
        );

        return res.json(categoriasCadastradas.rows);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
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