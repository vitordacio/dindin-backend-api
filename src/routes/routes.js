const express = require('express');
const { cadastrarUsuario, loginDeUsuario } = require('../components/user');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', loginDeUsuario);
rotas.get('/usuario',);



module.exports = rotas;