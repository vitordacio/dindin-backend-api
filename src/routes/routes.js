const express = require('express');
const {
    listagemDeTransacoes, listarTransacaoPorId,
    cadastroDeTransacao, atualizarTransacaoPorId,
    delecaoDeTransacaoPorId, extratoDeTransacoes } = require('../controllers/transactions');
const {
    cadastroDeUsuario, loginDeUsuario,
    perfilDeUsuario, atualizacaoDeUsuario,
    listagemDeCategorias } = require('../controllers/users');
const verificarLogin = require('../middlewares/verifyLogin');

const rotas = express();

rotas.post('/usuario', cadastroDeUsuario);
rotas.post('/login', loginDeUsuario);

rotas.use(verificarLogin);

rotas.get('/usuario', perfilDeUsuario);
rotas.put('/usuario', atualizacaoDeUsuario);
rotas.get('/categoria', listagemDeCategorias);

rotas.get('/transacao', listagemDeTransacoes);
rotas.post('/transacao', cadastroDeTransacao);
rotas.get('/transacao/extrato', extratoDeTransacoes);
rotas.get('/transacao/:id', listarTransacaoPorId);
rotas.put('/transacao/:id', atualizarTransacaoPorId);
rotas.delete('/transacao/:id', delecaoDeTransacaoPorId);

module.exports = rotas;