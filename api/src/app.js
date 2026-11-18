const path = require('path');
const express = require('express');
const cors = require('cors');
const usuariasRotas = require('./rotas/usuarias');
const alertasRotas = require('./rotas/alertas');
const contatosRotas = require('./rotas/contatos');
const ocorrenciasRotas = require('./rotas/ocorrencias');

const app = express();

app.use(cors()); // permite o app (Expo Web/celular) chamar a API
app.use(express.json()); // lê o corpo das requisições em JSON

app.get('/', (req, res) => {
  res.json({ status: 'ok', api: 'PoupaBem' });
});

// Cada CRUD registra as suas rotas aqui
app.use('/usuarias', usuariasRotas);
app.use('/alertas', alertasRotas);
app.use('/contatos', contatosRotas);
app.use('/ocorrencias', ocorrenciasRotas);

// Painel web da delegacia: página estática em api/public/painel.html
// Abrir em http://localhost:3000/painel
app.get('/painel', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'painel.html'));
});

// Nenhuma rota acima respondeu: 404
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Erros não tratados nos controladores caem aqui (o Express 5 já captura erros de funções async)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

module.exports = app;
