# Bloco 1 — Escopo e requisitos


## 1. Propósito

O RestauranteApp é uma aplicação mobile para apoiar operações de restaurante. O escopo inicial cobre autenticação, consulta e edição do cardápio, lançamento e acompanhamento de comandas, confirmação de pagamentos e consulta do histórico.

## 2. Atores identificados

| Ator | Responsabilidade no escopo |
| --- | --- |
| Garçom | Usa as funcionalidades operacionais do aplicativo, incluindo lançamento de pedidos e acompanhamento das mesas. |
| Caixa | Tem as mesmas opções e o mesmo acesso operacional do garçom. |
| Gerente | É a pessoa autorizada, na operação do restaurante, a inserir a senha local para consultar o histórico de vendas e gerenciar produtos e seções do cardápio. |
| Firebase Authentication | Serviço externo que autentica a sessão da aplicação. |

Garçom e caixa entram pela mesma conta compartilhada. O aplicativo não identifica qual dessas pessoas está usando essa conta.

### Acesso ao histórico: comportamento atual

O histórico fica oculto na interface até a senha local ser validada. A senha está definida no código cliente e não está associada a uma conta individual de gerente. O aplicativo também inicia a leitura do histórico no Firebase para o utilizador autenticado; portanto, esse bloqueio descreve a interface atual, não uma autorização segura dos dados.

## 3. Requisitos funcionais existentes

Um requisito funcional descreve uma ação que o sistema permite realizar. A lista abaixo registra ações já presentes no código.

| ID | Requisito | Estado |
| --- | --- | --- |
| RF-01 | Permitir autenticação e apresentar a área principal apenas quando existir utilizador autenticado. | Existente |
| RF-02 | Consultar o cardápio e adicionar ou remover produtos. | Existente |
| RF-03 | Criar ou atualizar a comanda de uma mesa com itens e quantidades. | Existente |
| RF-04 | Consultar comandas ativas e ajustar itens de uma mesa. | Existente |
| RF-05 | Marcar uma comanda como fechada e permitir reabri-la. | Existente |
| RF-06 | Confirmar o pagamento, guardar a comanda no histórico e removê-la das comandas ativas. | Existente |
| RF-07 | Ocultar o histórico até que seja inserida a senha local. | Existente na interface; a senha não identifica o gerente nem restringe o acesso aos dados no Firebase. |
| RF-08 | No Balcão, permitir imprimir o comprovante de uma comanda fechada; no Histórico, permitir reimprimir o comprovante. | Existente |
| RF-09 | Exigir a senha local para entrar no gerenciamento de produtos e seções do cardápio. | Implementado no código; validação manual pendente |
| RF-10 | Permitir ao gerente cadastrar, editar e excluir seções e produtos, com confirmação antes de exclusões. | Implementado no código; validação manual pendente |
| RF-11 | Permitir organizar produtos em seções e escolher uma seção para consultar seus produtos ao lançar um pedido. | Implementado no código; validação manual pendente |

### Critérios de aceitação confirmados

Critérios de aceitação são resultados observáveis que ajudam a verificar se um requisito está funcionando.

#### RF-01 — Autenticação

- Enquanto verifica a sessão, o aplicativo mostra um indicador de carregamento.
- Sem utilizador autenticado, mostra a tela de login.
- Com credenciais inválidas, mostra um alerta de erro e permite tentar novamente.
- Com autenticação bem-sucedida, mostra a área principal.

#### RF-02 — Cardápio

- O cardápio mostra cada produto com nome e preço.
- Para cadastrar um produto, é necessário informar nome e preço maior que zero.
- Se os dados forem inválidos, aparece um alerta e o produto não é cadastrado.
- Se o cadastro funcionar, o produto aparece no cardápio, surge uma mensagem de sucesso e os campos são limpos.
- Ao tentar remover um produto, o aplicativo pede confirmação. Se cancelar, o produto permanece; se confirmar, é removido.

#### RF-03 — Criar ou atualizar uma comanda

- O aplicativo exige o número da mesa e pelo menos um item; caso falte algum, mostra um alerta.
- Se ainda não houver comanda para a mesa, cria uma.
- Se já houver uma comanda aberta, acrescenta os novos itens a ela.
- Se um produto já estiver na comanda, soma a nova quantidade à quantidade existente.
- Se o salvamento funcionar, confirma o sucesso e limpa o rascunho do pedido.

#### RF-04 — Consultar comandas ativas e ajustar itens

- O aplicativo mostra as comandas ativas e os respetivos itens.
- Numa comanda aberta, ao tocar no botão para remover, o aplicativo pede confirmação para remover uma unidade.
- Se a pessoa cancelar, a comanda não é alterada; se confirmar, a quantidade diminui em um.
- Quando a quantidade do produto chega a zero, esse produto é removido da comanda.
- Se a remoção deixar a comanda sem itens, o aviso informa que a mesa será liberada; após a confirmação, a comanda é removida das comandas ativas.

#### RF-05 — Fechar e reabrir uma comanda

- Ao pedir para fechar uma comanda, o aplicativo pede confirmação.
- Se cancelar, a comanda permanece aberta.
- Se confirmar, a comanda fica marcada como fechada.
- Enquanto estiver fechada, não aceita novos itens nem permite remover itens; ao tentar remover, o aplicativo orienta a reabrir a comanda.
- Se for reaberta, volta a aceitar novos itens e permite remover unidades após confirmação.

#### RF-06 — Confirmar pagamento e finalizar a comanda

- Ao confirmar o pagamento, o aplicativo pede confirmação.
- Se cancelar, não inicia a finalização.
- Se confirmar, grava no histórico a mesa, os itens, o total e a data/hora do fechamento.
- Depois, remove a comanda das comandas ativas e mostra uma mensagem de sucesso.
- Se ocorrer um erro ao salvar, mostra um alerta de erro.

#### RF-07 — Liberar a visualização do histórico

- Antes da validação, o conteúdo do histórico fica oculto na tela.
- Se a senha estiver incorreta, aparece um alerta e o histórico continua oculto.
- Se a senha estiver correta, o histórico fica visível.
- Depois da tentativa, o campo da senha é limpo.

O RF-07 descreve o bloqueio da interface atual; não significa que o acesso aos dados no Firebase esteja restrito.

#### RF-08 — Imprimir e reimprimir comprovantes

- No Balcão, comandas fechadas mostram a opção para imprimir o comprovante; comandas abertas não mostram essa opção.
- Ao selecionar a impressão no Balcão, o comprovante inclui a mesa, os itens, as quantidades, os preços e o total da comanda.
- No Histórico, cada comanda permite reimprimir o comprovante com os dados guardados, incluindo a data de fechamento.
- Imprimir ou reimprimir não altera o estado da comanda nem remove os seus dados.

#### RF-09 — Acessar o gerenciamento do cardápio

- Ao entrar no gerenciamento de produtos e seções, o aplicativo solicita a mesma senha local usada no Histórico.
- Depois de validada, a senha permite permanecer no gerenciamento enquanto essa área estiver aberta.
- Ao sair do gerenciamento, o acesso volta a ficar bloqueado e a senha precisa ser validada novamente numa próxima entrada.
- A senha é uma barreira na interface do aplicativo; não identifica uma conta individual de gerente nem restringe, por si só, os dados no Firebase.

#### RF-10 — Gerenciar seções e produtos

- O gerente pode criar, renomear e excluir seções.
- O sistema não permite duas seções com o mesmo nome; a comparação ignora diferenças entre maiúsculas e minúsculas.
- Renomear uma seção mantém nela os produtos que já estavam associados.
- Ao excluir uma seção, o aplicativo pede confirmação. Se confirmar, a seção e os produtos associados a ela são apagados; se cancelar, permanecem.
- O gerente pode cadastrar e editar produtos, informando nome, preço e seção, e pode mover um produto para outra seção.
- Para excluir um produto, o aplicativo pede confirmação. Se cancelar, o produto permanece; se confirmar, é apagado.
- Produtos existentes sem seção continuam visíveis no gerenciamento para que possam ser associados a uma seção.

#### RF-11 — Consultar produtos por seção ao lançar um pedido

- A tela de lançamento apresenta as seções disponíveis.
- Antes de escolher uma seção, os produtos não são apresentados na lista de lançamento.
- Ao escolher uma seção, a tela apresenta os produtos associados a ela para adicionar ao pedido.

**Estado de validação dos RF-09 a RF-11:** as funcionalidades foram implementadas no código local, mas ainda aguardam teste manual. A documentação registra o comportamento acordado; não afirma que o teste já foi concluído.
