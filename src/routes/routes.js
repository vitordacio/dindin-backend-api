const express = require('express');
const {
    listagemDeTransacoes, listarTransacaoPorId,
    cadastroDeTransacao, atualizarTransacaoPorId,
    delecaoDeTransacaoPorId, extratoDeTransacoes } = require('../controllers/transactions');
const {
    cadastroDeUsuario, loginDeUsuario,
    perfilDeUsuario, atualizacaoDeUsuario,
    listagemDeCategorias } = require('../controllers/users');
const verifyCustomBody = require('../middlewares/verifyCustomBody');
const verificarLogin = require('../middlewares/verifyLogin');
const schemaCadastrarTransacao = require('../schemas/schemaCadastrarTransacao');
const schemaCadastrarUsuario = require('../schemas/schemaCadastrarUsuario');
const schemaLogin = require('../schemas/schemaLogin');

const routes = express();

routes.post('/usuario', verifyCustomBody(schemaCadastrarUsuario), cadastroDeUsuario);
routes.post('/login', verifyCustomBody(schemaLogin), loginDeUsuario);

routes.use(verificarLogin);

routes.get('/usuario', perfilDeUsuario);
routes.put('/usuario', verifyCustomBody(schemaCadastrarUsuario), atualizacaoDeUsuario);
routes.get('/categoria', listagemDeCategorias);

routes.get('/transacao', listagemDeTransacoes);
routes.post('/transacao', verifyCustomBody(schemaCadastrarTransacao), cadastroDeTransacao);
routes.get('/transacao/extrato', extratoDeTransacoes);

routes.get('/transacao/:id', listarTransacaoPorId);
routes.put('/transacao/:id', verifyCustomBody(schemaCadastrarTransacao), atualizarTransacaoPorId);
routes.delete('/transacao/:id', delecaoDeTransacaoPorId);

module.exports = routes;