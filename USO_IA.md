## Primeiro prompt da criação da ideia

Preciso criar uma ideia de aplicativo para um projeto da faculdade na disciplina de desenvolvimento mobile.  
O tema do projeto é violência contra a mulher e precisamos desenvolver um aplicativo em React Native que tenha alguns CRUDs e use uma API.
Pensei em fazer um aplicativo disfarçado de outra coisa para que, caso outra pessoa pegue o celular, não perceba que é um aplicativo de apoio para mulheres em situação de violência.
A ideia seria ele parecer um aplicativo de controle financeiro, mostrando saldo, gastos, receitas e movimentações. Mas teria alguma forma escondida de acessar uma segunda parte do aplicativo, talvez segurando o saldo por alguns segundos e colocando um PIN.
Nessa área escondida poderia ter:
- cadastro de contatos de confiança;
- registro de ocorrências;
- perfil da usuária;
- botão de alerta ou SOS;
- acesso aos números 180 e 190;
- uma opção para sair rapidamente e voltar para a tela de finanças.
Somos 4 pessoas no grupo, então precisamos pensar em pelo menos 4 CRUDs para dividir entre os integrantes.
Me ajude a organizar essa ideia de forma simples, falando sobre o objetivo do aplicativo, principais funcionalidades, possíveis telas e como poderíamos dividir os CRUDs entre os integrantes do projeto.

## Entrega 2 - Telas do Perfil da Usuária (João)

Ferramenta: Claude

Preciso fazer as telas do meu CRUD, que é o Perfil da Usuária, pra Entrega 2. O pessoal vai fazer a fachada e o Drawer, então eu fico só com o perfil: uma tela pra mostrar os dados e outra pra editar. Ainda é com dados fictícios porque a API só entra na Entrega 4. Tem que seguir a tabela USUARIA do nosso DER e o PIN não pode aparecer em texto puro.

Como foi: eu defini o que o perfil precisava ter a partir do DER e da divisão do grupo. O Claude montou a primeira versão das telas (`src/pages/perfil/`), do `PerfilStack` e dos dados fictícios (`src/mocks/usuaria.js`), e eu revisei o código e conferi se o PIN nunca aparece. A validação do formulário (nome, e-mail e PIN de 4 números) foi testada no navegador.
