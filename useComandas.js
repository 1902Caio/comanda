import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { db } from './firebaseConfig';
import { ref, onValue, set, push, remove } from 'firebase/database';

const SENHA_CORRETA = '1234';

/**
 * Hook que concentra todo o estado e a lógica de negócio do app:
 * cardápio, comandas ativas, histórico, e todas as ações que mexem
 * no Firebase. As telas (screens) só consomem o que esse hook expõe.
 */
export function useComandas() {
  // CARDÁPIO BASE
  const [cardapio, setCardapio] = useState([]);

  // ESTADOS DO CADASTRO DE CARDÁPIO
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');

  // ESTADOS DO LANÇAMENTO DE COMANDA
  const [mesa, setMesa] = useState('');
  const [itensComanda, setItensComanda] = useState([]);

  // COMANDAS ATIVAS NO RESTAURANTE
  const [comandasAtivas, setComandasAtivas] = useState([]);

  // HISTÓRICO DE COMANDAS FECHADAS
  const [historicoComandas, setHistoricoComandas] = useState([]);

  // CONTROLE DE ACESSO POR SENHA NO HISTÓRICO
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [historicoAutorizado, setHistoricoAutorizado] = useState(false);

  // ---------------------------------------------------------------
  // CARREGAMENTO DE DADOS DO FIREBASE
  // ---------------------------------------------------------------
  useEffect(() => {
    const cardapioRef = ref(db, 'cardapio');
    const unsubscribeCardapio = onValue(cardapioRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lista = Object.entries(data).map(([id, valores]) => ({ id, ...valores }));
      setCardapio(lista);
    });
    return () => unsubscribeCardapio();
  }, []);

  useEffect(() => {
    const ativasRef = ref(db, 'comandasAtivas');
    const unsubscribeAtivas = onValue(ativasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lista = Object.entries(data).map(([mesaId, valores]) => ({
        id: mesaId,
        ...valores
      }));
      setComandasAtivas(lista);
    });
    return () => unsubscribeAtivas();
  }, []);

  useEffect(() => {
    const historicoRef = ref(db, 'historicoComandas');
    const unsubscribeHistorico = onValue(historicoRef, (snapshot) => {
      const data = snapshot.val() || {};
      const lista = Object.entries(data).map(([id, valores]) => ({ id, ...valores }));
      // mais recentes primeiro
      lista.sort((a, b) => (b.fechadaEm || 0) - (a.fechadaEm || 0));
      setHistoricoComandas(lista);
    });
    return () => unsubscribeHistorico();
  }, []);

  // ---------------------------------------------------------------
  // HISTÓRICO / SENHA
  // ---------------------------------------------------------------
  const verificarSenha = () => {
    if (senhaDigitada === SENHA_CORRETA) {
      setHistoricoAutorizado(true);
      setSenhaDigitada('');
    } else {
      Alert.alert('Erro', 'Senha incorreta!');
      setSenhaDigitada('');
    }
  };

  // ---------------------------------------------------------------
  // CARDÁPIO
  // ---------------------------------------------------------------
  const adicionarProdutoCardapio = () => {
    if (!novoNome || !novoPreco) return Alert.alert('Atenção', 'Preencha o nome e o preço!');
    const valorNumerico = parseFloat(novoPreco.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) return Alert.alert('Erro', 'Preço inválido!');

    const novoRef = push(ref(db, 'cardapio'));
    set(novoRef, {
      nome: novoNome,
      preco: valorNumerico
    })
      .then(() => {
        setNovoNome('');
        setNovoPreco('');
        Alert.alert('Sucesso', 'Produto cadastrado na nuvem!');
      })
      .catch((error) => {
        // Se cair aqui, normalmente é regra de permissão do Realtime Database
        // (ver Firebase Console > Realtime Database > Regras) ou databaseURL errado.
        console.error('[cardapio] ERRO ao cadastrar produto: ', error);
        Alert.alert('Erro', `Não foi possível salvar: ${error.message}`);
      });
  };

  const removerProdutoCardapio = (produtoId) => {
    Alert.alert('Remover produto', 'Tem certeza que deseja remover este item do cardápio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => remove(ref(db, `cardapio/${produtoId}`))
      }
    ]);
  };

  // ---------------------------------------------------------------
  // RASCUNHO DE ITENS (tela "Lançar")
  // ---------------------------------------------------------------
  const adicionarItemComanda = (produto) => {
    const itemExistente = itensComanda.find((item) => item.id === produto.id);
    if (itemExistente) {
      setItensComanda(
        itensComanda.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      );
    } else {
      setItensComanda([...itensComanda, { ...produto, quantidade: 1 }]);
    }
  };

  const removerItemComanda = (produtoId) => {
    const itemExistente = itensComanda.find((item) => item.id === produtoId);
    if (!itemExistente) return; // Evita travar se o item não existir no rascunho

    if (itemExistente.quantidade > 1) {
      setItensComanda(
        itensComanda.map((item) =>
          item.id === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item
        )
      );
    } else {
      setItensComanda(itensComanda.filter((item) => item.id !== produtoId));
    }
  };

  const calcularTotalRascunho = () => {
    return itensComanda.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  };

  // ---------------------------------------------------------------
  // COMANDAS JÁ LANÇADAS (Firebase)
  // ---------------------------------------------------------------
  const calcularTotalComanda = (itens) => {
    return itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  };

  const removerItemDaMesa = (numeroMesa, produtoId) => {
    const comandaMesa = comandasAtivas.find((c) => c.mesa === numeroMesa);
    if (!comandaMesa) return;

    const itensAtualizados = comandaMesa.itens
      .map((item) => {
        if (item.id === produtoId) {
          return { ...item, quantidade: item.quantidade - 1 };
        }
        return item;
      })
      .filter((item) => item.quantidade > 0);

    if (itensAtualizados.length === 0) {
      remove(ref(db, `comandasAtivas/${numeroMesa}`))
        .then(() => Alert.alert('Mesa Liberada', `Todos os itens da Mesa ${numeroMesa} foram removidos.`))
        .catch((err) => console.error('Erro ao remover mesa: ', err));
    } else {
      set(ref(db, `comandasAtivas/${numeroMesa}`), {
        ...comandaMesa,
        itens: itensAtualizados
      }).catch((err) => console.error('Erro ao atualizar itens da mesa: ', err));
    }
  };

  const selecionarMesaParaAdicionar = (numeroMesa, setAbaAtiva) => {
    setMesa(numeroMesa);
    setItensComanda([]);
    setAbaAtiva('comanda');
  };

  // ETAPA 1: fecha a comanda para pedir a conta.
  // A mesa continua em comandasAtivas (e aparece no Balcão), mas fica travada
  // para novos itens até ser reaberta ou o pagamento ser confirmado.
  const fecharComanda = (item) => {
    Alert.alert('Fechar Comanda', `Confirma o fechamento da conta da Mesa ${item.mesa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Fechar',
        onPress: () => {
          set(ref(db, `comandasAtivas/${item.mesa}`), {
            ...item,
            status: 'fechada'
          })
            .then(() => Alert.alert('Conta Fechada', `Mesa ${item.mesa} está pronta para pagamento no Balcão.`))
            .catch((err) => {
              Alert.alert('Erro', 'Não foi possível fechar a comanda.');
              console.error(err);
            });
        }
      }
    ]);
  };

  // Volta uma comanda fechada para "aberta", caso o cliente peça mais alguma coisa
  const reabrirComanda = (item) => {
    set(ref(db, `comandasAtivas/${item.mesa}`), {
      ...item,
      status: 'aberta'
    }).catch((err) => {
      Alert.alert('Erro', 'Não foi possível reabrir a comanda.');
      console.error(err);
    });
  };

  // ETAPA 2: confirma que o cliente pagou. Só agora a comanda vai para o
  // histórico (protegido por senha) e some do Balcão/Mesas.
  const confirmarPagamento = (item) => {
    Alert.alert('Confirmar Pagamento', `Confirma que a Mesa ${item.mesa} foi paga?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          const historicoRef = push(ref(db, 'historicoComandas'));
          set(historicoRef, {
            mesa: item.mesa,
            itens: item.itens,
            total: calcularTotalComanda(item.itens),
            fechadaEm: Date.now()
          })
            .then(() => remove(ref(db, `comandasAtivas/${item.mesa}`)))
            .then(() => Alert.alert('Pagamento Confirmado', `Mesa ${item.mesa} finalizada com sucesso.`))
            .catch((err) => {
              Alert.alert('Erro', 'Não foi possível confirmar o pagamento.');
              console.error(err);
            });
        }
      }
    ]);
  };

  const enviarPedido = () => {
    if (!mesa) return Alert.alert('Atenção', 'Digite o número da mesa!');
    if (itensComanda.length === 0) return Alert.alert('Atenção', 'Adicione pelo menos um item!');

    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const comandaMesaExistente = comandasAtivas.find((c) => c.mesa === mesa);

    if (comandaMesaExistente && comandaMesaExistente.status === 'fechada') {
      return Alert.alert(
        'Comanda Fechada',
        `A Mesa ${mesa} já pediu a conta. Reabra a comanda na aba "Mesas" antes de lançar novos itens.`
      );
    }

    let itensAtualizados = [];

    if (comandaMesaExistente) {
      itensAtualizados = [...comandaMesaExistente.itens];
      itensComanda.forEach((novoItem) => {
        const index = itensAtualizados.findIndex((i) => i.id === novoItem.id);
        if (index > -1) {
          itensAtualizados[index] = {
            ...itensAtualizados[index],
            quantidade: itensAtualizados[index].quantidade + novoItem.quantidade
          };
        } else {
          itensAtualizados.push({ ...novoItem });
        }
      });
    } else {
      itensAtualizados = [...itensComanda];
    }

    set(ref(db, `comandasAtivas/${mesa}`), {
      mesa: mesa,
      itens: itensAtualizados,
      ultimaHora: horaAtual,
      status: 'aberta'
    })
      .then(() => {
        Alert.alert('Sucesso! 🚀', `Itens adicionados à comanda da Mesa ${mesa}!`);
        setMesa('');
        setItensComanda([]);
      })
      .catch((error) => {
        Alert.alert('Erro', 'Não foi possível salvar o pedido no banco de dados.');
        console.error(error);
      });
  };

  return {
    // cardápio
    cardapio,
    novoNome,
    setNovoNome,
    novoPreco,
    setNovoPreco,
    adicionarProdutoCardapio,
    removerProdutoCardapio,

    // rascunho da comanda
    mesa,
    setMesa,
    itensComanda,
    adicionarItemComanda,
    removerItemComanda,
    calcularTotalRascunho,
    enviarPedido,

    // comandas ativas
    comandasAtivas,
    calcularTotalComanda,
    removerItemDaMesa,
    selecionarMesaParaAdicionar,
    fecharComanda,
    reabrirComanda,
    confirmarPagamento,

    // histórico
    historicoComandas,
    senhaDigitada,
    setSenhaDigitada,
    historicoAutorizado,
    verificarSenha
  };
}