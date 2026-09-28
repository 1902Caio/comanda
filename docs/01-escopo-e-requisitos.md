# Bloco 1 — Escopo e requisitos

**Estado:** rascunho inicial, baseado no código existente e nas especificações fornecidas.

## 1. Propósito

O RestauranteApp é uma aplicação mobile para apoiar operações de restaurante. O escopo inicial cobre autenticação, consulta e edição do cardápio, lançamento e acompanhamento de comandas, confirmação de pagamentos e consulta do histórico.

## 2. Atores identificados

| Ator | Responsabilidade no escopo |
| --- | --- |
| Funcionário do restaurante | Registar itens em comandas, acompanhar mesas e indicar fecho/pagamento. O perfil exato (garçom, caixa ou outro) ainda precisa de confirmação. |
| Administrador/gestor | Gerir cardápio e consultar dados do histórico financeiro. Permissões específicas ainda precisam de confirmação. |
| Firebase Authentication | Serviço externo que autentica a sessão da aplicação. |

Os papéis funcionário e administrador são uma proposta de domínio; o código atual não implementa autorização por papel.

## 3. Requisitos funcionais iniciais

Os requisitos abaixo descrevem funcionalidades visíveis no código atual, salvo quando marcados como **planejado**.

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-01 | Permitir autenticação e apresentar a área principal apenas quando existir utilizador autenticado. | Existente |
| RF-02 | Consultar o cardápio e adicionar ou remover produtos. | Existente |
| RF-03 | Criar ou atualizar a comanda de uma mesa com itens e quantidades. | Existente |
| RF-04 | Consultar comandas ativas e ajustar itens de uma mesa. | Existente |
| RF-05 | Marcar uma comanda como fechada e permitir reabri-la. | Existente |
| RF-06 | Confirmar o pagamento, guardar a comanda no histórico e removê-la das comandas ativas. | Existente |
| RF-07 | Restringir a visualização do histórico através de uma senha. | Parcial: existe uma validação local no cliente; não é controlo de acesso seguro no servidor. |
| RF-08 | Disponibilizar uma API própria para as operações do restaurante. | Planejado; não identificada no código atual. |

## 4. Requisitos não funcionais iniciais

| ID | Requisito | Nota / estado |
| --- | --- | --- |
| RNF-01 | Proteger dados e operações financeiras com autenticação e autorização verificadas no servidor. | Necessidade a implementar/validar; a senha local atual não satisfaz este requisito. |
| RNF-02 | Manter consistência entre pagamento, histórico e remoção da comanda ativa. | Necessidade arquitetural; o fluxo atual executa gravações Firebase em sequência. |
| RNF-03 | Exibir atualizações das comandas e do cardápio sem exigir recarregamento manual. | Implementado com listeners do Firebase Realtime Database. |
| RNF-04 | Documentar e fixar versões compatíveis das tecnologias usadas. | Pendente de alinhamento: a instrução do repositório aponta para Expo SDK 54 e `package.json` declara Expo 57. |
| RNF-05 | Disponibilizar a aplicação para dispositivos móveis e, conforme a configuração atual, web. | Plataformas declaradas no projeto; requisitos de desempenho e suporte ainda não definidos. |

## 5. Regras de negócio observadas

- Uma comanda precisa de mesa e pelo menos um item antes de ser enviada.
- Não se podem adicionar itens a uma comanda marcada como fechada; é necessário reabri-la primeiro.
- O pagamento confirmado gera um registo no histórico e remove a comanda ativa.
- A aplicação calcula o total a partir do preço e da quantidade de cada item.
- A senha atualmente usada para liberar o histórico está embutida no código do cliente. Deve ser tratada como implementação provisória, não como regra de segurança válida.

## 6. Arquitetura e tecnologias: estado conhecido

- **Cliente:** React Native com Expo.
- **Autenticação:** Firebase Authentication.
- **Persistência e atualizações em tempo real:** Firebase Realtime Database.
- **API própria:** prevista nas especificações, ainda não encontrada no repositório.
- **Firestore:** mencionado como possibilidade nas especificações, mas o código atual importa `firebase/database`; portanto, a base observada é Realtime Database, não Firestore.

Expo SDK 54 associa-se a React Native 0.81 e React 19.1 segundo a [documentação versionada do Expo](https://docs.expo.dev/versions/v54.0.0/). As versões declaradas no projeto são diferentes; a documentação de arquitetura deve ser atualizada quando essa divergência for resolvida.

## 7. Fora do escopo deste bloco

Casos de uso detalhados, diagramas, modelo de dados completo, contratos da API, implantação, critérios mensuráveis de desempenho e segurança serão documentados nos próximos blocos, depois de confirmados os requisitos.

## 8. Decisões em aberto

1. Quais papéis de utilizador existem e que ações cada papel pode executar?
2. O sistema usará uma API própria como backend principal? Qual será a responsabilidade do Firebase depois dessa API existir?
3. A persistência pretendida é Firebase Realtime Database ou Cloud Firestore?
4. O histórico exige autenticação por conta, autorização por papel ou ambos? A senha fixa deve ser removida.
5. O projeto terá suporte oficial a Android, iOS e web?
6. Qual é a versão Expo alvo: SDK 54 (instrução local) ou SDK 57 (dependências atuais)?

## Próximo bloco

Validar este escopo e, em seguida, detalhar atores, permissões e regras de negócio num catálogo rastreável antes de desenhar os casos de uso.
