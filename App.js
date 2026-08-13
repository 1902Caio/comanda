import { db } from './firebaseConfig';
import { ref, onValue, set, push, remove } from 'firebase/database';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('comanda');

  // CARDÁPIO BASE
  const [cardapio, setCardapio] = useState([]);

  // ESTADOS DA TELA 1 (Cardápio - cadastro)
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');

  // ESTADOS DA TELA 2 (Nova Comanda / Lançamento)
  const [mesa, setMesa] = useState('');
  const [itensComanda, setItensComanda] = useState([]);

  // COMANDAS ATIVAS NO RESTAURANTE
  const [comandasAtivas, setComandasAtivas] = useState([]);

  // HISTÓRICO DE COMANDAS FECHADAS
  const [historicoComandas, setHistoricoComandas] = useState([]);

  // CONTROLE DE ACESSO POR SENHA NO HISTÓRICO
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [historicoAutorizado, setHistoricoAutorizado] = useState(false);
  const SENHA_CORRETA = '1234';

  // ---------------------------------------------------------------
  // CARREGAMENTO DE DADOS DO FIREBASE (faltava no arquivo original)
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

  const verificarSenha = () => {
    if (senhaDigitada === SENHA_CORRETA) {
      setHistoricoAutorizado(true);
      setSenhaDigitada('');
    } else {
      Alert.alert('Erro', 'Senha incorreta!');
      setSenhaDigitada('');
    }
  };

  // --- CADASTRO DE PRODUTOS ---
  const adicionarProdutoCardapio = () => {
    if (!novoNome || !novoPreco) return Alert.alert('Atenção', 'Preencha o nome e o preço!');
    const valorNumerico = parseFloat(novoPreco.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) return Alert.alert('Erro', 'Preço inválido!');

    console.log('[cardapio] iniciando gravação...', { novoNome, valorNumerico });

    const novoRef = push(ref(db, 'cardapio'));
    set(novoRef, {
      nome: novoNome,
      preco: valorNumerico
    })
      .then(() => {
        console.log('[cardapio] gravação concluída com sucesso, key:', novoRef.key);
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

  // --- GERENCIAR ITENS NO RASCUNHO DO LANÇAMENTO ---
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

  // --- REMOVER/DIMINUIR ITEM DE UMA MESA JÁ LANÇADA NO FIREBASE ---
  // (bloco duplicado do arquivo original foi removido; bug "quantity" -> "quantidade" corrigido)
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

  const calcularTotalRascunho = () => {
    return itensComanda.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  };

  // Faltava no original: total de uma comanda já lançada (usado na aba "Mesas")
  const calcularTotalComanda = (itens) => {
    return itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  };

  // Faltava no original: permite voltar para a mesa e adicionar mais itens a ela
  const selecionarMesaParaAdicionar = (numeroMesa) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* MENU SUPERIOR DE 5 ABAS */}
      <View style={styles.menuAbas}>
        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'comanda' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('comanda')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'comanda' && styles.textoAbaAtivo]}>📝 Lançar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'ativas' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('ativas')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'ativas' && styles.textoAbaAtivo]}>
            📋 Mesas ({comandasAtivas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'balcao' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('balcao')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'balcao' && styles.textoAbaAtivo]}>🖨️ Balcão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'historico' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('historico')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'historico' && styles.textoAbaAtivo]}>🔒 Histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAba, abaAtiva === 'cardapio' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('cardapio')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'cardapio' && styles.textoAbaAtivo]}>🍔 Cardápio</Text>
        </TouchableOpacity>
      </View>

      {/* TELA 1: LANÇAR PEDIDO (COMANDA) */}
      {abaAtiva === 'comanda' && (
        <View style={styles.conteudoAba}>
          <View style={styles.areaMesa}>
            <Text style={styles.label}>Mesa / Comanda:</Text>
            <TextInput
              style={styles.inputMesa}
              placeholder="Ex: 05"
              value={mesa}
              onChangeText={setMesa}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.subtitulo}>Toque para adicionar itens:</Text>
          <View style={{ height: 130 }}>
            <FlatList
              data={cardapio}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cardCardapioComanda} onPress={() => adicionarItemComanda(item)}>
                  <Text style={styles.nomeProduto}>{item.nome}</Text>
                  <Text style={styles.precoVerde}>+ R$ {item.preco.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <Text style={styles.subtitulo}>Itens a Enviar:</Text>
          <View style={styles.areaResumo}>
            {itensComanda.length === 0 ? (
              <Text style={styles.textoVazio}>Nenhum item selecionado.</Text>
            ) : (
              <FlatList
                data={itensComanda}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.linhaItemComanda}>
                    <Text style={styles.textoItem}>
                      {item.quantidade}x {item.nome}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.nomeProduto, { marginRight: 10 }]}>
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </Text>
                      <TouchableOpacity onPress={() => removerItemComanda(item.id)} style={styles.botaoRemover}>
                        <Text style={styles.textoRemover}>❌</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          <View style={styles.rodape}>
            <View style={styles.linhaTotal}>
              <Text style={styles.labelTotal}>Subtotal:</Text>
              <Text style={styles.valorTotal}>R$ {calcularTotalRascunho().toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.botaoAzul} onPress={enviarPedido}>
              <Text style={styles.textoBotao}>Enviar Pedido para o Balcão</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TELA 2: MESAS OCUPADAS */}
      {abaAtiva === 'ativas' && (
        <View style={styles.conteudoAba}>
          <Text style={styles.titulo}>📋 Mesas Ocupadas</Text>
          {comandasAtivas.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhuma mesa ocupada no momento.</Text>
          ) : (
            <FlatList
              data={comandasAtivas}
              keyExtractor={(item) => item.mesa}
              renderItem={({ item }) => (
                <View style={[styles.form, { marginBottom: 15 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.subtitulo, { marginTop: 0, color: '#1976D2' }]}>Mesa {item.mesa}</Text>
                    {item.status === 'fechada' && (
                      <View style={styles.badgeFechada}>
                        <Text style={styles.badgeFechadaTexto}>CONTA FECHADA</Text>
                      </View>
                    )}
                  </View>

                  {item.itens.map((it) => (
                    <View key={it.id} style={styles.linhaItemComanda}>
                      <Text style={styles.textoItem}>
                        • {it.quantidade}x {it.nome}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500', marginRight: 8 }}>
                          R$ {(it.preco * it.quantidade).toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removerItemDaMesa(item.mesa, it.id)}
                          style={styles.botaoRemoverMesa}
                        >
                          <Text style={{ fontSize: 12 }}>❌</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Total Acumulado:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16 }}>
                      R$ {calcularTotalComanda(item.itens).toFixed(2)}
                    </Text>
                  </View>

                  {item.status === 'fechada' ? (
                    <TouchableOpacity
                      style={[styles.botaoCinza, { marginTop: 10, padding: 10 }]}
                      onPress={() => reabrirComanda(item)}
                    >
                      <Text style={styles.textoBotao}>🔓 Reabrir Comanda</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.botaoAzul, { marginTop: 10, padding: 10 }]}
                        onPress={() => selecionarMesaParaAdicionar(item.mesa)}
                      >
                        <Text style={styles.textoBotao}>➕ Adicionar mais itens</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.botaoVerde, { marginTop: 8, padding: 10 }]}
                        onPress={() => fecharComanda(item)}
                      >
                        <Text style={styles.textoBotao}>✅ Fechar Comanda (pedir conta)</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* TELA 3: BALCÃO (visão geral de todos os pedidos ativos) */}
      {abaAtiva === 'balcao' && (
        <View style={styles.conteudoAba}>
          <Text style={styles.titulo}>🖨️ Balcão</Text>
          {comandasAtivas.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhum pedido pendente.</Text>
          ) : (
            <FlatList
              data={[...comandasAtivas].sort((a, b) =>
                a.status === 'fechada' && b.status !== 'fechada' ? -1 : 0
              )}
              keyExtractor={(item) => item.mesa}
              renderItem={({ item }) => (
                <View style={[styles.form, item.status === 'fechada' && styles.formContaFechada, { marginBottom: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.subtitulo, { marginTop: 0 }]}>
                      Mesa {item.mesa} — {item.ultimaHora}
                    </Text>
                    {item.status === 'fechada' && (
                      <View style={styles.badgeFechada}>
                        <Text style={styles.badgeFechadaTexto}>PRONTA P/ PAGAR</Text>
                      </View>
                    )}
                  </View>

                  {item.itens.map((it) => (
                    <Text key={it.id} style={styles.textoItem}>
                      • {it.quantidade}x {it.nome} — R$ {(it.preco * it.quantidade).toFixed(2)}
                    </Text>
                  ))}

                  <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                    <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16 }}>
                      R$ {calcularTotalComanda(item.itens).toFixed(2)}
                    </Text>
                  </View>

                  {item.status === 'fechada' && (
                    <TouchableOpacity
                      style={[styles.botaoVerde, { marginTop: 10, padding: 10 }]}
                      onPress={() => confirmarPagamento(item)}
                    >
                      <Text style={styles.textoBotao}>💰 Confirmar Pagamento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* TELA 4: HISTÓRICO (protegido por senha) */}
      {abaAtiva === 'historico' && (
        <View style={styles.conteudoAba}>
          {!historicoAutorizado ? (
            <View style={styles.areaMesa}>
              <Text style={styles.label}>Digite a senha para acessar o histórico:</Text>
              <TextInput
                style={styles.inputMesa}
                placeholder="Senha"
                value={senhaDigitada}
                onChangeText={setSenhaDigitada}
                secureTextEntry
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.botaoAzul} onPress={verificarSenha}>
                <Text style={styles.textoBotao}>Entrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.titulo}>🔒 Histórico de Comandas</Text>
              {historicoComandas.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhuma comanda fechada ainda.</Text>
              ) : (
                <FlatList
                  data={historicoComandas}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.form}>
                      <Text style={[styles.subtitulo, { marginTop: 0 }]}>Mesa {item.mesa}</Text>
                      <Text style={styles.textoVazio}>
                        {new Date(item.fechadaEm).toLocaleString('pt-BR')}
                      </Text>
                      {item.itens.map((it) => (
                        <Text key={it.id} style={styles.textoItem}>
                          • {it.quantidade}x {it.nome}
                        </Text>
                      ))}
                      <View style={[styles.linhaTotal, { marginTop: 10 }]}>
                        <Text style={{ fontWeight: 'bold' }}>Total:</Text>
                        <Text style={{ fontWeight: 'bold', color: '#1976D2' }}>
                          R$ {item.total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              )}
            </>
          )}
        </View>
      )}

      {/* TELA 5: CARDÁPIO (cadastro de produtos) */}
      {abaAtiva === 'cardapio' && (
        <View style={styles.conteudoAba}>
          <Text style={styles.titulo}>🍔 Cardápio</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={novoNome}
              onChangeText={setNovoNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço (ex: 12.50)"
              value={novoPreco}
              onChangeText={setNovoPreco}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.botaoAzul} onPress={adicionarProdutoCardapio}>
              <Text style={styles.textoBotao}>Cadastrar Produto</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cardapio}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.linhaItemComanda}>
                <Text style={styles.textoItem}>{item.nome}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ marginRight: 10 }}>R$ {item.preco.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => removerProdutoCardapio(item.id)} style={styles.botaoRemover}>
                    <Text style={styles.textoRemover}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    // Reserva a altura da status bar no Android, já que SafeAreaView
    // sozinho não empurra o conteúdo para baixo nessa plataforma.
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  menuAbas: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 3,
    zIndex: 10 // garante que o menu fique acima de outros elementos e receba o toque
  },
  botaoAba: {
    flex: 1,
    paddingVertical: 16, // área de toque um pouco maior, mais fácil de acertar o dedo
    alignItems: 'center',
    justifyContent: 'center'
  },
  abaAtiva: { borderBottomWidth: 3, borderBottomColor: '#1976D2' },
  textoAba: { fontSize: 11, color: '#777' },
  textoAbaAtivo: { color: '#1976D2', fontWeight: 'bold' },
  conteudoAba: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subtitulo: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  areaMesa: { marginBottom: 10 },
  label: { fontSize: 13, color: '#555', marginBottom: 4 },
  inputMesa: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  form: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 1 },
  cardCardapioComanda: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    minWidth: 110,
    justifyContent: 'center'
  },
  nomeProduto: { fontWeight: '600' },
  precoVerde: { color: '#2E7D32', marginTop: 4 },
  areaResumo: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
  textoVazio: { color: '#999', fontStyle: 'italic' },
  linhaItemComanda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  textoItem: { fontSize: 14 },
  botaoRemover: { padding: 4 },
  botaoRemoverMesa: { padding: 4 },
  textoRemover: { fontSize: 14 },
  rodape: { marginTop: 10 },
  linhaTotal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  labelTotal: { fontSize: 15, fontWeight: '600' },
  valorTotal: { fontSize: 18, fontWeight: 'bold', color: '#1976D2' },
  botaoAzul: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  botaoVerde: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' }
});