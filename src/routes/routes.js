const express = require('express');
const { cadastroDeUsuario, loginDeUsuario, perfilDeUsuario, atualizacaoDeUsuario } = require('../controllers/user');

const rotas = express();

rotas.post('/usuario', cadastroDeUsuario);
rotas.post('/login', loginDeUsuario);
rotas.get('/usuario', perfilDeUsuario);
rotas.put('/usuario', atualizacaoDeUsuario);
rotas.get('/categoria',);
rotas.get('/transacao',);
rotas.post('/transacao',);
rotas.get('/transacao/extrato',);
rotas.get('/transacao/:id',);
rotas.put('/transacao/:id');
rotas.delete('/transacao/:id');

module.exports = rotas;