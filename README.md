# Poupa Bem

Aplicativo mobile em **React Native (Expo)** de apoio a mulheres em situação de violência, desenvolvido como Projeto Integrador da disciplina de Desenvolvimento Mobile.

Para proteger a usuária, o app é **disfarçado de controle financeiro**: quem abrir o celular vê saldo, gastos e movimentações. A área de apoio fica escondida atrás de um **PIN**, e as abas usam nomes financeiros (Pagamentos, Anotações, Cofrinho) para manter o disfarce.

## Funcionalidades

| Módulo (CRUD) | Aba no app (disfarce) | Responsável | O que faz |
| --- | --- | --- | --- |
| Perfil da usuária | Perfil | João | Criar, ver, editar e excluir o perfil pela API; PIN salvo só como hash (bcrypt) e nunca exibido; mostra quantos alertas estão ligados à usuária |
| Contatos de confiança | Pix e Pagamentos | Renan | Criar, listar, editar e excluir contatos da rede de apoio pela API |
| Diário de ocorrências | Anotações | Alisson | Criar, listar, ver, editar e excluir registros pela API (tipos da Lei Maria da Penha) |
| Alertas / SOS | Cofrinho | Gabriel | Botão de SOS (segurar 2 s) que envia a localização pela API, histórico, detalhe, alteração de status e exclusão |

Além dos CRUDs:

- **Fachada:** o app abre numa tela de finanças com saldo, gastos e movimentações fictícios. Segurar o card do saldo por **3 segundos** abre o PIN.
- **PIN:** o teclado confere o código na API (`verificar-pin`), que compara com o hash salvo no banco.
- **Saída rápida:** o ícone no canto do cabeçalho de todas as telas da área de apoio volta para a tela de finanças e apaga o histórico de navegação.
- **180 e 190:** atalhos para ligar na aba Início da área de apoio. Nada é enviado automaticamente à polícia.
- **Painel da delegacia:** página web em `http://localhost:3000/painel` que consulta os alertas a cada 5 segundos e permite mudar o status.

> As telas acessam os dados apenas pelos serviços em `src/services/`, e cada serviço chama a API pelo `api.js`. Em `src/mocks/` ficaram só a usuária de teste (id 1) e as listas fixas (tipos de ocorrência e status de alerta). Todos os dados de teste são fictícios.

## Tecnologias

- [Expo](https://expo.dev/) SDK 57 / React Native 0.86
- React Navigation (bottom tabs + native stack)
- `@expo/vector-icons` (Ionicons)
- `expo-location` (localização do SOS)
- API: Node.js + Express 5, MySQL (`mysql2`), `bcryptjs` para o hash do PIN

## Como rodar

Pré-requisitos: Node.js LTS, npm e um MySQL (ou MariaDB, como o do XAMPP).

### 1. API (pasta `api/`)

```bash
cd api
cp .env.example .env           # ajuste usuário/senha do seu MySQL
mysql -u root -p < database/schema.sql   # cria o banco poupabem com dados de teste
npm install
npm start                      # API em http://localhost:3000
```

Rotas da API (os erros voltam como `{ "erro": "mensagem" }` com 400, 404 ou 409):

**Perfil da Usuária (`/usuarias`)**

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/usuarias` | Lista as usuárias (sem o hash do PIN) |
| GET | `/usuarias/:id` | Busca uma usuária (404 se não existir) |
| POST | `/usuarias` | Cria `{ nome, email, pin }` (201; 409 se o e-mail já existe) |
| PUT | `/usuarias/:id` | Atualiza `{ nome, email, pin? }` (o PIN é opcional) |
| DELETE | `/usuarias/:id` | Exclui a usuária e, em cascata, os dados ligados a ela (204) |
| GET | `/usuarias/:id/resumo` | Quantos alertas estão ligados à usuária (relacionamento 1:N) |
| POST | `/usuarias/:id/verificar-pin` | Confere `{ pin }` com o hash salvo e devolve `{ valido }` |

**Contatos de confiança (`/contatos`)**

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/contatos?id_usuaria=1` | Lista os contatos da usuária (sem o filtro, lista todos) |
| GET | `/contatos/:id` | Busca um contato (404 se não existir) |
| POST | `/contatos` | Cria `{ id_usuaria, nome, telefone, parentesco? }` (201) |
| PUT | `/contatos/:id` | Atualiza `{ nome, telefone, parentesco? }` |
| DELETE | `/contatos/:id` | Exclui o contato; os alertas que o citavam ficam sem contato (204) |

**Diário de ocorrências (`/ocorrencias`)**

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/ocorrencias?id_usuaria=1` | Lista as ocorrências da usuária, da mais recente para a mais antiga |
| GET | `/ocorrencias/:id` | Busca uma ocorrência (404 se não existir) |
| POST | `/ocorrencias` | Cria `{ id_usuaria, data, tipo, local?, descricao }` (201; data no formato `AAAA-MM-DD`, não pode ser futura) |
| PUT | `/ocorrencias/:id` | Atualiza `{ data, tipo, local?, descricao }` |
| DELETE | `/ocorrencias/:id` | Exclui a ocorrência (204) |

**Alertas / SOS (`/alertas`)**

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/alertas` | Lista todos os alertas (usado pelo painel); aceita `?id_usuaria=1` e `?status=Novo` |
| GET | `/alertas/:id` | Busca um alerta, com o nome da usuária e do contato avisado |
| POST | `/alertas` | Cria `{ id_usuaria, latitude?, longitude?, id_contato? }`; data/hora e status `Novo` são preenchidos pela API (201) |
| PATCH | `/alertas/:id/status` | Muda o status para `Novo`, `Em atendimento` ou `Concluído` |
| DELETE | `/alertas/:id` | Exclui o alerta (204) |

**Painel da delegacia:** abra `http://localhost:3000/painel` no navegador com a API rodando.

Usuária de teste: id 1, PIN `1234`. Excluir a usuária apaga junto os contatos, ocorrências e alertas dela.

### 2. App (raiz do projeto)

```bash
git clone https://github.com/Renn4nn/poupa-bem.git
cd poupa-bem
npm install

npm run web       # abre no navegador
npm run android   # build de desenvolvimento no Android
npm run ios       # build de desenvolvimento no iOS (macOS)
```

Para entrar na área de apoio: na tela de finanças, segure o card do saldo por 3 segundos e digite o PIN `1234`.

O app chama a API em `http://localhost:3000`, o que funciona no navegador. No celular (Expo Go), crie um `.env` na raiz com o IP do computador na mesma rede, por exemplo `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000`, e reinicie o Expo.

> Para instalar novas bibliotecas use `npx expo install <pacote>` (garante versões compatíveis com o SDK do Expo).

## Estrutura de pastas

```
poupa-bem/
├── api/                    # Back-end Node.js/Express
│   ├── database/schema.sql # Tabelas do MySQL + dados de teste
│   ├── public/painel.html  # Painel web da delegacia (polling dos alertas)
│   └── src/
│       ├── server.js       # Sobe a API (lê o .env)
│       ├── app.js          # Express, rotas e tratamento de erros
│       ├── db.js           # Conexão com o MySQL
│       ├── rotas/          # Endereços de cada CRUD
│       └── controladores/  # O que cada rota faz no banco
├── App.js                  # Ponto de entrada: SafeArea + NavigationContainer
├── index.js
├── app.json                # Configuração do Expo
├── src/
│   ├── assets/             # Imagens (logo)
│   ├── components/         # Peças reaproveitadas (carregando/erro, botão de saída rápida)
│   ├── mocks/              # Usuária de teste e listas fixas (tipos, status)
│   ├── navigation/
│   │   ├── RootNavigation.js   # Home (fachada) -> Pin -> abas principais
│   │   ├── TabsMain.js         # Abas: Início, Pagamentos, Anotações, Cofrinho, Perfil
│   │   ├── navegacao.js        # Saída rápida (volta para a Home de qualquer tela)
│   │   ├── opcoesHeader.js     # Cabeçalho padrão com o botão de saída rápida
│   │   ├── ContatosStack.js
│   │   ├── OcorrenciasStack.js
│   │   ├── AlertasStack.js
│   │   └── PerfilStack.js
│   ├── pages/
│   │   ├── Home.js             # Tela de fachada (finanças); segurar o saldo 3 s abre o PIN
│   │   ├── Pin.js              # Teclado do PIN, conferido pela API
│   │   ├── InicioApoio.js      # Primeira aba da área de apoio (180, 190, saída rápida)
│   │   ├── contatos/
│   │   ├── ocorrencias/
│   │   ├── alertas/
│   │   └── perfil/
│   ├── services/           # Acesso aos dados; api.js faz as chamadas HTTP à API
│   └── utils/              # Datas e localização
├── android/ ios/           # Projetos nativos gerados pelo Expo
├── AGENTS.md               # Instruções para assistentes de IA
└── USO_IA.md               # Registro do uso de IA em cada entrega
```

### Padrão para um novo módulo

Cada CRUD segue a mesma organização:

1. `api/database/schema.sql` – tabela com `FOREIGN KEY (id_usuaria)` e dados de teste
2. `api/src/controladores/` e `api/src/rotas/` – rotas REST, registradas no `api/src/app.js`
3. `src/services/<modulo>Service.js` – funções `async` que chamam a API com `requisicao` (`api.js`)
4. `src/pages/<modulo>/` – telas, com carregando e erro (`components/EstadoTela.js`)
5. `src/navigation/<Modulo>Stack.js` – stack com `screenOptions={opcoesHeader}`, registrado em `TabsMain.js` com nome de aba disfarçado

## Equipe

- Renan Augusto – Contatos de confiança
- João Miguel – Perfil da usuária
- Alisson – Diário de ocorrências
- Gabriel – Alertas / SOS

O uso de ferramentas de IA em cada entrega está documentado em [`USO_IA.md`](USO_IA.md).

## Licença

Distribuído sob a licença descrita em [`LICENSE`](LICENSE).
