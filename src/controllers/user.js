const pool = require('../connection/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bearer = 'bearer';
//falta - mudar body resposta para não ter senha (mesmo que ela esteja em hash)
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

        return res.json(novoUsuario.rows[0]);

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}

const loginDeUsuario = async (req, res) => {
    const { email, senha } = req.body;
    try {
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: `Nome ou senha não detectados. É necessário preencher todos os campos!`
            });
        }

        const usuario = await pool.query(
            `select * from usuarios where email = $1`,
            [email]
        );

        if (usuario.rowCount < 1) {
            return res.status(404).json({
                mensagem: `E-mail ou senha invalida!`
            });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

        if (!senhaValida) {
            return res.status(404).json({
                mensagem: `E-mail ou senha invalida!`
            })
        }

        const token = jwt.sign({ id: usuario.rows[0].id }, bearer, {
            expiresIn: '24h',
        });

        const { senha: _, ...usuarioLogado } = usuario.rows[0];

        return res.json({ usuario: usuarioLogado, token });

    } catch (err) {
        return res.status(500).json({
            mensagem: `Erro interno do servidor! ${err}`
        });
    }
}
//falta conferir token daqui pra baixo
const perfilDeUsuario = async (req, res) => {
    if (token) {
        return res.json(req.usuario);
    }

    return res.status(401).json({
        mensagem: `Para acessar este recurso um token de autenticação válido deve ser enviado.`
    });
}

const atualizacaoDeUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (validacaoDeCamposObrigatorios(nome, email, senha) === false) {
        return res.status(400).json({ mensagem: ` Nome, e-mail ou senha não detectados. É necessário preencher todos os campos!` });
    }

    if (emailExistente(email)) {
        return res.status(400).json({
            mensagem: `Já existe usuário cadastrado com o e-mail informado! Favor escolher outro e-mail.`
        });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuarioEditado = await pool.query(
        `update usuarios (nome, email, senha) values ($1, $2, $3) where token = ${token}`,
        [nome, email, senhaCriptografada]
    );

    return res.json(usuarioEditado.rows[0]);
}

const listagemDeCategorias = async (req, res) => {

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

    if (emailExistente.rowCount >= 1) {
        return true;
    }
}

module.exports = {
    cadastroDeUsuario,
    loginDeUsuario,
    perfilDeUsuario,
    atualizacaoDeUsuario,
    listagemDeCategorias
}