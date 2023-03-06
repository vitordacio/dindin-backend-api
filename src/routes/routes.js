const express = require('express');
const { cadastroDeUsuario, loginDeUsuario, perfilDeUsuario, atualizacaoDeUsuario, listagemDeCategorias } = require('../controllers/users');
const verificarLogin = require('../middlewares/verifyLogin');

const rotas = express();

rotas.post('/usuario', cadastroDeUsuario);
rotas.post('/login', loginDeUsuario);

rotas.use(verificarLogin);

rotas.get('/usuario', perfilDeUsuario);
rotas.put('/usuario', atualizacaoDeUsuario);
rotas.get('/categoria', listagemDeCategorias);
rotas.get('/transacao',);
rotas.post('/transacao',);
rotas.get('/transacao/extrato',);
rotas.get('/transacao/:id',);
rotas.put('/transacao/:id');
rotas.delete('/transacao/:id');

module.exports = rotas;