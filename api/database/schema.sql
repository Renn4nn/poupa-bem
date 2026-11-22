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

-- ============================================================
-- FACHADA FINANCEIRA (o "app de finanças" que qualquer pessoa vê)
-- As abas da fachada funcionam de verdade, para o disfarce não levantar
-- suspeita. Os valores são fictícios: nenhum dinheiro real é movimentado.
-- ============================================================

-- MOVIMENTACAO: cada entrada ou saída da conta.
-- valor positivo = entrada; valor negativo = saída.
-- O saldo é a soma de todos os valores. Guardar no cofrinho é uma saída do
-- tipo 'Cofrinho' e resgatar é uma entrada do mesmo tipo.
CREATE TABLE IF NOT EXISTS movimentacao (
  id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
  id_usuaria      INT NOT NULL,
  data_hora       DATETIME NOT NULL,
  tipo            VARCHAR(20) NOT NULL,
  descricao       VARCHAR(100) NOT NULL,
  categoria       VARCHAR(40) NOT NULL DEFAULT 'Outros',
  valor           DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_movimentacao_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE,
  CONSTRAINT ck_movimentacao_tipo CHECK (tipo IN ('Entrada', 'Pix', 'Pagamento', 'Cofrinho'))
);

-- Movimentações de teste (fictícias). Saldo inicial: R$ 2.350,40
INSERT IGNORE INTO movimentacao (id_movimentacao, id_usuaria, data_hora, tipo, descricao, categoria, valor) VALUES
  (1, 1, '2026-11-05 08:00:00', 'Entrada',   'Salário',                'Salário',        2800.00),
  (2, 1, '2026-11-06 10:30:00', 'Cofrinho',  'Guardado no cofrinho',   'Cofrinho',       -150.00),
  (3, 1, '2026-11-09 18:20:00', 'Pagamento', 'Supermercado',           'Mercado',        -186.40),
  (4, 1, '2026-11-10 07:45:00', 'Pix',       'Transporte por app',     'Transporte',      -56.15),
  (5, 1, '2026-11-12 09:10:00', 'Pagamento', 'Conta de luz',           'Contas da casa', -132.15),
  (6, 1, '2026-11-13 16:00:00', 'Pagamento', 'Farmácia',               'Farmácia',        -74.90),
  (7, 1, '2026-11-14 12:00:00', 'Entrada',   'Transferência recebida', 'Entrada',         150.00);

-- LEMBRETE_CONTA: contas a pagar (aba "Anotações" da fachada).
-- Pagar um lembrete gera uma movimentação do tipo 'Pagamento'.
CREATE TABLE IF NOT EXISTS lembrete_conta (
  id_lembrete INT AUTO_INCREMENT PRIMARY KEY,
  id_usuaria  INT NOT NULL,
  descricao   VARCHAR(100) NOT NULL,
  valor       DECIMAL(10, 2) NOT NULL,
  vencimento  DATE NOT NULL,
  pago        TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_lembrete_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE
);

INSERT IGNORE INTO lembrete_conta (id_lembrete, id_usuaria, descricao, valor, vencimento, pago) VALUES
  (1, 1, 'Internet',    99.90, '2026-11-25', 0),
  (2, 1, 'Conta de água', 68.40, '2026-11-28', 0);

-- COFRINHO: a meta de economia da usuária (uma por usuária).
-- O valor guardado não fica aqui: é calculado pelas movimentações do tipo 'Cofrinho'.
CREATE TABLE IF NOT EXISTS cofrinho (
  id_usuaria INT PRIMARY KEY,
  nome_meta  VARCHAR(60) NOT NULL,
  valor_meta DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_cofrinho_usuaria FOREIGN KEY (id_usuaria)
    REFERENCES usuaria(id_usuaria) ON DELETE CASCADE
);

INSERT IGNORE INTO cofrinho (id_usuaria, nome_meta, valor_meta) VALUES
  (1, 'Reserva de emergência', 1000.00);
