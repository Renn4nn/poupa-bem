const mysql = require('mysql2/promise');

// Pool de conexões com o MySQL: cada consulta pega uma conexão livre e devolve depois.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Datas voltam como texto ('2026-10-01'), sem conversão de fuso horário
  dateStrings: true,
});

module.exports = db;
