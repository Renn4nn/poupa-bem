const { Router } = require('express');
const alertas = require('../controladores/alertasController');

// Rotas REST do CRUD Alertas/SOS (prefixo /alertas, definido no app.js)
const rotas = Router();

rotas.get('/', alertas.listar);
rotas.get('/:id', alertas.buscar);
rotas.post('/', alertas.criar);
rotas.patch('/:id/status', alertas.atualizarStatus);
rotas.delete('/:id', alertas.excluir);

module.exports = rotas;
