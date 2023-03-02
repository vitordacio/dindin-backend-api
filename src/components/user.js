const pool = require('../connection');

const cadastrarUsuario = (req, res) => {
    const { nome, email, senha } = req.body;

    // const validacaoDaRequisicao = [];

    // if(!nome){

    // }

    // if(!email){

    // }

    // if(!senha){

    // }
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: ` Nome, email ou senha não detectados. É necessário preencher todos os campos!` });
    }

    const emailExistente = bancoDeDadosTeste.find(usuario => usuario.email === email);

    if (emailExistente) {
        return res.status(403).json({ mensagem: `Já existe usuário cadastrado com o e-mail informado!` });
    }

    const novoUsuario = {
        id: 1, // precisa de id serial, único
        nome,
        email
    }
    // precisa Criptografar a senha antes de persistir no banco de dados
    // precisa Cadastrar o usuário no banco de dados
    bancoDeDadosTeste.push(novoUsuario);
    return res.json(novoUsuario);
}

const loginDeUsuario = (req, res) => {
    const { email, senha } = req.body;

    // if (!email || !senha) {
    //     return res.status(400).json({ mensagem: ` Nome ou senha não detectados. É necessário preencher todos os campos!` });
    // }
    // checarCamposObrigatorios(email, senha);
    if (checarCamposObrigatorios(email, senha)) {
        return res.status(400).json(checarCamposObrigatorios);
    }
    const token = 'test'; // precisa de um token pra autenticar

    const emailDoUsuario = bancoDeDadosTeste.find(usuario => usuario.email === email);
    // const senhaDoUsuario = bancoDeDadosTeste.find(usuario => usuario.senha === senha);
    // || !senhaDoUsuario
    if (!emailDoUsuario) {
        return res.status(400).json({
            mensagem: {
                mensagem: `Usuário e/ou senha inválido(s)!`
            }
        });
    }

    return res.json({ usuario: { ...emailDoUsuario }, token });
}

const checarCamposObrigatorios = (email, senha) => {
    if (!email || !senha) {
        return { mensagem: ` Nome ou senha não detectados. É necessário preencher todos os campos!` };
    }
}

module.exports = {
    cadastrarUsuario,
    loginDeUsuario
}