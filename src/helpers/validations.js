const validacaoDeCamposObrigatorios = (nome, email, senha) => {
    if (!nome || !email || !senha) {
        return false;
    }

    return true;
}

const validacaoDeCamposObrigatoriosDeTransacao = (
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
    validacaoDeCamposObrigatorios,
    validacaoDeCamposObrigatoriosDeTransacao
}