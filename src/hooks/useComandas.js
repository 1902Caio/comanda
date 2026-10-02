import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { db } from '../config/firebaseConfig';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const SENHA_CORRETA = '1234';

/**
 * Hook que concentra todo o estado e a lógica de negócio do app:
 * cardápio, comandas ativas, histórico, e todas as ações que mexem
 * no Firebase.
 */
export function useComandas() {
  // CARDÁPIO BASE
  const [cardapio, setCardapio] = useState([]);
  const [secoesCardapio, setSecoesCardapio] = useState([]);

  // ESTADOS DO LANÇAMENTO DE COMANDA
  const [mesa, setMesa] = useState('');
  const [itensComanda, setItensComanda] = useState([]);

  // COMANDAS ATIVAS NO RESTAURANTE
  const [comandasAtivas, setComandasAtivas] = useState([]);

  // HISTÓRICO DE COMANDAS FECHADAS E FILTRO
  const [historicoComandas, setHistoricoComandas] = useState([]);
  const [dataFiltro, setDataFiltro] = useState('');

  // CONTROLE DE ACESSO POR SENHA NO HISTÓRICO
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [historicoAutorizado, setHistoricoAutorizado] = useState(false);

  // ---------------------------------------------------------------
  // CARREGAMENTO SEGURO DOS DADOS APÓS CONFIRMAÇÃO DO LOGIN
  // ---------------------------------------------------------------
  useEffect(() => {
    const auth = getAuth();
    let unsubscribeCardapio;
    let unsubscribeSecoes;
    let unsubscribeAtivas;
    let unsubscribeHistorico;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeCardapio?.();
      unsubscribeSecoes?.();
      unsubscribeAtivas?.();
      unsubscribeHistorico?.();

      if (user) {
        // 1. ESCUTAR CARDÁPIO
        const cardapioRef = ref(db, 'cardapio');
        unsubscribeCardapio = onValue(
          cardapioRef,
          (snapshot) => {
            const data = snapshot.val();
            if (!data) {
              setCardapio([]);
              return;
            }

            let listaTratada = [];
            if (Array.isArray(data)) {
              listaTratada = data
                .filter(Boolean)
                .map((item, index) => ({
                  id: String(item.id || index),
                  nome: item.nome || 'Sem nome',
                  preco: typeof item.preco === 'number' ? item.preco : parseFloat(item.preco) || 0,
                  secaoId: item.secaoId || ''
                }));
            } else if (typeof data === 'object') {
              listaTratada = Object.entries(data).map(([key, valores]) => ({
                id: key,
                nome: valores?.nome || 'Sem nome',
                preco: typeof valores?.preco === 'number' ? valores.preco : parseFloat(valores?.preco) || 0,
                secaoId: valores?.secaoId || ''
              }));
            }
            setCardapio(listaTratada);
          },
          (error) => {
            console.error('[ERRO CARDAPIO FIREBASE]:', error);
          }
        );

        // 2. ESCUTAR SEÇÕES DO CARDÁPIO
        unsubscribeSecoes = onValue(
          ref(db, 'secoesCardapio'),
          (snapshot) => {
            const data = snapshot.val() || {};
            const lista = Object.entries(data).map(([id, valores]) => ({
              id,
              nome: valores?.nome || ''
            }));
            lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            setSecoesCardapio(lista);
          },
          (error) => console.error('[ERRO SEÇÕES CARDÁPIO FIREBASE]:', error)
        );

        // 3. ESCUTAR COMANDAS ATIVAS
        const ativasRef = ref(db, 'comandasAtivas');
        unsubscribeAtivas = onValue(
          ativasRef,
          (snapshot) => {
            const data = snapshot.val() || {};
            const lista = Object.entries(data).map(([mesaId, valores]) => ({
              id: mesaId,
              ...valores
            }));
            setComandasAtivas(lista);
          },
          (error) => {
            console.error('[ERRO COMANDAS ATIVAS FIREBASE]:', error);
          }
        );

        // 4. ESCUTAR HISTÓRICO DE COMANDAS
        const historicoRef = ref(db, 'historicoComandas');
        unsubscribeHistorico = onValue(
          historicoRef,
          (snapshot) => {
            const data = snapshot.val() || {};
            const lista = Object.entries(data).map(([id, valores]) => ({ id, ...valores }));
            lista.sort((a, b) => (b.fechadaEm || 0) - (a.fechadaEm || 0));
            setHistoricoComandas(lista);
          },
          (error) => {
            console.error('[ERRO HISTORICO FIREBASE]:', error);
          }
        );

      } else {
        // Limpa os dados se o usuário deslogar
        setCardapio([]);
        setSecoesCardapio([]);
        setComandasAtivas([]);
        setHistoricoComandas([]);
        setHistoricoAutorizado(false);
        setSenhaDigitada('');
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCardapio?.();
      unsubscribeSecoes?.();
      unsubscribeAtivas?.();
      unsubscribeHistorico?.();
    };
  }, []);

  // ---------------------------------------------------------------
  // HISTÓRICO / SENHA / CÁLCULO POR FILTRO DE DATA
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

  const obterDataReferencia = (dataStr) => {
    if (!dataStr) return new Date();

    const partes = dataStr.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const ano = parseInt(partes[2], 10);
      const dataValida = new Date(ano, mes, dia);
      if (!isNaN(dataValida.getTime())) return dataValida;
    }

    return new Date();
  };

  const calcularTotalMes = (filtro = dataFiltro) => {
    const dataRef = obterDataReferencia(filtro);
    const mesRef = dataRef.getMonth();
    const anoRef = dataRef.getFullYear();

    return historicoComandas
      .filter((c) => {
        if (!c.fechadaEm) return false;
        const dataComanda = new Date(c.fechadaEm);
        return dataComanda.getMonth() === mesRef && dataComanda.getFullYear() === anoRef;
      })
      .reduce((acc, c) => acc + (c.total || 0), 0);
  };

  const calcularTotalSemana = (filtro = dataFiltro) => {
    const dataRef = obterDataReferencia(filtro);

    const inicioSemana = new Date(dataRef);
    inicioSemana.setDate(dataRef.getDate() - dataRef.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    return historicoComandas
      .filter((c) => {
        if (!c.fechadaEm) return false;
        const dataComanda = new Date(c.fechadaEm);
        return dataComanda >= inicioSemana && dataComanda <= fimSemana;
      })
      .reduce((acc, c) => acc + (c.total || 0), 0);
  };

  // ---------------------------------------------------------------
  // CARDÁPIO
  // ---------------------------------------------------------------
  const validarSenhaGestao = (senha) => senha === SENHA_CORRETA;

  const nomeSecaoEmUso = (nome, ignorarId = null) => {
    const nomeNormalizado = nome.trim().toLocaleLowerCase('pt-BR');
    return secoesCardapio.some((secao) =>
      secao.id !== ignorarId && secao.nome.trim().toLocaleLowerCase('pt-BR') === nomeNormalizado
    );
  };

  const adicionarSecaoCardapio = (nome) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      Alert.alert('Atenção', 'Digite o nome da seção.');
      return false;
    }
    if (nomeSecaoEmUso(nomeLimpo)) {
      Alert.alert('Seção já existe', 'Escolha um nome diferente para a seção.');
      return false;
    }

    const novaRef = push(ref(db, 'secoesCardapio'));
    return set(novaRef, { id: novaRef.key, nome: nomeLimpo })
      .then(() => {
        Alert.alert('Sucesso', 'Seção cadastrada.');
        return true;
      })
      .catch((error) => {
        console.error('[cardapio] Erro ao cadastrar seção:', error);
        Alert.alert('Erro', 'Não foi possível salvar a seção.');
        return false;
      });
  };

  const renomearSecaoCardapio = (secaoId, nome) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      Alert.alert('Atenção', 'Digite o nome da seção.');
      return false;
    }
    if (nomeSecaoEmUso(nomeLimpo, secaoId)) {
      Alert.alert('Seção já existe', 'Escolha um nome diferente para a seção.');
      return false;
    }

    const secao = secoesCardapio.find((item) => item.id === secaoId);
    if (!secao) return;

    return set(ref(db, `secoesCardapio/${secaoId}`), { ...secao, nome: nomeLimpo })
      .then(() => {
        Alert.alert('Sucesso', 'Seção atualizada.');
        return true;
      })
      .catch((error) => {
        console.error('[cardapio] Erro ao renomear seção:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a seção.');
        return false;
      });
  };

  const removerSecaoCardapio = (secaoId) => {
    const secao = secoesCardapio.find((item) => item.id === secaoId);
    if (!secao) return;

    const produtosDaSecao = cardapio.filter((produto) => produto.secaoId === secaoId);
    const mensagem = produtosDaSecao.length > 0
      ? `Excluir a seção "${secao.nome}" também apagará ${produtosDaSecao.length} produto(s) associado(s). Deseja continuar?`
      : `Deseja excluir a seção "${secao.nome}"?`;

    Alert.alert('Confirmar exclusão', mensagem, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, excluir',
        style: 'destructive',
        onPress: () => {
          const alteracoes = { [`secoesCardapio/${secaoId}`]: null };
          produtosDaSecao.forEach((produto) => {
            alteracoes[`cardapio/${produto.id}`] = null;
          });

          update(ref(db), alteracoes).catch((error) => {
            console.error('[cardapio] Erro ao excluir seção:', error);
            Alert.alert('Erro', 'Não foi possível excluir a seção e os seus produtos.');
          });
        }
      }
    ]);
  };

  const adicionarProdutoCardapio = (nome, preco, secaoId) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo || !preco.trim() || !secoesCardapio.some((secao) => secao.id === secaoId)) {
      Alert.alert('Atenção', 'Preencha o nome, o preço e escolha uma seção válida.');
      return false;
    }

    const valorNumerico = parseFloat(preco.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um preço válido maior que zero.');
      return false;
    }

    const novaRef = push(ref(db, 'cardapio'));
    return set(novaRef, {
      id: novaRef.key,
      nome: nomeLimpo,
      preco: valorNumerico,
      secaoId
    })
      .then(() => {
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
        return true;
      })
      .catch((error) => {
        console.error('[cardapio] Erro ao cadastrar produto:', error);
        Alert.alert('Erro', `Não foi possível salvar: ${error.message}`);
        return false;
      });
  };

  const atualizarProdutoCardapio = (produtoId, nome, preco, secaoId) => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo || !preco.trim() || !secoesCardapio.some((secao) => secao.id === secaoId)) {
      Alert.alert('Atenção', 'Preencha o nome, o preço e escolha uma seção válida.');
      return false;
    }

    const valorNumerico = parseFloat(preco.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Erro', 'Digite um preço válido maior que zero.');
      return false;
    }

    const produto = cardapio.find((item) => item.id === produtoId);
    if (!produto) return;

    return set(ref(db, `cardapio/${produtoId}`), {
      ...produto,
      nome: nomeLimpo,
      preco: valorNumerico,
      secaoId
    })
      .then(() => {
        Alert.alert('Sucesso', 'Produto atualizado.');
        return true;
      })
      .catch((error) => {
        console.error('[cardapio] Erro ao atualizar produto:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o produto.');
        return false;
      });
  };

  const removerProdutoCardapio = (produtoId) => {
    const produto = cardapio.find((item) => item.id === produtoId);
    if (!produto) return;

    Alert.alert('Confirmar exclusão', `Deseja excluir o produto "${produto.nome}"?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, excluir',
        style: 'destructive',
        onPress: () => remove(ref(db, `cardapio/${produtoId}`)).catch((error) => {
          console.error('[cardapio] Erro ao excluir produto:', error);
          Alert.alert('Erro', 'Não foi possível excluir o produto.');
        })
      }
    ]);
  };

  // ---------------------------------------------------------------
  // RASCUNHO DE ITENS (tela "Lançar")
  // ---------------------------------------------------------------
  const adicionarItemComanda = (produto) => {
    if (!produto || !produto.id) return;

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
    if (!itemExistente) return;

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
    return itensComanda.reduce((acc, item) => acc + (item.preco || 0) * item.quantidade, 0);
  };

  // ---------------------------------------------------------------
  // COMANDAS JÁ LANÇADAS (Firebase)
  // ---------------------------------------------------------------
  const calcularTotalComanda = (itens) => {
    if (!Array.isArray(itens)) return 0;
    return itens.reduce((acc, item) => acc + (item.preco || 0) * item.quantidade, 0);
  };

  const removerItemDaMesa = (numeroMesa, produtoId) => {
    const comandaMesa = comandasAtivas.find((c) => c.mesa === numeroMesa);
    if (!comandaMesa) return;

    if (comandaMesa.status === 'fechada') {
      return Alert.alert(
        'Comanda fechada',
        `Reabra a comanda da Mesa ${numeroMesa} antes de remover itens.`
      );
    }

    const produtoRemovido = comandaMesa.itens.find((item) => item.id === produtoId);
    if (!produtoRemovido) return;

    const itensAtualizados = comandaMesa.itens
      .map((item) => {
        if (item.id === produtoId) {
          return { ...item, quantidade: item.quantidade - 1 };
        }
        return item;
      })
      .filter((item) => item.quantidade > 0);

    const ultimaUnidadeDaMesa = itensAtualizados.length === 0;
    const mensagemConfirmacao = ultimaUnidadeDaMesa
      ? `Remover a última unidade de ${produtoRemovido.nome}? A Mesa ${numeroMesa} ficará sem itens e será liberada.`
      : `Deseja remover uma unidade de ${produtoRemovido.nome} da Mesa ${numeroMesa}?`;

    Alert.alert('Confirmar remoção', mensagemConfirmacao, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => {
          if (ultimaUnidadeDaMesa) {
            remove(ref(db, `comandasAtivas/${numeroMesa}`))
              .then(() => Alert.alert('Mesa Liberada', `Todos os itens da Mesa ${numeroMesa} foram removidos.`))
              .catch((err) => console.error('Erro ao remover mesa: ', err));
          } else {
            set(ref(db, `comandasAtivas/${numeroMesa}`), {
              ...comandaMesa,
              itens: itensAtualizados
            }).catch((err) => console.error('Erro ao atualizar itens da mesa: ', err));
          }
        }
      }
    ]);
  };

  const selecionarMesaParaAdicionar = (numeroMesa, setAbaAtiva) => {
    setMesa(numeroMesa);
    setItensComanda([]);
    setAbaAtiva('comanda');
  };

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

  const reabrirComanda = (item) => {
    set(ref(db, `comandasAtivas/${item.mesa}`), {
      ...item,
      status: 'aberta'
    }).catch((err) => {
      Alert.alert('Erro', 'Não foi possível reabrir a comanda.');
      console.error(err);
    });
  };

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
    cardapio,
    secoesCardapio,
    validarSenhaGestao,
    adicionarSecaoCardapio,
    renomearSecaoCardapio,
    removerSecaoCardapio,
    adicionarProdutoCardapio,
    atualizarProdutoCardapio,
    removerProdutoCardapio,

    mesa,
    setMesa,
    itensComanda,
    adicionarItemComanda,
    removerItemComanda,
    calcularTotalRascunho,
    enviarPedido,

    comandasAtivas,
    calcularTotalComanda,
    removerItemDaMesa,
    selecionarMesaParaAdicionar,
    fecharComanda,
    reabrirComanda,
    confirmarPagamento,

    historicoComandas,
    dataFiltro,
    setDataFiltro,
    calcularTotalMes,
    calcularTotalSemana,
    senhaDigitada,
    setSenhaDigitada,
    historicoAutorizado,
    verificarSenha
  };
}
