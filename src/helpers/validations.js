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
    emailExistente,
    validacaoDeCamposObrigatoriosDeTransacao
}