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

-- Dados de teste (fictícios). PIN da usuária de teste: 1234
INSERT IGNORE INTO usuaria (id_usuaria, nome, email, pin_hash, data_cadastro) VALUES
  (1, 'Maria Teste', 'maria.teste@exemplo.com',
   '$2b$10$dBtA7gbmaQWeJ5InIi3le.N3skHM4TMdo04UgLA4xJ1jkc6Pk2W4O', '2026-10-01');

-- CONTATO_APOIO (CRUD Rede de Apoio - Renan)
-- Pessoas de confiança da usuária. Vem antes de ALERTA porque o alerta aponta para cá.
CREATE TABLE IF NOT EXISTS contato_apoio (
  id_contato INT AUTO_INCREMENT PRIMARY KEY,
  id_usuaria INT NOT NULL,
  nome       VARCHAR(100) NOT NULL,
  telefone   VARCHAR(20)  NOT NULL,
  parentesco VARCHAR(40)  NULL,
  CONSTRAINT fk_contato_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE
);

-- Contatos de teste (fictícios), ligados à usuária de teste
INSERT IGNORE INTO contato_apoio (id_contato, id_usuaria, nome, telefone, parentesco) VALUES
  (1, 1, 'Beatriz Teste', '(43) 90000-0001', 'Mãe'),
  (2, 1, 'Clara Teste',   '(43) 90000-0002', 'Amiga');

-- OCORRENCIA (CRUD Diário de Ocorrências - Alisson)
-- Registros que a usuária faz para ter um histórico (tipos da Lei Maria da Penha, art. 7º).
CREATE TABLE IF NOT EXISTS ocorrencia (
  id_ocorrencia INT AUTO_INCREMENT PRIMARY KEY,
  id_usuaria    INT NOT NULL,
  data          DATE NOT NULL,
  tipo          VARCHAR(20)  NOT NULL,
  local         VARCHAR(60)  NULL,
  descricao     VARCHAR(500) NOT NULL,
  CONSTRAINT fk_ocorrencia_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE,
  CONSTRAINT ck_ocorrencia_tipo
    CHECK (tipo IN ('Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'))
);

-- Ocorrências de teste (fictícias), ligadas à usuária de teste
INSERT IGNORE INTO ocorrencia (id_ocorrencia, id_usuaria, data, tipo, local, descricao) VALUES
  (1, 1, '2026-10-20', 'Psicológica', 'Casa', 'Registro fictício de teste: discussão com ameaças verbais.'),
  (2, 1, '2026-10-28', 'Patrimonial', 'Casa', 'Registro fictício de teste: celular retido sem autorização.');

-- ALERTA (CRUD Alertas/SOS - Gabriel)
-- Cada acionamento do SOS: quem acionou, quando, onde e em que pé está o atendimento.
-- id_contato é o contato da Rede de Apoio avisado (opcional). Se o contato for
-- excluído, o alerta continua no histórico e o id_contato vira NULL.
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
  CONSTRAINT fk_alerta_contato FOREIGN KEY (id_contato)
    REFERENCES contato_apoio(id_contato) ON DELETE SET NULL,
  CONSTRAINT ck_alerta_status CHECK (status IN ('Novo', 'Em atendimento', 'Concluído'))
);

-- Alertas de teste (fictícios), ligados à usuária de teste
INSERT IGNORE INTO alerta (id_alerta, id_usuaria, id_contato, data_hora, tipo, status, latitude, longitude) VALUES
  (1, 1, 2,    '2026-11-08 21:40:00', 'SOS', 'Concluído',      -23.3103, -51.1628),
  (2, 1, NULL, '2026-11-10 19:05:00', 'SOS', 'Em atendimento', -23.3045, -51.1696);
