const { Router } = require('express');
const ocorrencias = require('../controladores/ocorrenciasController');

// Rotas REST do CRUD Diário de Ocorrências (prefixo /ocorrencias, definido no app.js)
const rotas = Router();

rotas.get('/', ocorrencias.listar);
rotas.get('/:id', ocorrencias.buscar);
rotas.post('/', ocorrencias.criar);
rotas.put('/:id', ocorrencias.atualizar);
rotas.delete('/:id', ocorrencias.excluir);

module.exports = rotas;
