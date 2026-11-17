# Poupa Bem

Aplicativo mobile em **React Native (Expo)** de apoio a mulheres em situação de violência, desenvolvido como Projeto Integrador da disciplina de Desenvolvimento Mobile.

Para proteger a usuária, o app é **disfarçado de controle financeiro**: quem abrir o celular vê saldo, gastos e movimentações. A área de apoio fica escondida atrás de um **PIN**, e as abas usam nomes financeiros (Pagamentos, Anotações, Cofrinho) para manter o disfarce.

## Funcionalidades

| Módulo (CRUD) | Aba no app (disfarce) | Responsável | O que faz |
| --- | --- | --- | --- |
| Perfil da usuária | Perfil | João | Criar, ver, editar e excluir o perfil pela API; PIN salvo só como hash (bcrypt) e nunca exibido; mostra quantos alertas estão ligados à usuária |
| Contatos de confiança | Pix e Pagamentos | Renan | Lista de contatos da rede de apoio |
| Diário de ocorrências | Anotações | Alisson | Criar, listar, ver, editar e excluir registros (tipos da Lei Maria da Penha) |
| Alertas / SOS | Cofrinho | Gabriel | Botão de SOS (segurar 2 s) que envia a localização, histórico, detalhe, alteração de status e exclusão |

Também estão previstos acesso rápido aos números **180** (Central de Atendimento à Mulher) e **190** (Polícia) e uma saída rápida para a tela de finanças.

> As telas acessam os dados apenas pelos serviços em `src/services/`, então a integração com a API troca só os serviços, sem mudar as telas. O Perfil já usa a API (`usuariaService.js`); os módulos que ainda não foram integrados usam os dados fictícios de `src/mocks/`. Todos os dados de teste são fictícios.

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

Rotas do Perfil da Usuária (`/usuarias`):

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/usuarias` | Lista as usuárias (sem o hash do PIN) |
| GET | `/usuarias/:id` | Busca uma usuária (404 se não existir) |
| POST | `/usuarias` | Cria `{ nome, email, pin }` (201; 409 se o e-mail já existe) |
| PUT | `/usuarias/:id` | Atualiza `{ nome, email, pin? }` (o PIN é opcional) |
| DELETE | `/usuarias/:id` | Exclui a usuária e, em cascata, os dados ligados a ela (204) |
| GET | `/usuarias/:id/resumo` | Quantos alertas estão ligados à usuária (relacionamento 1:N) |
| POST | `/usuarias/:id/verificar-pin` | Confere `{ pin }` com o hash salvo e devolve `{ valido }` |

Usuária de teste: id 1, PIN `1234`.

### 2. App (raiz do projeto)

```bash
git clone https://github.com/Renn4nn/poupa-bem.git
cd poupa-bem
npm install

npm run web       # abre no navegador
npm run android   # build de desenvolvimento no Android
npm run ios       # build de desenvolvimento no iOS (macOS)
```

O app chama a API em `http://localhost:3000`, o que funciona no navegador. No celular (Expo Go), crie um `.env` na raiz com o IP do computador na mesma rede, por exemplo `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000`, e reinicie o Expo.

> Para instalar novas bibliotecas use `npx expo install <pacote>` (garante versões compatíveis com o SDK do Expo).

## Estrutura de pastas

```
poupa-bem/
├── api/                    # Back-end Node.js/Express
│   ├── database/schema.sql # Tabelas do MySQL + dados de teste
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
│   ├── mocks/              # Dados fictícios (usuária, contatos, ocorrências, alertas)
│   ├── navigation/
│   │   ├── RootNavigation.js   # Pin -> abas principais
│   │   ├── TabsMain.js         # Abas: Início, Pagamentos, Anotações, Cofrinho, Perfil
│   │   ├── ContatosStack.js
│   │   ├── OcorrenciasStack.js
│   │   ├── AlertasStack.js
│   │   └── PerfilStack.js
│   ├── pages/
│   │   ├── Home.js             # Tela de fachada (finanças)
│   │   ├── Pin.js              # Acesso à área escondida
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

1. `src/mocks/<modulo>.js` – dados fictícios
2. `src/services/<modulo>Service.js` – funções `async` (listar, buscar, criar, atualizar, excluir)
3. `src/pages/<modulo>/` – telas
4. `src/navigation/<Modulo>Stack.js` – stack do módulo, registrado em `TabsMain.js` com nome de aba disfarçado

## Equipe

- Renan Augusto – Contatos de confiança
- João Miguel – Perfil da usuária
- Alisson – Diário de ocorrências
- Gabriel – Alertas / SOS

O uso de ferramentas de IA em cada entrega está documentado em [`USO_IA.md`](USO_IA.md).

## Licença

Distribuído sob a licença descrita em [`LICENSE`](LICENSE).
