-- Banco do PoupaBem (protótipo acadêmico, só dados fictícios).
-- Rodar uma vez no MySQL: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS poupabem
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE poupabem;

-- USUARIA (CRUD Perfil da Usuária - João)
-- O PIN nunca é salvo em texto puro: a API guarda só o hash bcrypt.
CREATE TABLE IF NOT EXISTS usuaria (
  id_usuaria    INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  pin_hash      VARCHAR(255) NOT NULL,
  data_cadastro DATE NOT NULL
);

-- As tabelas CONTATO_APOIO, OCORRENCIA e ALERTA entram abaixo,
-- cada uma com FOREIGN KEY (id_usuaria) REFERENCES usuaria(id_usuaria).

-- Dados de teste (fictícios). PIN da usuária de teste: 1234
INSERT IGNORE INTO usuaria (id_usuaria, nome, email, pin_hash, data_cadastro) VALUES
  (1, 'Maria Teste', 'maria.teste@exemplo.com',
   '$2b$10$dBtA7gbmaQWeJ5InIi3le.N3skHM4TMdo04UgLA4xJ1jkc6Pk2W4O', '2026-10-01');
