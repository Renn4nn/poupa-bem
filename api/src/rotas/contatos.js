const { Router } = require('express');
const contatos = require('../controladores/contatosController');

// Rotas REST do CRUD Rede de Apoio (prefixo /contatos, definido no app.js)
const rotas = Router();

rotas.get('/', contatos.listar);
rotas.get('/:id', contatos.buscar);
rotas.post('/', contatos.criar);
rotas.put('/:id', contatos.atualizar);
rotas.delete('/:id', contatos.excluir);

module.exports = rotas;
