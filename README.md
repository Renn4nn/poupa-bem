# Poupa Bem

Aplicativo mobile em **React Native (Expo)** de apoio a mulheres em situação de violência, desenvolvido como Projeto Integrador da disciplina de Desenvolvimento Mobile.

Para proteger a usuária, o app é **disfarçado de controle financeiro**: quem abrir o celular vê saldo, gastos e movimentações. A área de apoio fica escondida atrás de um **PIN**, e as abas usam nomes financeiros (Pagamentos, Anotações, Cofrinho) para manter o disfarce.

## Funcionalidades

| Módulo (CRUD) | Aba no app (disfarce) | Responsável | O que faz |
| --- | --- | --- | --- |
| Perfil da usuária | Perfil | João | Ver e editar dados; PIN nunca aparece em texto puro |
| Contatos de confiança | Pix e Pagamentos | Renan | Lista de contatos da rede de apoio |
| Diário de ocorrências | Anotações | Alisson | Criar, listar, ver, editar e excluir registros (tipos da Lei Maria da Penha) |
| Alertas / SOS | Cofrinho | Gabriel | Botão de SOS (segurar 2 s) que envia a localização, histórico, detalhe, alteração de status e exclusão |

Também estão previstos acesso rápido aos números **180** (Central de Atendimento à Mulher) e **190** (Polícia) e uma saída rápida para a tela de finanças.

> Por enquanto os dados são fictícios (`src/mocks/`). As telas acessam os dados apenas pelos serviços em `src/services/`, então a integração com a API vai trocar só os serviços, sem mudar as telas.

## Tecnologias

- [Expo](https://expo.dev/) SDK 57 / React Native 0.86
- React Navigation (bottom tabs + native stack)
- `@expo/vector-icons` (Ionicons)
- `expo-location` (localização do SOS)

## Como rodar

Pré-requisitos: Node.js LTS e npm.

```bash
git clone https://github.com/Renn4nn/poupa-bem.git
cd poupa-bem
npm install

npm run web       # abre no navegador
npm run android   # build de desenvolvimento no Android
npm run ios       # build de desenvolvimento no iOS (macOS)
```

> Para instalar novas bibliotecas use `npx expo install <pacote>` (garante versões compatíveis com o SDK do Expo).

## Estrutura de pastas

```
poupa-bem/
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
│   ├── services/           # Funções de acesso aos dados (futuras chamadas à API)
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
