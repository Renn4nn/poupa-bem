const { Router } = require('express');
const usuarias = require('../controladores/usuariasController');

// Rotas REST do CRUD de Perfil da Usuária (prefixo /usuarias, definido no app.js)
const rotas = Router();

rotas.get('/', usuarias.listar);
rotas.get('/:id', usuarias.buscar);
rotas.post('/', usuarias.criar);
rotas.put('/:id', usuarias.atualizar);
rotas.delete('/:id', usuarias.excluir);

module.exports = rotas;
