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

-- ALERTA (CRUD Alertas/SOS - Gabriel)
-- Cada acionamento do SOS: quem acionou, quando, onde e em que pé está o atendimento.
-- id_contato é o contato da Rede de Apoio avisado (opcional). A FOREIGN KEY dele
-- para contato_apoio entra quando essa tabela for criada (CRUD Rede de Apoio).
CREATE TABLE IF NOT EXISTS alerta (
  id_alerta  INT AUTO_INCREMENT PRIMARY KEY,
  id_usuaria INT NOT NULL,
  id_contato INT NULL,
  data_hora  DATETIME NOT NULL,
  tipo       VARCHAR(30) NOT NULL DEFAULT 'SOS',
  status     VARCHAR(20) NOT NULL DEFAULT 'Novo',
  latitude   DOUBLE NULL,
  longitude  DOUBLE NULL,
  CONSTRAINT fk_alerta_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE,
  CONSTRAINT ck_alerta_status CHECK (status IN ('Novo', 'Em atendimento', 'Concluído'))
);

-- Alertas de teste (fictícios), ligados à usuária de teste
INSERT IGNORE INTO alerta (id_alerta, id_usuaria, id_contato, data_hora, tipo, status, latitude, longitude) VALUES
  (1, 1, NULL, '2026-11-08 21:40:00', 'SOS', 'Concluído',      -23.3103, -51.1628),
  (2, 1, NULL, '2026-11-10 19:05:00', 'SOS', 'Em atendimento', -23.3045, -51.1696);
