const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaJwt = require('../middlewares/senhaToken');

const cadastroDeUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (validacaoDeCamposObrigatorios(nome, email, senha) === false) {
        return res.status(400).json({ mensagem: ` Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!` });
    }

    try {
        if (emailExistente(email) === true) {
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
            mensagem: `Erro interno do servidor!`
        });
    }
}

const loginDeUsuario = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: `Nome ou senha não detectados. É necessário preencher todos os campos!`
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

    if (validacaoDeCamposObrigatorios(nome, email, senha) === false) {
        return res.status(400).json({
            mensagem: `Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!`
        });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { rowCount } = await pool.query(
            'select * from usuarios where id = $1',
            [req.usuario.id]
        )

        if (rowCount === 0) {
            return res.status(404).json({
                mensagem: `Usuário não encontrado!`
            })
        }

        const atualizarUsuario = `
            update usuarios set nome = $1,
            email = $2,
            senha = $3  
            where id = $4
            `;

        await pool.query(atualizarUsuario, [nome, email, senhaCriptografada, req.usuario.id]);

        return res.status(202).json();

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor!`
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

const validacaoDeCamposObrigatorios = (nome, email, senha) => {
    if (!nome || !email || !senha) {
        return false;
    }

    return true;
}

const emailExistente = async (email) => {
    const emailExistente = await pool.query(
        `select * from usuarios where email = $1`,
        [email]);

    if (emailExistente.rowCount > 0) {
        return true;
    }

    return false;
}

module.exports = {
    cadastroDeUsuario,
    loginDeUsuario,
    perfilDeUsuario,
    atualizacaoDeUsuario,
    listagemDeCategorias
}