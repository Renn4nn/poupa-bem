const { Router } = require('express');
const financas = require('../controladores/financasController');

// Rotas da fachada financeira (prefixo /financas, definido no app.js)
const rotas = Router();

rotas.get('/resumo', financas.resumo);

rotas.get('/movimentacoes', financas.listarMovimentacoes);
rotas.post('/movimentacoes', financas.criarMovimentacao);

rotas.get('/lembretes', financas.listarLembretes);
rotas.post('/lembretes', financas.criarLembrete);
rotas.post('/lembretes/:id/pagar', financas.pagarLembrete);
rotas.delete('/lembretes/:id', financas.excluirLembrete);

rotas.get('/cofrinho', financas.buscarCofrinho);
rotas.put('/cofrinho', financas.salvarMeta);
rotas.post('/cofrinho/movimentar', financas.movimentarCofrinho);

module.exports = rotas;
