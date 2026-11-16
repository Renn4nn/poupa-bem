// Carrega o .env antes de tudo, porque o db.js lê as variáveis ao ser importado
require('dotenv').config({ quiet: true });

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API PoupaBem rodando em http://localhost:${PORT}`);
});
